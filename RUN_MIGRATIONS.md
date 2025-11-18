# Migration and Testing Instructions

## Phase 1 Implementation Complete!

All backend code for Assignment & Submission system has been implemented. Follow these steps to activate the features.

---

## Step 1: Install python-magic

The file validation system requires `python-magic`. Install it inside the Docker container:

```bash
docker exec -it webgis_backend bash
pip install python-magic==0.4.27
exit
```

Or rebuild the Docker container to install all requirements:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Step 2: Generate and Apply Migrations

Run these commands inside the Docker container:

```bash
# Enter the container
docker exec -it webgis_backend bash

# Generate migrations
python manage.py makemigrations classrooms

# Apply migrations
python manage.py migrate

# Exit container
exit
```

Expected output:
```
Migrations for 'classrooms':
  apps/classrooms/migrations/000X_add_assignment_models.py
    - Create model Assignment
    - Create model Submission
    - Create model Grade
    - Add index on assignment(classroom, due_date)
    - Add index on submission(assignment, student)
```

---

## Step 3: Verify Models in Django Admin

1. Go to: http://localhost:8080/admin/
2. Login with admin credentials
3. You should see new sections:
   - **Assignments** - Create and manage assignments
   - **Submissions** - View student submissions
   - **Grades** - Grade submissions

---

## Step 4: Test API Endpoints

### A. Create an Assignment (Teacher)

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/ \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GIS Analysis Assignment",
    "description": "Analyze the spatial distribution of schools in Hanoi",
    "due_date": "2025-12-31T23:59:59Z",
    "max_score": 100
  }'
```

### B. Submit Assignment (Student)

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -F "text_answer=Here is my analysis of the spatial distribution..." \
  -F "file=@/path/to/submission.pdf"
```

### C. Grade Submission (Teacher)

```bash
curl -X POST http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "feedback": "Good work! Consider analyzing the buffer zones more thoroughly.",
    "is_published": true
  }'
```

### D. View Grade (Student)

```bash
curl -X GET http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

---

## Step 5: Test with Python (Django Shell)

```bash
docker exec -it webgis_backend python manage.py shell
```

```python
from django.utils import timezone
from datetime import timedelta
from apps.classrooms.models import Classroom, Assignment, Submission, Grade
from apps.users.models import User

# Get teacher and student
teacher = User.objects.filter(role='teacher').first()
student = User.objects.filter(role='student').first()

# Get or create classroom
classroom = Classroom.objects.filter(teacher=teacher).first()

# Create assignment
assignment = Assignment.objects.create(
    classroom=classroom,
    title="Test Assignment",
    description="This is a test assignment",
    due_date=timezone.now() + timedelta(days=7),
    max_score=100,
    created_by=teacher
)
print(f"Created assignment: {assignment}")

# Student submits assignment
submission = Submission.objects.create(
    assignment=assignment,
    student=student,
    text_answer="This is my submission text"
)
print(f"Created submission: {submission}")
print(f"Is late: {submission.is_late}")

# Teacher grades submission
grade = Grade.objects.create(
    submission=submission,
    score=85,
    feedback="Well done!",
    is_published=True,
    graded_by=teacher
)
print(f"Created grade: {grade}")
print(f"Percentage: {grade.percentage}%")
```

---

## Complete API Endpoints

### Assignments
- `POST   /api/v1/classrooms/{id}/assignments/` - Create (teacher)
- `GET    /api/v1/classrooms/{id}/assignments/` - List all
- `GET    /api/v1/classrooms/{id}/assignments/{aid}/` - Get details
- `PUT    /api/v1/classrooms/{id}/assignments/{aid}/` - Update (teacher)
- `DELETE /api/v1/classrooms/{id}/assignments/{aid}/` - Delete (teacher)
- `GET    /api/v1/classrooms/{id}/assignments/{aid}/submission_status/` - Check if submitted

### Submissions
- `POST /api/v1/classrooms/{id}/assignments/{aid}/submissions/submit/` - Submit
- `GET  /api/v1/classrooms/{id}/assignments/{aid}/submissions/` - List (teacher: all, student: own)
- `GET  /api/v1/submissions/{id}/` - Get submission details

### Grades
- `POST /api/v1/submissions/{id}/grade/` - Create grade (teacher)
- `PUT  /api/v1/submissions/{id}/grade/` - Update grade (teacher)
- `GET  /api/v1/submissions/{id}/grade/` - Get grade (student: if published, teacher: always)

---

## Security Features Implemented

✅ **File Validation**: Uses libmagic to verify actual file content (not just extension)
✅ **File Size Limit**: Max 10MB per upload
✅ **Allowed Types**: Only PDF, DOC, DOCX
✅ **Permission Control**: Teachers grade, students submit
✅ **Enrollment Check**: Students must be enrolled to submit
✅ **Duplicate Prevention**: One submission per student per assignment
✅ **Late Detection**: Automatically flags late submissions
✅ **Grade Visibility**: Students only see published grades

---

## Database Schema

### assignments
- id, classroom_id, title, description, due_date, max_score
- attachment, created_by_id, created_at, updated_at
- **Index**: (classroom_id, due_date)

### submissions
- id, assignment_id, student_id, text_answer, file
- submitted_at, is_late
- **Unique**: (assignment_id, student_id)
- **Index**: (assignment_id, student_id)

### grades
- id, submission_id (OneToOne), score, feedback, feedback_file
- is_published, graded_by_id, graded_at

---

## File Storage Structure

```
/home/user/webgisc3/media/
├── assignments/
│   └── 2025/11/18/
│       └── assignment_file_abc123.pdf
├── submissions/
│   └── 2025/11/18/
│       └── submission_file_xyz789.pdf
└── feedback/
    └── 2025/11/18/
        └── feedback_file_def456.pdf
```

---

## Troubleshooting

### python-magic not found
```bash
docker exec -it webgis_backend pip install python-magic
```

### Migrations not applying
```bash
docker exec -it webgis_backend python manage.py showmigrations classrooms
docker exec -it webgis_backend python manage.py migrate classrooms --fake-initial
```

### File uploads failing
Check:
1. MEDIA_ROOT directory exists and is writable
2. File size < 10MB
3. File type is PDF, DOC, or DOCX
4. Content type matches extension (libmagic validation)

### Permission denied errors
Ensure:
1. Teacher role for creating assignments and grading
2. Student enrollment for submitting assignments
3. Grade is_published=True for students to view

---

## Next Steps

After testing Phase 1:
1. **Phase 2**: Quiz Deadline & Grading System
2. **Phase 3**: Frontend Integration (React components)
3. **Phase 4**: Bulk operations and CSV export

---

Good luck testing! 🚀
