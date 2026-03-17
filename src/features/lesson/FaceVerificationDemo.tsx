import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { FaceDetection } from '@/shared/ui/FaceDetection';
import { Camera, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function FaceVerificationDemo() {
  const [showFaceDetection, setShowFaceDetection] = useState(false);
  const [detectionMode, setDetectionMode] = useState<'enrollment' | 'verification'>('enrollment');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [faceData, setFaceData] = useState<string | null>(null);

  const handleEnrollmentSuccess = (data?: string) => {
    setIsEnrolled(true);
    setFaceData(data || null);
    setShowFaceDetection(false);
    toast.success('Đã đăng ký khuôn mặt thành công! 🎉');
  };

  const handleVerificationSuccess = () => {
    setShowFaceDetection(false);
    toast.success('Xác minh thành công! Bạn có thể bắt đầu học. 👍');
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const startEnrollment = () => {
    setDetectionMode('enrollment');
    setShowFaceDetection(true);
  };

  const startVerification = () => {
    setDetectionMode('verification');
    setShowFaceDetection(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Face Verification Demo</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Hệ thống xác minh học sinh bằng khuôn mặt
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feature Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6 rounded-3xl border-2 border-green-100 dark:border-green-900">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Tính năng Face ID
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600 dark:text-green-400">
                ✅ Khi nào dùng?
              </h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Làm bài test / kiểm tra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Luyện phát âm với AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Tham gia lớp học trực tuyến</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Xác minh danh tính học sinh</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600 dark:text-green-400">
                🔒 Quyền riêng tư
              </h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Chỉ lưu dữ liệu khuôn mặt được mã hóa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Không lưu trữ video hoặc hình ảnh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Camera tắt ngay sau khi xác minh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Dữ liệu được bảo mật an toàn</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Demo Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6 mb-8"
      >
        {/* Enrollment Card */}
        <Card className={`p-6 rounded-3xl border-2 transition-all ${
          isEnrolled 
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' 
            : 'border-gray-200 dark:border-gray-700'
        }`}>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              {isEnrolled ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-500">
                  <Camera className="h-6 w-6" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">1. Đăng ký khuôn mặt</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lần đầu vào lớp
                </p>
              </div>
            </div>
          </div>
          
          {isEnrolled ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <p className="font-medium">✓ Đã đăng ký thành công!</p>
                <p className="text-sm mt-1">Bạn có thể xác minh để bắt đầu học.</p>
              </div>
              <Button
                onClick={startEnrollment}
                variant="outline"
                className="w-full rounded-xl"
              >
                Đăng ký lại
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quét khuôn mặt của bạn để lưu vào hệ thống. Chỉ cần làm một lần.
              </p>
              <Button
                onClick={startEnrollment}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
              >
                <Camera className="h-5 w-5 mr-2" />
                Bắt đầu đăng ký
              </Button>
            </div>
          )}
        </Card>

        {/* Verification Card */}
        <Card className={`p-6 rounded-3xl border-2 ${
          isEnrolled 
            ? 'border-green-200 dark:border-green-800' 
            : 'border-gray-200 dark:border-gray-700 opacity-50'
        }`}>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isEnrolled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              } shadow-lg`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">2. Xác minh học sinh</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trước khi học / thi
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {isEnrolled ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Xác minh khuôn mặt của bạn để đảm bảo bạn là người đang học.
                </p>
                <Button
                  onClick={startVerification}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
                >
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Xác minh ngay
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Vui lòng đăng ký khuôn mặt trước khi xác minh.
                </p>
                <Button
                  disabled
                  className="w-full rounded-xl opacity-50 cursor-not-allowed"
                >
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Xác minh ngay
                </Button>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 rounded-3xl border-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">🎯 Cách hoạt động</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl font-bold text-green-600">
                1
              </div>
              <h4 className="font-semibold mb-2">Đăng ký lần đầu</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hệ thống quét và lưu đặc điểm khuôn mặt của bạn (không lưu ảnh)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl font-bold text-green-600">
                2
              </div>
              <h4 className="font-semibold mb-2">Xác minh mỗi lần học</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                So sánh khuôn mặt hiện tại với dữ liệu đã lưu để xác nhận
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl font-bold text-green-600">
                3
              </div>
              <h4 className="font-semibold mb-2">Bắt đầu học</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sau khi xác minh thành công, bạn có thể tiếp tục học tập
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Face Detection Modal */}
      <FaceDetection
        mode={detectionMode}
        isActive={showFaceDetection}
        onClose={() => setShowFaceDetection(false)}
        onSuccess={detectionMode === 'enrollment' ? handleEnrollmentSuccess : handleVerificationSuccess}
        onError={handleError}
        studentName="Nguyễn Văn A"
      />
    </div>
  );
}
