# Scout Report: WebGIS Classroom & Quiz System Codebase Analysis

**Date:** 2025-11-18
**Scope:** Backend (Django) + Frontend (React) files for classroom and quiz features
**Status:** ✅ Complete

---

## Executive Summary

WebGIS Educational Platform has **robust classroom and quiz infrastructure** already implemented. Backend Django apps exist for classrooms, quizzes, lessons. Frontend React components exist for classroom management, quiz UI, lesson viewer. Most core features functional - enhancements needed for file uploads, advanced quiz types, better integration.

---

## 1. BACKEND - Django Apps

### 1.1 Classrooms App (`/home/user/webgisc3/apps/classrooms/`)

**Models** (`models.py`):
- ✅ `Classroom` - name, teacher, enrollment_code (8-char unique), timestamps
- ✅ `Enrollment` - student-classroom relationship, unique_together constraint
- ✅ `Announcement` - classroom posts, author, content, timestamps

**Views** (`views.py`):
- ✅ `ClassroomViewSet` - CRUD operations, custom queryset (teacher's classes + enrolled classes)
- ✅ `EnrollmentJoinView` - join classroom with code
- ✅ `AnnouncementViewSet` - nested under classrooms, owner-only create/update/delete

**Serializers** (`serializers.py`):
- ✅ `ClassroomSerializer` - includes teacher info, student count
- ✅ `ClassroomCreateSerializer` - auto-assigns teacher from request.user
- ✅ `EnrollmentCreateSerializer` - validates enrollment code
- ✅ `StudentListSerializer` - lists enrolled students
- ✅ `AnnouncementSerializer` - announcement CRUD

**URLs** (`urls.py`):
- ✅ `/api/v1/classrooms/` - list/create classrooms
- ✅ `/api/v1/classrooms/{id}/` - retrieve/update/delete
- ✅ `/api/v1/classrooms/{id}/students/` - list students (teacher only)
- ✅ `/api/v1/classrooms/enrollments/join/` - join with code
- ✅ `/api/v1/classrooms/{id}/announcements/` - nested announcements
- ✅ `/api/v1/classrooms/{class_id}/quiz_session/{quiz_id}/` - quiz session data

**Permissions**:
- Uses custom permissions from `apps/core/permissions.py`
- IsTeacher, IsStudent, IsTeacherOrReadOnly, IsOwnerOrTeacher

**Migrations**:
- ✅ `0001_initial.py` - initial classroom models
- ✅ `0002_initial.py` - foreign key to users
- ✅ `0003_alter_classroom_teacher...` - schema updates

---

### 1.2 Quizzes App (`/home/user/webgisc3/apps/quizzes/`)

**Models** (`models.py`):
- ✅ `Quiz` - title, classroom (FK, nullable), description, timestamps
- ✅ `QuizQuestion` - quiz (FK), question_text, order
- ✅ `QuizAnswer` - question (FK), answer_text, is_correct
- ✅ `QuizSubmission` - quiz (FK), student (FK), score (0-100), answers (JSON), unique_together

**Views** (`views.py`):
- ✅ `QuizViewSet` - read-only for authenticated users
- ✅ `QuizSessionView` - GET full quiz data with questions/answers for session
- ✅ `QuizSubmissionView` - POST submit answers, auto-calculates score

**Serializers** (`serializers.py`):
- ✅ `QuizListSerializer` - basic quiz info + question count
- ✅ `QuizDetailSerializer` - full quiz with nested questions/answers
- ✅ `QuizSessionSerializer` - quiz data + map config for sessions
- ✅ `QuizSubmissionCreateSerializer` - validates all questions answered, correct answer IDs
- ✅ Auto score calculation in create() method

**URLs** (`urls.py`):
- ✅ `/api/v1/quizzes/` - list quizzes
- ✅ `/api/v1/quizzes/{id}/` - quiz details
- ✅ `/api/v1/quizzes/quiz_submissions/` - submit quiz answers

**Migrations**:
- ✅ `0001_initial.py` - quiz models
- ✅ `0002_initial.py` - foreign keys

---

### 1.3 Lessons App (`/home/user/webgisc3/apps/lessons/`)

**Models** (`models.py`):
- ✅ `Lesson` - title, description, timestamps
- ✅ `MapAction` - action_type (TOGGLE_LAYER, ZOOM_TO, etc.), payload (JSON)
- ✅ `LessonStep` - lesson (FK), order, popup_text, map_action (FK optional)

**Views** (`views.py`):
- ✅ `LessonViewSet` - read-only, prefetch steps and map_actions

**Serializers** (`serializers.py`):
- ✅ `LessonListSerializer` - basic lesson info
- ✅ `LessonDetailSerializer` - full lesson with steps and map actions

**URLs** (`urls.py`):
- ✅ `/api/v1/lessons/` - list lessons
- ✅ `/api/v1/lessons/{id}/` - lesson details with steps

---

### 1.4 Users App (`/home/user/webgisc3/apps/users/`)

**Models** (`models.py`):
- ✅ `User` - custom user with UUID pk, email auth, role (student/teacher)
- ✅ `UserManager` - create_user, create_superuser
- Properties: is_teacher, is_student

**Serializers** (`serializers.py`):
- ✅ `UserSerializer` - user data for API responses

**Views** (`views.py`):
- ✅ Authentication endpoints (JWT)
- ✅ Profile endpoint

---

### 1.5 Core App (`/home/user/webgisc3/apps/core/`)

**Permissions** (`permissions.py`):
- ✅ `IsTeacher` - restrict to teachers
- ✅ `IsStudent` - restrict to students
- ✅ `IsTeacherOrReadOnly` - teachers can edit, students read-only
- ✅ `IsOwnerOrTeacher` - owner or teacher access

**Other Files**:
- ✅ `pagination.py` - StandardResultsSetPagination
- ✅ `exceptions.py` - custom exception handler

---

### 1.6 Configuration (`/home/user/webgisc3/config/`)

**Settings** (`settings/base.py`):
- ✅ INSTALLED_APPS includes all relevant apps
- ✅ REST_FRAMEWORK with JWT auth
- ✅ MEDIA_ROOT configured (`/home/user/webgisc3/media`)
- ✅ MEDIA_URL configured (`/media/`)
- ✅ GeoDjango enabled

**URLs** (`config/urls.py`):
- ✅ `/api/v1/auth/` - authentication
- ✅ `/api/v1/classrooms/` - classroom routes
- ✅ `/api/v1/lessons/` - lesson routes
- ✅ `/api/v1/quizzes/` - quiz routes
- ✅ `/api/schema/swagger-ui/` - API docs

---

## 2. FRONTEND - React Application

### 2.1 Services (`/home/user/webgisc3/frontend/src/services/`)

**API Services**:
- ✅ `api.js` - axios instance with JWT interceptors
- ✅ `classroom.service.js` - list, create, get, getStudents, join
- ✅ `quiz.service.js` - list, get, getSession, submit
- ✅ `lesson.service.js` - list, get
- ✅ `announcement.service.js` - announcement operations
- ✅ `auth.service.js` - authentication
- ✅ `gis.service.js` - GIS data
- ✅ `tools.service.js` - GIS tools

---

### 2.2 Components - Classroom UI

**Classroom Pages** (`/home/user/webgisc3/frontend/src/features/classroom/pages/`):
- ✅ `ClassroomsPage.jsx` - list classrooms, create/join modal, student count display
- ✅ `ClassroomDetailPage.jsx` - classroom detail with tabs (stream, classwork, people)
  - Stream tab: announcements
  - Classwork tab: assignments (placeholder)
  - People tab: teacher + students list

**Features**:
- Color-coded classroom cards with gradients
- Enrollment code display & copy
- Teacher-only controls (create announcement, view students)
- Student join with code
- Responsive design with Tailwind CSS

---

### 2.3 Components - Quiz UI

**Quiz Components** (`/home/user/webgisc3/frontend/src/components/map/`):
- ✅ `QuizPanel/index.jsx` - full quiz UI with:
  - Question navigation
  - Multiple choice selection
  - Progress bar
  - Score calculation
  - Results screen
  - Hardcoded sample quiz (needs API integration)
- ✅ `QuizFloatingButton/index.jsx` - floating button to open quiz panel

**Current State**: UI complete, needs backend integration

---

### 2.4 Components - Lessons UI

**Lesson Components** (`/home/user/webgisc3/frontend/src/components/map/`):
- ✅ `LessonsPanel/index.jsx` - lesson list with:
  - Difficulty badges (Beginner/Intermediate/Advanced)
  - Duration display
  - Icon representation
  - Hardcoded sample lessons (needs API integration)

**Integration Needed**: Connect to `/api/v1/lessons/` endpoint

---

### 2.5 Map Integration Components

**Map Components** (`/home/user/webgisc3/frontend/src/components/map/`):
- ✅ `MapboxMap/index.jsx` - main map component
- ✅ `LayersPanel/index.jsx` - layer control
- ✅ `ToolsPanel/index.jsx` - GIS tools
- ✅ `MapTopToolbar/index.jsx` - map toolbar
- ✅ `CollapsibleSidebar/index.jsx` - collapsible sidebar for lessons/quiz

---

### 2.6 Constants & Configuration

**Constants** (`/home/user/webgisc3/frontend/src/constants/`):
- ✅ `api.constants.js` - API endpoints, base URL
- ✅ `routes.js` - frontend routes
- ✅ `roles.js` - user roles (TEACHER, STUDENT)
- ✅ `map.constants.js` - map configuration

**API Endpoints Defined**:
```javascript
ENDPOINTS = {
  CLASSROOMS: { LIST, CREATE, DETAIL, STUDENTS, ENROLL },
  LESSONS: { LIST, DETAIL },
  QUIZZES: { LIST, DETAIL, SESSION, SUBMIT },
  // ... others
}
```

---

### 2.7 Routing

**App Router** (`/home/user/webgisc3/frontend/src/App.jsx`):
- ✅ `/login` - LoginPage
- ✅ `/dashboard` - DashboardPage (protected)
- ✅ `/classrooms` - ClassroomsPage (protected)
- ✅ `/classrooms/:id` - ClassroomDetailPage (protected)
- ✅ `/map` - MapViewerPage (protected)
- ✅ `/lessons` - LessonViewerPage (placeholder)
- ✅ `/quizzes` - QuizTakerPage (placeholder)
- ✅ `/tools` - ToolsPage (placeholder)

---

### 2.8 Common UI Components

**Reusable Components** (`/home/user/webgisc3/frontend/src/components/common/`):
- ✅ `Badge/index.jsx` - badges
- ✅ `Card/index.jsx` - card layout
- ✅ `Button/index.jsx` - button component
- ✅ `Input/index.jsx` - input fields
- ✅ `Spinner/index.jsx` - loading spinner
- ✅ `Modal/index.jsx` - modal dialogs

**Layout Components** (`/home/user/webgisc3/frontend/src/components/layout/`):
- ✅ `Sidebar/index.jsx` - main sidebar
- ✅ `CollapsibleSidebar/index.jsx` - collapsible sidebar
- ✅ `UserCard/index.jsx` - user info display

---

## 3. EXISTING IMPLEMENTATIONS

### 3.1 Working Features ✅

**Classrooms**:
- ✅ Create classroom (any authenticated user)
- ✅ Join classroom with 8-char code
- ✅ List teacher's classrooms + enrolled classrooms
- ✅ View classroom details
- ✅ Post announcements (teacher only)
- ✅ View student list (teacher only)

**Quizzes**:
- ✅ Quiz model with questions and answers
- ✅ Quiz submission with auto-scoring
- ✅ One submission per student per quiz
- ✅ Quiz session endpoint for frontend
- ✅ Quiz UI component (needs API integration)

**Lessons**:
- ✅ Interactive lesson model with steps
- ✅ Map actions (toggle layer, zoom, highlight, etc.)
- ✅ Lesson viewer API
- ✅ Lesson UI component (needs API integration)

**Authentication**:
- ✅ JWT authentication
- ✅ Role-based permissions (teacher/student)
- ✅ Protected routes
- ✅ User profile endpoint

---

## 4. GAPS & NEEDED IMPLEMENTATIONS

### 4.1 Backend Gaps ⚠️

**File Uploads**:
- ❌ No file upload models for quiz attachments
- ❌ No file upload models for lesson materials
- ❌ No file upload models for classroom resources
- ❌ MEDIA_ROOT configured but not used

**Quiz Enhancements**:
- ❌ No quiz assignment to classrooms (link exists but not enforced)
- ❌ No quiz deadline/due dates
- ❌ No quiz time limits
- ❌ No quiz attempts tracking (only one submission allowed)
- ❌ No quiz results history for teachers
- ❌ No spatial quiz questions (GIS-specific)

**Lesson Enhancements**:
- ❌ No lesson-classroom assignment
- ❌ No lesson completion tracking
- ❌ No lesson progress per student

**Classroom Enhancements**:
- ❌ No classroom archive/delete functionality
- ❌ No student removal from classroom
- ❌ No classroom settings (description, image, etc.)

---

### 4.2 Frontend Gaps ⚠️

**Integration Work**:
- ❌ QuizPanel using hardcoded data - needs API integration
- ❌ LessonsPanel using hardcoded data - needs API integration
- ❌ No quiz assignment page for teachers
- ❌ No quiz results view for teachers
- ❌ No lesson creation UI for teachers

**Missing Pages**:
- ❌ Quiz management page for teachers
- ❌ Lesson management page for teachers
- ❌ Student gradebook/progress view
- ❌ Quiz results detail page

**UI Enhancements**:
- ❌ No file upload UI
- ❌ No rich text editor for announcements
- ❌ No image/attachment preview

---

## 5. FILE INVENTORY BY CATEGORY

### 5.1 Backend Models
```
/home/user/webgisc3/apps/classrooms/models.py (Classroom, Enrollment, Announcement)
/home/user/webgisc3/apps/quizzes/models.py (Quiz, QuizQuestion, QuizAnswer, QuizSubmission)
/home/user/webgisc3/apps/lessons/models.py (Lesson, LessonStep, MapAction)
/home/user/webgisc3/apps/users/models.py (User, UserManager)
```

### 5.2 Backend Views
```
/home/user/webgisc3/apps/classrooms/views.py (ClassroomViewSet, EnrollmentJoinView, AnnouncementViewSet)
/home/user/webgisc3/apps/quizzes/views.py (QuizViewSet, QuizSessionView, QuizSubmissionView)
/home/user/webgisc3/apps/lessons/views.py (LessonViewSet)
/home/user/webgisc3/apps/users/views.py (auth endpoints)
```

### 5.3 Backend Serializers
```
/home/user/webgisc3/apps/classrooms/serializers.py (6 serializers)
/home/user/webgisc3/apps/quizzes/serializers.py (7 serializers)
/home/user/webgisc3/apps/lessons/serializers.py (2 serializers)
/home/user/webgisc3/apps/users/serializers.py (UserSerializer)
```

### 5.4 Backend URLs
```
/home/user/webgisc3/config/urls.py (main routing)
/home/user/webgisc3/apps/classrooms/urls.py (classroom routes + nested announcements)
/home/user/webgisc3/apps/quizzes/urls.py (quiz routes)
/home/user/webgisc3/apps/lessons/urls.py (lesson routes)
/home/user/webgisc3/apps/users/urls.py (auth routes)
```

### 5.5 Backend Permissions
```
/home/user/webgisc3/apps/core/permissions.py (IsTeacher, IsStudent, IsTeacherOrReadOnly, IsOwnerOrTeacher)
```

### 5.6 Backend Configuration
```
/home/user/webgisc3/config/settings/base.py (Django settings)
/home/user/webgisc3/config/settings/development.py
/home/user/webgisc3/config/settings/production.py
```

### 5.7 Migrations
```
/home/user/webgisc3/apps/classrooms/migrations/0001_initial.py
/home/user/webgisc3/apps/classrooms/migrations/0002_initial.py
/home/user/webgisc3/apps/classrooms/migrations/0003_alter_classroom_teacher...
/home/user/webgisc3/apps/quizzes/migrations/0001_initial.py
/home/user/webgisc3/apps/quizzes/migrations/0002_initial.py
/home/user/webgisc3/apps/lessons/migrations/0001_initial.py
/home/user/webgisc3/apps/users/migrations/0001_initial.py
```

### 5.8 Frontend Services
```
/home/user/webgisc3/frontend/src/services/api.js
/home/user/webgisc3/frontend/src/services/classroom.service.js
/home/user/webgisc3/frontend/src/services/quiz.service.js
/home/user/webgisc3/frontend/src/services/lesson.service.js
/home/user/webgisc3/frontend/src/services/announcement.service.js
/home/user/webgisc3/frontend/src/services/auth.service.js
/home/user/webgisc3/frontend/src/services/index.js
```

### 5.9 Frontend Pages
```
/home/user/webgisc3/frontend/src/features/classroom/pages/ClassroomsPage.jsx
/home/user/webgisc3/frontend/src/features/classroom/pages/ClassroomDetailPage.jsx
/home/user/webgisc3/frontend/src/features/auth/pages/LoginPage.jsx
/home/user/webgisc3/frontend/src/features/dashboard/pages/DashboardPage.jsx
/home/user/webgisc3/frontend/src/features/map/pages/MapViewerPage.jsx
```

### 5.10 Frontend Components - Map
```
/home/user/webgisc3/frontend/src/components/map/QuizPanel/index.jsx
/home/user/webgisc3/frontend/src/components/map/QuizFloatingButton/index.jsx
/home/user/webgisc3/frontend/src/components/map/LessonsPanel/index.jsx
/home/user/webgisc3/frontend/src/components/map/LayersPanel/index.jsx
/home/user/webgisc3/frontend/src/components/map/ToolsPanel/index.jsx
/home/user/webgisc3/frontend/src/components/map/MapboxMap/index.jsx
/home/user/webgisc3/frontend/src/components/map/MapTopToolbar/index.jsx
```

### 5.11 Frontend Components - Common
```
/home/user/webgisc3/frontend/src/components/common/Badge/index.jsx
/home/user/webgisc3/frontend/src/components/common/Card/index.jsx
/home/user/webgisc3/frontend/src/components/common/Button/index.jsx
/home/user/webgisc3/frontend/src/components/common/Input/index.jsx
/home/user/webgisc3/frontend/src/components/common/Spinner/index.jsx
/home/user/webgisc3/frontend/src/components/common/Modal/index.jsx
```

### 5.12 Frontend Components - Layout
```
/home/user/webgisc3/frontend/src/components/layout/Sidebar/index.jsx
/home/user/webgisc3/frontend/src/components/layout/CollapsibleSidebar/index.jsx
/home/user/webgisc3/frontend/src/components/layout/UserCard/index.jsx
```

### 5.13 Frontend Constants
```
/home/user/webgisc3/frontend/src/constants/index.js
/home/user/webgisc3/frontend/src/constants/api.constants.js
/home/user/webgisc3/frontend/src/constants/routes.js
/home/user/webgisc3/frontend/src/constants/roles.js
/home/user/webgisc3/frontend/src/constants/map.constants.js
```

### 5.14 Frontend Routing
```
/home/user/webgisc3/frontend/src/App.jsx
/home/user/webgisc3/frontend/src/features/auth/components/ProtectedRoute.jsx
```

---

## 6. RECOMMENDATIONS

### 6.1 Immediate Actions

1. **Connect Quiz UI to Backend**
   - Update `QuizPanel/index.jsx` to fetch from `/api/v1/quizzes/{id}/`
   - Implement quiz submission to `/api/v1/quizzes/quiz_submissions/`
   - Display real-time score from backend

2. **Connect Lesson UI to Backend**
   - Update `LessonsPanel/index.jsx` to fetch from `/api/v1/lessons/`
   - Implement lesson detail view
   - Integrate map actions with lesson steps

3. **File Upload Support**
   - Add FileField to Quiz model for attachments
   - Add FileField to Lesson model for resources
   - Create upload endpoints
   - Build frontend file upload component

4. **Quiz Assignment Workflow**
   - Enforce quiz-classroom relationship
   - Add quiz assignment page for teachers
   - Add quiz list for students in classroom detail

### 6.2 Enhancement Priorities

**High Priority**:
- Quiz assignment to classrooms
- Quiz results view for teachers
- Lesson completion tracking
- Student progress dashboard

**Medium Priority**:
- Quiz time limits
- Quiz deadlines
- Rich text editor for announcements
- Classroom settings page

**Low Priority**:
- Multiple quiz attempts
- Spatial quiz questions (GIS-specific)
- Lesson analytics
- Student peer collaboration features

---

## 7. TECHNICAL NOTES

### 7.1 Database Schema
- PostgreSQL 14 + PostGIS 3.3
- GeoDjango for spatial features
- UUID primary keys for User model
- Auto-incrementing IDs for other models

### 7.2 Authentication
- JWT tokens via django-rest-framework-simplejwt
- Access token: 60 minutes
- Refresh token: 7 days
- Role-based permissions (teacher/student)

### 7.3 Frontend Stack
- React 18
- Vite build tool
- Tailwind CSS for styling
- Axios for HTTP requests
- React Router for routing
- Mapbox GL JS for maps

### 7.4 API Documentation
- drf-spectacular for OpenAPI schema
- Swagger UI: http://localhost:8080/api/schema/swagger-ui/
- ReDoc: http://localhost:8080/api/schema/redoc/

---

## 8. UNRESOLVED QUESTIONS

1. **Quiz Assignment**: Should quizzes be required or optional for classroom? Current model allows nullable classroom FK.

2. **File Storage**: Where to store uploaded files? Local media folder or cloud storage (S3, CloudFlare R2)?

3. **Quiz Time Limits**: Should time limits be enforced server-side or client-side? Security implications?

4. **Lesson Progress**: Track per-step completion or whole lesson completion only?

5. **Student Removal**: Should teachers be able to remove students from classroom? Or only students can leave?

6. **Quiz Retakes**: Allow unlimited retakes or limit to N attempts? Keep all submissions or only best score?

7. **Spatial Quizzes**: Integrate quiz questions with map interactions? Click-on-map answers?

---

## 9. CONCLUSION

WebGIS has strong foundation for classroom & quiz system. Backend models, views, serializers complete. Frontend UI components exist but need API integration. Main gaps: file uploads, quiz-classroom assignment workflow, progress tracking. Recommend incremental approach: connect existing UI to backend first, then enhance with new features.

**Estimated Effort**:
- Connect Quiz/Lesson UI: 4-6 hours
- File upload support: 6-8 hours  
- Quiz assignment workflow: 8-12 hours
- Progress tracking: 12-16 hours

**Total: 30-42 hours** for complete implementation.

---

**End of Scout Report**
