## 🧾 Project Report – English Learning App (09/03/2026)

### 1. Scope & Modules

- **Frontend**: React + TypeScript + Vite, Tailwind, Zustand, shadcn UI.
- **Backend**: Spring Boot 3, PostgreSQL, Spring Security/JWT, WebSocket, Kafka, AWS S3, Azure Speech, OpenAI APIs.
- **Major domains**:
  - Curriculum / Topic / Session / Lesson.
  - Tests & assessment.
  - Student progress & gamification.
  - Transcription (YouTube + file upload) & pronunciation scoring.
  - AI conversation chatbot (text + voice).

### 2. Backend – Current Status

- **Auth & Users**
  - JWT-based auth, user roles (likely STUDENT/TEACHER/ADMIN).
  - `User`, `Role`, `Permission`, `UserProfile` entities; `UserDetailsServiceImpl` implemented.

- **Curriculum & Sessions**
  - Entities: `Curriculum` (courses), `Topic`, `Session`, `Lesson`, `LessonVideo`.
  - Services/controllers:
    - `/api/v1/curriculums` – CRUD khóa học.
    - `/api/v1/sessions` – CRUD session; sessions gắn với `Curriculum`.
    - `/api/v1/lessons` – CRUD + `/{id}/video`, `/{id}/ipa/regenerate`.

- **Student Progress**
  - Entities: `UserLessonProgress`, `UserSessionProgress`, `XPLog`, `UserBadge`.
  - API:
    - `/api/v1/student/dashboard` – thống kê.
    - `/api/v1/student/lessons/{lessonId}/complete` – hoàn thành bài, cộng XP, update session.
    - `/api/v1/student/progress/*` – lesson/session completed IDs, participated sessions.

- **Tests**
  - Entities: `Test`, `TestQuestion`, `TestOption`, `TestAttempt`, `TestAnswer`.
  - APIs:
    - `/api/v1/tests` – CRUD & lấy đề để làm.
    - `/api/v1/tests/{id}/attempts` – nộp bài, chấm điểm.
    - `/api/v1/tests/manage` – module quản lý đề cho giáo viên/admin.

- **Transcription & Media**
  - `StorageService` (AWS S3):
    - `uploadMultipartFile(MultipartFile, key)` → `s3://bucket/key`.
    - Đã xử lý an toàn size (fallback `file.getBytes()` khi cần).
  - Kafka producers:
    - `YoutubeTranscribeProducer`, `UploadTranscribeProducer` gửi event sang topics cấu hình.
  - Controllers:
    - `/api/v1/youtube/transcribe` (POST) – gửi job phân tích YouTube.
    - `/api/v1/youtube/{lessonId}/transcript` (GET) – lấy transcript JSON.
    - `/api/v1/upload/transcribe` (POST, multipart) – upload file (ví dụ `videoplayback.mp4`) → S3 → Kafka job.
  - IPA regeneration:
    - `/api/v1/lessons/{id}/ipa/regenerate` – dùng eSpeak để thêm IPA vào transcript JSON.

- **Pronunciation**
  - Backend sử dụng Azure Speech để chấm điểm, lưu `PronunciationAttempt` + S3 audio (Kafka).
  - API (đã dùng ở FE):
    - `/api/pronunciation/score` (multipart) – chấm phát âm cho một câu/sentence.
  - GlobalExceptionHandler:
    - Trả 400 cho input sai (IllegalArgumentException).

- **AI Chatbot**
  - REST API: `/api/v1/ai/chat`
    - Body: `messages[] { role, content }`, `lessonContext`.
    - Service: `AiChatService` gọi OpenAI Chat, hoặc API của bạn qua `app.ai.chat.url`.

- **Exception Handling**
  - `GlobalExceptionHandler`:
    - `ApiException` → 400 với `errorCode`.
    - Validation → 422 với map field errors.
    - MediaType not supported / wrong path → 404 `ENDPOINT_NOT_FOUND`.
    - `IllegalArgumentException` → 400 `BAD_REQUEST`.
    - `DataIntegrityViolationException` → 400 `CONSTRAINT_VIOLATION` (ví dụ xóa lesson còn dữ liệu liên quan).
    - Fallback `Exception` → 500 `INTERNAL_ERROR`.

### 3. Frontend – Current Status

- **Tech stack**
  - React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router 7.
  - UI enhancements: Motion animations, Sonner toasts, Recharts, PWA (manifest + service worker).

