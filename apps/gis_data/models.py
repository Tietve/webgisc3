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
        filter_column: Optional column name to filter data (e.g., 'category')
        filter_value: Optional value to filter by (e.g., 'truong_hoc')
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
    filter_column = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Optional column name to filter data (e.g., category)'
    )
    filter_value = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Optional value to filter by (e.g., truong_hoc)'
    )
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


class PointOfInterest(models.Model):
    """
    Model for storing points of interest (landmarks, schools, hospitals, etc.).

    Fields:
        name: Name of the point of interest
        category: Category/type (e.g., 'school', 'hospital', 'landmark')
        description: Optional description
        geometry: Point geometry (latitude, longitude)
        created_at: Timestamp of creation
    """
    name = models.CharField(max_length=255, help_text='Name of the point of interest')
    category = models.CharField(max_length=100, blank=True, help_text='Category/type (e.g., school, hospital)')
    description = models.TextField(blank=True, help_text='Description of the point')
    geometry = models.PointField(srid=4326, null=True, blank=True, help_text='Point location')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'points_of_interest'
        verbose_name = 'Point of Interest'
        verbose_name_plural = 'Points of Interest'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class LineFeature(models.Model):
    """
    Model for storing line features (roads, rivers, paths, etc.).

    Fields:
        name: Name of the line feature
        category: Category/type (e.g., 'road', 'river', 'path')
        description: Optional description
        geometry: LineString geometry
        created_at: Timestamp of creation
    """
    name = models.CharField(max_length=255, help_text='Name of the line feature')
    category = models.CharField(max_length=100, help_text='Category/type (e.g., road, river)')
    description = models.TextField(blank=True, help_text='Description of the feature')
    geometry = models.LineStringField(srid=4326, help_text='Line geometry')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'line_features'
        verbose_name = 'Line Feature'
        verbose_name_plural = 'Line Features'
        ordering = ['name']
        indexes = [
            models.Index(fields=['category'], name='idx_line_features_category'),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"


class PolygonFeature(models.Model):
    """
    Model for storing polygon features (parks, lakes, buildings, etc.).

    Fields:
        name: Name of the polygon feature
        category: Category/type (e.g., 'park', 'lake', 'building')
        description: Optional description
        geometry: Polygon geometry
        created_at: Timestamp of creation
    """
    name = models.CharField(max_length=255, help_text='Name of the polygon feature')
    category = models.CharField(max_length=100, help_text='Category/type (e.g., park, lake)')
    description = models.TextField(blank=True, help_text='Description of the feature')
    geometry = models.PolygonField(srid=4326, help_text='Polygon geometry')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'polygon_features'
        verbose_name = 'Polygon Feature'
        verbose_name_plural = 'Polygon Features'
        ordering = ['name']
        indexes = [
            models.Index(fields=['category'], name='idx_polygon_features_category'),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"


class Boundary(models.Model):
    """
    Model for storing administrative boundaries (districts, wards, etc.).

    Fields:
        name: Name of the boundary
        type: Type of boundary (e.g., 'district', 'ward', 'province')
        code: Administrative code
        population: Population count
        area_km2: Area in square kilometers
        geometry: MultiPolygon geometry
        created_at: Timestamp of creation
    """
    name = models.CharField(max_length=255, help_text='Name of the boundary')
    type = models.CharField(max_length=100, blank=True, help_text='Type (e.g., district, ward)')
    code = models.CharField(max_length=50, blank=True, help_text='Administrative code')
    population = models.IntegerField(null=True, blank=True, help_text='Population count')
    area_km2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Area in km²')
    geometry = models.MultiPolygonField(srid=4326, null=True, blank=True, help_text='Boundary geometry')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'boundaries'
        verbose_name = 'Boundary'
        verbose_name_plural = 'Boundaries'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"


class Route(models.Model):
    """
    Model for storing routes (bus routes, hiking trails, etc.).

    Fields:
        name: Name of the route
        type: Type of route (e.g., 'bus', 'trail', 'highway')
        length_km: Length in kilometers
        geometry: LineString geometry representing the route
        created_at: Timestamp of creation
    """
    name = models.CharField(max_length=255, help_text='Name of the route')
    type = models.CharField(max_length=100, blank=True, help_text='Type (e.g., bus, trail)')
    length_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Length in km')
    geometry = models.LineStringField(srid=4326, null=True, blank=True, help_text='Route geometry')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'routes'
        verbose_name = 'Route'
        verbose_name_plural = 'Routes'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"
