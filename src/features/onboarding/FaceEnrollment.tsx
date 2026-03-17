import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Camera, Shield, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { FaceDetection } from '@/shared/ui/FaceDetection';

type EnrollmentStep = 'intro' | 'capture' | 'success';

export function FaceEnrollment() {
  const navigate = useNavigate();
  const [step, setStep] = useState<EnrollmentStep>('intro');
  const [isCapturing, setIsCapturing] = useState(false);

  const handleStartCapture = () => {
    setStep('capture');
    setIsCapturing(true);
  };

  const handleFaceDetected = (faceData: any) => {
    // In real app, save face data to backend
    console.log('Face detected:', faceData);
    setTimeout(() => {
      setIsCapturing(false);
      setStep('success');
    }, 1000);
  };

  const handleComplete = () => {
    // Mark face enrollment as complete
    localStorage.setItem('faceEnrolled', 'true');
    navigate('/register');
  };

  const handleSkip = () => {
    navigate('/register');
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-2xl">
                <Shield className="h-10 w-10" />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Set up Face Verification
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Verify your identity during tests and pronunciation practice for secure learning
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            <Card className="p-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex-shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Secure Test Verification
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ensure authentic test results with identity verification
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Enhanced Pronunciation Practice
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Better AI feedback with facial recognition during speaking exercises
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Privacy First:</strong> Your face data is encrypted and stored securely. 
                  It's only used for verification and never shared with third parties.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            <Button
              size="lg"
              onClick={handleStartCapture}
              className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Camera className="mr-2 h-5 w-5" />
              Set Up Face Verification
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleSkip}
              className="rounded-2xl px-8 py-6 text-lg border-2"
            >
              Skip for now
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === 'capture') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Position your face
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Look directly at the camera and stay still
            </p>
          </motion.div>

          {/* Face Detection Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FaceDetection
              onFaceDetected={handleFaceDetected}
              showInstructions
              mode="enrollment"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6"
          >
            <Button
              variant="outline"
              onClick={handleSkip}
              className="rounded-2xl"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success step
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl">
              <CheckCircle className="h-14 w-14" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Face Verification Set Up!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-8"
          >
            You're all set! Your identity will be verified during tests and pronunciation practice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              onClick={handleComplete}
              className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Complete Setup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
