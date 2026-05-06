from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with role='admin'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsHR(BasePermission):
    """Allow access only to users with role='hr'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'hr'


class IsAdminOrHR(BasePermission):
    """Allow access to admin or HR users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'hr')


class IsCustomer(BasePermission):
    """Allow access only to users with role='customer'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'