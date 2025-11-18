# Phase 1: Assignment & Submission Backend

---

## Context Links

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: None (foundation phase)
**Related Docs**:
- [Scout Report](./scout/scout-01-codebase-analysis.md)
- [Research: Classroom Systems](./research/researcher-01-classroom-systems.md)
- [Research: Quiz Submission](./research/researcher-02-quiz-submission.md)
- [System Architecture](/home/user/webgisc3/docs/system-architecture.md)

---

## Overview

**Date**: 2025-11-18
**Description**: Create Assignment model (separate from Announcement), Submission model with file+text support, Grade model with feedback. Establish foundation for homework submission system.
**Priority**: Critical
**Implementation Status**: 🔵 Not Started
**Review Status**: Not Reviewed
**Estimated Duration**: 8-10 hours

---

## Key Insights

**From Scout Report**:
- Announcement model exists but lacks assignment features (no due dates, no submissions)
- MEDIA_ROOT configured (`/home/user/webgisc3/media`) but unused
- Permission classes ready (IsTeacher, IsStudent, IsTeacherOrReadOnly)
- Enrollment model tracks student-classroom relationship
- JWT auth working with role-based access

**From Research**:
- Use FileField with FileExtensionValidator for security
- Implement libmagic content validation (not just extension)
- Use unique_together constraint for one submission per student per assignment
- Track submission status (not_submitted, submitted, graded, published)
- Store files in dated subdirectories (`submissions/%Y/%m/%d/`)

**Best Practices**:
- Separate Assignment (what to do) from Submission (student's work) from Grade (teacher's evaluation)
- Allow late submissions with is_late flag
- Make grade visibility controlled (is_published field)
- Support dual input: text answer + file upload (both optional, but require at least one)

---

## Requirements

### Functional Requirements

**FR1**: Teachers create assignments with title, description, due date, max score, optional file attachment
**FR2**: Students submit assignments with text answer and/or file upload (PDF, DOC, DOCX)
**FR3**: System prevents duplicate submissions (one per student per assignment)
**FR4**: System tracks late submissions automatically
**FR5**: Teachers grade submissions with score + feedback (text and optional file)
**FR6**: Students view published grades only
**FR7**: File uploads validated for type and size (max 10MB)

### Non-Functional Requirements

**NFR1**: File uploads must be secure (content validation, not just extension)
**NFR2**: API responses must include submission status for students
**NFR3**: Database queries must be optimized with select_related/prefetch_related
**NFR4**: Permissions must enforce teacher-only grading, student-only submission

---

## Architecture

### Database Schema

**New Models**:

```python
# apps/classrooms/models.py

class Assignment(models.Model):
    """Homework assignment created by teacher"""
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    attachment = models.FileField(upload_to='assignments/%Y/%m/%d/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-due_date']
        indexes = [models.Index(fields=['classroom', 'due_date'])]

class Submission(models.Model):
    """Student submission for assignment"""
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    text_answer = models.TextField(blank=True)
    file = models.FileField(
        upload_to='submissions/%Y/%m/%d/',
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])],
        blank=True,
        null=True
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        unique_together = [['assignment', 'student']]
        indexes = [models.Index(fields=['assignment', 'student'])]

class Grade(models.Model):
    """Teacher grade and feedback for submission"""
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='grade')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    feedback = models.TextField(blank=True)
    feedback_file = models.FileField(upload_to='feedback/%Y/%m/%d/', blank=True, null=True)
    is_published = models.BooleanField(default=False)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    graded_at = models.DateTimeField(auto_now_add=True)

    @property
    def percentage(self):
        max_score = self.submission.assignment.max_score
        return (self.score / max_score * 100) if max_score > 0 else 0
```

### API Endpoints

```
POST   /api/v1/classrooms/{id}/assignments/           - Create assignment (teacher)
GET    /api/v1/classrooms/{id}/assignments/           - List assignments
GET    /api/v1/classrooms/{id}/assignments/{aid}/     - Get assignment detail
PUT    /api/v1/classrooms/{id}/assignments/{aid}/     - Update assignment (teacher)
DELETE /api/v1/classrooms/{id}/assignments/{aid}/     - Delete assignment (teacher)

POST   /api/v1/assignments/{id}/submit/               - Submit assignment (student)
GET    /api/v1/assignments/{id}/submissions/          - List submissions (teacher: all, student: own)
GET    /api/v1/submissions/{id}/                      - Get submission detail

POST   /api/v1/submissions/{id}/grade/                - Grade submission (teacher)
PUT    /api/v1/submissions/{id}/grade/                - Update grade (teacher)
GET    /api/v1/submissions/{id}/grade/                - Get grade (owner + teacher)
```

### Permission Matrix

