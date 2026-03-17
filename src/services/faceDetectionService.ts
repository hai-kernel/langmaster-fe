/**
 * Face Detection Service
 * Handles face enrollment, verification, and liveness detection
 * 
 * In production, this would integrate with services like:
 * - AWS Rekognition
 * - Azure Face API
 * - Google Cloud Vision API
 * - Face++ API
 * - Custom ML models
 */

export interface FaceDetectionResult {
  detected: boolean;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality?: {
    brightness: number;
    sharpness: number;
    position: 'center' | 'left' | 'right' | 'top' | 'bottom';
  };
  errors?: string[];
}

export interface FaceEnrollmentData {
  userId: string;
  faceId: string;
  images: string[]; // Base64 encoded images
  enrolledAt: Date;
  confidence: number;
}

export interface FaceVerificationResult {
  verified: boolean;
  confidence: number;
  userId?: string;
  message: string;
  livenessCheck?: boolean;
}

// Simulated delay for API calls
const simulateDelay = (ms: number = 1500) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Detect face in image
 */
export async function detectFace(imageData: string): Promise<FaceDetectionResult> {
  await simulateDelay(800);

  // Mock detection - In production, this would call AI API
  const detected = Math.random() > 0.2; // 80% success rate

  if (!detected) {
    return {
      detected: false,
      confidence: 0,
      errors: ['No face detected. Please position your face in the center of the frame.'],
    };
  }

  const confidence = Math.random() * 20 + 80; // 80-100
  const quality = {
    brightness: Math.random() * 20 + 80,
    sharpness: Math.random() * 20 + 80,
    position: 'center' as const,
  };

  // Check quality thresholds
  const errors: string[] = [];
  if (quality.brightness < 70) {
    errors.push('Image too dark. Please ensure good lighting.');
  }
  if (quality.sharpness < 70) {
    errors.push('Image too blurry. Please hold still.');
  }

  return {
    detected: true,
    confidence,
    boundingBox: {
      x: 100,
      y: 80,
      width: 200,
      height: 240,
    },
    quality,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Enroll user's face
 */
export async function enrollFace(
  userId: string,
  images: string[]
): Promise<FaceEnrollmentData> {
  await simulateDelay(2000);

  if (images.length < 3) {
    throw new Error('At least 3 images required for enrollment');
  }

  // Mock enrollment
  const faceId = `face_${userId}_${Date.now()}`;
  
  return {
    userId,
    faceId,
    images,
    enrolledAt: new Date(),
    confidence: Math.random() * 10 + 90, // 90-100
  };
}

/**
 * Verify face against enrolled data
 */
export async function verifyFace(
  userId: string,
  imageData: string
): Promise<FaceVerificationResult> {
  await simulateDelay(1500);

  // First, detect face
  const detection = await detectFace(imageData);
  
  if (!detection.detected) {
    return {
      verified: false,
      confidence: 0,
      message: detection.errors?.[0] || 'Face not detected',
    };
  }

  // Mock verification
  const isEnrolled = localStorage.getItem(`face_enrolled_${userId}`) === 'true';
  
  if (!isEnrolled) {
    return {
      verified: false,
      confidence: 0,
      message: 'User not enrolled. Please complete face enrollment first.',
    };
  }

  const confidence = Math.random() * 15 + 85; // 85-100
  const verified = confidence > 75;

  return {
    verified,
    confidence,
    userId: verified ? userId : undefined,
    message: verified
      ? 'Face verified successfully!'
      : 'Face verification failed. Please try again.',
    livenessCheck: true,
  };
}

/**
 * Perform liveness detection to prevent spoofing
 */
export async function checkLiveness(videoFrames: string[]): Promise<{
  isLive: boolean;
  confidence: number;
  checks: {
    blinkDetected: boolean;
    movementDetected: boolean;
    depthCheck: boolean;
  };
}> {
  await simulateDelay(1000);

  // Mock liveness check
  return {
    isLive: Math.random() > 0.1, // 90% pass rate
    confidence: Math.random() * 15 + 85,
    checks: {
      blinkDetected: Math.random() > 0.2,
      movementDetected: Math.random() > 0.1,
      depthCheck: Math.random() > 0.15,
    },
  };
}

/**
 * Update enrolled face data
 */
export async function updateFaceEnrollment(
  userId: string,
  newImages: string[]
): Promise<FaceEnrollmentData> {
  await simulateDelay(1500);

  return enrollFace(userId, newImages);
}

/**
 * Delete enrolled face data
 */
export async function deleteFaceEnrollment(userId: string): Promise<boolean> {
  await simulateDelay(500);

  localStorage.removeItem(`face_enrolled_${userId}`);
  localStorage.removeItem(`face_data_${userId}`);
  
  return true;
}

/**
 * Get camera stream with specific constraints
 */
export async function getCameraStream(facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    return stream;
  } catch (error) {
    console.error('Failed to get camera stream:', error);
    throw new Error('Camera access denied. Please grant camera permissions.');
  }
}

/**
 * Capture image from video element
 */
export function captureImageFromVideo(
  video: HTMLVideoElement,
  maxWidth: number = 640
): string {
  const canvas = document.createElement('canvas');
  const aspectRatio = video.videoHeight / video.videoWidth;
  
  canvas.width = maxWidth;
  canvas.height = maxWidth * aspectRatio;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Check if camera is available
 */
export async function isCameraAvailable(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Failed to enumerate devices:', error);
    return false;
  }
}

/**
 * Get camera permission status
 */
export async function getCameraPermission(): Promise<PermissionState> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state;
  } catch (error) {
    // Fallback: try to access camera
    try {
      const stream = await getCameraStream();
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    } catch {
      return 'denied';
    }
  }
}

/**
 * Calculate face position feedback
 */
export function getFacePositionFeedback(
  faceBox: { x: number; y: number; width: number; height: number },
  frameWidth: number,
  frameHeight: number
): string[] {
  const feedback: string[] = [];
  const centerX = faceBox.x + faceBox.width / 2;
  const centerY = faceBox.y + faceBox.height / 2;
  const frameCenterX = frameWidth / 2;
  const frameCenterY = frameHeight / 2;

  // Check horizontal position
  if (centerX < frameCenterX * 0.7) {
    feedback.push('Move slightly to the right');
  } else if (centerX > frameCenterX * 1.3) {
    feedback.push('Move slightly to the left');
  }

  // Check vertical position
  if (centerY < frameCenterY * 0.7) {
    feedback.push('Move down a bit');
  } else if (centerY > frameCenterY * 1.3) {
    feedback.push('Move up a bit');
  }

  // Check distance (based on face size)
  const faceArea = faceBox.width * faceBox.height;
  const frameArea = frameWidth * frameHeight;
  const faceRatio = faceArea / frameArea;

  if (faceRatio < 0.15) {
    feedback.push('Move closer to the camera');
  } else if (faceRatio > 0.4) {
    feedback.push('Move farther from the camera');
  }

  if (feedback.length === 0) {
    feedback.push('Perfect! Hold this position');
  }

  return feedback;
}

/**
 * Store face enrollment status locally
 */
export function storeFaceEnrollmentStatus(userId: string, enrolled: boolean): void {
  localStorage.setItem(`face_enrolled_${userId}`, enrolled.toString());
}

/**
 * Check if user has enrolled face
 */
export function isFaceEnrolled(userId: string): boolean {
  return localStorage.getItem(`face_enrolled_${userId}`) === 'true';
}
