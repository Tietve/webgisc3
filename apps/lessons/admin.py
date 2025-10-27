"""
Admin configuration for lessons app.
"""
from django.contrib import admin
from .models import Lesson, LessonStep, MapAction


class LessonStepInline(admin.TabularInline):
    """Inline admin for lesson steps in lesson detail."""
    model = LessonStep
    extra = 1
    ordering = ('order',)
    raw_id_fields = ('map_action',)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin interface for Lesson model."""
    list_display = ('title', 'get_step_count', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [LessonStepInline]

    def get_step_count(self, obj):
        """Display step count in list view."""
        return obj.steps.count()
    get_step_count.short_description = 'Steps'


@admin.register(LessonStep)
class LessonStepAdmin(admin.ModelAdmin):
    """Admin interface for LessonStep model."""
    list_display = ('lesson', 'order', 'get_popup_preview', 'map_action')
    list_filter = ('lesson',)
    search_fields = ('lesson__title', 'popup_text')
    raw_id_fields = ('lesson', 'map_action')
    ordering = ('lesson', 'order')

    def get_popup_preview(self, obj):
        """Show preview of popup text."""
        return obj.popup_text[:50] + '...' if len(obj.popup_text) > 50 else obj.popup_text
    get_popup_preview.short_description = 'Popup Text Preview'


@admin.register(MapAction)
class MapActionAdmin(admin.ModelAdmin):
    """Admin interface for MapAction model."""
    list_display = ('id', 'action_type', 'get_payload_preview')
    list_filter = ('action_type',)
    search_fields = ('action_type',)

    def get_payload_preview(self, obj):
        """Show preview of payload."""
        payload_str = str(obj.payload)
        return payload_str[:50] + '...' if len(payload_str) > 50 else payload_str
    get_payload_preview.short_description = 'Payload Preview'
