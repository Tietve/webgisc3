# Research Report: Educational Classroom Management Systems with Role-Based Permissions

**Research Date**: 2025-11-18
**Focus**: Django-based classroom systems, RBAC, database schema, REST API patterns
**Sources Consulted**: 25+ technical articles, GitHub projects, official documentation

## Executive Summary

Django-based classroom management systems leverage built-in authentication with Groups/Permissions for model-level RBAC and django-guardian for object-level permissions. Key architecture: Users → Roles (Groups) → Permissions → Resources (Courses/Assignments). Database design follows normalized schema with junction tables for many-to-many relationships (enrollments, submissions). REST API uses DRF viewsets with custom permission classes combining IsTeacher/IsStudent with object ownership checks.

**Recommended Stack**: Django 4.2+ + DRF + django-guardian + PostgreSQL
**Key Pattern**: Hybrid permissions (model-level + object-level) for granular access control

## 1. Django-Based LMS Systems Analysis

### Production Systems

**Open edX** (edx-platform)
- Architecture: Django monolith with LMS + Studio (course authoring)
- Database: MySQL (user data) + MongoDB (course content) + YouTube/S3 (videos)
- Scale: Massive open online courses (MOOCs)
- Use case: Universities, enterprise training

**Moodle Alternative: Django-based Projects**
- **django-sis** (School Information System): Tracks students, parents, cohorts, enrollments, grades
- **Django School Management**: Payment integration, e-admissions, results tracking
- **teach-me-django**: Teachers create quizzes, students answer & view results
- **coursemaster**: Course CRUD, enrollment management, session scheduling, progress tracking

### Common Features Across Systems
- Multi-role support: Admin, Teacher, Student (sometimes Parent)
- Enrollment workflows with admin approval
- Assignment creation, submission, grading pipeline
- Attendance tracking, progress monitoring
- Notification systems (email, in-app)

## 2. Permission Systems: RBAC Implementation

### Django Built-in Approach

**Model-Level Permissions**
```python
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

# Create groups
teacher_group = Group.objects.create(name='Teacher')
student_group = Group.objects.create(name='Student')

# Assign permissions
content_type = ContentType.objects.get_for_model(Assignment)
create_perm = Permission.objects.get(content_type=content_type, codename='add_assignment')
teacher_group.permissions.add(create_perm)

# Assign user to group
user.groups.add(teacher_group)
```

**Custom User Model with Roles**
```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    @property
    def is_teacher(self):
        return self.role == 'teacher'

    @property
    def is_student(self):
        return self.role == 'student'
```

### Object-Level Permissions with django-guardian

**Installation & Setup**
```python
# settings.py
INSTALLED_APPS = ['guardian', ...]
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
]
```

**Classroom Permission Example**
```python
from guardian.shortcuts import assign_perm, remove_perm, get_objects_for_user

# Assign student to classroom
classroom = Classroom.objects.get(id=1)
student = User.objects.get(id=2)
assign_perm('view_classroom', student, classroom)
assign_perm('submit_assignment', student, classroom)

# Check permissions
if student.has_perm('submit_assignment', classroom):
    # Allow submission
    pass

# Get all classrooms student can access
accessible_classrooms = get_objects_for_user(student, 'view_classroom', Classroom)
```

**Teacher/Student Workflow**
```python
# When student enrolls in course
def enroll_student(course, student):
    enrollment = Enrollment.objects.create(course=course, student=student)
    assign_perm('view_course', student, course)
    assign_perm('submit_assignment', student, course)

# When teacher creates assignment
def create_assignment(course, teacher, title):
    if teacher.has_perm('manage_course', course):
        assignment = Assignment.objects.create(course=course, title=title, created_by=teacher)
        assign_perm('grade_assignment', teacher, assignment)
```

### Best Practices (2024)

