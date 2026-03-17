# 🔌 English AI - API Specification

> RESTful API Documentation for Backend Integration

**Version**: 1.0.0  
**Last Updated**: 19/01/2026  
**Base URL**: `https://api.english-ai.com/v1`

---

## 📖 Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [User Management](#3-user-management)
4. [Class Management](#4-class-management)
5. [Session & Lesson](#5-session--lesson)
6. [Tests & Assessments](#6-tests--assessments)
7. [Vocabulary](#7-vocabulary)
8. [AI Services](#8-ai-services)
9. [Gamification](#9-gamification)
10. [Progress Tracking](#10-progress-tracking)
11. [Teacher APIs](#11-teacher-apis)
12. [Admin APIs](#12-admin-apis)
13. [Notifications](#13-notifications)
14. [Analytics](#14-analytics)
15. [File Upload](#15-file-upload)
16. [Real-time WebSocket](#16-real-time-websocket)
17. [Error Codes](#17-error-codes)
18. [Rate Limiting](#18-rate-limiting)

---

## 1. Overview

### 1.1 Base URL
```
Production:  https://api.english-ai.com/v1
Staging:     https://staging-api.english-ai.com/v1
Development: http://localhost:3000/api/v1
```

### 1.2 Request Format
- **Content-Type**: `application/json`
- **Authorization**: `Bearer {JWT_TOKEN}` (in headers)
- **Accept**: `application/json`

### 1.3 Response Format
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Success message",
  "timestamp": "2026-01-19T10:30:00Z"
}
```

### 1.4 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  },
  "timestamp": "2026-01-19T10:30:00Z"
}
```

---

## 2. Authentication

### 2.1 Register

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "learningGoal": "conversation",
  "levelSelection": "beginner"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatar": "https://cdn.english-ai.com/avatars/default.png",
      "role": "student",
      "level": 1,
      "xp": 0,
      "streak": 0,
      "faceIdEnrolled": false,
      "createdAt": "2026-01-19T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

### 2.2 Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatar": "https://cdn.english-ai.com/avatars/user123.jpg",
      "role": "student",
      "level": 5,
      "xp": 1250,
      "streak": 7,
      "totalLessonsCompleted": 12,
      "enrolledClasses": ["cls_001", "cls_002"],
      "faceIdEnrolled": true,
      "permissions": ["view_dashboard", "take_lessons", "take_tests"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 2.3 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.4 Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 2.5 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## 3. User Management

### 3.1 Get Current User

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": "https://cdn.english-ai.com/avatars/user123.jpg",
    "role": "student",
    "level": 5,
    "xp": 1250,
    "streak": 7,
    "totalLessonsCompleted": 12,
    "enrolledClasses": ["cls_001", "cls_002"],
    "badges": ["badge_001", "badge_002"],
    "achievements": [
      {
        "id": "ach_001",
        "title": "First Lesson",
        "progress": 1,
        "target": 1,
        "completed": true
      }
    ],
    "faceIdEnrolled": true,
    "settings": {
      "notifications": true,
      "darkMode": false,
      "language": "vi"
    },
    "createdAt": "2025-12-01T00:00:00Z",
    "lastActiveAt": "2026-01-19T10:30:00Z"
  }
}
```

### 3.2 Update Profile

**Endpoint:** `PATCH /users/me`

**Request Body:**
```json
{
  "name": "Nguyễn Văn B",
  "avatar": "https://cdn.english-ai.com/avatars/newavatar.jpg",
  "settings": {
    "notifications": false,
    "darkMode": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "name": "Nguyễn Văn B",
    "avatar": "https://cdn.english-ai.com/avatars/newavatar.jpg",
    "settings": {
      "notifications": false,
      "darkMode": true
    }
  },
  "message": "Profile updated successfully"
}
```

### 3.3 Upload Avatar

**Endpoint:** `POST /users/me/avatar`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
FormData:
  avatar: File (image/jpeg, image/png, max 5MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.english-ai.com/avatars/user123_new.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

### 3.4 Get User Progress

**Endpoint:** `GET /users/me/progress`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_1234567890",
    "currentSessionId": "sess_005",
    "currentLessonId": "lsn_023",
    "completedSessions": ["sess_001", "sess_002", "sess_003"],
    "completedLessons": ["lsn_001", "lsn_002", "lsn_003"],
    "lessonScores": {
      "lsn_001": 85,
      "lsn_002": 92,
      "lsn_003": 78
    },
    "vocabularyProgress": {
      "word_001": 100,
      "word_002": 75,
      "word_003": 50
    },
    "streakHistory": {
      "current": 7,
      "longest": 15,
      "freezesUsed": 2,
      "freezesRemaining": 1
    },
    "lastActiveDate": "2026-01-19T10:30:00Z"
  }
}
```

---

## 4. Class Management

### 4.1 Get All Classes (Student View)

**Endpoint:** `GET /classes`

**Query Parameters:**
- `enrolled`: `true|false` (filter enrolled classes)
- `level`: `beginner|intermediate|advanced`
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "cls_001",
        "name": "English Conversation - Beginner",
        "description": "Lớp học giao tiếp tiếng Anh cơ bản",
        "teacherName": "Ms. Sarah Johnson",
        "teacherId": "tch_001",
        "teacherAvatar": "https://cdn.english-ai.com/avatars/sarah.jpg",
        "studentCount": 24,
        "maxStudents": 30,
        "schedule": "Thứ 2, 4, 6 - 7:00 PM",
        "level": "beginner",
        "color": "from-green-400 to-green-500",
        "startDate": "2026-01-05T00:00:00Z",
        "endDate": "2026-03-28T00:00:00Z",
        "isActive": true,
        "enrolled": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 4.2 Get Class Details

**Endpoint:** `GET /classes/:classId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cls_001",
    "name": "English Conversation - Beginner",
    "description": "Lớp học giao tiếp tiếng Anh cơ bản cho người mới bắt đầu",
    "teacherName": "Ms. Sarah Johnson",
    "teacherId": "tch_001",
    "teacherAvatar": "https://cdn.english-ai.com/avatars/sarah.jpg",
    "teacherBio": "10+ years teaching English",
    "studentCount": 24,
    "maxStudents": 30,
    "schedule": {
      "daysOfWeek": [1, 3, 5],
      "startTime": "19:00",
      "endTime": "20:30",
      "timezone": "Asia/Ho_Chi_Minh"
    },
    "level": "beginner",
    "curriculum": {
      "id": "curr_001",
      "name": "Beginner Conversation Course",
      "sessions": ["sess_001", "sess_002", "sess_003"]
    },
    "startDate": "2026-01-05T00:00:00Z",
    "endDate": "2026-03-28T00:00:00Z",
    "isActive": true,
    "enrolled": true,
    "progress": {
      "completion": 45,
      "lessonsCompleted": 12,
      "totalLessons": 27
    }
  }
}
```

### 4.3 Enroll in Class

**Endpoint:** `POST /classes/:classId/enroll`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "classId": "cls_001",
    "studentId": "usr_1234567890",
    "enrolledAt": "2026-01-19T10:30:00Z"
  },
  "message": "Successfully enrolled in class"
}
```

### 4.4 Leave Class

**Endpoint:** `DELETE /classes/:classId/leave`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully left the class"
}
```

---

## 5. Session & Lesson

### 5.1 Get All Sessions

**Endpoint:** `GET /sessions`

**Query Parameters:**
- `level`: `beginner|intermediate|advanced`
- `status`: `locked|in-progress|completed`
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "sess_001",
        "title": "Giới thiệu bản thân",
        "description": "Học cách tự giới thiệu và hỏi thăm người khác",
        "level": "beginner",
        "thumbnail": "https://cdn.english-ai.com/thumbnails/session1.jpg",
        "totalLessons": 5,
        "completedLessons": 3,
        "estimatedTime": 25,
        "status": "in-progress",
        "order": 1,
        "unlockCondition": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### 5.2 Get Session Details

**Endpoint:** `GET /sessions/:sessionId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "sess_001",
    "title": "Giới thiệu bản thân",
    "description": "Học cách tự giới thiệu và hỏi thăm người khác",
    "level": "beginner",
    "thumbnail": "https://cdn.english-ai.com/thumbnails/session1.jpg",
    "totalLessons": 5,
    "completedLessons": 3,
    "estimatedTime": 25,
    "status": "in-progress",
    "order": 1,
    "lessons": [
      {
        "id": "lsn_001",
        "title": "Greetings & Introductions",
        "type": "video",
        "description": "Learn basic greetings",
        "duration": 5,
        "status": "completed",
        "order": 1,
        "score": 85
      },
      {
        "id": "lsn_002",
        "title": "Pronunciation Practice",
        "type": "pronunciation",
        "description": "Practice greeting phrases",
        "duration": 5,
        "status": "completed",
        "order": 2,
        "score": 92
      },
      {
        "id": "lsn_003",
        "title": "AI Conversation",
        "type": "ai-conversation",
        "description": "Introduce yourself to AI",
        "duration": 10,
        "status": "in-progress",
        "order": 3,
        "score": null
      }
    ],
    "vocabularyCount": 25,
    "userProgress": {
      "completion": 60,
      "averageScore": 88.5,
      "timeSpent": 15
    }
  }
}
```

### 5.3 Get Lesson Details

**Endpoint:** `GET /lessons/:lessonId`

**Response (200 OK):**

**For Video Lesson:**
```json
{
  "success": true,
  "data": {
    "id": "lsn_001",
    "sessionId": "sess_001",
    "title": "Greetings & Introductions",
    "type": "video",
    "description": "Learn basic greetings and how to introduce yourself",
    "duration": 5,
    "status": "completed",
    "order": 1,
    "videoUrl": "https://cdn.english-ai.com/videos/lesson1.mp4",
    "subtitles": [
      {
        "id": "sub_001",
        "text": "Hello, my name is Sarah.",
        "startTime": 0,
        "endTime": 2,
        "words": [
          {
            "text": "Hello",
            "startTime": 0,
            "endTime": 0.5,
            "pronunciation": "/həˈloʊ/",
            "meaning": "Xin chào"
          },
          {
            "text": "my",
            "startTime": 0.6,
            "endTime": 0.8,
            "pronunciation": "/maɪ/",
            "meaning": "của tôi"
          }
        ]
      }
    ],
    "targetWords": ["hello", "my", "name", "is"],
    "minScore": 70,
    "userScore": 85,
    "completedAt": "2026-01-18T15:30:00Z"
  }
}
```

**For Pronunciation Lesson:**
```json
{
  "success": true,
  "data": {
    "id": "lsn_002",
    "sessionId": "sess_001",
    "title": "Pronunciation Practice - Greetings",
    "type": "pronunciation",
    "description": "Practice pronouncing greeting phrases",
    "duration": 5,
    "status": "in-progress",
    "order": 2,
    "exercises": [
      {
        "id": "ex_001",
        "targetText": "Hello, nice to meet you.",
        "audioUrl": "https://cdn.english-ai.com/audio/native_speaker_1.mp3",
        "phonetic": "/həˈloʊ, naɪs tuː miːt juː/",
        "attempts": 2,
        "bestScore": 78
      }
    ],
    "minScore": 70
  }
}
```

### 5.4 Complete Lesson

**Endpoint:** `POST /lessons/:lessonId/complete`

**Request Body:**
```json
{
  "score": 85,
  "timeSpent": 5,
  "data": {
    "watchedVideo": true,
    "markedWords": ["hello", "introduction", "greeting"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lessonId": "lsn_001",
    "completed": true,
    "score": 85,
    "xpEarned": 50,
    "badgesUnlocked": ["badge_first_lesson"],
    "nextLesson": {
      "id": "lsn_002",
      "title": "Pronunciation Practice",
      "status": "locked"
    }
  },
  "message": "Lesson completed! +50 XP"
}
```

---

## 6. Tests & Assessments

### 6.1 Get All Tests

**Endpoint:** `GET /tests`

**Query Parameters:**
- `type`: `placement|progress|unit|mock`
- `status`: `available|completed|expired`
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "test_001",
        "title": "Beginner Placement Test",
        "description": "Determine your English level",
        "type": "placement",
        "duration": 30,
        "questionsCount": 20,
        "passScore": 70,
        "maxAttempts": 1,
        "attemptsUsed": 0,
        "status": "available",
        "deadline": null,
        "createdBy": "admin",
        "faceVerificationRequired": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### 6.2 Get Test Details

**Endpoint:** `GET /tests/:testId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "test_001",
    "title": "Beginner Placement Test",
    "description": "Comprehensive test to determine your English proficiency level",
    "type": "placement",
    "duration": 30,
    "questionsCount": 20,
    "passScore": 70,
    "maxAttempts": 1,
    "attemptsUsed": 0,
    "status": "available",
    "faceVerificationRequired": true,
    "instructions": [
      "You have 30 minutes to complete this test",
      "Face verification is required before starting",
      "You can only take this test once"
    ],
    "sections": [
      {
        "id": "sec_001",
        "title": "Listening Comprehension",
        "questionsCount": 5
      },
      {
        "id": "sec_002",
        "title": "Speaking & Pronunciation",
        "questionsCount": 5
      },
      {
        "id": "sec_003",
        "title": "Vocabulary",
        "questionsCount": 10
      }
    ]
  }
}
```

### 6.3 Start Test

**Endpoint:** `POST /tests/:testId/start`

**Request Body:**
```json
{
  "faceVerification": {
    "imageData": "base64_encoded_image_data"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attemptId": "att_12345",
    "testId": "test_001",
    "startedAt": "2026-01-19T10:30:00Z",
    "endsAt": "2026-01-19T11:00:00Z",
    "questions": [
      {
        "id": "q_001",
        "type": "multiple-choice",
        "question": "What does 'hello' mean?",
        "audioUrl": "https://cdn.english-ai.com/audio/q1.mp3",
        "options": [
          { "id": "opt_1", "text": "Xin chào" },
          { "id": "opt_2", "text": "Tạm biệt" },
          { "id": "opt_3", "text": "Cảm ơn" },
          { "id": "opt_4", "text": "Xin lỗi" }
        ],
        "points": 5
      },
      {
        "id": "q_002",
        "type": "pronunciation",
        "question": "Pronounce the following phrase",
        "targetText": "Nice to meet you",
        "audioUrl": "https://cdn.english-ai.com/audio/native_q2.mp3",
        "points": 10
      }
    ]
  },
  "message": "Test started successfully"
}
```

### 6.4 Submit Answer

**Endpoint:** `POST /tests/attempts/:attemptId/answers`

**Request Body:**
```json
{
  "questionId": "q_001",
  "answer": {
    "selectedOption": "opt_1"
  }
}
```

**Or for pronunciation questions:**
```json
{
  "questionId": "q_002",
  "answer": {
    "audioBlob": "base64_encoded_audio_data"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "questionId": "q_001",
    "saved": true,
    "autoSaved": true
  },
  "message": "Answer saved"
}
```

### 6.5 Submit Test

**Endpoint:** `POST /tests/attempts/:attemptId/submit`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attemptId": "att_12345",
    "testId": "test_001",
    "score": 85,
    "totalPoints": 100,
    "correctAnswers": 17,
    "totalQuestions": 20,
    "passed": true,
    "timeSpent": 25,
    "submittedAt": "2026-01-19T10:55:00Z",
    "sectionScores": [
      { "section": "Listening", "score": 90 },
      { "section": "Speaking", "score": 80 },
      { "section": "Vocabulary", "score": 85 }
    ],
    "feedback": {
      "strengths": ["Good pronunciation", "Strong vocabulary"],
      "weaknesses": ["Improve listening skills"],
      "suggestions": ["Practice more with audio materials"]
    },
    "xpEarned": 100,
    "badgesUnlocked": ["badge_test_taker"],
    "levelUp": false
  },
  "message": "Test submitted successfully"
}
```

### 6.6 Get Test Results

**Endpoint:** `GET /tests/attempts/:attemptId/results`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attemptId": "att_12345",
    "testId": "test_001",
    "testTitle": "Beginner Placement Test",
    "score": 85,
    "passed": true,
    "submittedAt": "2026-01-19T10:55:00Z",
    "detailedResults": [
      {
        "questionId": "q_001",
        "question": "What does 'hello' mean?",
        "yourAnswer": "opt_1",
        "correctAnswer": "opt_1",
        "isCorrect": true,
        "points": 5,
        "earnedPoints": 5
      },
      {
        "questionId": "q_002",
        "question": "Pronounce: Nice to meet you",
        "type": "pronunciation",
        "score": 80,
        "feedback": "Good pronunciation, slightly improve 'meet'",
        "points": 10,
        "earnedPoints": 8
      }
    ]
  }
}
```

---

## 7. Vocabulary

### 7.1 Get All Vocabulary

**Endpoint:** `GET /vocabulary`

**Query Parameters:**
- `sessionId`: string (filter by session)
- `learned`: `true|false`
- `search`: string (search by word)
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "word_001",
        "word": "hello",
        "meaning": "xin chào",
        "pronunciation": "/həˈloʊ/",
        "example": "Hello, how are you?",
        "audioUrl": "https://cdn.english-ai.com/audio/words/hello.mp3",
        "imageUrl": "https://cdn.english-ai.com/images/words/hello.jpg",
        "learned": true,
        "reviewCount": 5,
        "lastReviewed": "2026-01-18T10:00:00Z",
        "mastery": 85,
        "sessionId": "sess_001"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    },
    "stats": {
      "total": 150,
      "learned": 75,
      "learning": 50,
      "notStarted": 25
    }
  }
}
```

### 7.2 Mark Word as Learned

**Endpoint:** `POST /vocabulary/:wordId/learned`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "wordId": "word_001",
    "learned": true,
    "xpEarned": 5
  },
  "message": "Word marked as learned"
}
```

### 7.3 Review Word

**Endpoint:** `POST /vocabulary/:wordId/review`

**Request Body:**
```json
{
  "quality": 4
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "wordId": "word_001",
    "reviewCount": 6,
    "nextReviewDate": "2026-01-22T10:00:00Z",
    "mastery": 90
  },
  "message": "Review recorded"
}
```

### 7.4 Get Words to Review

**Endpoint:** `GET /vocabulary/review`

**Query Parameters:**
- `limit`: number (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "word_005",
        "word": "goodbye",
        "meaning": "tạm biệt",
        "pronunciation": "/ɡʊdˈbaɪ/",
        "nextReviewDate": "2026-01-19T00:00:00Z",
        "reviewCount": 3,
        "mastery": 60
      }
    ],
    "total": 15
  }
}
```

---

## 8. AI Services

### 8.1 Analyze Pronunciation

**Endpoint:** `POST /ai/pronunciation/analyze`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
FormData:
  audio: File (audio/webm, audio/wav, max 10MB)
  targetText: "Hello, nice to meet you"
  language: "en-US"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "score": {
      "overall": 85,
      "pronunciation": 88,
      "fluency": 82,
      "intonation": 86,
      "accuracy": 84
    },
    "transcript": "Hello, nice to meet you",
    "targetText": "Hello, nice to meet you",
    "wordAnalysis": [
      {
        "word": "Hello",
        "isCorrect": true,
        "score": 92,
        "expectedPronunciation": "/həˈloʊ/",
        "actualPronunciation": "/həˈloʊ/",
        "feedback": "Perfect!"
      },
      {
        "word": "nice",
        "isCorrect": true,
        "score": 85,
        "expectedPronunciation": "/naɪs/",
        "actualPronunciation": "/naɪs/",
        "feedback": "Good, but emphasize 'i' more"
      },
      {
        "word": "meet",
        "isCorrect": false,
        "score": 70,
        "expectedPronunciation": "/miːt/",
        "actualPronunciation": "/mɪt/",
        "feedback": "Pronounce with long 'ee' sound"
      }
    ],
    "suggestions": [
      "Practice long vowel sounds",
      "Slow down your pace for better clarity"
    ],
    "strengths": [
      "Good intonation",
      "Clear consonants"
    ],
    "weaknesses": [
      "Vowel pronunciation needs improvement"
    ]
  },
  "message": "Analysis completed"
}
```

### 8.2 AI Conversation

**Endpoint:** `POST /ai/conversation`

**Request Body:**
```json
{
  "lessonId": "lsn_003",
  "conversationId": "conv_12345",
  "message": "Hello, my name is John. Nice to meet you.",
  "audioBlob": "base64_encoded_audio_data"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_12345",
    "aiResponse": {
      "text": "Hello John! Nice to meet you too. How are you doing today?",
      "audioUrl": "https://cdn.english-ai.com/ai-audio/response_123.mp3",
      "suggestions": [
        "You can say: I'm doing well, thank you!",
        "Or: I'm great, thanks for asking!"
      ]
    },
    "userMessageAnalysis": {
      "pronunciation": {
        "overall": 85,
        "feedback": "Good pronunciation of 'Nice to meet you'"
      },
      "grammar": {
        "correct": true,
        "feedback": "Perfect grammar!"
      },
      "vocabulary": {
        "level": "beginner",
        "suggestions": ["Try using: 'Pleased to meet you' next time"]
      }
    }
  }
}
```

### 8.3 Get AI Conversation History

**Endpoint:** `GET /ai/conversation/:conversationId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_12345",
    "lessonId": "lsn_003",
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "text": "Hello, my name is John.",
        "timestamp": "2026-01-19T10:30:00Z",
        "analysis": {
          "pronunciation": 85,
          "grammar": 100
        }
      },
      {
        "id": "msg_002",
        "role": "ai",
        "text": "Hello John! Nice to meet you.",
        "audioUrl": "https://cdn.english-ai.com/ai-audio/msg2.mp3",
        "timestamp": "2026-01-19T10:30:05Z"
      }
    ],
    "overallScore": 88,
    "createdAt": "2026-01-19T10:30:00Z"
  }
}
```

---

## 9. Gamification

### 9.1 Get Gamification Stats

**Endpoint:** `GET /gamification/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_1234567890",
    "xp": 1250,
    "level": 5,
    "xpToNextLevel": 1500,
    "xpProgress": 83,
    "streak": {
      "current": 7,
      "longest": 15,
      "freezesRemaining": 1
    },
    "badges": [
      {
        "id": "badge_001",
        "name": "First Lesson",
        "description": "Complete your first lesson",
        "icon": "🎓",
        "unlockedAt": "2026-01-10T10:00:00Z"
      },
      {
        "id": "badge_002",
        "name": "Week Warrior",
        "description": "7-day learning streak",
        "icon": "🔥",
        "unlockedAt": "2026-01-17T10:00:00Z"
      }
    ],
    "achievements": [
      {
        "id": "ach_001",
        "title": "Complete 10 lessons",
        "description": "Finish 10 lessons in any course",
        "xpReward": 100,
        "progress": 7,
        "target": 10,
        "completed": false,
        "icon": "📚"
      },
      {
        "id": "ach_002",
        "title": "Reach Level 5",
        "description": "Advance to Level 5",
        "xpReward": 200,
        "progress": 5,
        "target": 5,
        "completed": true,
        "icon": "⭐",
        "completedAt": "2026-01-18T14:30:00Z"
      }
    ],
    "rank": {
      "global": 1234,
      "class": 5
    }
  }
}
```

### 9.2 Add XP

**Endpoint:** `POST /gamification/xp`

**Request Body:**
```json
{
  "amount": 50,
  "source": "lesson_completion",
  "sourceId": "lsn_001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "xp": 1300,
    "xpAdded": 50,
    "level": 5,
    "leveledUp": false,
    "badgesUnlocked": [],
    "achievementsCompleted": []
  },
  "message": "+50 XP earned!"
}
```

### 9.3 Get Leaderboard

**Endpoint:** `GET /gamification/leaderboard`

**Query Parameters:**
- `scope`: `global|class` (default: global)
- `classId`: string (required if scope=class)
- `period`: `daily|weekly|monthly|all-time`
- `limit`: number (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "scope": "global",
    "period": "weekly",
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_9999",
        "name": "Nguyễn Văn X",
        "avatar": "https://cdn.english-ai.com/avatars/user9999.jpg",
        "xp": 2500,
        "level": 8,
        "streak": 15
      },
      {
        "rank": 2,
        "userId": "usr_8888",
        "name": "Trần Thị Y",
        "avatar": "https://cdn.english-ai.com/avatars/user8888.jpg",
        "xp": 2200,
        "level": 7,
        "streak": 10
      }
    ],
    "currentUser": {
      "rank": 1234,
      "userId": "usr_1234567890",
      "xp": 1250
    }
  }
}
```

---

## 10. Progress Tracking

### 10.1 Get Overall Progress

**Endpoint:** `GET /progress`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_1234567890",
    "overallProgress": {
      "totalSessions": 10,
      "completedSessions": 3,
      "totalLessons": 50,
      "completedLessons": 12,
      "totalTests": 5,
      "completedTests": 2,
      "vocabularyLearned": 75,
      "vocabularyTotal": 150,
      "overallCompletion": 24,
      "averageScore": 85.5,
      "totalTimeSpent": 180,
      "streak": 7
    },
    "sessionProgress": [
      {
        "sessionId": "sess_001",
        "title": "Giới thiệu bản thân",
        "completion": 100,
        "averageScore": 88,
        "completedAt": "2026-01-15T10:00:00Z"
      },
      {
        "sessionId": "sess_002",
        "title": "Mua sắm & Giá cả",
        "completion": 60,
        "averageScore": 82,
        "lastActivity": "2026-01-18T14:30:00Z"
      }
    ],
    "weeklyActivity": [
      { "date": "2026-01-13", "minutesSpent": 30, "xpEarned": 150 },
      { "date": "2026-01-14", "minutesSpent": 45, "xpEarned": 200 },
      { "date": "2026-01-15", "minutesSpent": 60, "xpEarned": 300 }
    ],
    "skillsBreakdown": {
      "listening": 85,
      "speaking": 80,
      "pronunciation": 90,
      "vocabulary": 75
    }
  }
}
```

