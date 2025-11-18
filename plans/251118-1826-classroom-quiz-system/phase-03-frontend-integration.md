# Phase 3: Frontend API Integration

---

## Context Links

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: Phase 1 (Assignment Backend), Phase 2 (Quiz Deadline System)
**Related Docs**:
- [Scout Report](./scout/scout-01-codebase-analysis.md)
- [Research: UI Patterns](./research/researcher-03-ui-patterns.md)
- [Phase 1: Assignment Backend](./phase-01-assignment-submission-backend.md)
- [Phase 2: Quiz Deadline](./phase-02-quiz-deadline-grading.md)

---

## Overview

**Date**: 2025-11-18
**Description**: Connect QuizPanel and LessonsPanel to backend APIs, implement file upload component, create assignment submission UI in classroom detail, display aggregated deadlines in map view.
**Priority**: High
**Implementation Status**: 🔵 Not Started
**Review Status**: Not Reviewed
**Estimated Duration**: 10-14 hours

---

## Key Insights

**From Scout Report**:
- QuizPanel component exists with hardcoded data at `/home/user/webgisc3/frontend/src/components/map/QuizPanel/index.jsx`
- LessonsPanel component exists with hardcoded data at `/home/user/webgisc3/frontend/src/components/map/LessonsPanel/index.jsx`
- API services exist: classroom.service.js, quiz.service.js, lesson.service.js
- ClassroomDetailPage has tabs (stream, classwork, people) - classwork tab is placeholder
- No file upload component exists yet
- React 18 + Vite + Tailwind CSS stack

**From Research**:
- Use react-dropzone for file uploads (drag & drop + click to upload)
- Display file upload progress with progress bar
- Validate file types and sizes client-side before upload
- Use FormData for multipart/form-data uploads
- Show deadline countdown with dynamic color coding

**Architecture Pattern**:
- Create reusable FileUpload component
- Use React hooks for state management (useState, useEffect)
- Use Axios interceptors (already configured) for API calls
- Display loading states and error messages
- Implement optimistic UI updates where appropriate

---

## Requirements

### Functional Requirements

**FR1**: QuizPanel fetches quiz data from `/api/v1/quizzes/{id}/` and submits to `/api/v1/quizzes/quiz_submissions/`
**FR2**: LessonsPanel fetches lessons from `/api/v1/lessons/` and displays
**FR3**: ClassroomDetailPage shows assignments in Classwork tab with create/list/detail
**FR4**: Students submit assignments with text answer and/or file upload
**FR5**: Map view displays aggregated deadlines (assignments + quizzes) from `/api/v1/deadlines/`
**FR6**: Teachers view submissions and grade with feedback
**FR7**: Students view grades and feedback in classroom detail

### Non-Functional Requirements

**NFR1**: File upload with drag & drop, progress indicator, client-side validation
**NFR2**: Responsive design (mobile + desktop) with Tailwind
**NFR3**: Error handling with user-friendly messages
**NFR4**: Loading states for all async operations
**NFR5**: Optimistic UI updates where safe

---

## Architecture

### Component Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   └── FileUpload/
│   │       └── index.jsx (NEW - reusable file upload)
│   ├── map/
│   │   ├── QuizPanel/
│   │   │   └── index.jsx (UPDATE - connect to API)
│   │   ├── LessonsPanel/
│   │   │   └── index.jsx (UPDATE - connect to API)
│   │   └── DeadlineWidget/
│   │       └── index.jsx (NEW - deadline display)
│   └── classroom/
│       ├── AssignmentList/
│       │   └── index.jsx (NEW)
│       ├── AssignmentCreate/
│       │   └── index.jsx (NEW - teacher only)
│       ├── AssignmentDetail/
│       │   └── index.jsx (NEW)
│       ├── SubmissionForm/
│       │   └── index.jsx (NEW - student)
│       ├── SubmissionList/
│       │   └── index.jsx (NEW - teacher)
│       └── GradeForm/
│           └── index.jsx (NEW - teacher)
├── services/
│   ├── assignment.service.js (NEW)
│   ├── submission.service.js (NEW)
│   ├── deadline.service.js (NEW)
│   ├── quiz.service.js (UPDATE)
│   └── lesson.service.js (UPDATE)
└── features/classroom/pages/
    └── ClassroomDetailPage.jsx (UPDATE - add Classwork tab content)
