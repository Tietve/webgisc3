# Assignment System - API Quick Reference

Quick copy-paste examples for testing the new Assignment & Submission APIs.

---

## Authentication

All requests require JWT authentication:
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher01@webgis.com","password":"teacher123"}' \
  | jq -r '.access')

# Use token in requests
curl -H "Authorization: Bearer $TOKEN" ...
```

---

## Assignment APIs

### 1. Create Assignment (Teacher)

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GIS Buffer Analysis",
    "description": "Create 500m buffers around schools and analyze land use within buffers",
    "due_date": "2025-12-31T23:59:59Z",
    "max_score": 100
  }'
```

### 2. Create Assignment with File Attachment

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=GIS Analysis" \
  -F "description=See attached PDF for instructions" \
  -F "due_date=2025-12-31T23:59:59Z" \
  -F "max_score=100" \
  -F "attachment=@/path/to/instructions.pdf"
```

### 3. List Assignments in Classroom

```bash
curl -X GET http://localhost:8080/api/v1/classrooms/1/assignments/ \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Assignment Details

```bash
curl -X GET http://localhost:8080/api/v1/classrooms/1/assignments/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Update Assignment (Teacher)

```bash
curl -X PATCH http://localhost:8080/api/v1/classrooms/1/assignments/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_score": 120
  }'
```

### 6. Delete Assignment (Teacher)

```bash
curl -X DELETE http://localhost:8080/api/v1/classrooms/1/assignments/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Check Submission Status

```bash
curl -X GET http://localhost:8080/api/v1/classrooms/1/assignments/1/submission_status/ \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
```json
{
  "submitted": true,
  "submission_id": 5,
  "submitted_at": "2025-11-18T10:30:00Z",
  "is_late": false
}
```

---

## Submission APIs

### 1. Submit with Text Answer Only

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text_answer": "My analysis shows that there are 45 schools within the study area..."
  }'
```

### 2. Submit with File Only

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/submission.pdf"
```

### 3. Submit with Both Text and File

```bash
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "text_answer=See attached PDF for detailed analysis" \
  -F "file=@/path/to/analysis.pdf"
```

### 4. List Submissions (Teacher sees all, Student sees own)

```bash
# List all submissions for an assignment
curl -X GET http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/ \
  -H "Authorization: Bearer $TOKEN"

# OR list all submissions across all assignments
curl -X GET http://localhost:8080/api/v1/submissions/ \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Get Submission Details

```bash
curl -X GET http://localhost:8080/api/v1/submissions/1/ \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
```json
{
  "id": 1,
  "assignment": 1,
  "assignment_title": "GIS Buffer Analysis",
  "student": 5,
  "student_email": "student01@webgis.com",
  "text_answer": "My analysis...",
  "file": "/media/submissions/2025/11/18/file_abc123.pdf",
  "file_url": "http://localhost:8080/media/submissions/2025/11/18/file_abc123.pdf",
  "submitted_at": "2025-11-18T10:30:00Z",
  "is_late": false,
  "grade": {
    "id": 1,
    "score": 85.0,
    "percentage": 85.0,
    "feedback": "Good work!",
    "is_published": true,
    "graded_at": "2025-11-18T15:00:00Z"
  }
}
```

---

## Grade APIs

### 1. Create Grade (Teacher)

```bash
curl -X POST http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "feedback": "Good work! Your buffer analysis is accurate. Consider adding more detail on land use classification.",
    "is_published": false
  }'
```

### 2. Create Grade with Feedback File

```bash
curl -X POST http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "score=90" \
  -F "feedback=See attached PDF for detailed feedback" \
  -F "is_published=false" \
  -F "feedback_file=@/path/to/feedback.pdf"
```

### 3. Update Grade (Teacher)

```bash
curl -X PUT http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 92,
    "feedback": "Excellent work after revisions!",
    "is_published": true
  }'
```

### 4. Publish Grade (Make Visible to Student)

```bash
curl -X PATCH http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_published": true
  }'
```

### 5. Get Grade (Student: only if published, Teacher: always)

```bash
curl -X GET http://localhost:8080/api/v1/submissions/1/grade/ \
  -H "Authorization: Bearer $TOKEN"