1. **Hybrid Approach**: Model-level for broad actions (create course) + object-level for specific resources (grade this assignment)
2. **Role-Based Groups**: Use Groups for role management, not hardcoded role fields
3. **Permission Decorators**: Protect views with custom decorators
4. **Middleware Checks**: Validate permissions before view execution
5. **Security-First**: Always verify both authentication AND authorization

## 3. Database Schema Design

### Core Tables Structure

```python
# User Management
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True)

# Academic Structure
class AcademicCycle(models.Model):
    """Represents academic year/term"""
    name = models.CharField(max_length=100)  # "Fall 2024"
    start_date = models.DateField()
    end_date = models.DateField()

class Course(models.Model):
    """Course template (doesn't change year to year)"""
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    credits = models.IntegerField()
    category = models.CharField(max_length=50)

class CourseOffering(models.Model):
    """Specific instance of course in academic cycle"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    cycle = models.ForeignKey(AcademicCycle, on_delete=models.CASCADE)
    max_students = models.IntegerField()

    class Meta:
        unique_together = [['course', 'cycle']]

# Classroom/Class Section
class Classroom(models.Model):
    """Physical or virtual classroom"""
    course_offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # "Section A"
    teacher = models.ForeignKey(User, on_delete=models.PROTECT, limit_choices_to={'role': 'teacher'})
    schedule = models.TextField()  # "Mon/Wed 10-11:30"

# Enrollment (Many-to-Many)
class Enrollment(models.Model):
    """Student enrollment in classroom"""
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('dropped', 'Dropped')])

    class Meta:
        unique_together = [['classroom', 'student']]
        indexes = [
            models.Index(fields=['classroom', 'status']),
            models.Index(fields=['student']),
        ]

# Assignments & Submissions
class Assignment(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    max_score = models.IntegerField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    file = models.FileField(upload_to='submissions/', blank=True)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='graded_submissions')

    class Meta:
        unique_together = [['assignment', 'student']]
```

### Normalization Best Practices

- **3NF Compliance**: Separate Course (template) from CourseOffering (instance) to avoid data duplication
- **Junction Tables**: Use Enrollment for student-classroom M2M relationship
- **Indexes**: Add on frequently queried fields (classroom + status, student)
- **Constraints**: unique_together prevents duplicate enrollments
- **on_delete**: Use PROTECT for teachers (prevent deletion), CASCADE for dependent records

## 4. REST API Design Patterns

### ViewSets with Custom Permissions

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsTeacher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Classroom.objects.filter(teacher=user)
        elif user.role == 'student':
            return Classroom.objects.filter(enrollments__student=user, enrollments__status='active')
        return Classroom.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def enroll(self, request, pk=None):
        classroom = self.get_object()
        if Enrollment.objects.filter(classroom=classroom, student=request.user).exists():
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)

        Enrollment.objects.create(classroom=classroom, student=request.user)
        assign_perm('view_classroom', request.user, classroom)
        return Response({'status': 'enrolled'})

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsTeacher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        classroom_id = self.request.query_params.get('classroom')

        if user.role == 'teacher':
            return Assignment.objects.filter(classroom__teacher=user)
        elif user.role == 'student':
            return Assignment.objects.filter(
                classroom__enrollments__student=user,
                classroom__enrollments__status='active'
            )
        return Assignment.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        # Check if student is enrolled
        if not Enrollment.objects.filter(
            classroom=assignment.classroom,
            student=request.user,
            status='active'
        ).exists():
            return Response({'error': 'Not enrolled'}, status=status.HTTP_403_FORBIDDEN)

        submission, created = Submission.objects.update_or_create(
            assignment=assignment,
            student=request.user,
            defaults={'content': request.data.get('content')}
        )
        return Response(SubmissionSerializer(submission).data)
```

### API Endpoint Structure

```
/api/v1/classrooms/
  GET     - List classrooms (filtered by role)
  POST    - Create classroom (teachers only)

/api/v1/classrooms/{id}/
  GET     - Retrieve classroom details
  PUT     - Update classroom (teacher only)
  DELETE  - Delete classroom (teacher only)