| Endpoint | Teacher | Student | Logic |
|----------|---------|---------|-------|
| Create assignment | ✅ | ❌ | IsTeacher + owns classroom |
| View assignment | ✅ | ✅ | Enrolled in classroom |
| Submit assignment | ❌ | ✅ | IsStudent + enrolled + not duplicate |
| View all submissions | ✅ | ❌ | IsTeacher + owns classroom |
| View own submission | ✅ | ✅ | IsOwner or IsTeacher |
| Grade submission | ✅ | ❌ | IsTeacher + owns classroom |
| View grade | ✅ | ✅ | IsOwner (if published) or IsTeacher |

---

## Related Code Files

**Models**:
- `/home/user/webgisc3/apps/classrooms/models.py` (add Assignment, Submission, Grade)

**Serializers**:
- `/home/user/webgisc3/apps/classrooms/serializers.py` (create 7 new serializers)

**Views**:
- `/home/user/webgisc3/apps/classrooms/views.py` (add 3 viewsets)

**URLs**:
- `/home/user/webgisc3/apps/classrooms/urls.py` (add nested routes)

**Permissions**:
- `/home/user/webgisc3/apps/core/permissions.py` (reuse existing)

**Validators** (new file):
- `/home/user/webgisc3/apps/core/validators.py` (create for file validation)

**Settings**:
- `/home/user/webgisc3/config/settings/base.py` (verify MEDIA_ROOT, add FILE_UPLOAD_MAX_MEMORY_SIZE)

**Migrations**:
- `/home/user/webgisc3/apps/classrooms/migrations/000X_add_assignment_models.py` (auto-generated)

---

## Implementation Steps

### Step 1: Create Models (1-2 hours)

1. Add Assignment, Submission, Grade models to `apps/classrooms/models.py`
2. Add __str__ methods for admin readability
3. Add @property methods (is_overdue for Assignment, percentage for Grade)
4. Create migration: `python manage.py makemigrations classrooms`
5. Review migration file for correctness
6. Apply migration: `python manage.py migrate`
7. Test in Django shell: create assignment, submission, grade

### Step 2: Create File Validators (30 min)

1. Create `apps/core/validators.py`
2. Install python-magic: `pip install python-magic`
3. Implement validate_file_content() using libmagic
4. Add to Assignment.attachment and Submission.file validators
5. Update requirements.txt

### Step 3: Create Serializers (2-3 hours)

1. **AssignmentSerializer** - full assignment with teacher info, attachment URL
2. **AssignmentCreateSerializer** - create with auto-set created_by from request.user
3. **AssignmentListSerializer** - lightweight for list view, include submission_count
4. **SubmissionSerializer** - full submission with file URL, grade (if published)
5. **SubmissionCreateSerializer** - validate at least one of text_answer or file, check enrollment, set is_late
6. **GradeSerializer** - full grade with feedback, percentage property
7. **GradeCreateUpdateSerializer** - validate score <= max_score, set graded_by

### Step 4: Create Views (2-3 hours)

1. **AssignmentViewSet** - nested under classrooms, teacher can CRUD, students read-only
   - Override get_queryset: filter by classroom and enrollment
   - Override perform_create: set created_by from request.user
   - Add custom action: @action(detail=True, methods=['get']) submission_status
2. **SubmissionViewSet** - custom actions for submit, list, retrieve
   - @action(detail=True, methods=['post']) submit (students only)
   - Override get_queryset: teachers see all, students see own
3. **GradeViewSet** - create/update grade, retrieve grade
   - Permission: IsTeacher for create/update
   - Permission: IsOwnerOrTeacher for retrieve (students only if is_published=True)

### Step 5: Configure URLs (30 min)

1. Add nested routes in `apps/classrooms/urls.py`:
   ```python
   classroom_router.register(r'assignments', AssignmentViewSet, basename='classroom-assignments')
   ```
2. Add standalone routes:
   ```python
   router.register(r'assignments', AssignmentViewSet, basename='assignments')
   router.register(r'submissions', SubmissionViewSet, basename='submissions')
   ```
3. Test URL patterns: `python manage.py show_urls | grep assignment`

### Step 6: Update Settings (15 min)

1. Verify MEDIA_ROOT and MEDIA_URL in `config/settings/base.py`
2. Add FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760 (10MB)
3. Add FILE_UPLOAD_PERMISSIONS = 0o644
4. Ensure MEDIA_URL served in development (urls.py)

### Step 7: Test API Endpoints (2 hours)

1. Create teacher and student users in Django admin
2. Create classroom and enroll student
3. Test assignment creation (teacher):
   - POST to `/api/v1/classrooms/{id}/assignments/`
   - Verify file upload works
4. Test assignment submission (student):
   - POST to `/api/v1/assignments/{aid}/submit/`
   - Test text-only, file-only, both, neither (should fail)
   - Test duplicate submission (should fail)
   - Test late submission (is_late=True)
