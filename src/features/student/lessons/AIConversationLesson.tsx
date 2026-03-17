import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../../app/components/ui/button';
import { Card } from '../../../app/components/ui/card';
import { Badge } from '../../../app/components/ui/badge';
import { Mic, MicOff, Volume2, ArrowLeft, CheckCircle2, Bot, User, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../../../app/components/ui/avatar';
import { Input } from '../../../app/components/ui/input';
import apiService from '../../../services/apiService';
import { useAppStore } from '../../../store/appStore';
import { RealtimeSpeechClient, type RealtimeClientState } from '../../../services/realtimeSpeechClient';

interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

// Fallback greeting khi API lỗi hoặc chưa load
function buildGreeting(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('ăn') || t.includes('nhà hàng') || t.includes('food') || t.includes('restaurant'))
    return "Xin chào! Chào mừng bạn đến với nhà hàng của chúng tôi. Bạn muốn đặt bàn không?";
  if (t.includes('khách sạn') || t.includes('hotel'))
    return "Good evening! Welcome to our hotel. How may I assist you today?";
  if (t.includes('mua sắm') || t.includes('shopping'))
    return "Hello! Welcome to our store. Are you looking for anything specific today?";
  if (t.includes('du lịch') || t.includes('travel') || t.includes('airport'))
    return "Hello! Welcome. How can I help you with your travel plans today?";
  if (t.includes('bệnh viện') || t.includes('doctor') || t.includes('health'))
    return "Good morning! How can I help you today? Do you have an appointment?";
  return `Hello! Let's practice a conversation about "${title}". How can I help you?`;
}

