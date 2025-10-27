"""
URL configuration for webgis_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/', include([
        # Authentication
        path('auth/', include('apps.users.urls')),

        # Core features
        path('classrooms/', include('apps.classrooms.urls')),
        path('lessons/', include('apps.lessons.urls')),
        path('quizzes/', include('apps.quizzes.urls')),
        path('layers/', include('apps.gis_data.urls')),
        path('tools/', include('apps.tools.urls')),
    ])),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = "WebGIS Educational Platform Admin"
admin.site.site_title = "WebGIS Admin Portal"
admin.site.index_title = "Welcome to WebGIS Administration"
