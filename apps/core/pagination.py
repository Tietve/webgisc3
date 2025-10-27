"""
Custom pagination classes for API responses.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class for list endpoints.

    Returns paginated results with metadata:
    {
        "count": 100,
        "next": "http://api.example.com/items/?page=2",
        "previous": null,
        "results": [...]
    }
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination class for large datasets (e.g., GIS features).
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000
