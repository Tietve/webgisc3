# Phase 2: Quiz Deadline & Grading System

---

## Context Links

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: None (can run parallel to Phase 1, but share some concepts)
**Related Docs**:
- [Scout Report](./scout/scout-01-codebase-analysis.md)
- [Research: Quiz Submission](./research/researcher-02-quiz-submission.md)
- [Phase 1: Assignment & Submission Backend](./phase-01-assignment-submission-backend.md) (similar patterns)

---

## Overview

**Date**: 2025-11-18
**Description**: Add deadline management to Quiz model, classroom assignment relationship, deadline aggregation endpoint for map view display, grading workflow with feedback beyond auto-scoring.
**Priority**: High
**Implementation Status**: 🔵 Not Started
**Review Status**: Not Reviewed
**Estimated Duration**: 6-8 hours

---

## Key Insights

**From Scout Report**:
- Quiz, QuizQuestion, QuizAnswer, QuizSubmission models exist and functional
- Auto-scoring implemented in QuizSubmissionCreateSerializer
- Quiz has nullable classroom FK but not enforced
- No deadline field in Quiz model
- No teacher feedback mechanism (only auto-calculated score)
- Frontend QuizPanel exists but uses hardcoded data

**From Research**:
- Use due_date + optional late_deadline for flexible deadlines
- Color-code deadlines (green >7d, yellow 1-7d, red <24h)
- Track submission status (not_submitted, submitted, graded)
- Allow teacher review even for auto-graded quizzes (add comments, adjust score)
- Aggregate deadlines across all enrolled classrooms for student view

**Design Decision**:
- Keep auto-scoring for immediate student feedback
- Add optional teacher review for manual score adjustment + feedback
- Support both classroom-assigned quizzes and standalone quizzes (nullable classroom FK)

---

## Requirements

### Functional Requirements

**FR1**: Quiz has due_date field for deadline management
**FR2**: Quiz optionally assigned to classroom (strengthen FK relationship)
**FR3**: Aggregate endpoint returns all upcoming deadlines for authenticated user
**FR4**: Teachers can add feedback to auto-graded quiz submissions
**FR5**: Teachers can adjust auto-calculated scores (override)
**FR6**: Students see quiz deadlines in map view sorted by date
**FR7**: API returns deadline status (upcoming, due_soon, overdue)

### Non-Functional Requirements

**NFR1**: Deadline aggregation query optimized (select_related, prefetch_related)
**NFR2**: Response includes color coding hints (green/yellow/red)
**NFR3**: Support timezone-aware deadlines (UTC storage, local display)

---

## Architecture

### Database Schema Updates

**Updated Quiz Model**:

```python
# apps/quizzes/models.py

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    classroom = models.ForeignKey(
        'classrooms.Classroom',
        on_delete=models.CASCADE,
        related_name='quizzes',
        null=True,
        blank=True,
        help_text='Optional: assign to specific classroom'
    )
    due_date = models.DateTimeField(null=True, blank=True)
    late_submission_allowed = models.BooleanField(default=False)
    late_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_overdue(self):
        if not self.due_date:
            return False
        return timezone.now() > self.due_date

    @property
    def deadline_status(self):
        """Returns: upcoming, due_soon, overdue, or no_deadline"""
        if not self.due_date:
            return 'no_deadline'
        now = timezone.now()
        if now > self.due_date:
            return 'overdue'
        time_left = self.due_date - now
        if time_left.days < 1:
            return 'due_soon'
        return 'upcoming'

    @property
    def deadline_color(self):
        """Returns color hint for frontend: green, yellow, red"""
        status = self.deadline_status
        if status == 'overdue': return 'red'
        if status == 'due_soon': return 'yellow'
        return 'green'

    class Meta:
        ordering = ['due_date']
```

**Updated QuizSubmission Model**:

```python
class QuizSubmission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('users.User', on_delete=models.CASCADE)
    answers = models.JSONField()  # {question_id: answer_id}
    score = models.IntegerField(default=0)  # Auto-calculated
    adjusted_score = models.IntegerField(null=True, blank=True)  # Teacher override
    teacher_feedback = models.TextField(blank=True)
    is_reviewed = models.BooleanField(default=False)
    is_late = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    @property
    def final_score(self):
        """Return adjusted score if exists, else auto score"""
        return self.adjusted_score if self.adjusted_score is not None else self.score

    class Meta:
        unique_together = [['quiz', 'student']]
```

### New API Endpoints

```
GET    /api/v1/quizzes/deadlines/                     - Aggregate deadlines (authenticated user)
POST   /api/v1/quiz-submissions/{id}/review/          - Teacher reviews submission
GET    /api/v1/classrooms/{id}/quizzes/               - List classroom quizzes
GET    /api/v1/quizzes/{id}/results/                  - Teacher views all submissions (new)
```