### 10.2 Update Lesson Progress

**Endpoint:** `PUT /progress/lessons/:lessonId`

**Request Body:**
```json
{
  "status": "in-progress",
  "progress": 50,
  "timeSpent": 3,
  "data": {
    "currentSegment": 5,
    "totalSegments": 10
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lessonId": "lsn_001",
    "status": "in-progress",
    "progress": 50,
    "updatedAt": "2026-01-19T10:30:00Z"
  },
  "message": "Progress updated"
}
```

---

## 11. Teacher APIs

### 11.1 Get Teacher Dashboard Stats

**Endpoint:** `GET /teacher/dashboard`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalClasses": 5,
      "totalStudents": 78,
      "activeStudents": 65,
      "pendingGradings": 12,
      "upcomingClasses": 3
    },
    "recentActivities": [
      {
        "type": "submission",
        "studentName": "Nguyễn Văn A",
        "lessonTitle": "Pronunciation Practice",
        "timestamp": "2026-01-19T09:30:00Z"
      }
    ],
    "classPerformance": [
      {
        "classId": "cls_001",
        "className": "Beginner Conversation",
        "averageCompletion": 65,
        "averageScore": 82,
        "activeStudents": 20
      }
    ]
  }
}
```

### 11.2 Create Class (Teacher)

**Endpoint:** `POST /teacher/classes`

**Request Body:**
```json
{
  "name": "Advanced English Conversation",
  "description": "Advanced conversation practice",
  "level": "advanced",
  "maxStudents": 25,
  "schedule": {
    "daysOfWeek": [1, 3, 5],
    "startTime": "18:00",
    "endTime": "19:30",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "startDate": "2026-02-01",
  "endDate": "2026-05-01",
  "curriculumId": "curr_005"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cls_new_001",
    "name": "Advanced English Conversation",
    "teacherId": "tch_001",
    "createdAt": "2026-01-19T10:30:00Z"
  },
  "message": "Class created successfully"
}
```

### 11.3 Get Students (Teacher)

**Endpoint:** `GET /teacher/students`

**Query Parameters:**
- `classId`: string (filter by class)
- `status`: `active|inactive`
- `search`: string
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "usr_1234567890",
        "name": "Nguyễn Văn A",
        "email": "user@example.com",
        "avatar": "https://cdn.english-ai.com/avatars/user123.jpg",
        "level": 5,
        "xp": 1250,
        "enrolledClasses": ["cls_001", "cls_002"],
        "progress": {
          "overallCompletion": 45,
          "averageScore": 85
        },
        "lastActive": "2026-01-19T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 78,
      "totalPages": 4
    }
  }
}
```

