"""
Simple GIS API Views - Không cần MapLayer model
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection


class SimpleLayerViewSet(viewsets.ViewSet):
    """
    API endpoint đơn giản để lấy dữ liệu GIS layers
    Không cần MapLayer model
    """
    permission_classes = [AllowAny]

    def list(self, request):
        """
        GET /api/v1/layers/
        Trả về danh sách các layers có sẵn
        """
        layers = [
            {
                "id": 1,
                "name": "Điểm Quan Tâm",
                "data_source_table": "points_of_interest",
                "geom_type": "POINT",
                "description": "Các điểm quan tâm như hồ nước, chợ, trường học, bệnh viện...",
                "is_active": True
            },
            {
                "id": 2,
                "name": "Ranh Giới",
                "data_source_table": "boundaries",
                "geom_type": "MULTIPOLYGON",
                "description": "Ranh giới hành chính các tỉnh, huyện, xã",
                "is_active": True
            },
            {
                "id": 3,
                "name": "Tuyến Đường",
                "data_source_table": "routes",
                "geom_type": "LINESTRING",
                "description": "Các tuyến đường, xe buýt, metro...",
                "is_active": True
            }
        ]

        return Response({"results": layers})

    def retrieve(self, request, pk=None):
        """
        GET /api/v1/layers/{id}/
        Trả về chi tiết 1 layer
        """
        layers = {
            "1": {
                "id": 1,
                "name": "Điểm Quan Tâm",
                "data_source_table": "points_of_interest",
                "geom_type": "POINT",
                "description": "Các điểm quan tâm như hồ nước, chợ, trường học, bệnh viện...",
                "is_active": True
            },
            "2": {
                "id": 2,
                "name": "Ranh Giới",
                "data_source_table": "boundaries",
                "geom_type": "MULTIPOLYGON",
                "description": "Ranh giới hành chính các tỉnh, huyện, xã",
                "is_active": True
            },
            "3": {
                "id": 3,
                "name": "Tuyến Đường",
                "data_source_table": "routes",
                "geom_type": "LINESTRING",
                "description": "Các tuyến đường, xe buýt, metro...",
                "is_active": True
            }
        }

        if str(pk) not in layers:
            return Response(
                {"error": "Layer not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(layers[str(pk)])

    @action(detail=True, methods=['get'], url_path='features')
    def features(self, request, pk=None):
        """
        GET /api/v1/layers/{id}/features/
        Trả về GeoJSON features của layer
        """
        # Map layer ID to table name
        table_mapping = {
            "1": "points_of_interest",
            "2": "boundaries",
            "3": "routes"
        }

        if str(pk) not in table_mapping:
            return Response(
                {"error": "Layer not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        table_name = table_mapping[str(pk)]

        # Lấy dữ liệu từ database
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
                    {"error": f"Database error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
