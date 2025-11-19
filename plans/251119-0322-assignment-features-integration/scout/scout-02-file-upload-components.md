# Scout Report: File Upload Components & Utilities
## Date: 2025-11-19

---

## FOUND COMPONENTS

### 1. FileUpload Component (Reusable)
Path: `/d/Webgis/frontend/src/components/common/FileUpload/index.jsx`

Features:
- Drag & drop file upload
- Click-to-browse file selection
- Client-side validation (type, size)
- Framer Motion animations
- File preview with remove button
- Dark mode support
- Error message display

Props:
- accept: file types (default: '.pdf,.doc,.docx,.txt')
- maxSize: bytes limit (default: 10MB)
- onFileSelect: callback function
- onFileRemove: callback function
- disabled: boolean
- error: error message string

---

## BACKEND VALIDATORS

Path: `/d/Webgis/apps/core/validators.py`

Constants:
- MAX_FILE_SIZE = 10MB
- ALLOWED_DOCUMENT_MIMES: PDF, DOCX, DOC

Functions:
1. validate_file_size(file) - Size check
2. validate_file_content(file) - MIME detection via libmagic
3. validate_submission_file(file) - Combined validation
4. validate_assignment_file(file) - Assignment file validation
5. validate_feedback_file(file) - Feedback file validation

Security: Uses magic number detection (not just extension)

---

## STORAGE CONFIGURATION

Path: `/d/Webgis/config/settings/base.py`

Settings:
- MEDIA_URL = 'media/'
- MEDIA_ROOT = BASE_DIR / 'media'
- FILE_UPLOAD_MAX_MEMORY_SIZE = 10MB
- FILE_UPLOAD_PERMISSIONS = 0o644

Storage Paths:
- Submissions: media/submissions/{year}/{month}/{day}/
- Assignments: media/assignments/{year}/{month}/{day}/
- Feedback: media/feedback/{year}/{month}/{day}/

---

## MODELS WITH FILE UPLOADS

### Assignment Model
Path: `/d/Webgis/apps/classrooms/models.py` (Line 136)

FileField:
- upload_to: 'assignments/%Y/%m/%d/'
- Validators: FileExtensionValidator + validate_assignment_file
- Optional: blank=True, null=True

### Submission Model
Path: `/d/Webgis/apps/classrooms/models.py` (Line 208)

FileField:
- upload_to: 'submissions/%Y/%m/%d/'
- Validators: FileExtensionValidator + validate_submission_file
- Optional: blank=True, null=True
- Additional: text_answer field (optional alternative)
- Auto-set: is_late flag on save if past deadline

### Grade Model
Path: `/d/Webgis/apps/classrooms/models.py` (Line 272)

FileField (feedback_file):
- upload_to: 'feedback/%Y/%m/%d/'
- Validators: FileExtensionValidator + validate_feedback_file
- Optional: blank=True, null=True

---

## SERIALIZERS

### SubmissionSerializer
Path: `/d/Webgis/apps/classrooms/serializers.py` (Line 220)

Features:
- file_url: SerializerMethodField with build_absolute_uri
- Nested student/assignment info
- Conditional grade visibility

### SubmissionCreateSerializer
Path: `/d/Webgis/apps/classrooms/serializers.py` (Line 268)

Validation:
- Requires at least text_answer OR file
- Prevents duplicate submissions
- Verifies student enrollment
- Sets assignment & student from context

---

## FRONTEND COMPONENTS USING UPLOADS

### SubmissionForm Component
Path: `/d/Webgis/frontend/src/components/classroom/SubmissionForm.jsx`

Features:
- Text textarea + FileUpload component
- Late submission warning
- Assignment info display
- FormData construction for multipart
- Success confirmation
- Error handling

Upload Pattern:
```
formData = new FormData()
formData.append('text_answer', text) // optional
formData.append('file', file) // optional
submissionService.submit(assignmentId, formData)
```

FileUpload Config:
- accept: ".pdf,.doc,.docx,.txt,.zip"
- maxSize: 10MB

---

## SERVICES

### submission.service.js
Path: `/d/Webgis/frontend/src/services/submission.service.js`

Methods:
- submit(assignmentId, formData) - POST with multipart
- update(id, formData) - PUT with multipart
- get(id), delete(id), grade(id, data)
- getMySubmissions(classroomId)

### assignment.service.js
Path: `/d/Webgis/frontend/src/services/assignment.service.js`

Methods:
- create(classroomId, formData) - POST with multipart
- update(id, formData) - PUT with multipart
- list(classroomId), get(id), delete(id)
- getSubmissions(assignmentId)

---

## UPLOAD PATTERNS REFERENCE TABLE

| Item | File Type | Size | Storage | Required |
|------|-----------|------|---------|----------|
| Submission | PDF, DOC, DOCX | 10MB | submissions/%Y/%m/%d/ | Optional (with text) |
| Assignment | PDF, DOC, DOCX | 10MB | assignments/%Y/%m/%d/ | Optional |
| Feedback | PDF, DOC, DOCX | 10MB | feedback/%Y/%m/%d/ | Optional |

---

## REUSABLE COMPONENTS AVAILABLE

- FileUpload.jsx - Generic upload component with validation
- Validators - Backend file validators with magic detection
- Models - FileField patterns with validators
- Serializers - File URL generation patterns
- Services - FormData multipart handling

---

## IMPLEMENTATION CHECKLIST FOR NEW FEATURES

For any new assignment-like features requiring file uploads:

1. Use existing FileUpload component in forms
2. Use validators from core/validators.py in Django
3. Add FileField with upload_to matching pattern
4. Use FormData + multipart/form-data in frontend
5. Include file_url in serializer (build_absolute_uri)
6. Follow SubmissionCreateSerializer for validation
7. Test file size, type, and drag-drop functionality

---

## CONFIGURATION EXTENSION POINTS

- File types: Update 'accept' in FileUpload, ALLOWED_DOCUMENT_MIMES
- Size limits: Change maxSize in FileUpload, MAX_FILE_SIZE in validators.py
- Storage paths: Modify upload_to in model FileField
- Permissions: Edit FILE_UPLOAD_PERMISSIONS in settings.py

---

## SECURITY NOTES

- Uses libmagic for MIME detection (not just extension)
- File pointer reset after validation read
- Extension whitelist on both frontend & backend
- Size limits enforced at multiple layers
- 0o644 permissions (rw-r--r--)