### 11.4 Get Student Detail (Teacher)

**Endpoint:** `GET /teacher/students/:studentId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": "https://cdn.english-ai.com/avatars/user123.jpg",
    "level": 5,
    "xp": 1250,
    "streak": 7,
    "enrolledClasses": [
      {
        "id": "cls_001",
        "name": "Beginner Conversation",
        "progress": 65,
        "averageScore": 88
      }
    ],
    "lessonHistory": [
      {
        "lessonId": "lsn_001",
        "title": "Greetings",
        "completedAt": "2026-01-18T15:30:00Z",
        "score": 85,
        "timeSpent": 5
      }
    ],
    "testHistory": [
      {
        "testId": "test_001",
        "title": "Unit 1 Test",
        "submittedAt": "2026-01-17T14:00:00Z",
        "score": 92,
        "passed": true
      }
    ],
    "vocabularyStats": {
      "total": 150,
      "learned": 75,
      "mastery": 80
    }
  }
}
```

### 11.5 Create Lesson (Teacher)

**Endpoint:** `POST /teacher/lessons`

**Request Body:**
```json
{
  "title": "Business Meeting Vocabulary",
  "description": "Learn vocabulary for business meetings",
  "type": "video",
  "sessionId": "sess_005",
  "level": "intermediate",
  "duration": 10,
  "videoUrl": "https://cdn.english-ai.com/videos/business_meeting.mp4",
  "subtitles": [],
  "targetWords": ["meeting", "presentation", "agenda"],
  "minScore": 70
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "lsn_new_001",
    "title": "Business Meeting Vocabulary",
    "createdBy": "tch_001",
    "createdAt": "2026-01-19T10:30:00Z"
  },
  "message": "Lesson created successfully"
}
```