/api/v1/classrooms/{id}/enroll/
  POST    - Enroll student (students only)

/api/v1/classrooms/{id}/students/
  GET     - List enrolled students

/api/v1/assignments/
  GET     - List assignments (filtered by classroom/role)
  POST    - Create assignment (teachers only)

/api/v1/assignments/{id}/submit/
  POST    - Submit assignment (students only)

/api/v1/assignments/{id}/submissions/
  GET     - List submissions (teachers: all, students: own)

/api/v1/assignments/{id}/submissions/{student_id}/grade/
  POST    - Grade submission (teachers only)
```

## 5. Enrollment & Membership Best Practices

### Enrollment Workflow

1. **Prerequisites Check**: Verify student hasn't already enrolled, classroom has available seats
2. **Transaction Safety**: Use database transactions for enrollment + permission assignment
3. **Status Management**: Track enrollment status (pending, active, dropped, completed)
4. **Audit Trail**: Log enrollment changes with timestamps and actors
5. **Cascade Handling**: When student drops course, revoke object permissions

### Code Example

```python
from django.db import transaction
from guardian.shortcuts import assign_perm, remove_perm

@transaction.atomic
def process_enrollment(classroom_id, student_id):
    classroom = Classroom.objects.select_for_update().get(id=classroom_id)
    student = User.objects.get(id=student_id)

    # Validate prerequisites
    if Enrollment.objects.filter(classroom=classroom, student=student).exists():
        raise ValidationError("Already enrolled")

    if classroom.enrollments.filter(status='active').count() >= classroom.max_students:
        raise ValidationError("Classroom full")

    # Create enrollment
    enrollment = Enrollment.objects.create(
        classroom=classroom,
        student=student,
        status='active'
    )

    # Assign permissions
    assign_perm('view_classroom', student, classroom)
    assign_perm('submit_assignment', student, classroom)

    # Assign permissions to all existing assignments
    for assignment in classroom.assignments.all():
        assign_perm('view_assignment', student, assignment)

    return enrollment

def drop_course(enrollment_id):
    enrollment = Enrollment.objects.get(id=enrollment_id)
    classroom = enrollment.classroom
    student = enrollment.student

    with transaction.atomic():
        enrollment.status = 'dropped'
        enrollment.save()

        # Revoke permissions
        remove_perm('view_classroom', student, classroom)
        remove_perm('submit_assignment', student, classroom)
```

## Key References

**Official Documentation:**
- Django Permissions: https://docs.djangoproject.com/en/4.2/topics/auth/default/
- Django REST Framework: https://www.django-rest-framework.org/api-guide/permissions/
- django-guardian: https://django-guardian.readthedocs.io/

**GitHub Projects:**
- Open edX Platform: https://github.com/openedx/edx-platform
- teach-me-django: https://github.com/justdjango/teach-me-django
- Django School Management: https://github.com/TareqMonwer/Django-School-Management
- coursemaster: https://github.com/fatemehSalarzaei/coursemaster

**Tutorials:**
- "How to Implement Multiple User Types": https://simpleisbetterthancomplex.com/tutorial/2018/01/18/how-to-implement-multiple-user-types-with-django.html
- LMS Database Design: https://vertabelo.com/blog/database-design-management-system/

## Unresolved Questions

1. **Concurrent Enrollment**: How to handle race conditions when multiple students enroll simultaneously in last available seat? (Solution: Use select_for_update() with transactions)
2. **Permission Caching**: Does django-guardian cache object permissions? Performance implications for large classrooms? (Yes, uses querysets - needs monitoring)
3. **Grade Modification Audit**: Should grade changes be versioned? Immutable history vs. editable records? (Recommend separate GradeHistory table)
4. **Multi-Teacher Courses**: How to handle team-teaching scenarios with multiple instructors? (Use M2M relationship + primary teacher designation)
5. **Cross-Course Prerequisites**: Enforcing prerequisites across different courses/terms? (Requires CoursePrerequisite model + validation layer)