```

### API Service Functions

**assignment.service.js**:
```javascript
export const assignmentService = {
  list: (classroomId) => api.get(`/classrooms/${classroomId}/assignments/`),
  get: (assignmentId) => api.get(`/assignments/${assignmentId}/`),
  create: (classroomId, data) => api.post(`/classrooms/${classroomId}/assignments/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (assignmentId, data) => api.put(`/assignments/${assignmentId}/`, data),
  delete: (assignmentId) => api.delete(`/assignments/${assignmentId}/`)
}
```

**submission.service.js**:
```javascript
export const submissionService = {
  submit: (assignmentId, formData) => api.post(`/assignments/${assignmentId}/submit/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions/`),
  get: (submissionId) => api.get(`/submissions/${submissionId}/`),
  grade: (submissionId, data) => api.post(`/submissions/${submissionId}/grade/`, data)
}
```

**deadline.service.js**:
```javascript
export const deadlineService = {
  getAll: (filters) => api.get('/deadlines/', { params: filters }), // Combined assignments + quizzes
  getUpcoming: () => api.get('/deadlines/', { params: { status: 'upcoming' } })
}
```

### State Management Pattern

Use React hooks for local state, no global state library needed yet:

```javascript
// Example: AssignmentList component
function AssignmentList({ classroomId }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAssignments()
  }, [classroomId])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const response = await assignmentService.list(classroomId)
      setAssignments(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  // Render logic...
}
```

---

## Related Code Files

**New Components**:
- `/home/user/webgisc3/frontend/src/components/common/FileUpload/index.jsx`
- `/home/user/webgisc3/frontend/src/components/classroom/AssignmentList/index.jsx`
- `/home/user/webgisc3/frontend/src/components/classroom/AssignmentCreate/index.jsx`
- `/home/user/webgisc3/frontend/src/components/classroom/AssignmentDetail/index.jsx`
- `/home/user/webgisc3/frontend/src/components/classroom/SubmissionForm/index.jsx`
- `/home/user/webgisc3/frontend/src/components/classroom/SubmissionList/index.jsx`
- `/home/user/webgisc3/frontend/src/components/classroom/GradeForm/index.jsx`
- `/home/user/webgisc3/frontend/src/components/map/DeadlineWidget/index.jsx`

**New Services**:
- `/home/user/webgisc3/frontend/src/services/assignment.service.js`
- `/home/user/webgisc3/frontend/src/services/submission.service.js`
- `/home/user/webgisc3/frontend/src/services/deadline.service.js`

**Updated Components**:
- `/home/user/webgisc3/frontend/src/components/map/QuizPanel/index.jsx`
- `/home/user/webgisc3/frontend/src/components/map/LessonsPanel/index.jsx`
- `/home/user/webgisc3/frontend/src/features/classroom/pages/ClassroomDetailPage.jsx`

**Updated Services**:
- `/home/user/webgisc3/frontend/src/services/quiz.service.js`
- `/home/user/webgisc3/frontend/src/services/lesson.service.js`
- `/home/user/webgisc3/frontend/src/services/index.js` (export new services)

**Constants**:
- `/home/user/webgisc3/frontend/src/constants/api.constants.js` (add new endpoints)

---

## Implementation Steps

### Step 1: Create File Upload Component (2 hours)

1. Install react-dropzone: `npm install react-dropzone`
2. Create `FileUpload/index.jsx`:
   - Accept file types, max size props
   - Drag & drop zone with visual feedback
   - File preview (name, size, type)
   - Progress indicator for upload
   - Remove file button
   - Client-side validation
3. Style with Tailwind (dropzone border, hover effects)
4. Add loading spinner during upload
5. Test with different file types and sizes

### Step 2: Create API Service Files (1.5 hours)

1. Create `assignment.service.js` with CRUD operations
2. Create `submission.service.js` with submit/grade operations
3. Create `deadline.service.js` with aggregation endpoint
4. Update `quiz.service.js` to include deadline params
5. Update `lesson.service.js` for lesson fetching
6. Export all services in `services/index.js`
7. Update `api.constants.js` with new endpoints

### Step 3: Update QuizPanel Component (2 hours)

1. Remove hardcoded quiz data
2. Add useEffect to fetch quiz from API
3. Implement quiz submission:
   ```javascript
   const handleSubmit = async () => {
     try {
       const response = await quizService.submit(quizId, { answers })
       setScore(response.data.score)
       setShowResults(true)
     } catch (err) {
       setError(err.response?.data?.message)
     }
   }
   ```
4. Display loading state while fetching
5. Show error messages if API fails
6. Display auto-calculated score from backend
7. Show teacher feedback if reviewed
8. Test with real quiz data

### Step 4: Update LessonsPanel Component (1.5 hours)

1. Remove hardcoded lesson data
2. Add useEffect to fetch lessons from `/api/v1/lessons/`
3. Display lesson list with difficulty badges
4. Add loading skeleton while fetching
5. Handle empty state (no lessons available)
6. Add click handler to view lesson detail
7. Test with real lesson data

### Step 5: Create Assignment Components (3 hours)

1. **AssignmentList**:
   - Fetch assignments from API
   - Display list with due dates, submission status
   - Color-code deadlines (green/yellow/red)
   - Teacher: show submission count
   - Student: show submission status (not_submitted, submitted, graded)

2. **AssignmentCreate** (teacher only):
   - Form: title, description, due_date, max_score, attachment
   - Use FileUpload component for attachment
   - Submit with multipart/form-data
   - Redirect to assignment detail on success

3. **AssignmentDetail**:
   - Display assignment info
   - Teacher: show submission list
   - Student: show submission form or submitted status

4. **SubmissionForm** (student):
   - Textarea for text answer
   - FileUpload for file submission
   - Validate: require at least one (text or file)
   - Show submission confirmation
   - Detect late submission (show warning)

5. **SubmissionList** (teacher):
   - List all submissions with student names
   - Show not_submitted students
   - Link to grade form for each submission

6. **GradeForm** (teacher):
   - Display submission (text + file download link)
   - Input: score, feedback
   - Checkbox: publish grade
   - Submit grade via API

### Step 6: Update ClassroomDetailPage (2 hours)

1. Add Classwork tab content (currently placeholder):
   ```jsx
   {activeTab === 'classwork' && (
     <div>
       {isTeacher && <AssignmentCreate classroomId={classroomId} />}
       <AssignmentList classroomId={classroomId} />
     </div>
   )}
   ```
2. Add People tab: show submissions for selected assignment
3. Test role-based rendering (teacher vs student view)

### Step 7: Create Deadline Widget for Map View (2 hours)

1. Create `DeadlineWidget/index.jsx`:
   - Fetch from `/api/v1/deadlines/`
   - Display upcoming deadlines (assignments + quizzes)
   - Sort by due date (nearest first)
   - Color-code by status (green/yellow/red)
   - Show countdown timer for due_soon items
   - Click to navigate to assignment/quiz
2. Add to MapViewerPage:
   ```jsx
   <DeadlineWidget className="absolute top-4 right-4" />
   ```
3. Make collapsible/expandable
4. Add filtering: all, assignments only, quizzes only

### Step 8: Testing & Polish (2 hours)

1. Test quiz submission workflow:
   - Fetch quiz → answer questions → submit → see score
2. Test lesson viewing:
   - Fetch lessons → click lesson → view detail
3. Test assignment workflow:
   - Teacher: create → upload file → publish
   - Student: view → submit (text + file) → see confirmation
   - Teacher: view submissions → grade → publish grade
   - Student: view grade and feedback
4. Test deadline widget:
   - Verify aggregation (assignments + quizzes)
   - Test countdown updates
   - Test click navigation
5. Test mobile responsiveness (all components)
6. Test error handling (network errors, validation errors)
7. Test loading states (spinners, skeletons)

---

## Todo List

- [ ] Install react-dropzone dependency
- [ ] Create reusable FileUpload component
- [ ] Create assignment.service.js with API functions
- [ ] Create submission.service.js with API functions
- [ ] Create deadline.service.js with aggregation
- [ ] Update quiz.service.js for submission
- [ ] Update lesson.service.js for fetching
- [ ] Update api.constants.js with new endpoints
- [ ] Update QuizPanel to fetch from API
- [ ] Update QuizPanel to submit via API
- [ ] Update LessonsPanel to fetch from API
- [ ] Create AssignmentList component
- [ ] Create AssignmentCreate component (teacher)
- [ ] Create AssignmentDetail component
- [ ] Create SubmissionForm component (student)
- [ ] Create SubmissionList component (teacher)
- [ ] Create GradeForm component (teacher)
- [ ] Update ClassroomDetailPage Classwork tab
- [ ] Create DeadlineWidget component
- [ ] Add DeadlineWidget to MapViewerPage
- [ ] Test quiz submission end-to-end
- [ ] Test lesson viewing
- [ ] Test assignment creation (teacher)
- [ ] Test assignment submission (student)
- [ ] Test grading workflow (teacher)
- [ ] Test deadline aggregation display
- [ ] Test mobile responsiveness
- [ ] Test error handling and loading states

---

## Success Criteria

- [ ] QuizPanel fetches real quiz data from API
- [ ] Students submit quiz answers and see auto-calculated score
- [ ] LessonsPanel displays lessons from `/api/v1/lessons/`
- [ ] Teachers create assignments with file attachments
- [ ] Students submit assignments with text and/or file
- [ ] File upload component shows progress indicator
- [ ] Teachers view all submissions for assignment
- [ ] Teachers grade submissions with feedback
- [ ] Students view published grades in classroom
- [ ] Deadline widget shows upcoming deadlines (assignments + quizzes)
- [ ] Deadline countdown updates in real-time
- [ ] All components responsive on mobile and desktop
- [ ] Error messages display for API failures
- [ ] Loading states show during async operations

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Large file uploads timeout | Medium | Medium | Add upload progress, increase timeout, compress files client-side |
| CORS issues with file uploads | High | Low | Verify CORS headers in Django settings, test multipart/form-data |
| Deadline countdown performance | Low | Low | Use setTimeout/setInterval efficiently, cleanup on unmount |
| Mobile file upload UX issues | Medium | Medium | Test on real devices, add touch-friendly dropzone |
| API response structure mismatch | Medium | Medium | Use TypeScript or PropTypes, test with backend team |

---

## Security Considerations

1. **Client-Side Validation**:
   - Validate file types before upload (PDF, DOC, DOCX only)
   - Validate file size (max 10MB)
   - Sanitize file names
   - Note: Server-side validation is primary, client-side is UX

2. **Authentication**:
   - Use JWT from localStorage (already implemented)
   - Handle 401 errors (redirect to login)
   - Refresh token on expiration

3. **Authorization**:
   - Hide teacher-only components from students (role check)
   - Display submission form only if enrolled
   - Disable grade form if not teacher

4. **Data Handling**:
   - Don't store sensitive data in localStorage (only tokens)
   - Clear file inputs after submission
   - Handle file downloads securely (presigned URLs if cloud storage)

---

## Next Steps

After Phase 3 completion:
1. Proceed to **Phase 4** (UI Modernization) to enhance visual design
2. Add real-time features (notifications, live updates) if needed
3. Implement analytics dashboard for teachers
4. Add student progress tracking

**Handoff to Testing**: Provide test scenarios, API endpoint list, and component interaction flows.

---

## Unresolved Questions

1. **File Download Security**: Should files be served directly from MEDIA_ROOT or use presigned URLs?
   - Recommendation: Direct serving for dev, presigned URLs (CloudFlare R2) for production

2. **Real-Time Updates**: Should deadline countdown update automatically every second?
   - Recommendation: Update every 10 seconds to balance UX and performance

3. **Offline Support**: Should app work offline with cached data?
   - Recommendation: Out of scope for MVP, future PWA enhancement

4. **File Preview**: Should PDF files be previewed in-browser before submission?
   - Recommendation: Phase 4 enhancement, use react-pdf library

5. **Bulk Operations**: Should teachers be able to grade multiple submissions at once?
   - Recommendation: Future enhancement, not in this phase

6. **Notification System**: Should students receive notifications for new grades?
   - Recommendation: Phase 4 enhancement, use WebSocket or Server-Sent Events