### 11.6 Create Test (Teacher)

**Endpoint:** `POST /teacher/tests`

**Request Body:**
```json
{
  "title": "Unit 2 Progress Test",
  "description": "Test your knowledge from Unit 2",
  "type": "progress",
  "duration": 20,
  "passScore": 70,
  "faceVerificationRequired": false,
  "sections": [
    {
      "title": "Listening",
      "questions": [
        {
          "type": "multiple-choice",
          "question": "What is the main topic?",
          "audioUrl": "https://cdn.english-ai.com/audio/test_q1.mp3",
          "options": [
            { "text": "Weather", "isCorrect": true },
            { "text": "Food", "isCorrect": false },
            { "text": "Travel", "isCorrect": false }
          ],
          "points": 5
        }
      ]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "test_new_001",
    "title": "Unit 2 Progress Test",
    "createdBy": "tch_001",
    "createdAt": "2026-01-19T10:30:00Z"
  },
  "message": "Test created successfully"
}
```

### 11.7 Grade Submission

**Endpoint:** `PUT /teacher/grading/:attemptId`

**Request Body:**
```json
{
  "score": 85,
  "feedback": "Good work! Keep practicing your pronunciation.",
  "detailedFeedback": [
    {
      "questionId": "q_005",
      "feedback": "Your pronunciation of 'hello' is perfect!"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attemptId": "att_12345",
    "score": 85,
    "gradedBy": "tch_001",
    "gradedAt": "2026-01-19T10:30:00Z"
  },
  "message": "Graded successfully"
}
```

