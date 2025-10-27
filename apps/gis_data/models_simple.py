"""
Simple models without GeoDjango for testing
"""
from django.db import models
import json


class MapLayer(models.Model):
    """Map layer - simplified version"""
    name = models.CharField(max_length=255)
    layer_type = models.CharField(
        max_length=50,
        choices=[
            ('point', 'Point'),
            ('line', 'Line'),
            ('polygon', 'Polygon'),
            ('raster', 'Raster'),
        ]
    )
    description = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    style = models.JSONField(default=dict, blank=True)
    visible_by_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class VietnamProvince(models.Model):
    """Vietnam province - simplified without geometry"""
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    region = models.CharField(max_length=50)
    # Store geometry as JSON text
    geometry_json = models.TextField()
    population = models.IntegerField(null=True, blank=True)
    area_km2 = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def geometry(self):
        """Return geometry as dict"""
        try:
            return json.loads(self.geometry_json)
        except:
            return None
