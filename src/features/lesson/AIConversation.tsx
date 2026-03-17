import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar } from '@/app/components/ui/avatar';
import {
  Mic,
  MicOff,
  ChevronLeft,
  Send,
  Bot,
  User,
  CheckCircle,
  Volume2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';
import { RealtimeSpeechClient, type RealtimeClientState } from '@/services/realtimeSpeechClient';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

const FALLBACK_GREETING = "Hello! Let's practice English conversation. How can I help you?";

export function AIConversation() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { setCurrentView, invalidateProgress } = useAppStore();

  const [lesson, setLesson] = useState<{ id: string | number; title: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [rtState, setRtState] = useState<RealtimeClientState>('idle');
  const rtRef = useRef<RealtimeSpeechClient | null>(null);
  const aiDraftRef = useRef<string>('');

  const lessonContext = lesson ? [lesson.title, lesson.description].filter(Boolean).join('\n') : '';

  // Load lesson and initial AI greeting
  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    apiService.lesson.getById(Number(lessonId))
      .then((res) => {
        const data = (res.data as any)?.data ?? res.data;
        setLesson(data);
        const title = data?.title ?? 'Luyện hội thoại';
        const desc = data?.description ?? '';
        const ctx = [title, desc].filter(Boolean).join('\n');
        return apiService.ai.chat({
          messages: [{ role: 'user', content: `Start with a short greeting for this English conversation practice. Lesson: ${title}. ${desc ? `Description: ${desc}` : ''}` }],
          lessonContext: ctx,
        }).then((chatRes) => {
          const raw = chatRes.data as any;
          const content = raw?.data?.content ?? raw?.content ?? '';
          const greeting = (typeof content === 'string' && content.trim()) ? content.trim() : FALLBACK_GREETING;
          setMessages([{ id: '1', role: 'ai', text: greeting, timestamp: new Date() }]);
        }).catch(() => {
          setMessages([{ id: '1', role: 'ai', text: FALLBACK_GREETING, timestamp: new Date() }]);
        });
      })
      .catch(() => {
        setMessages([{ id: '1', role: 'ai', text: FALLBACK_GREETING, timestamp: new Date() }]);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => {
    rtRef.current = new RealtimeSpeechClient({
      onState: (s) => {
        setRtState(s);
        setIsRecording(s === 'listening' || s === 'ai_speaking');
      },
      onTranscript: (evt) => {
        if (evt.role === 'user' && evt.isFinal) {
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: evt.text,
            timestamp: new Date(),
          };
          setMessages((prev) => [
            ...prev,
            userMessage,
            { id: `ai-${Date.now()}`, role: 'ai', text: '...', timestamp: new Date() },
          ]);
          setTurnCount((prev) => prev + 1);
          aiDraftRef.current = '';
        } else if (evt.role === 'assistant' && evt.isDelta) {
          aiDraftRef.current = aiDraftRef.current
            ? `${aiDraftRef.current} ${evt.text}`
            : evt.text;
          const t = aiDraftRef.current.trim();
          if (!t) return;
          setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === 'ai') {
                next[i] = { ...next[i], text: t };
                return next;
              }
            }
            next.push({ id: `ai-${Date.now()}`, role: 'ai', text: t, timestamp: new Date() });
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoice = async () => {
    if (rtState === 'idle' || rtState === 'error') {
      if (!lessonId) return;
      await rtRef.current?.start({ instructions: lessonContext });
      rtRef.current?.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: 'Start with a short greeting.' }],
        },
      });
      rtRef.current?.sendEvent({ type: 'response.create' });
    } else {
      rtRef.current?.stop();
    }
  };

  const handleSendMessage = (text?: string) => {
    const messageText = (text ?? inputText).trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setRecordingTime(0);
    setTurnCount((prev) => prev + 1);
    setIsAITyping(true);

    const history = [...messages, userMessage].map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }));

    apiService.ai.chat({ messages: history, lessonContext })
      .then((res) => {
        const raw = res.data as any;
        const content = raw?.data?.content ?? raw?.content ?? '';
        const reply = (typeof content === 'string' && content.trim()) ? content.trim() : "I'm here to help. Could you say that again?";
        const aiMessage: Message = { id: `ai-${Date.now()}`, role: 'ai', text: reply, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMessage]);
        setTurnCount((prev) => prev + 1);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Không thể kết nối AI. Thử lại sau.');
        const fallback: Message = { id: `ai-${Date.now()}`, role: 'ai', text: "Sorry, I couldn't reply right now. Please try again.", timestamp: new Date() };
        setMessages((prev) => [...prev, fallback]);
        setTurnCount((prev) => prev + 1);
      })
      .finally(() => setIsAITyping(false));
  };

  const handleComplete = async () => {
    if (!lessonId) return;
    try {
      await apiService.student.completeLesson(lessonId, 100);
      invalidateProgress?.();
    } catch { /* ignore */ }
    toast.success('Hoàn thành hội thoại!');
    setCurrentView?.('session-detail');
    navigate(-1);
  };

  const handlePlayAudio = (text: string) => {
    // Voice output comes from realtime mode; keep button as no-op for now.
    void text;
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
  const isConversationComplete = turnCount >= targetTurns;
  const displayLesson = lesson ?? { id: lessonId, title: 'Luyện hội thoại AI', description: 'Hãy nói chuyện tự nhiên bằng tiếng Anh' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Badge variant="outline" className="gap-1">
            <Bot className="h-3 w-3" />
            AI Conversation
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">{displayLesson.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{displayLesson.description}</p>
          </div>

          {/* Chat Container */}
          <Card className="mb-4 overflow-hidden">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <Avatar className={`flex-shrink-0 h-10 w-10 ${
                      message.role === 'ai' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}>
                      <div className="flex h-full w-full items-center justify-center text-white">
                        {message.role === 'ai' ? (
                          <Bot className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                    </Avatar>

                    {/* Message Bubble */}
                    <div className={`flex-1 max-w-[70%] ${message.role === 'user' ? 'items-end' : ''}`}>
                      <div
                        className={`rounded-2xl p-4 ${
                          message.role === 'ai'
                            ? 'bg-white dark:bg-gray-800 shadow-md'
                            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                        }`}
                      >
                        <p className="text-sm md:text-base">{message.text}</p>
                        
                        {message.role === 'ai' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayAudio(message.text)}
                            className="mt-2 h-8 gap-1 text-xs"
                          >
                            <Volume2 className="h-3 w-3" />
                            Nghe
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 px-2">
                        {message.timestamp.toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isAITyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="flex h-full w-full items-center justify-center text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                  </Avatar>
                  <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-md p-4">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!isConversationComplete && (
              <div className="border-t p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  {/* Voice Input */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVoice}
                    disabled={rtState === 'ai_speaking' || isAITyping}
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                      isRecording
                        ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                        : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:shadow-lg'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-5 w-5 text-white" />
                    ) : (
                      <Mic className="h-5 w-5 text-white" />
                    )}
                  </motion.button>

                  {/* Recording Timer */}
                  {isRecording && null}

                  {/* Text Input */}
                  {!isRecording && (
                    <>
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Nhập câu trả lời..."
                        disabled={isAITyping}
                        className="flex-1 rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim() || isAITyping}
                        className="h-12 w-12 p-0 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Nhấn vào micro để nói hoặc nhập văn bản
                </p>
              </div>
            )}

            {/* Complete Message */}
            {isConversationComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-t p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-center"
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-bold mb-2">Xuất sắc! 🎉</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Bạn đã hoàn thành cuộc hội thoại!
                </p>
                <Button
                  size="lg"
                  onClick={handleComplete}
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle className="h-5 w-5" />
                  Hoàn thành bài học (+100 XP)
                </Button>
              </motion.div>
            )}
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="mb-2 font-bold flex items-center gap-2">
              💬 Mẹo hội thoại
            </h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Trả lời bằng giọng nói hoặc gõ văn bản</li>
              <li>• Cố gắng trả lời đầy đủ và tự nhiên</li>
              <li>• Nhấn nút nghe để nghe lại câu hỏi của AI</li>
              <li>• Đừng lo lắng nếu mắc lỗi - hãy thử lại!</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