5. Test grading (teacher):
   - POST to `/api/v1/submissions/{id}/grade/`
   - Verify score validation (not > max_score)
6. Test grade visibility (student):
   - Verify unpublished grades hidden
   - Verify published grades visible

### Step 8: Add Admin Interface (30 min)

1. Register Assignment, Submission, Grade in `apps/classrooms/admin.py`
2. Add list_display, list_filter, search_fields
3. Add inline for Submission in Assignment admin
4. Test in Django admin

---

## Todo List

- [ ] Create Assignment model with fields and validators
- [ ] Create Submission model with unique_together constraint
- [ ] Create Grade model with OneToOne relationship
- [ ] Generate and apply database migration
- [ ] Create file validation utility with libmagic
- [ ] Install python-magic and update requirements.txt
- [ ] Implement 7 serializers (Assignment, Submission, Grade variants)
- [ ] Create AssignmentViewSet with nested routing
- [ ] Create SubmissionViewSet with submit action
- [ ] Create GradeViewSet with permission checks
- [ ] Configure nested URLs in classrooms app
- [ ] Update MEDIA settings in base.py
- [ ] Register models in admin interface
- [ ] Test assignment CRUD via API (Postman/curl)
- [ ] Test submission workflow (text + file)
- [ ] Test duplicate submission prevention
- [ ] Test late submission detection
- [ ] Test grading workflow and visibility
- [ ] Test permission enforcement (teacher vs student)
- [ ] Document API endpoints in Swagger

---

## Success Criteria

- [ ] Teacher creates assignment with file attachment via API
- [ ] Student submits text answer via API (no file)
- [ ] Student submits file (PDF) via API (no text)
- [ ] Student submits both text + file via API
- [ ] System rejects duplicate submission (HTTP 400)
- [ ] System correctly flags late submission (is_late=True)
- [ ] Teacher grades submission with feedback
- [ ] Student cannot see unpublished grade
- [ ] Student sees published grade with percentage
- [ ] File uploads validate content type with libmagic
- [ ] File size limit enforced (10MB max)
- [ ] All API endpoints documented in Swagger
- [ ] Database queries optimized (no N+1 problems)

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| File upload vulnerabilities (malicious files) | High | Medium | Use libmagic validation, sanitize filenames, serve with X-Content-Type-Options |
| Race condition in duplicate submission check | Medium | Low | Use unique_together constraint + atomic transaction |
| Large file uploads blocking server | Medium | Medium | Set FILE_UPLOAD_MAX_MEMORY_SIZE, use streaming for large files |
| Migration conflicts with existing data | Low | Low | Test on dev DB first, backup production before migration |
| Permission bypass in nested routes | Medium | Low | Test all permission combinations, use DRF permission classes |

---

## Security Considerations

1. **File Upload Security**:
   - Validate file content with libmagic (not just extension)
   - Sanitize filenames before storage
   - Store uploads outside STATIC_ROOT
   - Serve files with proper Content-Type headers
   - Add X-Content-Type-Options: nosniff header

2. **Access Control**:
   - Verify enrollment before allowing submission
   - Check classroom ownership before allowing grading
   - Hide unpublished grades from students
   - Use object-level permissions (IsOwnerOrTeacher)

3. **Data Validation**:
   - Validate score <= max_score
   - Require at least one of text_answer or file
   - Validate due_date is future date
   - Check file size and type

4. **SQL Injection Prevention**:
   - Use Django ORM (not raw SQL)
   - Use parameterized queries if raw SQL needed
   - Validate all user inputs

---

## Next Steps

After Phase 1 completion:
1. Proceed to **Phase 2** (Quiz Deadline & Grading) to add quiz enhancement features
2. Alternatively start **Phase 3** (Frontend Integration) to connect assignment UI
3. Test integration between assignment submission and classroom detail page

**Handoff to Next Phase**: Provide API endpoint documentation, example requests/responses, and database schema diagram.

---

## Unresolved Questions

1. **Resubmission Policy**: Should students be allowed to resubmit before deadline? If yes, keep all versions or only latest?
   - Recommendation: Allow resubmission, keep only latest (update existing Submission)

2. **Grade History**: Should grade changes be tracked (audit trail)? Create GradeHistory model?
   - Recommendation: Phase 2 enhancement, not required for MVP

3. **Bulk Grading**: Should teachers be able to grade multiple submissions at once (CSV upload)?
   - Recommendation: Phase 4 enhancement, not required for MVP

4. **Rubric Support**: Should assignments support grading rubrics with multiple criteria?
   - Recommendation: Future enhancement, out of scope for this phase

5. **Cloud Storage**: Use local MEDIA_ROOT or cloud storage (S3, Cloudflare R2)?
   - Recommendation: Start with local, add cloud storage in production deployment phase
