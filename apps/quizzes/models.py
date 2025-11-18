"""
Models for quiz and assessment system.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.classrooms.models import Classroom


class Quiz(models.Model):
    """
    Quiz model for assessments.

    Fields:
        id: Auto-incrementing primary key
        title: Title of the quiz
        classroom: Foreign key to the classroom (optional)
        description: Optional description of the quiz
        due_date: Deadline for quiz submission
        late_submission_allowed: Whether late submissions are accepted
        late_deadline: Extended deadline for late submissions
        created_at: Timestamp of quiz creation
        updated_at: Timestamp of last update
    """
    title = models.CharField(max_length=255, help_text='Title of the quiz')
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='quizzes',
        null=True,
        blank=True,
        help_text='Classroom this quiz is assigned to'
    )
    description = models.TextField(blank=True, help_text='Description of the quiz')
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Deadline for quiz submission'
    )
    late_submission_allowed = models.BooleanField(
        default=False,
        help_text='Whether late submissions are accepted'
    )
    late_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Extended deadline for late submissions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quizzes'
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['due_date', '-created_at']

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        """Check if quiz is past due date."""
        if not self.due_date:
            return False
        return timezone.now() > self.due_date

    @property
    def deadline_status(self):
        """
        Get deadline status.
        Returns: 'upcoming', 'due_soon', 'overdue', or 'no_deadline'
        """
        if not self.due_date:
            return 'no_deadline'

        now = timezone.now()
        if now > self.due_date:
            return 'overdue'

        time_left = self.due_date - now
        if time_left.days < 1:  # Less than 24 hours
            return 'due_soon'
        elif time_left.days <= 7:  # 1-7 days
            return 'upcoming_soon'

        return 'upcoming'

    @property
    def deadline_color(self):
        """
        Get color hint for frontend.
        Returns: 'green', 'yellow', or 'red'
        """
        status = self.deadline_status
        if status == 'overdue':
            return 'red'
        elif status in ['due_soon', 'upcoming_soon']:
            return 'yellow'
        elif status == 'upcoming':
            return 'green'
        return 'gray'  # no_deadline


class QuizQuestion(models.Model):
    """
    QuizQuestion model for quiz questions.

    Fields:
        id: Auto-incrementing primary key
        quiz: Foreign key to the quiz
        question_text: Text of the question
        order: Order of the question in the quiz
    """
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        help_text='Quiz this question belongs to'
    )
    question_text = models.TextField(help_text='Text of the question')
    order = models.IntegerField(default=0, help_text='Order of the question in the quiz')

    class Meta:
        db_table = 'quiz_questions'
        verbose_name = 'Quiz Question'
        verbose_name_plural = 'Quiz Questions'
        ordering = ['quiz', 'order']

    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}: {self.question_text[:50]}"


class QuizAnswer(models.Model):
    """
    QuizAnswer model for multiple choice answers.

    Fields:
        id: Auto-incrementing primary key
        question: Foreign key to the question
        answer_text: Text of the answer
        is_correct: Whether this is the correct answer
    """
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name='answers',
        help_text='Question this answer belongs to'
    )
    answer_text = models.TextField(help_text='Text of the answer')
    is_correct = models.BooleanField(default=False, help_text='Whether this is the correct answer')

    class Meta:
        db_table = 'quiz_answers'
        verbose_name = 'Quiz Answer'
        verbose_name_plural = 'Quiz Answers'

    def __str__(self):
        return f"{self.answer_text[:50]} ({'Correct' if self.is_correct else 'Incorrect'})"


class QuizSubmission(models.Model):
    """
    QuizSubmission model for student quiz submissions.

    Fields:
        id: Auto-incrementing primary key
        quiz: Foreign key to the quiz
        student: Foreign key to the student
        score: Auto-calculated score (0-100)
        adjusted_score: Teacher-adjusted score override
        teacher_feedback: Teacher's review comments
        is_reviewed: Whether teacher has reviewed submission
        is_late: Whether submission was late
        submitted_at: Timestamp of submission
        answers: JSON field storing student answers
    """
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='submissions',
        help_text='Quiz that was submitted'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_submissions',
        limit_choices_to={'role': 'student'},
        help_text='Student who submitted the quiz'
    )
    score = models.IntegerField(help_text='Auto-calculated score (0-100)')
    adjusted_score = models.IntegerField(
        null=True,
        blank=True,
        help_text='Teacher-adjusted score override (0-100)'
    )
    teacher_feedback = models.TextField(
        blank=True,
        help_text='Teacher review comments'
    )
    is_reviewed = models.BooleanField(
        default=False,
        help_text='Whether teacher has reviewed this submission'
    )
    is_late = models.BooleanField(
        default=False,
        help_text='Whether submission was after deadline'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    # Store the student's answers as JSON
    answers = models.JSONField(
        default=dict,
        help_text='Student answers stored as {question_id: answer_id}'
    )

    class Meta:
        db_table = 'quiz_submissions'
        verbose_name = 'Quiz Submission'
        verbose_name_plural = 'Quiz Submissions'
        ordering = ['-submitted_at']
        unique_together = ('quiz', 'student')  # Each student can submit once per quiz

    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} ({self.final_score}%)"

    @property
    def final_score(self):
        """Return adjusted score if exists, else auto-calculated score."""
        return self.adjusted_score if self.adjusted_score is not None else self.score
