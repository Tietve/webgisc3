# Research: Assignment/Quiz Submission Systems

## 1. Homework Submission Workflows

**Pattern**: Dual input - FileField + TextField
- Support PDF, DOC, DOCX uploads
- Text editor for answers

**Django Model**:
```python
class Submission(models.Model):
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE)
    student = models.ForeignKey('User', on_delete=models.CASCADE)
    file = models.FileField(upload_to='submissions/%Y/%m/%d/',
                           validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])],
                           blank=True, null=True)
    text_answer = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    class Meta:
        unique_together = ['assignment', 'student']
```

**File Validation** (security):
```python
import magic
def validate_file_content(file):
    if file.size > 10 * 1024 * 1024: raise ValidationError("File too large")
    mime = magic.from_buffer(file.read(1024), mime=True); file.seek(0)
    if mime not in ['application/pdf', 'application/msword']: raise ValidationError("Invalid type")
```

## 2. Deadline Management

```python
class Assignment(models.Model):
    title = models.CharField(max_length=200)
    classroom = models.ForeignKey('Classroom', on_delete=models.CASCADE)
    due_date = models.DateTimeField()
    late_submission_allowed = models.BooleanField(default=False)
    late_deadline = models.DateTimeField(null=True, blank=True)
    def is_overdue(self): return timezone.now() > self.due_date
```

**Display**: Countdown timer, color coding (green >7d, yellow 1-7d, red <24h), notifications (7d, 3d, 1d, 2h before)

## 3. Grading System

```python
class Grade(models.Model):
    submission = models.OneToOneField('Submission', on_delete=models.CASCADE)
    graded_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    feedback = models.TextField(blank=True)
    feedback_file = models.FileField(upload_to='feedback/%Y/%m/%d/', blank=True)
    is_published = models.BooleanField(default=False)
    graded_at = models.DateTimeField(auto_now_add=True)
    def percentage(self): return (self.score/self.max_score)*100 if self.max_score>0 else 0
```

**Admin Interface**: List submissions, filter by status/score, bulk publish, download ZIP, add feedback

## 4. Submission Status Tracking

```python
class SubmissionStatus(models.TextChoices):
    NOT_SUBMITTED = 'not_submitted', 'Not Submitted'
    SUBMITTED = 'submitted', 'Submitted'
    GRADED = 'graded', 'Graded'
    PUBLISHED = 'published', 'Graded (Published)'
    LATE = 'late', 'Late Submission'

def get_submission_status(assignment, student):
    try:
        sub = Submission.objects.get(assignment=assignment, student=student)
        if hasattr(sub, 'grade') and sub.grade.is_published: return SubmissionStatus.PUBLISHED
        elif hasattr(sub, 'grade'): return SubmissionStatus.GRADED
        elif sub.is_late: return SubmissionStatus.LATE
        return SubmissionStatus.SUBMITTED
    except Submission.DoesNotExist:
        return SubmissionStatus.NOT_SUBMITTED
```

## 5. Student View of Grades

```python
class StudentGradeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Grade.objects.filter(
            submission__student=self.request.user, is_published=True
        ).select_related('submission__assignment', 'graded_by')
```

**Display**: Grade history, score/percentage/feedback, statistics, email notifications

## 6. Database Schema Summary

```
assignments: id, title, description, classroom_id(FK), due_date, late_deadline, max_score
submissions: id, assignment_id(FK), student_id(FK), file, text_answer, submitted_at, is_late
            unique(assignment_id, student_id)
grades: id, submission_id(FK 1:1), graded_by_id(FK), score, max_score, feedback,
        feedback_file, is_published, graded_at
```

**Relationships**: Assignment→Submissions(1:N), Submission→Grade(1:1), Classroom→Assignments(1:N)

## 7. File Handling with Django

**Settings**:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_MAX_MEMORY_SIZE = 2621440  # 2.5 MB
```

**Permission Control**:
```python
def download_submission(request, submission_id):
    submission = get_object_or_404(Submission, id=submission_id)
    if request.user == submission.student or \
       request.user in submission.assignment.classroom.teachers.all():
        return FileResponse(submission.file, as_attachment=True)
    raise Http404("Permission denied")
```

**Storage**: Local (MEDIA_ROOT) for dev, Cloud (django-storages + S3/GCS) for production. Separate media from code.

---

## Key Implementation Notes

- **Security**: Use libmagic for content validation, not just file extensions
- **Permissions**: Check student ownership OR teacher in classroom
- **Status Flow**: Not Submitted → Submitted → Graded → Published
- **Timezone**: Store UTC in DB, display in user's timezone
- **File Size**: Default 10MB limit, configurable

## Unresolved Questions

1. Max file size? (suggest 10-50MB)
2. Rubric support with multiple criteria?
3. Peer review feature?
4. Plagiarism detection integration?
5. Resubmission before deadline? Version tracking?
6. Group assignments with shared grades?
7. Auto-grading for multiple choice?
8. Notification preferences: email/in-app/both?
