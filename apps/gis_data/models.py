"""
Models for GIS data layers and spatial data.
"""
from django.contrib.gis.db import models


class MapLayer(models.Model):
    """
    MapLayer model for managing GIS layers.

    Fields:
        id: Auto-incrementing primary key
        name: Display name of the layer
        data_source_table: Name of the PostGIS table containing the data
        geom_type: Geometry type (POINT, LINESTRING, POLYGON, etc.)
        description: Optional description of the layer
        is_active: Whether the layer is active and visible
        created_at: Timestamp of layer creation
        updated_at: Timestamp of last update
    """
    GEOMETRY_TYPES = [
        ('POINT', 'Point'),
        ('LINESTRING', 'LineString'),
        ('POLYGON', 'Polygon'),
        ('MULTIPOINT', 'MultiPoint'),
        ('MULTILINESTRING', 'MultiLineString'),
        ('MULTIPOLYGON', 'MultiPolygon'),
    ]

    name = models.CharField(max_length=100, help_text='Display name of the layer')
    data_source_table = models.CharField(
        max_length=100,
        help_text='Name of the PostGIS table containing the data'
    )
    geom_type = models.CharField(
        max_length=50,
        choices=GEOMETRY_TYPES,
        help_text='Geometry type stored in this layer'
    )
    description = models.TextField(blank=True, help_text='Description of the layer')
    is_active = models.BooleanField(default=True, help_text='Whether the layer is active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'map_layers'
        verbose_name = 'Map Layer'
        verbose_name_plural = 'Map Layers'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.geom_type})"


class VietnamProvince(models.Model):
    """
    Sample PostGIS model for Vietnam provinces.

    This model demonstrates how to store spatial data using GeoDjango.
    It represents administrative provinces of Vietnam with polygon geometries.
    """
    name = models.CharField(max_length=100, help_text='Province name')
    name_en = models.CharField(max_length=100, blank=True, help_text='Province name in English')
    code = models.CharField(max_length=10, unique=True, help_text='Province code')
    region = models.CharField(max_length=50, blank=True, help_text='Region (North, Central, South)')
    population = models.IntegerField(null=True, blank=True, help_text='Population')
    area_km2 = models.FloatField(null=True, blank=True, help_text='Area in square kilometers')
    geometry = models.MultiPolygonField(srid=4326, help_text='Province boundary geometry')

    class Meta:
        db_table = 'vietnam_provinces'
        verbose_name = 'Vietnam Province'
        verbose_name_plural = 'Vietnam Provinces'
        ordering = ['name']

    def __str__(self):
        return self.name
