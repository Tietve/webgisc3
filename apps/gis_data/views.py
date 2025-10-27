"""
Views for GIS data layers and features.
"""
from django.contrib.gis.geos import Polygon
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import connection
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from apps.core.pagination import LargeResultsSetPagination
from .models import MapLayer, VietnamProvince
from .serializers import MapLayerSerializer, VietnamProvinceGeoSerializer


class MapLayerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing map layers.

    GET /api/v1/layers/ - List all active map layers
    GET /api/v1/layers/{id}/ - Get layer details
    GET /api/v1/layers/{id}/features/ - Get GeoJSON features for the layer
    """
    queryset = MapLayer.objects.filter(is_active=True)
    serializer_class = MapLayerSerializer
    permission_classes = [AllowAny]  # Cho phép xem không cần đăng nhập

    @extend_schema(
        summary="List all map layers",
        description="Get a list of all active map layers",
        responses={200: MapLayerSerializer(many=True)},
        tags=['GIS Data']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Get layer details",
        description="Get details of a specific map layer",
        responses={200: MapLayerSerializer},
        tags=['GIS Data']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Get GeoJSON features for layer",
        description="Get GeoJSON FeatureCollection for the layer. Supports bbox filtering.",
        parameters=[
            OpenApiParameter(
                name='bbox',
                description='Bounding box filter (xmin,ymin,xmax,ymax)',
                required=False,
                type=str,
                location=OpenApiParameter.QUERY
            )
        ],
        responses={
            200: OpenApiResponse(description="GeoJSON FeatureCollection"),
            400: OpenApiResponse(description="Invalid bbox parameter")
        },
        tags=['GIS Data']
    )
    @action(detail=True, methods=['get'], pagination_class=LargeResultsSetPagination)
    def features(self, request, pk=None):
        """
        GET /api/v1/layers/{id}/features/

        Get GeoJSON features for a layer with optional bbox filtering.

        Query Parameters:
            bbox: Bounding box filter (xmin,ymin,xmax,ymax)

        Returns:
            GeoJSON FeatureCollection
        """
        layer = self.get_object()

        # Hỗ trợ các bảng GIS custom (points_of_interest, boundaries, routes)
        custom_tables = ['points_of_interest', 'boundaries', 'routes']

        if layer.data_source_table in custom_tables:
            # Lấy dữ liệu trực tiếp từ database bằng raw SQL
            table_name = layer.data_source_table

            with connection.cursor() as cursor:
                query = f"""
                    SELECT json_build_object(
                        'type', 'FeatureCollection',
                        'features', COALESCE(json_agg(
                            json_build_object(
                                'type', 'Feature',
                                'id', id,
                                'properties', json_build_object(
                                    'id', id,
                                    'name', name,
                                    'category', COALESCE(category, 'Unknown')
                                ),
                                'geometry', ST_AsGeoJSON(geometry)::json
                            )
                        ), '[]'::json)
                    ) as geojson
                    FROM {table_name}
                    WHERE geometry IS NOT NULL;
                """

                try:
                    cursor.execute(query)
                    result = cursor.fetchone()

                    if result and result[0]:
                        return Response(result[0])
                    else:
                        return Response({
                            "type": "FeatureCollection",
                            "features": []
                        })
                except Exception as e:
                    return Response(
                        {'error': {'code': 'DatabaseError', 'message': str(e)}},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

        # Xử lý vietnam_provinces như cũ
        if layer.data_source_table != 'vietnam_provinces':
            return Response(
                {'error': {'code': 'NotImplemented', 'message': f'Layer {layer.data_source_table} not implemented yet.'}},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

        queryset = VietnamProvince.objects.all()

        # Apply bbox filter if provided
        bbox_param = request.query_params.get('bbox')
        if bbox_param:
            try:
                # Parse bbox: xmin,ymin,xmax,ymax
                coords = [float(c) for c in bbox_param.split(',')]
                if len(coords) != 4:
                    raise ValueError("bbox must contain exactly 4 coordinates")

                xmin, ymin, xmax, ymax = coords
                bbox_polygon = Polygon.from_bbox((xmin, ymin, xmax, ymax))
                queryset = queryset.filter(geometry__intersects=bbox_polygon)

            except (ValueError, TypeError) as e:
                return Response(
                    {'error': {'code': 'InvalidParameter', 'message': f'Invalid bbox parameter: {str(e)}'}},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Paginate the results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = VietnamProvinceGeoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = VietnamProvinceGeoSerializer(queryset, many=True)
        return Response(serializer.data)
