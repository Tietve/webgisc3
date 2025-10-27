"""
Custom permission classes for role-based access control.
"""
from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    """
    Permission to only allow teachers to access the view.
    """
    message = "Only teachers can perform this action."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'


class IsStudent(permissions.BasePermission):
    """
    Permission to only allow students to access the view.
    """
    message = "Only students can perform this action."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'


class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Permission to allow teachers to edit, but students can only read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'


class IsOwnerOrTeacher(permissions.BasePermission):
    """
    Permission to allow owners and teachers to access an object.
    """
    def has_object_permission(self, request, view, obj):
        # Teachers have full access
        if request.user.role == 'teacher':
            return True

        # Check if user is the owner (assuming obj has a 'user' field)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return obj.student == request.user

        return False