- **State & API**
  - Stores:
    - `authStore` – tokens, login/logout, refresh token (axios interceptor).
    - `appStore` – progressVersion, dashboard data, etc.
    - `gamificationStore` – XP, level, streak, badges.
  - `axiosInstance`:
    - `baseURL = '/api'` in dev (Vite proxy → backend).
    - 401 auto-refresh flow, redirect to `/login` khi hết hạn.
  - `apiService`:
    - `auth`, `user`, `topic`, `curriculum`, `session`, `lesson`, `test`, `testManage`, `student`, `transcribe`, `pronunciation`, `ai`, `admin`, `vocabulary`, `notification`.
    - Mọi response bọc trong `BaseResponse<T>` giống backend.

- **Key Screens**
  - Student:
    - Dashboard, SessionOverview/Detail, LessonRouter, PronunciationLesson, VideoConversationLesson, AIConversationLesson, Tests.
    - Bài học hoàn thành gọi `student.completeLesson` + `invalidateProgress`.
  - Teacher/Admin:
    - `AdminDashboard` – thống kê từ `/v1/admin/stats`, thao tác nhanh tới User/Topic/Session/Curriculum, theme đồng bộ với app.
    - `AdminTopicManagement` – quản lý Topic/Curriculum/Session/Lesson/Test; accordion theo topic → session → lesson; dùng `transcribe.youtube` và `transcribe.upload` để generate transcript cho video bài học.
    - `AdminSessionManagement` + `AdminCurriculumManagement` – layout admin thống nhất, load dữ liệu thật từ `/v1/sessions` và `/v1/curriculums`, refetch sau khi tạo/xóa.
    - `UserManagement` – danh sách user từ `/v1/auth/users`, lọc theo role/status, UI bảng nâng cấp.
  - AI & Pronunciation:
    - `PronunciationLesson.tsx` – ghi âm thật, gửi audio blob lên `/api/pronunciation/score`, hiển thị điểm + feedback, complete lesson khi đạt ngưỡng.
    - `VideoConversationLesson.tsx` – mode xem video & thoại theo, chấm từng câu; ưu tiên `youtubeUrl` hoặc `https` `videoUrl`, bỏ qua URI nội bộ dạng `s3://...` để tránh lỗi `ERR_UNKNOWN_URL_SCHEME`.
    - `AIConversationLesson.tsx` + `AIConversation.tsx` – hội thoại với AI, dùng `apiService.ai.chat`.

### 4. Upload Video & Transcript Flow (Updated)

1. **Từ FE (AdminTopicManagement)**
   - Chọn bài học (lesson) type VIDEO.
   - Tab “Upload file từ máy” → chọn `videoplayback.mp4` (~19.6 MB).
   - Gọi `apiService.transcribe.upload(lessonId, file, 'en-US')`:
     - `POST /api/v1/upload/transcribe` (multipart: `file`, `lessonId`, `languageCode`).

2. **Backend**
   - `UploadTranscribeController.uploadAndTranscribe`:
     - Lưu file lên S3 qua `StorageService.uploadMultipartFile`.
     - Gửi event `UploadTranscribeEvent` lên Kafka topic `upload-transcribe`.
     - Trả `202 Accepted` + `transactionId`.
   - Lỗi được phân biệt rõ:
     - Lỗi S3 → 502 `S3_ERROR`.
     - Lỗi đọc file → 400 `UPLOAD_IO_ERROR`.
     - Lỗi Kafka/hàng đợi → 503 `QUEUE_UNAVAILABLE`.
     - Lỗi khác → 500 `UPLOAD_ERROR`.
   - FE đã được fix `Content-Type: multipart/form-data` khi gọi `transcribe.upload` để tránh lỗi “No endpoint found for this URL and method” do sai Content-Type.

3. **Worker / Consumer** (không nằm trong repo này) xử lý S3 URI, tạo transcript JSON gắn vào `LessonVideo`.

4. **FE Polling**
   - `transcribe.getTranscript(lessonId)` → `GET /api/v1/youtube/{lessonId}/transcript`.
   - Khi transcript có dữ liệu, FE hiển thị script JSON và cho phép chỉnh/sửa trước khi lưu vào bài.

### 5. Known Risks & Next Steps

- **Risks**
  - AWS/Kafka chưa chạy → upload sẽ trả `S3_ERROR` hoặc `QUEUE_UNAVAILABLE`.
  - Các khóa bí mật (AWS, Azure, OpenAI) đang cấu hình trực tiếp trong `application.properties` – nên chuyển sang env khi deploy thực tế.

- **Immediate Next Steps**
  1. Chạy Kafka + worker cho `upload-transcribe` và `youtube-transcribe`.
  2. Viết README ngắn cho backend (cách chạy, môi trường, phụ thuộc Kafka/S3).
  3. Thêm UI hiển thị rõ lỗi upload (dựa theo `errorCode` mới).
  4. Bổ sung test cơ bản cho `UploadTranscribeController` và `LessonService.delete`.

