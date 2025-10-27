"""
URL configuration for tools app.
"""
from django.urls import path
from .views import ToolExecuteView

app_name = 'tools'

urlpatterns = [
    # Dynamic tool executor
    path('<str:tool_name>/execute/', ToolExecuteView.as_view(), name='tool-execute'),
]
