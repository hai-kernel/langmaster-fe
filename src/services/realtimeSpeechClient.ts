import { API_BASE_URL } from './baseUrl';

export type RealtimeRole = 'user' | 'assistant';

export type RealtimeClientState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'ai_speaking'
  | 'error';

export interface RealtimeTranscriptEvent {
  role: RealtimeRole;
  text: string;
  isDelta: boolean;
  isFinal: boolean;
}

export interface RealtimeClientEvents {
  onState?: (state: RealtimeClientState) => void;
  onTranscript?: (evt: RealtimeTranscriptEvent) => void;
  onError?: (message: string) => void;
  onRawEvent?: (evt: any) => void;
}

interface StartOptions {
  /** Optional extra instructions (e.g., lesson context) */
  instructions?: string;
  /** ws(s) override. If omitted, will derive from API_BASE_URL */
  wsUrl?: string;
}

/**
 * Browser realtime speech client:
 * - Captures mic -> resamples to PCM16 16k mono -> streams via WebSocket (binary frames)
 * - Receives PCM16 audio from server and plays it
 * - Uses server-side VAD (OpenAI) to detect end of speech; server triggers response automatically.
 */
export class RealtimeSpeechClient {
  private ws: WebSocket | null = null;
  private state: RealtimeClientState = 'idle';
  private events: RealtimeClientEvents;

  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micProcessor: ScriptProcessorNode | null = null;

  private listeningEnabled = true;
  private outputSampleRate = 24000;
  private nextPlayTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private closedByUser = false;
  private lastAppendAt = 0;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private lastStartOpts: StartOptions | null = null;
  private responseActive = false;
  private assistantDraft = '';
  private bargeInTimer: number | null = null;
  private bargeInFrames = 0;
  private pendingResponseCreate = false;
  private suppressAiAudio = false;

  constructor(events: RealtimeClientEvents = {}) {
    this.events = events;
  }

  getState() {
    return this.state;
  }

  setListeningEnabled(enabled: boolean) {
    this.listeningEnabled = enabled;
  }

  /** Send a raw Realtime event to backend (will be forwarded to OpenAI). */
  sendEvent(evt: any) {
    this.sendJson(evt);
  }

  async start(opts: StartOptions = {}) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.closedByUser = false;
    this.lastStartOpts = opts;
    this.setState('connecting');

    try {
      await this.initAudio();
    } catch (e: any) {
      this.fail(e?.message || 'Failed to access microphone');
      return;
    }

    const wsUrl = opts.wsUrl ?? deriveWsUrlFromApiBase(API_BASE_URL);
    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      // Optionally update instructions per lesson/context (backend forwards to OpenAI).
      if (opts.instructions && opts.instructions.trim()) {
        this.sendJson({
          type: 'session.update',
          session: { instructions: opts.instructions.trim() },
        });
      }

