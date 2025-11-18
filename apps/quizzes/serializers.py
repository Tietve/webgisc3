"""
Serializers for quiz and assessment system.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Quiz, QuizQuestion, QuizAnswer, QuizSubmission


class QuizAnswerSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz answers.
    """
    class Meta:
        model = QuizAnswer
        fields = ('id', 'answer_text', 'is_correct')
        read_only_fields = ('id',)


class QuizQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz questions with answers.
    """
    answers = QuizAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ('id', 'question_text', 'order', 'answers')
        read_only_fields = ('id',)


class QuizListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing quizzes.
    """
    question_count = serializers.SerializerMethodField()
    deadline_status = serializers.CharField(read_only=True)
    deadline_color = serializers.CharField(read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'classroom', 'question_count',
                  'due_date', 'deadline_status', 'deadline_color', 'created_at')
        read_only_fields = fields

    def get_question_count(self, obj):
        """Get the number of questions in the quiz."""
        return obj.questions.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz details with questions and answers.
    """
    questions = QuizQuestionSerializer(many=True, read_only=True)
    deadline_status = serializers.CharField(read_only=True)
    deadline_color = serializers.CharField(read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'questions', 'due_date',
                  'late_submission_allowed', 'late_deadline', 'deadline_status',
                  'deadline_color', 'created_at')
        read_only_fields = fields


class QuizSessionSerializer(serializers.Serializer):
    """
    Serializer for quiz session data.

    This combines quiz data with optional map configuration.
    """
    quiz_title = serializers.CharField()
    quiz_id = serializers.IntegerField()
    questions = QuizQuestionSerializer(many=True)
    map_config = serializers.JSONField(required=False)


class QuizSubmissionCreateSerializer(serializers.Serializer):
    """
    Serializer for submitting quiz answers.

    Expected input:
    {
        "quiz_id": 1,
        "answers": {
            "1": "5",  // question_id: answer_id
            "2": "8",
            ...
        }
    }
    """
    quiz_id = serializers.IntegerField()
    answers = serializers.DictField(
        child=serializers.CharField(),
        help_text='Dictionary of question_id: answer_id'
    )

    def validate_quiz_id(self, value):
        """Validate that the quiz exists."""
        try:
            Quiz.objects.get(id=value)
        except Quiz.DoesNotExist:
            raise serializers.ValidationError("Quiz not found.")
        return value

    def validate(self, attrs):
        """Validate the answers."""
        quiz_id = attrs['quiz_id']
        answers = attrs['answers']

        # Get all questions for this quiz
        quiz = Quiz.objects.get(id=quiz_id)
        questions = quiz.questions.all()

        # Check that all questions are answered
        question_ids = set(str(q.id) for q in questions)
        answer_question_ids = set(answers.keys())

        if question_ids != answer_question_ids:
            raise serializers.ValidationError(
                "All questions must be answered."
            )

        # Validate that all answer IDs are valid
        for question_id, answer_id in answers.items():
            try:
                question = QuizQuestion.objects.get(id=question_id)
                QuizAnswer.objects.get(id=answer_id, question=question)
            except (QuizQuestion.DoesNotExist, QuizAnswer.DoesNotExist):
                raise serializers.ValidationError(
                    f"Invalid answer ID {answer_id} for question {question_id}."
                )

        return attrs

    def create(self, validated_data):
        """
        Create a quiz submission and calculate the score.
        Auto-detects late submissions based on quiz deadline.
        """
        quiz_id = validated_data['quiz_id']
        answers = validated_data['answers']
        student = self.context['request'].user

        quiz = Quiz.objects.get(id=quiz_id)

        # Calculate score
        total_questions = quiz.questions.count()
        correct_answers = 0

        for question_id, answer_id in answers.items():
            answer = QuizAnswer.objects.get(id=answer_id)
            if answer.is_correct:
                correct_answers += 1

        score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0

        # Check if submission is late
        is_late = False
        if quiz.due_date:
            now = timezone.now()
            is_late = now > quiz.due_date

        # Create or update submission
        submission, created = QuizSubmission.objects.update_or_create(
            quiz=quiz,
            student=student,
            defaults={
                'score': score,
                'answers': answers,
                'is_late': is_late
            }
        )

        return submission


class QuizSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz submission results.
    """
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    final_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizSubmission
        fields = ('id', 'quiz_title', 'student_email', 'score', 'adjusted_score',
                  'final_score', 'teacher_feedback', 'is_reviewed', 'is_late', 'submitted_at')
        read_only_fields = fields


class QuizDeadlineSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for quiz deadline aggregation.
    Shows quiz deadlines with color coding and submission status.
    """
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    classroom_id = serializers.IntegerField(source='classroom.id', read_only=True)
    deadline_status = serializers.CharField(read_only=True)
    deadline_color = serializers.CharField(read_only=True)
    user_submission_status = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'classroom_id', 'classroom_name', 'due_date',
                  'deadline_status', 'deadline_color', 'user_submission_status', 'time_remaining')
        read_only_fields = fields

    def get_user_submission_status(self, obj):
        """Get user's submission status for this quiz."""
        request = self.context.get('request')
        if not request or not request.user:
            return 'not_submitted'

        submission = obj.submissions.filter(student=request.user).first()
        if not submission:
            return 'not_submitted'
        elif submission.is_reviewed:
            return 'graded'
        else:
            return 'submitted'

    def get_time_remaining(self, obj):
        """Get human-readable time remaining until deadline."""
        if not obj.due_date:
            return None

        now = timezone.now()
        if now > obj.due_date:
            return 'Overdue'

        time_left = obj.due_date - now
        days = time_left.days
        hours = time_left.seconds // 3600

        if days > 0:
            return f"{days} day{'s' if days != 1 else ''}"
        elif hours > 0:
            return f"{hours} hour{'s' if hours != 1 else ''}"
        else:
            return "Less than 1 hour"


class QuizSubmissionReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for teacher to review and grade quiz submissions.
    Allows adjusting score and adding feedback.
    """
    class Meta:
        model = QuizSubmission
        fields = ('id', 'adjusted_score', 'teacher_feedback', 'is_reviewed')

    def validate_adjusted_score(self, value):
        """Validate adjusted score is between 0 and 100."""
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Adjusted score must be between 0 and 100.")
        return value

    def update(self, instance, validated_data):
        """Update submission and mark as reviewed if score or feedback provided."""
        instance.adjusted_score = validated_data.get('adjusted_score', instance.adjusted_score)
        instance.teacher_feedback = validated_data.get('teacher_feedback', instance.teacher_feedback)

        # Mark as reviewed if teacher provided score or feedback
        if instance.adjusted_score is not None or instance.teacher_feedback:
            instance.is_reviewed = True
        else:
            instance.is_reviewed = validated_data.get('is_reviewed', instance.is_reviewed)

        instance.save()
        return instance


class QuizResultsSerializer(serializers.ModelSerializer):
    """
    Serializer for teachers to view all quiz submissions.
    Shows student info, scores, and review status.
    """
    student_name = serializers.CharField(source='student.email', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    final_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizSubmission
        fields = ('id', 'student_name', 'student_email', 'score', 'adjusted_score',
                  'final_score', 'teacher_feedback', 'is_reviewed', 'is_late', 'submitted_at')
        read_only_fields = fields
