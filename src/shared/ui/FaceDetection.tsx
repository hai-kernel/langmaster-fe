import { useEffect, useRef, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Camera, CameraOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaceDetectionProps {
  /** Mode: 'enrollment' for first-time registration, 'verification' for checking */
  mode: 'enrollment' | 'verification';
  /** Callback when face is successfully enrolled or verified */
  onSuccess?: (faceData?: string) => void;
  /** Callback when verification fails */
  onError?: (error: string) => void;
  /** Whether to show the component */
  isActive: boolean;
  /** Callback to close/dismiss the component */
  onClose?: () => void;
  /** Optional: Student name for personalization */
  studentName?: string;
}

export function FaceDetection({
  mode,
  onSuccess,
  onError,
  isActive,
  onClose,
  studentName,
}: FaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  // Start camera
  useEffect(() => {
    if (!isActive) return;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            const playPromise = videoRef.current?.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsCameraReady(true);
                  
                  if (mode === 'enrollment') {
                    setMessage('Hãy nhìn thẳng vào camera');
                  } else {
                    setMessage('Đang xác minh khuôn mặt...');
                  }
                })
                .catch((error) => {
                  console.error('Video play error:', error);
                  // Try to play again after user interaction
                });
            }
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setDetectionStatus('error');
        setMessage('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
        onError?.('Camera access denied');
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, mode]);

  // Simulate face detection (in production, use actual ML model like face-api.js or TensorFlow.js)
  const performFaceDetection = () => {
    setIsDetecting(true);
    setDetectionStatus('detecting');
    
    // Countdown before capture
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        
        // Simulate detection delay
        setTimeout(() => {
          // Mock: 90% success rate for demo
          const success = Math.random() > 0.1;
          
          if (success) {
            setDetectionStatus('success');
            
            if (mode === 'enrollment') {
              setMessage(`Tuyệt vời! Đã lưu khuôn mặt của bạn 🎉`);
              // Mock face embedding data
              const mockFaceData = `face_${Date.now()}_${Math.random().toString(36).substring(7)}`;
              setTimeout(() => {
                onSuccess?.(mockFaceData);
              }, 1500);
            } else {
              setMessage(`Xác minh thành công! Chào ${studentName || 'bạn'} 👋`);
              setTimeout(() => {
                onSuccess?.();
              }, 1500);
            }
          } else {
            setDetectionStatus('error');
            
            if (mode === 'enrollment') {
              setMessage('Không phát hiện khuôn mặt rõ ràng. Vui lòng thử lại.');
            } else {
              setMessage('Không thể xác minh. Vui lòng đảm bảo bạn nhìn thẳng vào camera.');
            }
            
            onError?.('Face detection failed');
            
            // Reset after 2 seconds
            setTimeout(() => {
              setDetectionStatus('idle');
              setIsDetecting(false);
              setMessage(mode === 'enrollment' ? 'Hãy nhìn thẳng vào camera' : 'Sẵn sàng xác minh');
            }, 2000);
          }
        }, 1000);
      }
    }, 1000);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {mode === 'enrollment' ? 'Đăng ký khuôn mặt' : 'Xác minh học sinh'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {mode === 'enrollment' 
                      ? 'Lần đầu tiên vào lớp - Chỉ cần làm một lần' 
                      : 'Để đảm bảo bạn là người đang học'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Camera View */}
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {/* Face detection overlay */}
              {isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Face guide circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: detectionStatus === 'detecting' ? 1.05 : 1,
                      opacity: detectionStatus === 'success' ? 0 : 1,
                    }}
                    className={`relative h-64 w-64 rounded-full border-4 ${
                      detectionStatus === 'success'
                        ? 'border-green-500'
                        : detectionStatus === 'error'
                        ? 'border-red-500'
                        : detectionStatus === 'detecting'
                        ? 'border-yellow-400'
                        : 'border-white/50'
                    } transition-colors`}
                  >
                    {/* Countdown */}
                    {isDetecting && countdown > 0 && (
                      <motion.div
                        key={countdown}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white"
                      >
                        {countdown}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Status icons */}
                  {detectionStatus === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="rounded-full bg-green-500 p-6">
                        <CheckCircle className="h-16 w-16 text-white" />
                      </div>
                    </motion.div>
                  )}

                  {detectionStatus === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="rounded-full bg-red-500 p-6">
                        <AlertCircle className="h-16 w-16 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with message and actions */}
            <div className="p-6 space-y-4">
              {/* Message */}
              <div className="text-center">
                <motion.p
                  key={message}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-medium"
                >
                  {message}
                </motion.p>
              </div>

              {/* Privacy notice */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-800 dark:text-blue-200">
                <p className="flex items-start gap-2">
                  <span className="text-lg">🔒</span>
                  <span>
                    <strong>Quyền riêng tư:</strong> Camera chỉ dùng để xác minh học tập. 
                    Chúng tôi <strong>không lưu video</strong>, chỉ lưu dữ liệu khuôn mặt được mã hóa.
                  </span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {!isDetecting && detectionStatus !== 'success' && (
                  <>
                    <Button
                      onClick={performFaceDetection}
                      disabled={!isCameraReady}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white gap-2"
                      size="lg"
                    >
                      <Camera className="h-5 w-5" />
                      {mode === 'enrollment' ? 'Đăng ký khuôn mặt' : 'Xác minh ngay'}
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      size="lg"
                    >
                      Hủy
                    </Button>
                  </>
                )}

                {detectionStatus === 'success' && (
                  <Button
                    onClick={handleClose}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Tiếp tục
                  </Button>
                )}
              </div>

              {/* Instructions for enrollment */}
              {mode === 'enrollment' && !isDetecting && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>💡 <strong>Hướng dẫn:</strong></p>
                  <ul className="text-left inline-block">
                    <li>✓ Đảm bảo ánh sáng đủ</li>
                    <li>✓ Nhìn thẳng vào camera</li>
                    <li>✓ Giữ khuôn mặt trong khung tròn</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}