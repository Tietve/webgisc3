"""
URL configuration for gis_data app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .simple_views import SimpleLayerViewSet

app_name = 'gis_data'

router = DefaultRouter()
router.register(r'', SimpleLayerViewSet, basename='layer')

urlpatterns = [
    path('', include(router.urls)),
]