---

## 12. Admin APIs

### 12.1 Get Admin Dashboard Stats

**Endpoint:** `GET /admin/dashboard`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 5000,
      "activeUsers": 3500,
      "totalClasses": 150,
      "totalContent": 500,
      "totalRevenue": 100000
    },
    "userGrowth": [
      { "date": "2026-01-12", "newUsers": 50, "activeUsers": 3200 },
      { "date": "2026-01-13", "newUsers": 60, "activeUsers": 3300 }
    ],
    "contentStats": {
      "sessions": 50,
      "lessons": 200,
      "tests": 100,
      "vocabulary": 2000
    },
    "aiUsage": {
      "totalCalls": 10000,
      "pronunciationAnalysis": 7000,
      "aiConversations": 3000,
      "cost": 500
    }
  }
}
```

### 12.2 Get All Users (Admin)

**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `role`: `student|teacher|admin`
- `status`: `active|inactive|suspended`
- `search`: string
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "usr_1234567890",
        "name": "Nguyễn Văn A",
        "email": "user@example.com",
        "avatar": "https://cdn.english-ai.com/avatars/user123.jpg",
        "role": "student",
        "level": 5,
        "status": "active",
        "createdAt": "2025-12-01T00:00:00Z",
        "lastActive": "2026-01-19T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5000,
      "totalPages": 100
    }
  }
}
```

