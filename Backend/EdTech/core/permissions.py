from rest_framework import permissions
from core.models import Student  

class IsParent(permissions.BasePermission):
    message = "You must be a parent to access this resource."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and getattr(request.user, "user_type", None) == "parent"
        )


class IsParentOfStudent(permissions.BasePermission):
    message = "You can only access your own children's data."

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.user_type != "parent":
            return False

        if isinstance(obj, Student):
            return obj.parent_id == request.user.id

        if hasattr(obj, "student"):
            return obj.student.parent_id == request.user.id

        return False


class IsTeacher(permissions.BasePermission):
    message = "You must be a teacher to access this resource."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and getattr(request.user, "user_type", None) == "teacher"
        )


class IsAdmin(permissions.BasePermission):
    message = "You must be an admin to access this resource."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and getattr(request.user, "user_type", None) == "admin"
        )


class IsTeacherOrAdmin(permissions.BasePermission):
    message = "You must be a teacher or admin to access this resource."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and getattr(request.user, "user_type", None) in ["teacher", "admin"]
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, "owner", None) == request.user


class CanAccessStudent(permissions.BasePermission):
    message = "You don't have permission to access this student's data."

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.user_type == "admin":
            return True

        if isinstance(obj, Student):
            student = obj
        elif hasattr(obj, "student"):
            student = obj.student
        else:
            return False

        if user.user_type == "parent":
            return student.parent_id == user.id

        if user.user_type == "teacher":
            return True  
        return False


class IsMessageParticipant(permissions.BasePermission):
    message = "You can only access message threads you're part of."

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "participants"):
            return request.user in obj.participants.all()
        if hasattr(obj, "thread"):
            return request.user in obj.thread.participants.all()
        return False


class CanModifyConsent(permissions.BasePermission):
    message = "You can only manage consent for your own children."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.user_type == "admin" and request.method in permissions.SAFE_METHODS:
            return True

        if user.user_type == "parent":
            return obj.student.parent_id == user.id

        return False