```

**Response** (if published or teacher):
```json
{
  "id": 1,
  "submission": 1,
  "student_email": "student01@webgis.com",
  "assignment_title": "GIS Buffer Analysis",
  "score": 85.0,
  "percentage": 85.0,
  "feedback": "Good work! Your analysis is accurate.",
  "feedback_file": null,
  "feedback_file_url": null,
  "is_published": true,
  "graded_by": 2,
  "graded_by_email": "teacher01@webgis.com",
  "graded_at": "2025-11-18T15:00:00Z"
}
```

**Response** (if not published and student):
```json
{
  "error": "This grade has not been published yet"
}
```

---

## Complete URL Structure

```
/api/v1/classrooms/{classroom_id}/
├── assignments/                              # List/Create assignments
│   └── {assignment_id}/
│       ├── GET, PUT, PATCH, DELETE          # Assignment detail
│       ├── submission_status/               # Check if user submitted
│       └── submissions/
│           └── submit/                      # Submit assignment (POST)
│
/api/v1/submissions/                         # List all submissions
└── {submission_id}/
    ├── GET                                  # Submission detail
    └── grade/
        ├── POST                             # Create grade
        ├── PUT, PATCH                       # Update grade
        └── GET                              # Get grade
```

---

## Error Responses

### 400 Bad Request
```json
{
  "text_answer": ["This field is required."],
  "file": ["File type not allowed."]
}
```

### 403 Forbidden
```json
{
  "error": "Only the classroom teacher can create assignments"
}
```

### 404 Not Found
```json
{
  "error": "This submission has not been graded yet"
}
```

---

## Testing Workflow

### Complete Assignment Flow

```bash
# 1. Teacher creates assignment
ASSIGNMENT_ID=$(curl -s -X POST http://localhost:8080/api/v1/classrooms/1/assignments/ \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","due_date":"2025-12-31T23:59:59Z","max_score":100}' \
  | jq -r '.id')

# 2. Student submits assignment
SUBMISSION_ID=$(curl -s -X POST http://localhost:8080/api/v1/classrooms/1/assignments/$ASSIGNMENT_ID/submissions/submit/ \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -F "text_answer=My answer" \
  | jq -r '.id')

# 3. Teacher grades submission
curl -X POST http://localhost:8080/api/v1/submissions/$SUBMISSION_ID/grade/ \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score":85,"feedback":"Good!","is_published":true}'

# 4. Student views grade
curl -X GET http://localhost:8080/api/v1/submissions/$SUBMISSION_ID/grade/ \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## File Upload Testing

### Test Valid Files
```bash
# PDF
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf"

# DOC
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.doc"

# DOCX
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.docx"
```

### Test Invalid Files (Should Fail)
```bash
# Wrong extension
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"
# Error: File extension ".txt" is not allowed

# Spoofed extension (rename exe to pdf)
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@malicious.exe.pdf"
# Error: File type "application/x-executable" is not allowed

# File too large (> 10MB)
curl -X POST http://localhost:8080/api/v1/classrooms/1/assignments/1/submissions/submit/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@huge_file.pdf"
# Error: File size exceeds maximum allowed size of 10MB
```

---

## Pagination

All list endpoints support pagination:

```bash
curl -X GET "http://localhost:8080/api/v1/classrooms/1/assignments/?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
```json
{
  "count": 45,
  "next": "http://localhost:8080/api/v1/classrooms/1/assignments/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Filters & Search

### Upcoming Assignments
```bash
# Filter by date (future assignments)
curl -X GET "http://localhost:8080/api/v1/classrooms/1/assignments/?due_date__gte=2025-11-18" \
  -H "Authorization: Bearer $TOKEN"
```

### Late Submissions
```bash
# Filter submissions by is_late
curl -X GET "http://localhost:8080/api/v1/submissions/?is_late=true" \
  -H "Authorization: Bearer $TOKEN"
```

### Unpublished Grades (Teacher)
```bash
curl -X GET "http://localhost:8080/api/v1/submissions/1/grade/?is_published=false" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

---

## Common Issues & Solutions

### Issue: "You have already submitted this assignment"
**Solution**: Each student can only submit once per assignment. Use update endpoint (not yet implemented) or delete previous submission.

### Issue: "You are not enrolled in this classroom"
**Solution**: Student must join classroom first using enrollment code.

### Issue: "File type not allowed"
**Solution**: Only PDF, DOC, DOCX allowed. Check file extension and actual content.

### Issue: "This grade has not been published yet"
**Solution**: Teacher must set `is_published: true` for student to see grade.

---

## Postman Collection

Import this collection for easier testing:

```json
{
  "info": {
    "name": "WebGIS Assignment System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Assignments",
      "item": [
        {
          "name": "Create Assignment",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "{{base_url}}/classrooms/{{classroom_id}}/assignments/",
            "body": {
              "mode": "raw",
              "raw": "{\"title\":\"Test\",\"description\":\"Test\",\"due_date\":\"2025-12-31T23:59:59Z\",\"max_score\":100}"
            }
          }
        }
      ]
    }
  ]
}
```

---

**Last Updated**: 2025-11-18
**API Version**: v1
**Base URL**: http://localhost:8080/api/v1
