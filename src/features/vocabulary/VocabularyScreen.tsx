import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, Volume2, Loader2, LayoutGrid, Globe, Hand, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

/** Bộ màu "Vũ trụ" – glow theo loại từ (dùng cho cầu 3D + thẻ). */
const WORD_TYPE_COLORS = {
  verb: {
    hex: '#FF3366',
    bg: 'rgba(255,51,102,0.2)',
    border: '#FF3366',
    glow: '0 0 20px rgba(255,51,102,0.65), 0 0 40px rgba(255,51,102,0.3)',
    tag: 'Động từ',
  },
  noun: {
    hex: '#00F5FF',
    bg: 'rgba(0,245,255,0.18)',
    border: '#00F5FF',
    glow: '0 0 20px rgba(0,245,255,0.65), 0 0 40px rgba(0,245,255,0.3)',
    tag: 'Danh từ',
  },
  adjective: {
    hex: '#CCFF00',
    bg: 'rgba(204,255,0,0.22)',
    border: '#CCFF00',
    glow: '0 0 20px rgba(204,255,0,0.6), 0 0 40px rgba(204,255,0,0.25)',
    tag: 'Tính từ',
  },
  phrase: {
    hex: '#B24BF3',
    bg: 'rgba(178,75,243,0.2)',
    border: '#B24BF3',
    glow: '0 0 20px rgba(178,75,243,0.6), 0 0 40px rgba(178,75,243,0.25)',
    tag: 'Thành ngữ',
  },
} as const;

type WordType = keyof typeof WORD_TYPE_COLORS;

function getWordType(pos: string | undefined): WordType {
  if (!pos) return 'noun';
  const p = pos.toLowerCase();
  if (p.includes('verb') || p.includes('v.')) return 'verb';
  if (p.includes('adj') || p.includes('adjective') || p.includes('a.')) return 'adjective';
  if (p.includes('phrase') || p.includes('idiom') || p.includes('expr')) return 'phrase';
  return 'noun';
}

interface VocabItem {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  wordType: WordType;
}

type ViewMode = 'cards' | 'sphere';

const SPHERE_RADIUS = 200;
const PERSPECTIVE = 1000;
/** Từ sát cầu hơn như vệ tinh quanh hành tinh */
const LAYER_RADII = [0.72, 0.88, 1.02];
const LAYER_OPACITY = [0.5, 0.82, 1];
const LAYER_SCALE = [0.88, 1, 1.08];
const PARALLAX_MULT = [1.25, 1, 0.75];
/** viewZ dưới ngưỡng này coi là mặt sau → ẩn để tránh chữ lật ngược */
const BACK_FACE_Z_THRESHOLD = -20;

