"""
Serializers for quiz and assessment system.
"""
from rest_framework import serializers
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

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'classroom', 'question_count', 'created_at')
        read_only_fields = fields

    def get_question_count(self, obj):
        """Get the number of questions in the quiz."""
        return obj.questions.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz details with questions and answers.
    """
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'questions', 'created_at')
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

        # Create or update submission
        submission, created = QuizSubmission.objects.update_or_create(
            quiz=quiz,
            student=student,
            defaults={
                'score': score,
                'answers': answers
            }
        )

        return submission


class QuizSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz submission results.
    """
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)

    class Meta:
        model = QuizSubmission
        fields = ('id', 'quiz_title', 'student_email', 'score', 'submitted_at')
        read_only_fields = fields