### 12.3 Create User (Admin)

**Endpoint:** `POST /admin/users`

**Request Body:**
```json
{
  "name": "New Teacher",
  "email": "teacher@example.com",
  "password": "TempPass123!",
  "role": "teacher",
  "permissions": ["manage_classes", "grade_students"],
  "teachingSubjects": ["Conversation", "Pronunciation"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tch_new_001",
    "name": "New Teacher",
    "email": "teacher@example.com",
    "role": "teacher",
    "createdAt": "2026-01-19T10:30:00Z"
  },
  "message": "User created successfully"
}
```

### 12.4 Update User (Admin)

**Endpoint:** `PUT /admin/users/:userId`

**Request Body:**
```json
{
  "status": "suspended",
  "suspensionReason": "Violation of terms"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "status": "suspended",
    "updatedAt": "2026-01-19T10:30:00Z"
  },
  "message": "User updated successfully"
}
```

### 12.5 Delete User (Admin)

**Endpoint:** `DELETE /admin/users/:userId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 12.6 Get Platform Analytics (Admin)

**Endpoint:** `GET /admin/analytics`

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `metric`: `users|engagement|revenue|content`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-01-19T23:59:59Z"
    },
    "metrics": {
      "userGrowth": {
        "newUsers": 500,
        "activeUsers": 3500,
        "churnRate": 5
      },
      "engagement": {
        "averageSessionDuration": 25,
        "lessonsCompleted": 5000,
        "testsCompleted": 1200,
        "dailyActiveUsers": 1500
      },
      "contentPerformance": {
        "topSessions": [
          { "id": "sess_001", "title": "Giới thiệu bản thân", "completions": 1500 }
        ],
        "topLessons": [
          { "id": "lsn_001", "title": "Greetings", "completions": 2000 }
        ]
      },
      "aiUsage": {
        "totalCalls": 10000,
        "averageCostPerCall": 0.05,
        "totalCost": 500
      }
    }
  }
}
```