      this.lastAppendAt = Date.now();
      this.reconnectAttempt = 0;
      this.setState('listening');
    };

    this.ws.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        this.handleTextEvent(ev.data);
      } else {
        this.handleAudioDelta(ev.data as ArrayBuffer);
      }
    };

    this.ws.onerror = (ev) => {
      console.warn('Realtime WS error', ev);
      // Keep the socket alive; onclose will handle reconnect if needed.
    };

    this.ws.onclose = (ev) => {
      console.warn('Realtime WS closed', {
        code: ev.code,
        reason: ev.reason,
        wasClean: ev.wasClean,
      });
      this.cleanupAudio();
      if (!this.closedByUser) {
        this.setState('idle');
        this.scheduleReconnect();
      }
      this.ws = null;
    };
  }

  stop() {
    this.closedByUser = true;
    this.cleanupAudio();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
    this.ws = null;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.setState('idle');
  }

  /** Clear OpenAI input buffer (not used by default; server handles it). */
  resetBuffer() {
    const now = Date.now();
    if (now - this.lastAppendAt < 120) return;
    this.sendJson({ type: 'input_audio_buffer.clear' });
  }

  private scheduleReconnect() {
    if (this.closedByUser || !this.lastStartOpts) return;
    if (this.reconnectAttempt >= 5) return;
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 8000);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempt += 1;
      this.start(this.lastStartOpts ?? {});
    }, delay);
  }

  private setState(s: RealtimeClientState) {
    if (this.state === s) return;
    this.state = s;
    this.events.onState?.(s);
  }

  private fail(message: string) {
    this.events.onError?.(message);
    this.setState('error');
    if (!this.closedByUser) {
      this.scheduleReconnect();
      return;
    }
    this.stop();
  }

  private sendJson(obj: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(obj));
  }

  private async initAudio() {
    if (this.audioCtx || this.micStream) return;
    // Capture mic
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Playback + capture in one AudioContext
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.nextPlayTime = this.audioCtx.currentTime;
    this.activeSources = [];

    this.micSource = this.audioCtx.createMediaStreamSource(this.micStream);
    // ScriptProcessorNode is deprecated but widely supported; good enough for this app.
    this.micProcessor = this.audioCtx.createScriptProcessor(4096, 1, 1);

    const inputSampleRate = this.audioCtx.sampleRate;
    this.micProcessor.onaudioprocess = (e) => {
      if (!this.listeningEnabled) return;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      // Allow barge-in: keep sending mic even while AI is speaking.

      const input = e.inputBuffer.getChannelData(0);
      const pcm16 = floatToPcm16(resampleFloat32(input, inputSampleRate, 16000));
      if (pcm16.length > 0) {
        if (this.responseActive) {
          const energy = rms(pcm16);
          if (energy > 0.01) {
            this.bargeInFrames += 1;
          } else {
            this.bargeInFrames = 0;
          }
          // Require sustained real speech energy before cutting AI audio.
          if (this.bargeInFrames >= 4) {
            this.sendJson({ type: 'response.cancel' });
            this.sendJson({ type: 'input_audio_buffer.commit' });
            this.stopAiPlayback();
            this.pendingResponseCreate = true;
            // Wait for user to finish (server will create response on speech_stopped)
            this.responseActive = false;
            this.setState('listening');
            this.bargeInFrames = 0;
          }
        }
        this.ws.send(pcm16.buffer);
        this.lastAppendAt = Date.now();
      }
    };

    this.micSource.connect(this.micProcessor);
    // Avoid local monitoring feedback: connect to a zero-gain node.
    const zeroGain = this.audioCtx.createGain();
    zeroGain.gain.value = 0;
    this.micProcessor.connect(zeroGain);
    zeroGain.connect(this.audioCtx.destination);
  }

  private cleanupAudio() {
    try {
      this.micProcessor?.disconnect();
      this.micSource?.disconnect();
    } catch {
      // ignore
    }
    this.micProcessor = null;
    this.micSource = null;

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.activeSources = [];
  }

  private handleTextEvent(text: string) {
    try {
      const evt = JSON.parse(text);
      this.events.onRawEvent?.(evt);

      const type = String(evt?.type || '');
      if (type === 'response.created') {
        this.responseActive = true;
        this.assistantDraft = '';
        this.setState('ai_speaking');
      } else if (type === 'response.done') {
        // Response finished -> resume listening (allow queued audio to finish).
        this.responseActive = false;
        this.assistantDraft = '';
        this.bargeInFrames = 0;
        this.pendingResponseCreate = false;
        this.suppressAiAudio = false;
        this.setState('listening');
      } else if (type === 'response.cancelled') {
        this.responseActive = false;
        this.assistantDraft = '';
        this.bargeInFrames = 0;
        this.pendingResponseCreate = false;
        this.suppressAiAudio = false;
        this.stopAiPlayback();
        this.setState('listening');
      } else if (type === 'input_audio_buffer.speech_started') {
        if (this.responseActive) {
          this.bargeInFrames = 0;
          this.sendJson({ type: 'response.cancel' });
          this.sendJson({ type: 'input_audio_buffer.commit' });
          this.stopAiPlayback();
          this.pendingResponseCreate = true;
          this.suppressAiAudio = true;
          this.responseActive = false;
          this.setState('listening');
        }
      } else if (type === 'input_audio_buffer.speech_stopped') {
        this.bargeInFrames = 0;
        if (this.pendingResponseCreate) {
          this.pendingResponseCreate = false;
          this.suppressAiAudio = false;
          this.sendJson({ type: 'input_audio_buffer.commit' });
          this.sendJson({ type: 'response.create' });
        }
      } else if (type === 'conversation.item.input_audio_transcription.completed') {
        const t = String(evt?.transcript || evt?.text || evt?.item?.content?.[0]?.transcript || '').trim();
        if (t) {
          this.events.onTranscript?.({ role: 'user', text: t, isDelta: false, isFinal: true });
        }
      } else if (type === 'response.audio_transcript.delta') {
        const delta = String(evt?.delta || '').trim();
        if (delta) {
          this.assistantDraft = this.assistantDraft
            ? `${this.assistantDraft} ${delta}`
            : delta;
          this.events.onTranscript?.({ role: 'assistant', text: this.assistantDraft.trim(), isDelta: true, isFinal: false });
        }
      } else if (type === 'response.audio_transcript.done') {
        const transcript = String(evt?.transcript || '').trim();
        if (transcript) {
          this.events.onTranscript?.({ role: 'assistant', text: transcript, isDelta: false, isFinal: true });
        }
      } else if (type === 'error') {
        const msg = String(evt?.error?.message || 'Realtime error');
        // Ignore benign "buffer too small" commit errors so the session can continue.
        if (msg.includes('buffer too small')) {
          this.setState('listening');
          return;
        }
        this.fail(msg);
      }
    } catch {
      // ignore parse errors
    }
  }

  private handleAudioDelta(buf: ArrayBuffer) {
    if (!this.audioCtx) return;
    if (this.suppressAiAudio) return;
    // Server forwards raw PCM16 bytes (little endian) at ~24kHz
    const float32 = pcm16ToFloat32(new Int16Array(buf));
    playPcmFloat32(
      this.audioCtx,
      float32,
      this.outputSampleRate,
      (t) => {
        this.nextPlayTime = t;
      },
      this.nextPlayTime,
      (src) => {
        this.activeSources.push(src);
      }
    );
  }

  private stopAiPlayback() {
    if (this.bargeInTimer) {
      window.clearTimeout(this.bargeInTimer);
      this.bargeInTimer = null;
    }
    this.bargeInFrames = 0;
    if (this.activeSources.length > 0) {
      this.activeSources.forEach((src) => {
        try {
          src.stop();
        } catch {
          // ignore
        }
      });
      this.activeSources = [];
    }
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    } else {
      this.nextPlayTime = 0;
    }
  }
}

