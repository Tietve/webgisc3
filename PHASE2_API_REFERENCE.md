# Phase 2: Quiz Deadline & Grading System - API Reference

Quick reference for new API endpoints and usage examples.

---

## 🔗 New Endpoints

### 1. GET /api/v1/quizzes/deadlines/

**Description:** Get all quiz deadlines for authenticated user

**Authentication:** Required

**Permissions:**
- Students: See quizzes from enrolled classrooms
- Teachers: See quizzes from owned classrooms + stats

**Query Parameters:**
- `status` (optional): Filter by deadline status
  - Values: `upcoming`, `upcoming_soon`, `due_soon`, `overdue`
- `classroom_id` (optional): Filter by specific classroom ID

**Example Requests:**

```bash
# Get all deadlines (student)
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/quizzes/deadlines/

# Filter by due soon
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/quizzes/deadlines/?status=due_soon"

# Filter by classroom
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/quizzes/deadlines/?classroom_id=5"
```

**Response (Student):**
```json
[
  {
    "id": 1,
    "title": "Geography Quiz 1",
    "classroom_id": 2,
    "classroom_name": "GIS 101",
    "due_date": "2025-11-21T23:59:59Z",
    "deadline_status": "upcoming_soon",
    "deadline_color": "yellow",
    "user_submission_status": "not_submitted",
    "time_remaining": "3 days"
  },
  {
    "id": 2,
    "title": "Map Analysis Quiz",
    "classroom_id": 2,
    "classroom_name": "GIS 101",
    "due_date": "2025-11-25T23:59:59Z",
    "deadline_status": "upcoming",
    "deadline_color": "green",
    "user_submission_status": "submitted",
    "time_remaining": "7 days"
  }
]
```

**Response (Teacher - includes extra stats):**
```json
[
  {
    "id": 1,
    "title": "Geography Quiz 1",
    "classroom_id": 2,
    "classroom_name": "GIS 101",
    "due_date": "2025-11-21T23:59:59Z",
    "deadline_status": "upcoming_soon",
    "deadline_color": "yellow",
    "submission_count": 15,
    "pending_review_count": 3,
    "time_remaining": "3 days"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### 2. GET /api/v1/quizzes/{id}/results/

**Description:** Get all submissions for a quiz (teacher only)

**Authentication:** Required

**Permissions:** Teacher must own the quiz's classroom

**Example Request:**

```bash
curl -H "Authorization: Bearer <teacher_token>" \
  http://localhost:8080/api/v1/quizzes/1/results/
