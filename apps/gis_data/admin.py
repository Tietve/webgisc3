"""
Admin configuration for gis_data app.
"""
from django.contrib.gis import admin
from .models import MapLayer, VietnamProvince


@admin.register(MapLayer)
class MapLayerAdmin(admin.ModelAdmin):
    """Admin interface for MapLayer model."""
    list_display = ('name', 'data_source_table', 'geom_type', 'is_active', 'created_at')
    list_filter = ('geom_type', 'is_active', 'created_at')
    search_fields = ('name', 'data_source_table', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VietnamProvince)
class VietnamProvinceAdmin(admin.GISModelAdmin):
    """Admin interface for VietnamProvince model with map widget."""
    list_display = ('name', 'name_en', 'code', 'region', 'population', 'area_km2')
    list_filter = ('region',)
    search_fields = ('name', 'name_en', 'code')
    gis_widget_kwargs = {
        'attrs': {
            'default_zoom': 6,
            'default_lat': 16.0,
            'default_lon': 106.0,
        }
    }