/** Phân bố từ lên mặt cầu (tọa độ cầu → x,y,z). layer 0=xa, 1=giữa, 2=gần. */
function spherePosition(
  index: number,
  total: number,
  layer: number
): { x: number; y: number; z: number } {
  if (total <= 0) return { x: 0, y: 0, z: SPHERE_RADIUS };
  const r = SPHERE_RADIUS * LAYER_RADII[layer];
  const phi = Math.acos(-1 + (2 * index + 1) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

/** Tính tọa độ z trong view space sau khi xoay (rotateY rồi rotateX). Dùng để biết từ ở phía trước hay sau. */
function getViewZ(
  x: number,
  y: number,
  z: number,
  rotXDeg: number,
  rotYDeg: number
): number {
  const φ = (rotXDeg * Math.PI) / 180;
  const θ = (rotYDeg * Math.PI) / 180;
  const zAfterY = -x * Math.sin(θ) + z * Math.cos(θ);
  const yAfterY = y;
  return yAfterY * Math.sin(φ) + zAfterY * Math.cos(φ);
}

/** Opacity và scale theo viewZ: phía trước rõ, phía sau mờ. Ẩn hẳn khi ở mặt sau (tránh chữ lật ngược). */
function viewStyle(viewZ: number, maxR: number) {
  const isBack = viewZ < BACK_FACE_Z_THRESHOLD;
  const t = (viewZ + maxR) / (2 * maxR);
  const opacity = isBack ? 0 : 0.35 + 0.65 * Math.max(0, Math.min(1, t));
  const scale = 0.88 + 0.2 * Math.max(0, Math.min(1, t));
  const isFront = viewZ > maxR * 0.2;
  return { opacity, scale, isFront, isBack };
}

export function VocabularyScreen() {
  const { setCurrentView } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [list, setList] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSessionId, setFilterSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Array<{ sessionId: number; title: string }>>([]);
  const [sphereRotateX, setSphereRotateX] = useState(0);
  const [sphereRotateY, setSphereRotateY] = useState(0);
  const [selectedSphereWord, setSelectedSphereWord] = useState<VocabItem | null>(null);
  const [viewedWordIds, setViewedWordIds] = useState<Set<string>>(new Set());
  const [isSphereDragging, setIsSphereDragging] = useState(false);
  const [isSphereHovered, setIsSphereHovered] = useState(false);
  const sphereDragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startRotX: 0,
    startRotY: 0,
  });
  const sphereWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [vocabRes, sessionsRes] = await Promise.all([
          apiService.student.myVocabulary.getList(
            filterSessionId != null ? { sessionId: filterSessionId } : undefined
          ),
          apiService.student.getParticipatedSessions(),
        ]);
        if (cancelled) return;
        const data = vocabRes.data?.data ?? [];
        setList(
          data.map((v: any) => {
            const firstMeaning = Array.isArray(v.meanings) && v.meanings.length > 0 ? v.meanings[0] : {};
            const pos = firstMeaning.pos ?? firstMeaning.partOfSpeech;
            return {
              id: String(v.id),
              word: v.word ?? '',
              pronunciation: v.phonetic ?? '',
              meaning: firstMeaning.def ?? firstMeaning.definition ?? '',
              example: v.example ?? '',
              wordType: getWordType(pos),
            };
          })
        );
        const sess = (sessionsRes.data?.data ?? []) as Array<{ sessionId?: number; title?: string }>;
        setSessions(
          sess.map((s) => ({
            sessionId: s.sessionId ?? 0,
            title: s.title ?? `Session ${s.sessionId}`,
          }))
        );
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.message ?? 'Không tải được từ vựng.');
          toast.error('Không tải được danh sách từ vựng.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterSessionId]);

  const toggleFlip = (wordId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(wordId)) {
      newFlipped.delete(wordId);
    } else {
      newFlipped.add(wordId);
      setViewedWordIds((prev) => new Set(prev).add(wordId));
    }
    setFlippedCards(newFlipped);
  };

  const onSphereMouseDown = useCallback((e: React.MouseEvent) => {
    sphereDragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRotX: sphereRotateX,
      startRotY: sphereRotateY,
    };
    setIsSphereDragging(true);
  }, [sphereRotateX, sphereRotateY]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!sphereDragRef.current.isDragging) return;
      const dx = e.clientX - sphereDragRef.current.startX;
      const dy = e.clientY - sphereDragRef.current.startY;
      setSphereRotateY(sphereDragRef.current.startRotY + dx * 0.6);
      setSphereRotateX(sphereDragRef.current.startRotX - dy * 0.6);
    };
    const onUp = () => {
      sphereDragRef.current.isDragging = false;
      setIsSphereDragging(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseleave', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onUp);
    };
  }, []);

  const handleSphereWordClick = useCallback((word: VocabItem) => {
    const isDeselect = selectedSphereWord?.id === word.id;
    setSelectedSphereWord(isDeselect ? null : word);
    if (!isDeselect) {
      setViewedWordIds((prev) => new Set(prev).add(word.id));
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      toast.success('Bạn đã học thêm 1 từ!');
    }
  }, [selectedSphereWord?.id]);

  const progressViewed = viewedWordIds.size;
  const progressTotal = list.length;

  const handleRemove = useCallback(async (vocabularyId: string) => {
    try {
      await apiService.student.myVocabulary.remove(Number(vocabularyId));
      setList((prev) => prev.filter((w) => w.id !== vocabularyId));
      setViewedWordIds((prev) => {
        const next = new Set(prev);
        next.delete(vocabularyId);
        return next;
      });
      if (selectedSphereWord?.id === vocabularyId) setSelectedSphereWord(null);
      toast.success('Đã xóa từ khỏi danh sách.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Không thể xóa từ. Thử lại sau.');
    }
  }, [selectedSphereWord?.id]);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 bg-[#F4F6F8] dark:bg-slate-900/40">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => setCurrentView('home')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Từ vựng của tôi</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ôn tập các từ vựng bạn đã học
        </p>
        {!loading && !error && list.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Chế độ xem:</span>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
              Thẻ
            </Button>
            <Button
              variant={viewMode === 'sphere' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode('sphere')}
            >
              <Globe className="h-4 w-4" />
              Hình cầu (kéo chuột xoay)
            </Button>
          </div>
        )}
        {!loading && !error && list.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 max-w-[200px] rounded-full bg-white/80 shadow-inner overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #1E88E1, #AB47BC)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressTotal ? (progressViewed / progressTotal) * 100 : 0}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600">
              Đã xem {progressViewed} / {progressTotal} từ
            </span>
          </div>
        )}
        {sessions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Lọc:</span>
            <Button
              variant={filterSessionId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSessionId(null)}
            >
              Tất cả
            </Button>
            {sessions.map((s) => (
              <Button
                key={s.sessionId}
                variant={filterSessionId === s.sessionId ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSessionId(s.sessionId)}
              >
                {s.title}
              </Button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      )}

      {error && !loading && (
        <p className="py-8 text-center text-destructive">{error}</p>
      )}

      {!loading && !error && list.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          Chưa có từ vựng nào. Hãy lưu từ khi học bài (bấm vào từ rồi chọn &quot;Lưu từ vựng&quot;).
        </p>
      )}

      {!loading && !error && list.length > 0 && viewMode === 'cards' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((word) => {
            const isFlipped = flippedCards.has(word.id);
            const style = WORD_TYPE_COLORS[word.wordType];
            return (
              <motion.div
                key={word.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ perspective: 1000 }}
              >
                <Card
                  className="relative h-64 cursor-pointer overflow-hidden border-l-4 shadow-md"
                  style={{ borderLeftColor: style.hex }}
                  onClick={() => toggleFlip(word.id)}
                >
                  <motion.div
                    className="h-full w-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center p-6"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow"
                          style={{ backgroundColor: style.hex }}
                        >
                          {style.tag}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(word.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow"
                        style={{ backgroundColor: style.hex }}
                      >
                        <span className="text-3xl">📖</span>
                      </div>
                      <h3 className="mb-2 text-center text-2xl font-bold">{word.word}</h3>
                      <p className="mb-4 text-center text-sm text-gray-600">
                        {word.pronunciation ? `/${word.pronunciation}/` : ''}
                      </p>
                      <Button variant="ghost" size="sm" style={{ color: style.hex }}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <p className="mt-4 text-center text-xs text-gray-500">Click để xem nghĩa</p>
                    </div>
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: `linear-gradient(135deg, ${style.hex}, ${style.hex}99)`,
                      }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(word.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                      <h3 className="mb-4 text-center text-2xl font-bold">{word.meaning || '—'}</h3>
                      <p className="mb-4 text-center italic opacity-90">
                        &quot;{word.example || word.word}&quot;
                      </p>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && list.length > 0 && viewMode === 'sphere' && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Hand className="h-4 w-4 opacity-70" />
            <span>Kéo chuột để xoay cầu</span>
            <span className="text-slate-400">·</span>
            <span>Click vào từ để xem nghĩa</span>
          </div>
          <div
            ref={sphereWrapRef}
            className="relative select-none rounded-3xl overflow-hidden transition-transform duration-300"
            style={{
              width: '100%',
              maxWidth: 560,
              height: 440,
              perspective: PERSPECTIVE,
              cursor: isSphereDragging ? 'grabbing' : 'grab',
              backgroundColor: '#0A0E14',
              transform: isSphereHovered ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isSphereHovered ? '0 0 60px rgba(0,245,255,0.15), 0 0 100px rgba(255,51,102,0.08)' : undefined,
            }}
            onMouseDown={onSphereMouseDown}
            onMouseEnter={() => setIsSphereHovered(true)}
            onMouseLeave={() => setIsSphereHovered(false)}
          >
            {/* Bloom ánh sao trời */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(100,120,200,0.12) 0%, transparent 55%)',
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                perspective: PERSPECTIVE,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Quả cầu bầu trời sao: nền tối + sao lấp lánh */}
              <div
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  width: SPHERE_RADIUS * 1.9,
                  height: SPHERE_RADIUS * 1.9,
                  marginLeft: -SPHERE_RADIUS * 0.95,
                  marginTop: -SPHERE_RADIUS * 0.95,
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${sphereRotateX}deg) rotateY(${sphereRotateY}deg)`,
                }}
              >
                <div
                  className="w-full h-full rounded-full border border-white/15"
                  style={{
                    background: `
                      radial-gradient(1px 1px at 18% 35%, rgba(255,255,255,0.9) 0%, transparent 100%),
                      radial-gradient(1px 1px at 68% 25%, rgba(255,255,255,0.85) 0%, transparent 100%),
                      radial-gradient(1.5px 1.5px at 82% 58%, rgba(255,255,255,0.9) 0%, transparent 100%),
                      radial-gradient(1px 1px at 38% 78%, rgba(255,255,255,0.8) 0%, transparent 100%),
                      radial-gradient(1px 1px at 52% 42%, rgba(255,255,255,0.75) 0%, transparent 100%),
                      radial-gradient(1px 1px at 12% 62%, rgba(255,255,255,0.85) 0%, transparent 100%),
                      radial-gradient(1px 1px at 62% 85%, rgba(255,255,255,0.7) 0%, transparent 100%),
                      radial-gradient(1.5px 1.5px at 45% 18%, rgba(255,255,255,0.9) 0%, transparent 100%),
                      radial-gradient(1px 1px at 88% 42%, rgba(255,255,255,0.8) 0%, transparent 100%),
                      radial-gradient(1px 1px at 28% 52%, rgba(255,255,255,0.7) 0%, transparent 100%),
                      radial-gradient(1px 1px at 75% 72%, rgba(255,255,255,0.85) 0%, transparent 100%),
                      radial-gradient(1px 1px at 52% 92%, rgba(255,255,255,0.7) 0%, transparent 100%),
                      radial-gradient(circle at 65% 65%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 35%, transparent 60%),
                      radial-gradient(circle at 30% 30%, rgba(80,120,200,0.35) 0%, rgba(40,60,140,0.12) 40%, transparent 65%),
                      radial-gradient(circle at 50% 50%, rgba(30,40,80,0.6) 0%, rgba(15,18,40,0.95) 45%, rgba(8,10,25,1) 100%)
                    `,
                    boxShadow: `
                      inset -20px -20px 50px rgba(0,0,0,0.5),
                      inset 16px 16px 40px rgba(80,60,150,0.1),
                      0 0 0 1px rgba(255,255,255,0.08),
                      0 0 20px rgba(255,255,255,0.03),
                      0 0 40px rgba(100,120,200,0.2),
                      0 0 70px rgba(100,120,200,0.12)
                    `,
                  }}
                />
              </div>
              {[0, 1, 2].map((layer) => {
                const rotX = sphereRotateX * PARALLAX_MULT[layer];
                const rotY = sphereRotateY * PARALLAX_MULT[layer];
                return (
                  <div
                    key={layer}
                    className="absolute"
                    style={{
                      width: SPHERE_RADIUS * 2,
                      height: SPHERE_RADIUS * 2,
                      transformStyle: 'preserve-3d',
                      transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                    }}
                  >
                    {list
                      .map((word, i) => ({ word, i }))
                      .filter((_, idx) => idx % 3 === layer)
                      .map(({ word, i }) => {
                        const pos = spherePosition(i, list.length, layer);
                        const viewZ = getViewZ(pos.x, pos.y, pos.z, rotX, rotY);
                        const { opacity, scale, isFront, isBack } = viewStyle(viewZ, SPHERE_RADIUS * 1.2);
                        const style = WORD_TYPE_COLORS[word.wordType];
                        return (
                          <button
                            key={word.id}
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSphereWordClick(word);
                            }}
                            className="absolute left-1/2 top-1/2 rounded-xl border-2 px-3 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              transform: `translate(-50%,-50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) scale(${LAYER_SCALE[layer] * scale})`,
                              width: 'max-content',
                              maxWidth: 120,
                              backgroundColor: isFront ? 'rgba(255,255,255,0.92)' : style.bg,
                              borderColor: isFront ? style.hex : style.border,
                              borderWidth: isFront ? 2.5 : 2,
                              opacity,
                              color: style.hex,
                              boxShadow: isFront ? `0 4px 20px rgba(0,0,0,0.12), ${style.glow}` : undefined,
                              backfaceVisibility: 'hidden',
                              visibility: isBack ? 'hidden' : 'visible',
                              pointerEvents: isBack ? 'none' : 'auto',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = style.glow;
                              e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = isFront ? `0 4px 20px rgba(0,0,0,0.12), ${style.glow}` : '';
                              e.currentTarget.style.opacity = String(opacity);
                            }}
                          >
                            {word.word}
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
          {selectedSphereWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg"
            >
              <Card
                className="overflow-hidden shadow-xl border-l-4"
                style={{
                  borderLeftColor: WORD_TYPE_COLORS[selectedSphereWord.wordType].hex,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }}
              >
                <div className="flex gap-4 p-6">
                  <div
                    className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-4xl shadow-inner"
                    style={{
                      backgroundColor: WORD_TYPE_COLORS[selectedSphereWord.wordType].bg,
                    }}
                  >
                    📖
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-xl font-bold">{selectedSphereWord.word}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            handleRemove(selectedSphereWord.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSphereWord(null)}
                        >
                          Đóng
                        </Button>
                      </div>
                    </div>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white mb-2"
                      style={{
                        backgroundColor: WORD_TYPE_COLORS[selectedSphereWord.wordType].hex,
                      }}
                    >
                      {WORD_TYPE_COLORS[selectedSphereWord.wordType].tag}
                    </span>
                    {selectedSphereWord.pronunciation && (
                      <p className="flex items-center gap-2 mb-2 font-mono text-sm text-slate-600">
                        <Volume2
                          className="h-4 w-4 cursor-pointer hover:opacity-80"
                          style={{ color: WORD_TYPE_COLORS[selectedSphereWord.wordType].hex }}
                        />
                        /{selectedSphereWord.pronunciation}/
                      </p>
                    )}
                    <p className="mb-2 font-medium text-slate-800">{selectedSphereWord.meaning || '—'}</p>
                    <p className="text-sm italic text-slate-500">
                      &quot;{selectedSphereWord.example || selectedSphereWord.word}&quot;
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
