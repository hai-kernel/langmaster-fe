import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { RotateCcw, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Volume2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Flashcard {
  id: number;
  word: string;
  translation: string;
  phonetic: string;
  example: string;
  exampleTranslation: string;
  image?: string;
}

export function FlashcardLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [learning, setLearning] = useState<number[]>([]);
  const [mode, setMode] = useState<'study' | 'test'>('study');

  const cards: Flashcard[] = [
    {
      id: 1,
      word: 'Reservation',
      translation: 'Đặt chỗ',
      phonetic: '/ˌrezərˈveɪʃn/',
      example: 'I made a reservation at the restaurant.',
      exampleTranslation: 'Tôi đã đặt chỗ ở nhà hàng.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    },
    {
      id: 2,
      word: 'Available',
      translation: 'Có sẵn',
      phonetic: '/əˈveɪləbl/',
      example: 'Is this room available tonight?',
      exampleTranslation: 'Phòng này có trống tối nay không?',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
    },
    {
      id: 3,
      word: 'Confirm',
      translation: 'Xác nhận',
      phonetic: '/kənˈfɜːrm/',
      example: 'Please confirm your booking.',
      exampleTranslation: 'Vui lòng xác nhận đặt phòng của bạn.',
    },
    {
      id: 4,
      word: 'Accommodation',
      translation: 'Chỗ ở',
      phonetic: '/əˌkɒməˈdeɪʃn/',
      example: 'We need accommodation for three nights.',
      exampleTranslation: 'Chúng tôi cần chỗ ở cho ba đêm.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    },
    {
      id: 5,
      word: 'Check-in',
      translation: 'Làm thủ tục nhận phòng',
      phonetic: '/ˈtʃek ɪn/',
      example: 'Check-in time is at 2 PM.',
      exampleTranslation: 'Giờ nhận phòng là 2 giờ chiều.',
    },
  ];

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    if (!known.includes(currentCard.id)) {
      setKnown([...known, currentCard.id]);
      toast.success('Great! Card marked as known 🎉');
    }
    handleNext();
  };

  const handleLearning = () => {
    if (!learning.includes(currentCard.id)) {
      setLearning([...learning, currentCard.id]);
      toast.info('Card added to learning pile 📚');
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentCard.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleComplete = () => {
    const xp = (known.length * 10) + (learning.length * 5);
    toast.success(`🎉 Flashcard Set Completed! +${xp} XP`);
    navigate('/student/learning');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/learning')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {known.length} Known
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="w-4 h-4 text-yellow-600" />
              {learning.length} Learning
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="h-[500px] cursor-pointer relative overflow-hidden"
                onClick={handleFlip}
              >
                <motion.div
                  className="w-full h-full"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 p-8 flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {currentCard.image && (
                      <img
                        src={currentCard.image}
                        alt={currentCard.word}
                        className="w-48 h-48 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                      {currentCard.word}
                    </h1>
                    <p className="text-2xl text-gray-600 dark:text-gray-400 mb-6">
                      {currentCard.phonetic}
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      <Volume2 className="w-5 h-5" />
                      Listen
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 absolute bottom-8">
                      Click to flip
                    </p>
                  </div>

                  {/* Back Side */}
                  <div
                    className="absolute inset-0 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <h2 className="text-5xl font-bold text-green-700 dark:text-green-400 mb-8">
                      {currentCard.translation}
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
                      <p className="text-lg text-gray-900 dark:text-white mb-2">
                        {currentCard.example}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentCard.exampleTranslation}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 absolute bottom-8">
                      Click to flip back
                    </p>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleLearning}
            variant="outline"
            size="lg"
            className="gap-2 border-2 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          >
            <Star className="w-5 h-5 text-yellow-600" />
            Still Learning
          </Button>
          <Button
            onClick={handleKnown}
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-5 h-5" />
            I Know This
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button onClick={handleFlip} variant="ghost" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Flip Card
          </Button>

          {currentIndex === cards.length - 1 ? (
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Statistics */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {cards.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {known.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Known</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {learning.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
