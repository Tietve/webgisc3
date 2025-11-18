# Critical Fixes Required - Phase 1-4

**URGENT:** These 4 issues will cause runtime failures. Fix before deployment.

---

## Fix #1: Remove Invalid Enrollment Status Filter

**File:** `apps/quizzes/views.py`
**Line:** 263
**Current (BROKEN):**
```python
enrolled_classrooms = Classroom.objects.filter(
    enrollments__student=user,
    enrollments__status='active'  # ❌ Field doesn't exist
)
```

**Fixed:**
```python
enrolled_classrooms = Classroom.objects.filter(
    enrollments__student=user
)
```

---

## Fix #2: File Field Name Mismatch

**File:** `frontend/src/components/classroom/SubmissionForm.jsx`
**Line:** 48
**Current (BROKEN):**
```javascript
formData.append('file_submission', selectedFile)
```

**Fixed:**
```javascript
formData.append('file', selectedFile)
```

**Also fix in GradingInterface.jsx:**
**Lines:** 270, 276
```javascript
// BEFORE:
{selectedSubmission.file_submission && (
    <a href={selectedSubmission.file_submission}>

// AFTER:
{selectedSubmission.file_url && (
    <a href={selectedSubmission.file_url}>
```

---

## Fix #3: User.get_full_name() Missing

**File:** `apps/quizzes/serializers.py`
**Line:** 281
**Current (BROKEN):**
```python
student_name = serializers.CharField(source='student.get_full_name', read_only=True)
```

**Fixed (Option 1 - Quick):**
```python
student_name = serializers.EmailField(source='student.email', read_only=True)
```

**Fixed (Option 2 - Better):**
Add to `apps/users/models.py`:
```python
class User(AbstractBaseUser, PermissionsMixin):
    # ... existing fields ...

    def get_full_name(self):
        """Return email as full name for now."""
        return self.email
```

---

## Fix #4: Deadlines Endpoint Path

**File:** `frontend/src/constants/api.constants.js`
**Lines:** 55-57
**Current (BROKEN):**
```javascript
DEADLINES: {
    LIST: '/deadlines/',  // ❌ Endpoint doesn't exist
},
```

**Fixed:**
```javascript
DEADLINES: {
    LIST: '/quizzes/deadlines/',  // ✓ Matches backend
},
```

---

## Verification Checklist

After applying fixes:

- [ ] Fix #1: Test quiz deadlines view for students
- [ ] Fix #2: Test file upload in assignment submission
- [ ] Fix #3: Test teacher quiz results view
- [ ] Fix #4: Test deadline widget loading

---

**Estimated fix time:** 15 minutes
**Risk if not fixed:** Application crashes, 404 errors, failed submissions
