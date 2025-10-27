"""
Base class for geospatial analysis tools.

All tools should inherit from BaseTool and implement the execute() method.
"""
from abc import ABC, abstractmethod


class BaseTool(ABC):
    """
    Abstract base class for geospatial analysis tools.

    All tools must implement:
    - execute(request_data): Perform the analysis and return GeoJSON result
    """

    def __init__(self):
        """Initialize the tool."""
        pass

    @abstractmethod
    def execute(self, request_data):
        """
        Execute the tool with the given request data.

        Args:
            request_data (dict): Dictionary containing:
                - input_geojson: GeoJSON FeatureCollection or Feature
                - parameters: Tool-specific parameters

        Returns:
            dict: GeoJSON FeatureCollection with analysis results

        Raises:
            ValueError: If input data is invalid
        """
        pass

    def validate_input(self, request_data):
        """
        Validate input data.

        Args:
            request_data (dict): Request data to validate

        Raises:
            ValueError: If validation fails
        """
        if 'input_geojson' not in request_data:
            raise ValueError("Missing 'input_geojson' in request data")

        if 'parameters' not in request_data:
            raise ValueError("Missing 'parameters' in request data")