### Deadline Aggregation Logic

**For Students**:
```python
# Get all classrooms student enrolled in
enrolled_classrooms = Classroom.objects.filter(
    enrollments__student=request.user,
    enrollments__status='active'
)

# Get all quizzes from those classrooms with deadlines
quizzes = Quiz.objects.filter(
    classroom__in=enrolled_classrooms,
    due_date__isnull=False
).select_related('classroom')

# Include submission status for each quiz
for quiz in quizzes:
    quiz.user_submission = quiz.submissions.filter(student=request.user).first()
```

**For Teachers**:
```python
# Get all classrooms teacher owns
owned_classrooms = Classroom.objects.filter(teacher=request.user)

# Get all quizzes from those classrooms
quizzes = Quiz.objects.filter(
    classroom__in=owned_classrooms,
    due_date__isnull=False
).select_related('classroom').annotate(
    submission_count=Count('submissions'),
    pending_review_count=Count('submissions', filter=Q(submissions__is_reviewed=False))
)
```

---

## Related Code Files

**Models**:
- `/home/user/webgisc3/apps/quizzes/models.py` (update Quiz, QuizSubmission)

**Serializers**:
- `/home/user/webgisc3/apps/quizzes/serializers.py` (create 4 new serializers)

**Views**:
- `/home/user/webgisc3/apps/quizzes/views.py` (add 2 views, update 1 viewset)

**URLs**:
- `/home/user/webgisc3/apps/quizzes/urls.py` (add new endpoints)
- `/home/user/webgisc3/apps/classrooms/urls.py` (add nested quiz routes)

**Migrations**:
- `/home/user/webgisc3/apps/quizzes/migrations/000X_add_deadline_fields.py`

---

## Implementation Steps

### Step 1: Update Quiz Model (1 hour)

1. Add due_date, late_submission_allowed, late_deadline fields to Quiz model
2. Add @property methods: is_overdue, deadline_status, deadline_color
3. Update Meta ordering to ['-due_date']
4. Create migration: `python manage.py makemigrations quizzes`
5. Apply migration: `python manage.py migrate`
6. Test in Django shell: create quiz with due_date, check properties

### Step 2: Update QuizSubmission Model (1 hour)

1. Add adjusted_score, teacher_feedback, is_reviewed, is_late fields
2. Add @property final_score method
3. Update QuizSubmissionCreateSerializer to set is_late automatically
4. Create migration and apply
5. Test submission with late detection

### Step 3: Create Deadline Serializers (1 hour)

1. **QuizDeadlineSerializer** - lightweight: id, title, classroom_name, due_date, deadline_status, deadline_color, user_submission_status
2. **QuizResultsSerializer** - for teachers: quiz info + all submissions with scores
3. **QuizSubmissionReviewSerializer** - update adjusted_score, teacher_feedback, is_reviewed
4. Update existing QuizDetailSerializer to include due_date fields

### Step 4: Create Deadline Aggregation View (2 hours)

1. Create `QuizDeadlineView(APIView)` in `apps/quizzes/views.py`:
   ```python
   class QuizDeadlineView(APIView):
       permission_classes = [IsAuthenticated]

       def get(self, request):
           user = request.user
           if user.is_teacher:
               # Return teacher's classroom quizzes with stats
               pass
           else:
               # Return student's enrolled classroom quizzes
               pass
   ```
2. Optimize query with select_related, prefetch_related
3. Add filtering: ?status=upcoming|due_soon|overdue
4. Add pagination for large result sets
5. Test with different user roles

### Step 5: Create Teacher Review View (1 hour)

1. Create `QuizSubmissionReviewView(APIView)`:
   ```python
   @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
   def review(self, request, pk=None):
       submission = self.get_object()
       # Verify teacher owns classroom
       # Update adjusted_score, teacher_feedback, is_reviewed
       # Return updated submission
   ```
2. Add permission check: teacher must own quiz's classroom
3. Validate adjusted_score <= 100
4. Test review workflow

### Step 6: Create Quiz Results View (1 hour)

1. Add `QuizViewSet.results()` action for teachers:
   ```python
   @action(detail=True, methods=['get'], permission_classes=[IsTeacher])
   def results(self, request, pk=None):
       quiz = self.get_object()
       submissions = quiz.submissions.all().select_related('student')
       # Return list of students with scores, review status
   ```
2. Include not_submitted students (enrolled but no submission)
3. Add export option (CSV) for gradebook
4. Test with multiple submissions