function deriveWsUrlFromApiBase(apiBase: string): string {
  // apiBase examples:
  // - '/api'
  // - 'http://localhost:8080/api'
  // - 'https://domain.com/api'
  const path = '/v1/speaking/realtime';
  const trimmed = apiBase.replace(/\/+$/, '');
  const hasApi = trimmed.endsWith('/api');
  const withoutApi = hasApi ? trimmed.slice(0, -4) : trimmed;
  const wsPath = `${hasApi ? '/api' : ''}${path}`;
  if (withoutApi.startsWith('http://')) {
    return withoutApi.replace('http://', 'ws://') + wsPath;
  }
  if (withoutApi.startsWith('https://')) {
    return withoutApi.replace('https://', 'wss://') + wsPath;
  }
  // Relative -> assume backend on :8080 (Vite dev server runs on :5173 and doesn't proxy WS by default)
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port === '5173' ? '8080' : window.location.port;
  const portPart = port ? `:${port}` : '';
  return `${proto}//${host}${portPart}${wsPath}`;
}

function resampleFloat32(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (inRate === outRate) return input;
  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = pos - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

function floatToPcm16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function pcm16ToFloat32(input: Int16Array): Float32Array {
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = input[i] / 0x8000;
  }
  return out;
}

function rms(input: Int16Array): number {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const s = input[i] / 0x8000;
    sum += s * s;
  }
  return Math.sqrt(sum / Math.max(1, input.length));
}

function playPcmFloat32(
  ctx: AudioContext,
  pcm: Float32Array,
  sampleRate: number,
  setNextTime: (t: number) => void,
  nextTime: number,
  onSource?: (src: AudioBufferSourceNode) => void
) {
  const pcmData = new Float32Array(pcm) as Float32Array<ArrayBuffer>;
  const buffer = ctx.createBuffer(1, pcmData.length, sampleRate);
  buffer.copyToChannel(pcmData, 0);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);

  const startAt = Math.max(ctx.currentTime, nextTime);
  src.start(startAt);
  setNextTime(startAt + buffer.duration);
  onSource?.(src);
}

