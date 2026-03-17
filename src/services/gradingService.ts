/**
 * Grading Service
 * Handles automated grading for tests, assignments, and exercises
 */

export interface GradingCriteria {
  accuracy: number; // weight 0-1
  completeness: number; // weight 0-1
  speed: number; // weight 0-1
  effort: number; // weight 0-1
}

export interface TestAnswer {
  questionId: string;
  answer: string | number | string[];
  timeSpent: number; // seconds
  attempts: number;
}

export interface TestQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
  question: string;
  correctAnswer: string | number;
  points: number;
  options?: string[];
}

export interface TestResult {
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  feedback: string[];
  questionResults: QuestionResult[];
  timeSpent: number;
  completedAt: Date;
}

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  earnedPoints: number;
  maxPoints: number;
  feedback?: string;
  userAnswer: string | number | string[];
  correctAnswer: string | number;
}

export interface AssignmentGrade {
  score: number;
  feedback: string;
  rubric: {
    criterion: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  suggestions: string[];
}

/**
 * Grade a complete test
 */
export function gradeTest(
  questions: TestQuestion[],
  answers: TestAnswer[],
  passingScore: number = 70
): TestResult {
  const questionResults: QuestionResult[] = [];
  let totalPoints = 0;
  let earnedPoints = 0;
  let totalTime = 0;

  questions.forEach(question => {
    totalPoints += question.points;
    const answer = answers.find(a => a.questionId === question.id);
    
    if (!answer) {
      questionResults.push({
        questionId: question.id,
        correct: false,
        earnedPoints: 0,
        maxPoints: question.points,
        feedback: 'Question not answered',
        userAnswer: '',
        correctAnswer: question.correctAnswer,
      });
      return;
    }

    totalTime += answer.timeSpent;
    const result = gradeQuestion(question, answer.answer);
    
    earnedPoints += result.earnedPoints;
    questionResults.push(result);
  });

  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = percentage >= passingScore;
  const grade = calculateLetterGrade(percentage);
  const feedback = generateTestFeedback(percentage, questionResults, totalTime);

  return {
    totalPoints,
    earnedPoints,
    percentage: Math.round(percentage * 10) / 10,
    passed,
    grade,
    feedback,
    questionResults,
    timeSpent: totalTime,
    completedAt: new Date(),
  };
}

/**
 * Grade a single question
 */
export function gradeQuestion(
  question: TestQuestion,
  userAnswer: string | number | string[]
): QuestionResult {
  let correct = false;
  let earnedPoints = 0;
  let feedback: string | undefined;

  switch (question.type) {
    case 'multiple-choice':
    case 'true-false':
      correct = userAnswer === question.correctAnswer;
      earnedPoints = correct ? question.points : 0;
      feedback = correct 
        ? 'Correct!' 
        : `Incorrect. The correct answer is: ${question.options?.[question.correctAnswer as number]}`;
      break;

    case 'fill-blank':
      const userText = String(userAnswer).trim().toLowerCase();
      const correctText = String(question.correctAnswer).trim().toLowerCase();
      correct = userText === correctText;
      earnedPoints = correct ? question.points : 0;
      feedback = correct 
        ? 'Correct!' 
        : `Incorrect. The correct answer is: ${question.correctAnswer}`;
      break;

    case 'short-answer':
      // For short answers, use fuzzy matching or keyword detection
      const similarity = calculateTextSimilarity(
        String(userAnswer),
        String(question.correctAnswer)
      );
      
      if (similarity >= 0.9) {
        correct = true;
        earnedPoints = question.points;
        feedback = 'Excellent answer!';
      } else if (similarity >= 0.7) {
        correct = true;
        earnedPoints = Math.round(question.points * 0.8);
        feedback = 'Good answer, but could be more complete.';
      } else if (similarity >= 0.5) {
        correct = false;
        earnedPoints = Math.round(question.points * 0.5);
        feedback = 'Partially correct. Review the topic for better understanding.';
      } else {
        correct = false;
        earnedPoints = 0;
        feedback = 'Incorrect. Please review the material.';
      }
      break;
  }

  return {
    questionId: question.id,
    correct,
    earnedPoints,
    maxPoints: question.points,
    feedback,
    userAnswer,
    correctAnswer: question.correctAnswer,
  };
}

/**
 * Calculate letter grade from percentage
 */
export function calculateLetterGrade(percentage: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Generate feedback for test results
 */
function generateTestFeedback(
  percentage: number,
  results: QuestionResult[],
  totalTime: number
): string[] {
  const feedback: string[] = [];

  // Overall performance
  if (percentage >= 90) {
    feedback.push('🎉 Excellent work! You have a strong understanding of the material.');
  } else if (percentage >= 80) {
    feedback.push('👍 Good job! You have a solid grasp of most concepts.');
  } else if (percentage >= 70) {
    feedback.push('✓ You passed, but there is room for improvement.');
  } else {
    feedback.push('📚 Keep practicing. Review the material and try again.');
  }

  // Identify weak areas
  const incorrectResults = results.filter(r => !r.correct);
  if (incorrectResults.length > 0 && incorrectResults.length <= 3) {
    feedback.push(`Review questions: ${incorrectResults.map((_, i) => i + 1).join(', ')}`);
  }

  // Time feedback
  const avgTimePerQuestion = totalTime / results.length;
  if (avgTimePerQuestion < 30) {
    feedback.push('⚡ You completed this quickly. Make sure to read questions carefully.');
  } else if (avgTimePerQuestion > 120) {
    feedback.push('⏱️ Take your time, but try to improve your speed with practice.');
  }

  return feedback;
}

/**
 * Calculate text similarity (simple word-based approach)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  if (words1.length === 0 || words2.length === 0) return 0;

  const commonWords = words1.filter(w => words2.includes(w));
  const similarity = (commonWords.length * 2) / (words1.length + words2.length);

  return similarity;
}

/**
 * Grade pronunciation exercise
 */
export function gradePronunciation(
  targetText: string,
  transcribedText: string,
  pronunciationScore: number,
  fluencyScore: number
): {
  score: number;
  grade: string;
  feedback: string[];
} {
  const textSimilarity = calculateTextSimilarity(targetText, transcribedText);
  
  // Weighted scoring
  const finalScore = (
    pronunciationScore * 0.4 +
    fluencyScore * 0.3 +
    textSimilarity * 100 * 0.3
  );

  let grade: string;
  const feedback: string[] = [];

  if (finalScore >= 90) {
    grade = 'Excellent';
    feedback.push('🌟 Outstanding pronunciation! Keep up the great work!');
  } else if (finalScore >= 80) {
    grade = 'Good';
    feedback.push('👍 Good pronunciation. Minor improvements possible.');
  } else if (finalScore >= 70) {
    grade = 'Fair';
    feedback.push('✓ Fair pronunciation. Practice will help improve.');
  } else {
    grade = 'Needs Improvement';
    feedback.push('📚 Keep practicing. Focus on clarity and pace.');
  }

  // Specific feedback
  if (pronunciationScore < 70) {
    feedback.push('Work on pronouncing individual sounds more clearly.');
  }
  if (fluencyScore < 70) {
    feedback.push('Try to speak more smoothly and naturally.');
  }
  if (textSimilarity < 0.7) {
    feedback.push('Make sure you are saying all the words correctly.');
  }

  return {
    score: Math.round(finalScore),
    grade,
    feedback,
  };
}

/**
 * Grade conversation exercise
 */
export function gradeConversation(params: {
  turns: number;
  targetTurns: number;
  relevanceScore: number;
  grammarScore: number;
  vocabularyScore: number;
}): AssignmentGrade {
  const { turns, targetTurns, relevanceScore, grammarScore, vocabularyScore } = params;

  // Calculate rubric scores
  const rubric = [
    {
      criterion: 'Conversation Length',
      score: Math.min((turns / targetTurns) * 10, 10),
      maxScore: 10,
      feedback: turns >= targetTurns
        ? 'Completed the full conversation'
        : `Complete ${targetTurns - turns} more turns`,
    },
    {
      criterion: 'Relevance',
      score: (relevanceScore / 10),
      maxScore: 10,
      feedback: relevanceScore >= 8
        ? 'Stayed on topic throughout'
        : 'Try to stay more focused on the topic',
    },
    {
      criterion: 'Grammar',
      score: (grammarScore / 10),
      maxScore: 10,
      feedback: grammarScore >= 8
        ? 'Excellent grammar usage'
        : 'Review grammar rules and practice',
    },
    {
      criterion: 'Vocabulary',
      score: (vocabularyScore / 10),
      maxScore: 10,
      feedback: vocabularyScore >= 8
        ? 'Great vocabulary usage'
        : 'Expand your vocabulary with new words',
    },
  ];

  const totalScore = rubric.reduce((sum, r) => sum + r.score, 0);
  const maxScore = rubric.reduce((sum, r) => sum + r.maxScore, 0);
  const percentage = (totalScore / maxScore) * 100;

  const suggestions: string[] = [];
  if (relevanceScore < 8) {
    suggestions.push('Stay focused on the conversation topic');
  }
  if (grammarScore < 8) {
    suggestions.push('Review grammar lessons for common mistakes');
  }
  if (vocabularyScore < 8) {
    suggestions.push('Practice using more diverse vocabulary');
  }
  if (turns < targetTurns) {
    suggestions.push('Try to have longer conversations');
  }

  return {
    score: Math.round(percentage),
    feedback: percentage >= 80 ? 'Excellent conversation!' : 'Good effort, keep practicing!',
    rubric,
    suggestions: suggestions.length > 0 ? suggestions : ['Keep up the great work!'],
  };
}

/**
 * Calculate class average
 */
export function calculateClassAverage(scores: number[]): {
  average: number;
  median: number;
  highest: number;
  lowest: number;
  distribution: { range: string; count: number }[];
} {
  if (scores.length === 0) {
    return {
      average: 0,
      median: 0,
      highest: 0,
      lowest: 0,
      distribution: [],
    };
  }

  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const distribution = [
    { range: '90-100', count: scores.filter(s => s >= 90).length },
    { range: '80-89', count: scores.filter(s => s >= 80 && s < 90).length },
    { range: '70-79', count: scores.filter(s => s >= 70 && s < 80).length },
    { range: '60-69', count: scores.filter(s => s >= 60 && s < 70).length },
    { range: '0-59', count: scores.filter(s => s < 60).length },
  ];

  return {
    average: Math.round(average * 10) / 10,
    median: Math.round(median * 10) / 10,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    distribution,
  };
}
