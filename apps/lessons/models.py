"""
Models for interactive lesson system.
"""
from django.db import models


class Lesson(models.Model):
    """
    Lesson model for interactive educational content.

    Fields:
        id: Auto-incrementing primary key
        title: Title of the lesson
        description: Detailed description of the lesson
        created_at: Timestamp of lesson creation
        updated_at: Timestamp of last update
    """
    title = models.CharField(max_length=255, help_text='Title of the lesson')
    description = models.TextField(help_text='Detailed description of the lesson')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lessons'
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class MapAction(models.Model):
    """
    MapAction model for defining map interactions in lessons.

    Fields:
        id: Auto-incrementing primary key
        action_type: Type of map action (e.g., 'TOGGLE_LAYER', 'ZOOM_TO', 'HIGHLIGHT')
        payload: JSON data for the action parameters
    """
    ACTION_TYPE_CHOICES = [
        ('TOGGLE_LAYER', 'Toggle Layer'),
        ('ZOOM_TO', 'Zoom To Location'),
        ('HIGHLIGHT', 'Highlight Feature'),
        ('PAN_TO', 'Pan To Location'),
        ('SET_BASEMAP', 'Set Basemap'),
        ('SHOW_POPUP', 'Show Popup'),
    ]

    action_type = models.CharField(
        max_length=50,
        choices=ACTION_TYPE_CHOICES,
        help_text='Type of map action to perform'
    )
    payload = models.JSONField(
        default=dict,
        help_text='JSON data containing action parameters (e.g., layer_id, coordinates)'
    )

    class Meta:
        db_table = 'map_actions'
        verbose_name = 'Map Action'
        verbose_name_plural = 'Map Actions'

    def __str__(self):
        return f"{self.action_type} - {self.payload}"


class LessonStep(models.Model):
    """
    LessonStep model for individual steps in a lesson.

    Fields:
        id: Auto-incrementing primary key
        lesson: Foreign key to the parent lesson
        order: Order of the step in the lesson sequence
        popup_text: Text to display to the student
        map_action: Optional map action to trigger with this step
    """
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='steps',
        help_text='Lesson this step belongs to'
    )
    order = models.IntegerField(help_text='Order of the step in the lesson')
    popup_text = models.TextField(help_text='Text to display to the student')
    map_action = models.ForeignKey(
        MapAction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lesson_steps',
        help_text='Map action to trigger with this step'
    )

    class Meta:
        db_table = 'lesson_steps'
        verbose_name = 'Lesson Step'
        verbose_name_plural = 'Lesson Steps'
        ordering = ['lesson', 'order']
        unique_together = ('lesson', 'order')

    def __str__(self):
        return f"{self.lesson.title} - Step {self.order}"
