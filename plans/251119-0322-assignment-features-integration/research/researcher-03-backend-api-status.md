# Backend API Endpoints Status - Assignments

**Date:** 2025-11-19
**Research Focus:** Assignment CRUD operations, file handling, auth/permissions

---

## API Endpoints Summary

### Existing Endpoints (All Implemented)

#### Classroom Endpoints
- `GET /api/v1/classrooms/` - List user's classrooms
- `POST /api/v1/classrooms/` - Create classroom (any authenticated user)
- `GET /api/v1/classrooms/{id}/` - Retrieve classroom
- `PUT/PATCH /api/v1/classrooms/{id}/` - Update (owner only)
- `DELETE /api/v1/classrooms/{id}/` - Delete (owner only)
- `GET /api/v1/classrooms/{id}/students/` - List students (teacher only)

#### Assignment Endpoints
- `GET /api/v1/classrooms/{id}/assignments/` - List assignments
- `POST /api/v1/classrooms/{id}/assignments/` - Create assignment (teacher only)
- `GET /api/v1/classrooms/{id}/assignments/{aid}/` - Retrieve assignment
- `PUT/PATCH /api/v1/classrooms/{id}/assignments/{aid}/` - Update (teacher only)
- `DELETE /api/v1/classrooms/{id}/assignments/{aid}/` - Delete (teacher only)
- `GET /api/v1/classrooms/{id}/assignments/{aid}/submission_status/` - Check user submission

#### Submission Endpoints
- `GET /api/v1/assignments/{id}/submissions/` - List submissions (nested)
- `POST /api/v1/assignments/{id}/submissions/submit/` - Submit assignment
- `GET /api/v1/submissions/{id}/` - Retrieve submission
- `GET /api/v1/submissions/` - List submissions (standalone)

#### Grade Endpoints
- `POST /api/v1/submissions/{id}/grade/` - Create grade (teacher only)
- `PUT /api/v1/submissions/{id}/grade/` - Update grade (teacher only)
- `GET /api/v1/submissions/{id}/grade/` - Retrieve grade

---

## File Handling Implementation

### Upload Support
**Assignment Files:**
- Field: `attachment` (FileField)
- Path: `assignments/%Y/%m/%d/`
- Formats: PDF, DOC, DOCX only
- Validators: FileExtensionValidator + custom validate_assignment_file
- Endpoint: `POST /api/v1/classrooms/{id}/assignments/` (multipart/form-data)

**Submission Files:**
- Field: `file` (FileField)
- Path: `submissions/%Y/%m/%d/`
- Formats: PDF, DOC, DOCX
- Validators: FileExtensionValidator + validate_submission_file
- Endpoint: `POST /api/v1/assignments/{id}/submissions/submit/` (multipart/form-data)

**Feedback Files:**
- Field: `feedback_file` (FileField)
- Path: `feedback/%Y/%m/%d/`
- Formats: PDF, DOC, DOCX
- Validators: FileExtensionValidator + validate_feedback_file
- Endpoint: `POST /api/v1/submissions/{id}/grade/` (multipart/form-data)

### Download Support
- Attachment URL: Serializer builds absolute URI via `request.build_absolute_uri(obj.attachment.url)`
- Submission File URL: `SubmissionSerializer.get_file_url()`
- Feedback File URL: `GradeSerializer.get_feedback_file_url()`
- Response: URLs included in JSON, actual files served by Django FileStorage

---

## Permission & Authentication Checks

### Authentication
- All endpoints require `IsAuthenticated` permission
- Uses Django authentication (Token/Session-based per project setup)

### Assignment Permissions
- **Create:** `classroom.teacher == request.user` (teacher only)
- **Update:** `assignment.classroom.teacher == request.user` (teacher only)
- **Delete:** `assignment.classroom.teacher == request.user` (teacher only)
- **Read:** User is owner OR enrolled in classroom

### Submission Permissions
- **Submit:** User is enrolled in classroom (checked in serializer)
- **View (teacher):** All submissions for their assignments
- **View (student):** Own submissions only

### Grade Permissions
- **Create/Update:** `submission.assignment.classroom.teacher == request.user` (teacher only)
- **View (teacher):** All grades for their submissions
- **View (student):** Only published grades for own submissions

---

## Missing/Unimplemented Features

### File Operations
- ✓ Upload: Implemented in all three contexts
- ✓ Download: URLs returned in responses
- ❌ Batch download (multiple submissions)
- ❌ Bulk file operations
- ❌ File preview endpoints

### Assignment Features
- ✓ CRUD operations
- ✓ Due date validation
- ✓ Late submission flag
- ✓ Submission status check
- ❌ Assignment templates
- ❌ Rubric/criteria support
- ❌ Re-submission/revision tracking
- ❌ Partial submission (auto-save)

### Submission Features
- ✓ Text + file support
- ✓ Late detection
- ❌ Submission versioning
- ❌ Draft/in-progress state
- ❌ Plagiarism detection endpoints

### Grading Features
- ✓ Score + feedback
- ✓ Feedback files
- ✓ Publication control
- ❌ Rubric-based grading
- ❌ Grade analytics/statistics
- ❌ Bulk grading

---

## Data Models Structure

### Assignment Model
- `classroom` (FK) - Parent classroom
- `title`, `description` (CharField/TextField)
- `due_date` (DateTimeField)
- `max_score` (DecimalField)
- `attachment` (FileField, optional)
- `created_by` (FK to User)
- `created_at`, `updated_at` (auto-timestamps)
- **Relations:** `submissions` (reverse), `announcements`

### Submission Model
- `assignment` (FK)
- `student` (FK to User)
- `text_answer` (TextField, optional)
- `file` (FileField, optional)
- `submitted_at` (auto-timestamp)
- `is_late` (BooleanField, auto-calculated on save)
- **Constraint:** Unique together (assignment, student)

### Grade Model
- `submission` (OneToOneField)
- `score` (DecimalField)
- `feedback` (TextField, optional)
- `feedback_file` (FileField, optional)
- `is_published` (BooleanField)
- `graded_by` (FK to User)
- `graded_at` (auto-timestamp)

---

## Validation Rules

### Assignment
- Due date must be future
- Max score > 0
- File extensions: pdf, doc, docx

### Submission
- At least text_answer OR file required
- File extensions: pdf, doc, docx
- Student must be enrolled in classroom
- One submission per student per assignment (unique constraint)

### Grade
- Score >= 0
- Score <= assignment.max_score
- File extensions: pdf, doc, docx

---

## Router Configuration

**Nested Routes:**
- `/classrooms/{id}/assignments/` - AssignmentViewSet
- `/classrooms/{id}/assignments/{aid}/submissions/` - SubmissionViewSet (nested)
- `/submissions/{id}/grade/` - GradeViewSet (nested)

**Standalone Routes:**
- `/submissions/` - SubmissionViewSet (standalone access)
- `/enrollments/join/` - EnrollmentJoinView

---

## Key Observations

1. **Complete CRUD:** All assignment operations fully implemented
2. **Role-based Access:** Proper teacher/student permission checks
3. **File Validation:** Strict extension + custom validation in place
4. **Late Detection:** Auto-calculated on submission creation
5. **Grade Privacy:** Published flag controls student visibility
6. **Serializer Strategy:** Different serializers for list/create/detail operations
7. **URL Building:** Proper absolute URI construction for file downloads

---

## Unresolved Questions

- Batch operations API (download multiple submissions)?
- Rate limiting on file uploads?
- Storage backend configuration (local/S3)?
- File size limits enforced?
