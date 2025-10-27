"""
URL configuration for lessons app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet

app_name = 'lessons'

router = DefaultRouter()
router.register(r'', LessonViewSet, basename='lesson')

urlpatterns = [
    path('', include(router.urls)),
]