---

## 13. Notifications

### 13.1 Get Notifications

**Endpoint:** `GET /notifications`

**Query Parameters:**
- `unreadOnly`: `true|false`
- `type`: `lesson|test|achievement|class|system`
- `page`: number
- `limit`: number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "achievement",
        "title": "New Badge Unlocked!",
        "message": "You've unlocked the 'Week Warrior' badge!",
        "read": false,
        "data": {
          "badgeId": "badge_002"
        },
        "createdAt": "2026-01-19T10:00:00Z"
      },
      {
        "id": "notif_002",
        "type": "test",
        "title": "Test Available",
        "message": "Unit 2 Progress Test is now available",
        "read": true,
        "data": {
          "testId": "test_005"
        },
        "createdAt": "2026-01-18T14:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 13.2 Mark as Read

**Endpoint:** `PUT /notifications/:notificationId/read`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notificationId": "notif_001",
    "read": true
  },
  "message": "Notification marked as read"
}
```

### 13.3 Mark All as Read

**Endpoint:** `PUT /notifications/read-all`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  },
  "message": "All notifications marked as read"
}
```

---

## 14. Analytics

### 14.1 Get User Analytics

**Endpoint:** `GET /analytics/user`

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-01-19T23:59:59Z"
    },
    "learningTime": {
      "total": 180,
      "byDay": [
        { "date": "2026-01-13", "minutes": 30 },
        { "date": "2026-01-14", "minutes": 45 }
      ]
    },
    "lessonsCompleted": {
      "total": 12,
      "byType": {
        "video": 4,
        "pronunciation": 3,
        "ai-conversation": 3,
        "flashcard": 2
      }
    },
    "averageScores": {
      "overall": 85.5,
      "pronunciation": 90,
      "vocabulary": 82,
      "conversation": 88
    },
    "streakHistory": [
      { "date": "2026-01-13", "hasActivity": true },
      { "date": "2026-01-14", "hasActivity": true }
    ],
    "vocabularyGrowth": {
      "total": 150,
      "learned": 75,
      "byWeek": [
        { "week": "2026-W02", "newWords": 20 },
        { "week": "2026-W03", "newWords": 25 }
      ]
    }
  }
}
```

---

## 15. File Upload

### 15.1 Upload File

**Endpoint:** `POST /upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
FormData:
  file: File (max 50MB)
  type: "avatar|video|audio|image|document"
  public: boolean (default: false)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "fileId": "file_1234567890",
    "url": "https://cdn.english-ai.com/uploads/file_1234567890.jpg",
    "type": "image",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2026-01-19T10:30:00Z"
  },
  "message": "File uploaded successfully"
}
```

### 15.2 Delete File

**Endpoint:** `DELETE /upload/:fileId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 16. Real-time WebSocket

