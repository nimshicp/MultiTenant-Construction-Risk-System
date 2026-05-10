from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == "SUPER_ADMIN" or request.user.is_superuser)

class IsCompanyAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "COMPANY_ADMIN"

class IsProjectManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "PROJECT_MANAGER"