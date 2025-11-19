"""
Serializers for interactive lesson system.
"""
from rest_framework import serializers
from .models import Lesson, LessonStep, MapAction


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
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'grade', 'difficulty', 'duration', 'icon', 'step_count', 'completed', 'created_at')
        read_only_fields = fields

    def get_step_count(self, obj):
        """Get the number of steps in the lesson."""
        return obj.steps.count()

    def get_completed(self, obj):
        """Check if the lesson is completed (placeholder - implement with user progress tracking)."""
        # TODO: Implement user progress tracking
        return False


class LessonDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for full lesson details with all steps and map actions.

    This is used for GET /api/v1/lessons/{id}/ endpoint.
    Returns complete lesson data including nested steps and map actions.
    """
    steps = LessonStepSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'grade', 'difficulty', 'duration', 'icon', 'steps', 'created_at', 'updated_at')
        read_only_fields = fields