### 16.1 WebSocket Connection

**URL:** `wss://api.english-ai.com/ws`

**Authentication:**
```javascript
const ws = new WebSocket('wss://api.english-ai.com/ws?token=JWT_TOKEN');
```

### 16.2 Events

#### Client → Server

**Subscribe to Updates:**
```json
{
  "type": "subscribe",
  "channels": ["notifications", "class:cls_001", "lesson:lsn_001"]
}
```

**Send Message:**
```json
{
  "type": "message",
  "channel": "class:cls_001",
  "data": {
    "message": "Hello everyone!"
  }
}
```

#### Server → Client

**Notification:**
```json
{
  "type": "notification",
  "data": {
    "id": "notif_001",
    "title": "New Badge Unlocked!",
    "message": "You've unlocked the 'Week Warrior' badge!",
    "createdAt": "2026-01-19T10:30:00Z"
  }
}
```

**Live Update:**
```json
{
  "type": "update",
  "channel": "class:cls_001",
  "data": {
    "studentId": "usr_1234567890",
    "event": "lesson_completed",
    "lessonId": "lsn_001"
  }
}
```

**Heartbeat:**
```json
{
  "type": "ping"
}
```

---

## 17. Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Invalid or missing authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate email) |
| 422 | `UNPROCESSABLE_ENTITY` | Semantic errors in request |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Common Error Examples

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  },
  "timestamp": "2026-01-19T10:30:00Z"
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "timestamp": "2026-01-19T10:30:00Z"
}
```

**Permission Error:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  },
  "timestamp": "2026-01-19T10:30:00Z"
}
```

---

## 18. Rate Limiting

### 18.1 Rate Limit Rules

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| AI Services | 20 requests | 1 minute |
| File Upload | 10 requests | 5 minutes |
| General API | 100 requests | 1 minute |

### 18.2 Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1674138000
```

### 18.3 Rate Limit Exceeded Response

**Status: 429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  },
  "timestamp": "2026-01-19T10:30:00Z"
}
```

---

## 📝 Notes

### Production Considerations

1. **Security:**
   - All endpoints require HTTPS in production
   - JWT tokens expire after 1 hour
   - Refresh tokens expire after 7 days
   - Implement CORS whitelist
   - Add request signing for sensitive operations

2. **Performance:**
   - Implement caching (Redis) for frequently accessed data
   - Use CDN for static assets
   - Enable gzip/brotli compression
   - Implement database indexing

3. **Monitoring:**
   - Log all API requests
   - Monitor error rates
   - Track AI service costs
   - Set up alerts for anomalies

4. **Scalability:**
   - Use load balancers
   - Implement microservices for AI processing
   - Use message queues for async tasks
   - Database read replicas

---

## 🔗 Quick Links

- **API Base URL**: `https://api.english-ai.com/v1`
- **Documentation**: `https://docs.english-ai.com`
- **Status Page**: `https://status.english-ai.com`
- **Support**: `api-support@english-ai.com`

---

**Last Updated**: 19/01/2026  
**Version**: 1.0.0  
**Maintained By**: English AI Development Team