export function AIConversationLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [rtState, setRtState] = useState<RealtimeClientState>('idle');
  const [isAITyping, setIsAITyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const rtRef = useRef<RealtimeSpeechClient | null>(null);
  const aiDraftRef = useRef<string>('');

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    apiService.lesson.getById(Number(lessonId))
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setLesson(data);
        const title = data?.title ?? 'Luyện hội thoại';
        const desc = data?.description ?? '';
        const lessonContext = [title, desc].filter(Boolean).join('\n');
        return apiService.ai.chat({
          messages: [{ role: 'user', content: `Start with a short greeting for this English conversation practice. Lesson: ${title}. ${desc ? `Description: ${desc}` : ''}` }],
          lessonContext,
        }).then((chatRes) => {
          const content = (chatRes.data as any)?.data?.content ?? (chatRes.data as any)?.content;
          const greeting = (typeof content === 'string' && content.trim()) ? content.trim() : buildGreeting(title);
          const msg: Message = { id: 1, sender: 'ai', text: greeting, timestamp: new Date() };
          setMessages([msg]);
        }).catch(() => {
          const greeting = buildGreeting(title);
          setMessages([{ id: 1, sender: 'ai', text: greeting, timestamp: new Date() }]);
        });
      })
      .catch(() => {
        const defaultGreeting = "Hello! Let's practice English conversation. How can I help you?";
        setMessages([{ id: 1, sender: 'ai', text: defaultGreeting, timestamp: new Date() }]);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    rtRef.current = new RealtimeSpeechClient({
      onState: (s) => {
        setRtState(s);
        setIsRecording(s === 'listening' || s === 'ai_speaking');
      },
      onTranscript: (evt) => {
        if (evt.role === 'user' && evt.isFinal) {
          const userMsg: Message = { id: Date.now(), sender: 'user', text: evt.text, timestamp: new Date() };
          setMessages((prev) => [...prev, userMsg]);
          setTurnCount((prev) => prev + 1);
          aiDraftRef.current = '';
          // placeholder assistant bubble
          setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: '...', timestamp: new Date() }]);
        } else if (evt.role === 'assistant' && evt.isDelta) {
          const t = evt.text.trim();
          if (!t) return;
          setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].sender === 'ai') {
                next[i] = { ...next[i], text: t };
                return next;
              }
            }
            next.push({ id: Date.now(), sender: 'ai', text: t, timestamp: new Date() });
            return next;
          });
        } else if (evt.role === 'assistant' && evt.isFinal) {
          const t = evt.text.trim();
          if (!t) return;
          setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].sender === 'ai') {
                next[i] = { ...next[i], text: t };
                return next;
              }
            }
            next.push({ id: Date.now(), sender: 'ai', text: t, timestamp: new Date() });
            return next;
          });
        }
      },
      onError: (m) => toast.error(m || 'Realtime voice error'),
    });

    return () => {
      rtRef.current?.stop();
      rtRef.current = null;
    };
  }, []);

  const toggleRecording = async () => {
    if (rtState === 'idle' || rtState === 'error') {
      if (!lessonId) return;
      const title = lesson?.title ?? 'Luyện hội thoại';
      const desc = lesson?.description ?? '';
      const lessonContext = [title, desc].filter(Boolean).join('\n');
      try {
        await rtRef.current?.start({ instructions: lessonContext });

        // Removed auto response.create to avoid "response in progress" errors during realtime.
      } catch (err: any) {
        console.warn('Failed to start realtime mic', err);
        toast.error(err?.message || 'Không thể bật micro. Kiểm tra quyền microphone hoặc kết nối WebSocket.');
      }
    } else {
      rtRef.current?.stop();
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), sender: 'user', text: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTurnCount((prev) => prev + 1);
    setIsAITyping(true);

    const title = lesson?.title ?? '';
    const desc = lesson?.description ?? '';
    const lessonContext = [title, desc].filter(Boolean).join('\n');
    const history = [...messages, userMsg].map((m) => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }));

    apiService.ai.chat({ messages: history, lessonContext })
      .then((res) => {
        const raw = res.data as any;
        const content = raw?.data?.content ?? raw?.content ?? '';
        const response = (typeof content === 'string' && content.trim()) ? content.trim() : "I'm here to help. Could you say that again?";
        const aiMsg: Message = { id: Date.now() + 1, sender: 'ai', text: response, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
        setTurnCount((prev) => prev + 1);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Không thể kết nối AI. Thử lại sau.');
        const fallback: Message = { id: Date.now() + 1, sender: 'ai', text: "Sorry, I couldn't reply right now. Please try again.", timestamp: new Date() };
        setMessages((prev) => [...prev, fallback]);
        setTurnCount((prev) => prev + 1);
      })
      .finally(() => setIsAITyping(false));
  };

  const handleComplete = async () => {
    try {
      await apiService.student.completeLesson(lessonId!, 100);
      useAppStore.getState().invalidateProgress();
    } catch { /* ignore */ }
    toast.success('Tuyệt vời! Hoàn thành luyện hội thoại!');
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  const targetTurns = 8;
  const progress = Math.min((turnCount / targetTurns) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-4 lg:py-6 flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">{turnCount} lượt</p>
              <div className="w-28 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <Badge variant="secondary">QUIZ / AI</Badge>
          </div>
        </div>

        {/* Scenario Card */}
        <Card className="p-4 mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold">{lesson?.title ?? 'Luyện hội thoại AI'}</h2>
              <p className="text-xs text-gray-500">{lesson?.description ?? 'Hãy nói chuyện tự nhiên bằng tiếng Anh'}</p>
            </div>
            {rtState === 'ai_speaking' && (
              <div className="ml-auto flex items-center gap-1 text-xs text-purple-500 animate-pulse">
                <Volume2 className="w-3 h-3" />
                <span>AI đang nói...</span>
              </div>
            )}
          </div>
        </Card>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={message.sender === 'ai' ? 'bg-purple-100' : 'bg-green-100'}>
                    {message.sender === 'ai'
                      ? <Bot className="w-4 h-4 text-purple-600" />
                      : <User className="w-4 h-4 text-green-600" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[75%] ${message.sender === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                    message.sender === 'ai'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                      : 'bg-purple-600 text-white rounded-tr-sm'
                  }`}>
                    {message.text}
                  </div>
                  {message.sender === 'ai' && null}
                </div>
              </div>
            ))}
            {isAITyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-purple-100">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 flex-shrink-0">
            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'outline'}
              onClick={toggleRecording}
              disabled={isAITyping}
              className={`flex-shrink-0 ${isRecording ? 'animate-pulse' : ''}`}
              title={isRecording ? 'Nhấn để dừng' : 'Nhấn để nói'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputText); } }}
              placeholder="Gõ câu trả lời hoặc nhấn mic để nói..."
              disabled={isAITyping}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isAITyping}
              className="flex-shrink-0 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Complete Button */}
        {turnCount >= targetTurns && (
          <div className="mt-3 flex-shrink-0">
            <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Hoàn thành hội thoại
            </Button>
          </div>
        )}

        {/* Tip */}
        <p className="text-center text-xs text-gray-400 mt-2 flex-shrink-0">
          💡 Nhấn mic để nói bằng giọng thật, hoặc gõ câu trả lời của bạn
        </p>
      </div>
    </div>
  );
}
