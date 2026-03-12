"""
Serializers for interactive lesson system.
"""
from rest_framework import serializers
from apps.gis_data.serializers import MapLayerSerializer
from .models import Lesson, LessonStep, MapAction


CURATED_MODULE_CODES = {'module-01', 'module-02', 'module-03', 'module-04', 'module-05', 'module-06'}


class MapActionSerializer(serializers.ModelSerializer):
    """
    Serializer for MapAction model.
    """
    class Meta:
        model = MapAction
        fields = ('id', 'action_type', 'payload')
        read_only_fields = ('id',)


class LessonStepSerializer(serializers.ModelSerializer):
    """
    Serializer for LessonStep model with nested MapAction.
    """
    map_action = MapActionSerializer(read_only=True)

    class Meta:
        model = LessonStep
        fields = ('id', 'order', 'popup_text', 'map_action')
        read_only_fields = ('id',)


class LessonListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing lessons (without detailed steps).
    """
    step_count = serializers.SerializerMethodField()
    layers = MapLayerSerializer(many=True, read_only=True)
    quiz_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'description', 'subject', 'grade_level', 'semester',
            'textbook_series', 'module_code', 'lesson_type', 'is_published',
            'step_count', 'quiz_id', 'layers', 'created_at'
        )
        read_only_fields = fields

    def get_step_count(self, obj):
        """Get the number of steps in the lesson."""
        return obj.steps.count()

    def get_quiz_id(self, obj):
        quiz = obj.quizzes.filter(is_published=True, module_code__in=CURATED_MODULE_CODES).order_by('id').first()
        return quiz.id if quiz else None


class LessonDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for full lesson details with all steps and map actions.

    This is used for GET /api/v1/lessons/{id}/ endpoint.
    Returns complete lesson data including nested steps and map actions.
    """
    steps = LessonStepSerializer(many=True, read_only=True)
    layers = MapLayerSerializer(many=True, read_only=True)
    quiz_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'description', 'subject', 'grade_level', 'semester',
            'textbook_series', 'module_code', 'lesson_type', 'is_published',
            'quiz_id', 'layers', 'steps', 'created_at', 'updated_at'
        )
        read_only_fields = fields

    def get_quiz_id(self, obj):
        quiz = obj.quizzes.filter(is_published=True, module_code__in=CURATED_MODULE_CODES).order_by('id').first()
        return quiz.id if quiz else None