```

**Response:**
```json
{
  "quiz_id": 1,
  "quiz_title": "Geography Quiz 1",
  "total_submissions": 18,
  "submissions": [
    {
      "id": 101,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "score": 80,
      "adjusted_score": 85,
      "final_score": 85,
      "teacher_feedback": "Good job on most questions",
      "is_reviewed": true,
      "is_late": false,
      "submitted_at": "2025-11-18T10:00:00Z"
    },
    {
      "id": 102,
      "student_name": "Jane Smith",
      "student_email": "jane@example.com",
      "score": 95,
      "adjusted_score": null,
      "final_score": 95,
      "teacher_feedback": "",
      "is_reviewed": false,
      "is_late": false,
      "submitted_at": "2025-11-18T09:30:00Z"
    },
    {
      "id": 103,
      "student_name": "Bob Johnson",
      "student_email": "bob@example.com",
      "score": 70,
      "adjusted_score": null,
      "final_score": 70,
      "teacher_feedback": "",
      "is_reviewed": false,
      "is_late": true,
      "submitted_at": "2025-11-18T15:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Teacher doesn't own this classroom
- `404 Not Found`: Quiz not found

---

### 3. POST /api/v1/quiz-submissions/{id}/review/

**Description:** Teacher reviews and grades a quiz submission

**Authentication:** Required

**Permissions:** Teacher must own the quiz's classroom

**Request Body:**
```json
{
  "adjusted_score": 95,
  "teacher_feedback": "Excellent work! Minor issue with question 3, but overall great understanding.",
  "is_reviewed": true
}
```

**Fields:**
- `adjusted_score` (optional): Override auto-calculated score (0-100)
- `teacher_feedback` (optional): Review comments
- `is_reviewed` (optional): Auto-set to true if score/feedback provided

**Example Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "adjusted_score": 95,
    "teacher_feedback": "Excellent work! Minor issue with question 3."
  }' \
  http://localhost:8080/api/v1/quiz-submissions/123/review/
```

**Response:**
```json
{
  "id": 123,
  "quiz_title": "Geography Quiz 1",
  "student_email": "student@example.com",
  "score": 80,
  "adjusted_score": 95,
  "final_score": 95,
  "teacher_feedback": "Excellent work! Minor issue with question 3.",
  "is_reviewed": true,
  "is_late": false,
  "submitted_at": "2025-11-18T14:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid data (e.g., adjusted_score > 100)
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Teacher doesn't own this classroom
- `404 Not Found`: Submission not found

**Validation Errors:**
```json
{
  "adjusted_score": [
    "Adjusted score must be between 0 and 100."
  ]
}
```

---

## 📝 Updated Endpoints

### GET /api/v1/quizzes/{id}/

**What's New:** Now includes deadline fields

**Response (Updated):**
```json
{
  "id": 1,
  "title": "Geography Quiz 1",
  "description": "Test your knowledge of world geography",
  "questions": [...],
  "due_date": "2025-11-21T23:59:59Z",
  "late_submission_allowed": true,
  "late_deadline": "2025-11-22T23:59:59Z",
  "deadline_status": "upcoming_soon",
  "deadline_color": "yellow",
  "created_at": "2025-11-01T10:00:00Z"
}
```

---

### GET /api/v1/quizzes/

**What's New:** List includes deadline info

**Response (Updated):**
```json
[
  {
    "id": 1,
    "title": "Geography Quiz 1",
    "description": "Test your knowledge",
    "classroom": 2,
    "question_count": 10,
    "due_date": "2025-11-21T23:59:59Z",
    "deadline_status": "upcoming_soon",
    "deadline_color": "yellow",
    "created_at": "2025-11-01T10:00:00Z"
  }
]
```

---

### POST /api/v1/quiz_submissions/

**What's New:** Auto-detects late submissions

**Request (Same):**
```json
{
  "quiz_id": 1,
  "answers": {
    "1": "5",
    "2": "8",
    "3": "12"
  }
}
```

**Response (Updated):**
```json
{
  "submission_id": 123,
  "score": 80,
  "quiz_title": "Geography Quiz 1",
  "submitted_at": "2025-11-18T15:00:00Z",
  "is_late": true
}
```

**Note:** `is_late` is automatically set based on quiz due_date

---

## 🎨 Frontend Integration Guide

### Color Coding

Use `deadline_color` field to style deadline badges:

```jsx
const colorMap = {
  'green': 'bg-green-500',    // >7 days
  'yellow': 'bg-yellow-500',  // 1-7 days
  'red': 'bg-red-500',        // Overdue
  'gray': 'bg-gray-500'       // No deadline
};

<Badge className={colorMap[quiz.deadline_color]}>
  {quiz.time_remaining}
</Badge>
```

### Submission Status Icons

```jsx
const statusIcons = {
  'not_submitted': '❌',
  'submitted': '✅',
  'graded': '⭐'
};

<span>{statusIcons[quiz.user_submission_status]}</span>
```

### Deadline Status Messages

```jsx
const statusMessages = {
  'upcoming': 'Due in more than a week',
  'upcoming_soon': 'Due this week',
  'due_soon': 'Due in less than 24 hours!',
  'overdue': 'Overdue',
  'no_deadline': 'No deadline'
};
```

---

## 🔍 Testing Workflow

### 1. Create Quiz with Deadline (Admin/Teacher)

Via Django Admin or API:
```python
quiz = Quiz.objects.create(
    title="Test Quiz",
    classroom=classroom,
    due_date=timezone.now() + timedelta(days=3)
)
```

### 2. Student Views Deadlines

```bash
# Login as student
curl -X POST http://localhost:8080/api/v1/auth/token/ \
  -d '{"email": "student@example.com", "password": "student123"}'

# Get deadlines
curl -H "Authorization: Bearer <student_token>" \
  http://localhost:8080/api/v1/quizzes/deadlines/
```

### 3. Student Submits Quiz

```bash
curl -X POST \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": 1,
    "answers": {"1": "5", "2": "8"}
  }' \
  http://localhost:8080/api/v1/quiz_submissions/
```

### 4. Teacher Views Results

```bash
# Login as teacher
curl -X POST http://localhost:8080/api/v1/auth/token/ \
  -d '{"email": "teacher@example.com", "password": "teacher123"}'

# Get results
curl -H "Authorization: Bearer <teacher_token>" \
  http://localhost:8080/api/v1/quizzes/1/results/
```

### 5. Teacher Reviews Submission

```bash
curl -X POST \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "adjusted_score": 90,
    "teacher_feedback": "Great work!"
  }' \
  http://localhost:8080/api/v1/quiz-submissions/123/review/
```

### 6. Student Checks Updated Grade

```bash
curl -H "Authorization: Bearer <student_token>" \
  http://localhost:8080/api/v1/quizzes/1/
```

---

## 📊 Field Reference

### Quiz Model Fields (New)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `due_date` | DateTimeField | Yes | Deadline for submission |
| `late_submission_allowed` | BooleanField | No | Allow submissions after due_date |
| `late_deadline` | DateTimeField | Yes | Extended deadline for late work |

### Quiz Properties (Computed)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `is_overdue` | Boolean | True/False | Past due_date |
| `deadline_status` | String | upcoming, upcoming_soon, due_soon, overdue, no_deadline | Status category |
| `deadline_color` | String | green, yellow, red, gray | UI color hint |

### QuizSubmission Model Fields (New)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `adjusted_score` | IntegerField | Yes | Teacher override (0-100) |
| `teacher_feedback` | TextField | Yes | Review comments |
| `is_reviewed` | BooleanField | No | Teacher reviewed |
| `is_late` | BooleanField | No | Submitted after deadline |

### QuizSubmission Properties (Computed)

| Property | Type | Description |
|----------|------|-------------|
| `final_score` | Integer | Returns adjusted_score if exists, else score |

---

## ⚠️ Common Issues & Solutions

### Issue: 403 Forbidden on Review

**Cause:** Teacher doesn't own quiz's classroom

**Solution:** Verify teacher owns classroom:
```python
quiz.classroom.teacher == request.user
```

### Issue: Deadline status always "no_deadline"

**Cause:** Quiz.due_date is None

**Solution:** Set due_date via admin or API:
```python
quiz.due_date = timezone.now() + timedelta(days=7)
quiz.save()
```

### Issue: Late submissions not detected

**Cause:** Quiz.due_date not set or in future

**Solution:** Ensure due_date is in past:
```python
quiz.due_date = timezone.now() - timedelta(hours=2)
quiz.save()
```

### Issue: Empty deadline list

**Cause:** Student not enrolled or teacher has no classrooms

**Solution:** Verify enrollment:
```python
# Check student enrollment
Enrollment.objects.filter(student=user, status='active')

# Check teacher classrooms
Classroom.objects.filter(teacher=user)
```

---

## 🔗 Related Documentation

- [Full Implementation Report](./PHASE2_IMPLEMENTATION_REPORT.md)
- [Test Script](./test_phase2_quiz_system.py)
- [Phase 2 Plan](./plans/251118-1826-classroom-quiz-system/phase-02-quiz-deadline-grading.md)
- [Swagger UI](http://localhost:8080/api/schema/swagger-ui/)

---

**Last Updated:** 2025-11-18
**Version:** 1.0
**Status:** ✅ Production Ready
