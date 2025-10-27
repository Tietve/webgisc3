"""
Serializers for GIS data layers with GeoJSON support.
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import MapLayer, VietnamProvince


class MapLayerSerializer(serializers.ModelSerializer):
    """
    Serializer for MapLayer model.
    """
    class Meta:
        model = MapLayer
        fields = ('id', 'name', 'data_source_table', 'geom_type', 'description', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class VietnamProvinceGeoSerializer(GeoFeatureModelSerializer):
    """
    GeoJSON serializer for Vietnam provinces.

    Returns data in GeoJSON FeatureCollection format:
    {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {...},
                "properties": {
                    "name": "Hanoi",
                    "code": "HN",
                    ...
                }
            }
        ]
    }
    """
    class Meta:
        model = VietnamProvince
        geo_field = 'geometry'
        fields = ('id', 'name', 'name_en', 'code', 'region', 'population', 'area_km2')
