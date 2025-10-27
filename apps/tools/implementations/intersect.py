"""
Intersect tool - Finds the intersection between two geometry sets.

Example usage:
POST /api/v1/tools/intersect/execute/
{
    "input_geojson": {
        "type": "FeatureCollection",
        "features": [...]  // First geometry set
    },
    "parameters": {
        "overlay_geojson": {...}  // Second geometry set to intersect with
    }
}
"""
from django.contrib.gis.geos import GEOSGeometry
from ..base import BaseTool
import json


class IntersectTool(BaseTool):
    """
    Tool for finding intersection between two geometry sets.
    """

    def execute(self, request_data):
        """
        Execute intersection operation on input geometries.

        Args:
            request_data (dict): Contains input_geojson and parameters

        Returns:
            dict: GeoJSON FeatureCollection with intersection results
        """
        self.validate_input(request_data)

        input_geojson = request_data['input_geojson']
        parameters = request_data['parameters']

        # Validate parameters
        if 'overlay_geojson' not in parameters:
            raise ValueError("Missing 'overlay_geojson' parameter")

        overlay_geojson = parameters['overlay_geojson']

        # Process input GeoJSON
        if input_geojson['type'] == 'FeatureCollection':
            input_features = input_geojson['features']
        elif input_geojson['type'] == 'Feature':
            input_features = [input_geojson]
        else:
            raise ValueError("Input must be a Feature or FeatureCollection")

        # Process overlay GeoJSON
        if overlay_geojson['type'] == 'FeatureCollection':
            overlay_features = overlay_geojson['features']
        elif overlay_geojson['type'] == 'Feature':
            overlay_features = [overlay_geojson]
        else:
            raise ValueError("Overlay must be a Feature or FeatureCollection")

        # Perform intersection
        intersected_features = []
        for input_feature in input_features:
            input_geom = GEOSGeometry(json.dumps(input_feature['geometry']))

            for overlay_feature in overlay_features:
                overlay_geom = GEOSGeometry(json.dumps(overlay_feature['geometry']))

                # Check for intersection
                if input_geom.intersects(overlay_geom):
                    intersection = input_geom.intersection(overlay_geom)

                    if not intersection.empty:
                        # Create intersected feature
                        intersected_feature = {
                            'type': 'Feature',
                            'geometry': json.loads(intersection.geojson),
                            'properties': {
                                'input_properties': input_feature.get('properties', {}),
                                'overlay_properties': overlay_feature.get('properties', {}),
                                'area': intersection.area if intersection.geom_type in ['Polygon', 'MultiPolygon'] else None
                            }
                        }
                        intersected_features.append(intersected_feature)

        # Return GeoJSON FeatureCollection
        return {
            'type': 'FeatureCollection',
            'features': intersected_features,
            'metadata': {
                'total_intersections': len(intersected_features)
            }
        }


# This function is called by the dynamic executor
def execute(request_data):
    """
    Entry point for the intersect tool.

    Args:
        request_data (dict): Request data containing input_geojson and parameters

    Returns:
        dict: GeoJSON FeatureCollection with intersection results
    """
    tool = IntersectTool()
    return tool.execute(request_data)