### Step 7: Update URLs (30 min)

1. Add to `apps/quizzes/urls.py`:
   ```python
   path('deadlines/', QuizDeadlineView.as_view(), name='quiz-deadlines')
   path('quiz-submissions/<int:pk>/review/', QuizSubmissionReviewView.as_view())
   ```
2. Add nested route in `apps/classrooms/urls.py`:
   ```python
   path('classrooms/<int:classroom_id>/quizzes/', ...)
   ```
3. Test URL patterns

### Step 8: Test API (1.5 hours)

1. Create quiz with due_date via admin
2. Test deadline aggregation endpoint:
   - As student: see enrolled classroom quizzes
   - As teacher: see owned classroom quizzes with stats
   - Test filtering: ?status=due_soon
3. Test quiz submission with late detection
4. Test teacher review:
   - Adjust score
   - Add feedback
   - Verify student sees updated score
5. Test quiz results endpoint
6. Test permission enforcement

---

## Todo List

- [ ] Add due_date fields to Quiz model
- [ ] Add deadline status properties to Quiz
- [ ] Add review fields to QuizSubmission (adjusted_score, feedback)
- [ ] Create and apply database migrations
- [ ] Create QuizDeadlineSerializer
- [ ] Create QuizSubmissionReviewSerializer
- [ ] Create QuizResultsSerializer
- [ ] Implement QuizDeadlineView with role-based logic
- [ ] Implement QuizSubmissionReviewView with permissions
- [ ] Add quiz results action to QuizViewSet
- [ ] Update QuizSubmissionCreateSerializer for late detection
- [ ] Configure new URL routes
- [ ] Test deadline aggregation (student + teacher)
- [ ] Test teacher review workflow
- [ ] Test quiz results endpoint
- [ ] Test late submission detection
- [ ] Optimize queries (no N+1 problems)
- [ ] Document new endpoints in Swagger

---

## Success Criteria

- [ ] Quiz model has due_date field and deadline properties
- [ ] Student sees all upcoming quizzes from enrolled classrooms
- [ ] Deadlines color-coded (green/yellow/red) in API response
- [ ] Teacher sees quizzes with submission stats (count, pending review)
- [ ] Teacher can review quiz submission and adjust score
- [ ] Student sees adjusted score and teacher feedback
- [ ] Late submissions automatically flagged (is_late=True)
- [ ] Quiz results endpoint shows all students (including not_submitted)
- [ ] All queries optimized (no N+1)
- [ ] Permission enforcement tested (student vs teacher)

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Timezone handling issues (UTC vs local) | Medium | Medium | Store UTC in DB, convert in serializer with user timezone |
| N+1 query problem in deadline aggregation | Medium | High | Use select_related, prefetch_related, test with Django Debug Toolbar |
| Teacher overwrites auto-score by mistake | Low | Low | Keep both score and adjusted_score, show diff in UI |
| Performance with many classrooms/quizzes | Medium | Low | Add pagination, limit results to 30 days future |

---

## Security Considerations

1. **Permission Checks**:
   - Verify teacher owns classroom before allowing review
   - Students only see quizzes from enrolled classrooms
   - Hide other students' scores from students

2. **Data Validation**:
   - Validate adjusted_score between 0-100
   - Ensure due_date is in future (on create)
   - Validate late_deadline > due_date if provided

3. **Query Optimization**:
   - Use select_related to avoid N+1 queries
   - Add indexes on due_date, classroom FK
   - Paginate large result sets

---

## Next Steps

After Phase 2 completion:
1. Proceed to **Phase 3** (Frontend Integration) to connect Quiz UI to backend
2. Integrate with **Phase 1** deadline aggregation (combine assignment + quiz deadlines)
3. Test end-to-end workflow: create quiz → assign to classroom → student submits → teacher reviews

**Handoff to Frontend**: Provide deadline aggregation endpoint spec, submission review flow, and example responses.

---

## Unresolved Questions

1. **Deadline Notifications**: Should system send email/push notifications for upcoming deadlines?
   - Recommendation: Phase 4 enhancement, use Django signals + email backend

2. **Quiz Attempts**: Should students be allowed multiple attempts (retakes)?
   - Recommendation: Future enhancement, requires attempts tracking model

3. **Time Limits**: Should quizzes have time limits (e.g., 30 minutes)?
   - Recommendation: Future enhancement, requires session tracking

4. **Question Randomization**: Randomize question order per student?
   - Recommendation: Out of scope, complex implementation

5. **Combined Deadline View**: Should assignment + quiz deadlines be in single endpoint?
   - Recommendation: Yes, implement in Phase 3 as aggregator endpoint
