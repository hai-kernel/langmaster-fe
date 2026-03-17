/**
 * AI Speech Service
 * Handles speech recognition, pronunciation scoring, and AI conversation
 * 
 * In production, this would integrate with services like:
 * - Azure Speech Services
 * - Google Cloud Speech-to-Text
 * - Amazon Transcribe
 * - Custom ML models
 */

import type { PronunciationScore, PronunciationResult, WordAnalysis } from '@/types';

// Simulated delay for API calls
const simulateDelay = (ms: number = 1500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyzes audio for pronunciation accuracy
 */
export async function analyzePronunciation(
  audioBlob: Blob,
  targetText: string
): Promise<PronunciationResult> {
  await simulateDelay();

  // Mock analysis - In production, this would call AI API
  const words = targetText.split(' ');
  const wordAnalysis: WordAnalysis[] = words.map(word => {
    const randomScore = Math.random() * 40 + 60; // 60-100
    return {
      word,
      isCorrect: randomScore > 70,
      score: randomScore,
      expectedPronunciation: getPhonetic(word),
      actualPronunciation: getPhonetic(word),
      feedback: randomScore < 70 
        ? `Focus on the pronunciation of "${word}"`
        : undefined,
    };
  });

  const overallScore = wordAnalysis.reduce((sum, w) => sum + w.score, 0) / words.length;

  const score: PronunciationScore = {
    overall: Math.round(overallScore),
    pronunciation: Math.round(overallScore * 0.95 + Math.random() * 10),
    fluency: Math.round(overallScore * 0.9 + Math.random() * 20),
    intonation: Math.round(overallScore * 0.85 + Math.random() * 30),
    accuracy: Math.round(overallScore * 1.05),
  };

  const result: PronunciationResult = {
    score,
    transcript: targetText, // Mock: would be actual transcription
    targetText,
    wordAnalysis,
    suggestions: generateSuggestions(wordAnalysis),
    strengths: generateStrengths(score),
    weaknesses: generateWeaknesses(score),
  };

  return result;
}

/**
 * Speech-to-Text transcription
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  await simulateDelay(1000);
  
  // Mock transcription
  return "Hello, how are you today?";
}

/**
 * Scores conversation based on relevance, grammar, and fluency
 */
export async function scoreConversation(
  transcript: string,
  context: string
): Promise<{
  score: number;
  feedback: string[];
  grammarErrors: { text: string; correction: string }[];
}> {
  await simulateDelay();

  const score = Math.floor(Math.random() * 30 + 70); // 70-100

  return {
    score,
    feedback: [
      "Great job maintaining conversation flow!",
      "Good use of vocabulary",
      "Consider using more varied sentence structures",
    ],
    grammarErrors: [
      {
        text: "I go to school yesterday",
        correction: "I went to school yesterday",
      },
    ],
  };
}

/**
 * Generate AI conversation response
 */
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'ai'; message: string }[],
  scenario: string
): Promise<string> {
  await simulateDelay(800);

  // Mock AI responses based on scenario
  const responses = {
    restaurant: [
      "Good evening! Do you have a reservation?",
      "Certainly! Would you like to see our menu?",
      "What would you like to order today?",
      "Is there anything else I can help you with?",
    ],
    hotel: [
      "Welcome to our hotel! How may I assist you?",
      "I have a few rooms available. What type would you prefer?",
      "Your room is ready. Here's your key card.",
      "Enjoy your stay! Please let us know if you need anything.",
    ],
    job_interview: [
      "Thank you for coming. Please tell me about yourself.",
      "That's interesting. What are your greatest strengths?",
      "Can you describe a challenging situation you've faced?",
      "Do you have any questions for me?",
    ],
    default: [
      "That's interesting! Can you tell me more?",
      "I see. What do you think about that?",
      "Great point! How would you approach this?",
      "Thank you for sharing. What else would you like to discuss?",
    ],
  };

  const scenarioKey = scenario.toLowerCase().includes('restaurant') ? 'restaurant'
    : scenario.toLowerCase().includes('hotel') ? 'hotel'
    : scenario.toLowerCase().includes('interview') ? 'job_interview'
    : 'default';

  const options = responses[scenarioKey];
  const index = conversationHistory.length % options.length;
  
  return options[index];
}

/**
 * Evaluate overall speaking performance
 */
export async function evaluateSpeaking(
  audioBlob: Blob,
  expectedDuration: number
): Promise<{
  fluencyScore: number;
  paceScore: number;
  volumeScore: number;
  clarityScore: number;
}> {
  await simulateDelay();

  return {
    fluencyScore: Math.floor(Math.random() * 30 + 70),
    paceScore: Math.floor(Math.random() * 30 + 70),
    volumeScore: Math.floor(Math.random() * 30 + 70),
    clarityScore: Math.floor(Math.random() * 30 + 70),
  };
}

// Helper functions
function getPhonetic(word: string): string {
  // Simplified phonetic representation
  const phonetics: Record<string, string> = {
    hello: '/həˈloʊ/',
    world: '/wɜːrld/',
    restaurant: '/ˈrestərɑːnt/',
    pronunciation: '/prəˌnʌnsiˈeɪʃən/',
    english: '/ˈɪŋɡlɪʃ/',
    learning: '/ˈlɜːrnɪŋ/',
  };

  return phonetics[word.toLowerCase()] || `/${word}/`;
}

function generateSuggestions(wordAnalysis: WordAnalysis[]): string[] {
  const incorrectWords = wordAnalysis.filter(w => !w.isCorrect);
  
  if (incorrectWords.length === 0) {
    return [
      "Excellent pronunciation! Keep up the great work!",
      "Try to maintain this level of clarity in longer sentences.",
    ];
  }

  return [
    `Focus on improving: ${incorrectWords.map(w => w.word).join(', ')}`,
    "Practice these words slowly, then gradually increase speed",
    "Listen to native speakers and try to mimic their pronunciation",
    "Record yourself and compare with native pronunciation",
  ];
}

function generateStrengths(score: PronunciationScore): string[] {
  const strengths: string[] = [];

  if (score.pronunciation > 80) strengths.push("Excellent pronunciation clarity");
  if (score.fluency > 80) strengths.push("Natural speaking flow");
  if (score.intonation > 80) strengths.push("Good tone variation");
  if (score.accuracy > 80) strengths.push("High word accuracy");

  if (strengths.length === 0) {
    strengths.push("Keep practicing, you're making progress!");
  }

  return strengths;
}

function generateWeaknesses(score: PronunciationScore): string[] {
  const weaknesses: string[] = [];

  if (score.pronunciation < 70) weaknesses.push("Work on pronunciation clarity");
  if (score.fluency < 70) weaknesses.push("Practice speaking more smoothly");
  if (score.intonation < 70) weaknesses.push("Improve tone and rhythm");
  if (score.accuracy < 70) weaknesses.push("Focus on word accuracy");

  return weaknesses;
}

/**
 * Convert audio blob to base64 for API transmission
 */
export function audioToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check if browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Get microphone permission status
 */
export async function getMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}
