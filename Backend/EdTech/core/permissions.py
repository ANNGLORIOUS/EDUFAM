# core/permissions.py
from rest_framework import permissions
from core.models import Parent, Student


class IsParent(permissions.BasePermission):
    """
    Permission to check if user is a parent
    """
    message = "You must be a parent to access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is a parent
        if request.user.user_type != 'parent':
            return False
        
        # Check if parent profile exists
        try:
            request.user.parent_profile
            return True
        except Parent.DoesNotExist:
            # Create parent profile if doesn't exist for authenticated parent user
            Parent.objects.create(user=request.user)
            return True


class IsParentOfStudent(permissions.BasePermission):
    """
    Permission to check if parent has access to specific student
    """
    message = "You can only access your own children's data."
    
    def has_permission(self, request, view):
        # First check if user is a parent
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.user_type != 'parent':
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the parent has access to the specific student
        """
        try:
            parent = request.user.parent_profile
        except Parent.DoesNotExist:
            return False
        
        # If obj is a Student
        if isinstance(obj, Student):
            return parent.children.filter(id=obj.id).exists()
        
        # If obj has a student attribute (like GradeRecord, AttendanceRecord, etc.)
        if hasattr(obj, 'student'):
            return parent.children.filter(id=obj.student.id).exists()
        
        return False
    
    def has_view_permission(self, request, view):
        """
        Check permission based on URL parameters (for student_id in URL)
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.user_type != 'parent':
            return False
        
        # Get student_id from URL kwargs
        student_id = view.kwargs.get('student_id') or view.kwargs.get('pk')
        if not student_id:
            return True  # Let view handle this
        
        try:
            parent = request.user.parent_profile
            return parent.children.filter(id=student_id).exists()
        except (Parent.DoesNotExist, Student.DoesNotExist, ValueError):
            return False


class IsTeacher(permissions.BasePermission):
    """
    Permission to check if user is a teacher
    """
    message = "You must be a teacher to access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.user_type == 'teacher'


class IsAdmin(permissions.BasePermission):
    """
    Permission to check if user is an admin
    """
    message = "You must be an admin to access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.user_type == 'admin'


class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Permission to check if user is a teacher or admin
    """
    message = "You must be a teacher or admin to access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.user_type in ['teacher', 'admin']


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the model has an 'owner' field.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the owner of the object
        return obj.owner == request.user


class CanAccessStudent(permissions.BasePermission):
    """
    Permission that allows:
    - Parents to access their own children
    - Teachers to access students in their classes or subjects they teach
    - Admins to access all students
    """
    message = "You don't have permission to access this student's data."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.user_type in ['parent', 'teacher', 'admin']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin can access all students
        if user.user_type == 'admin':
            return True
        
        # Get the student object
        if isinstance(obj, Student):
            student = obj
        elif hasattr(obj, 'student'):
            student = obj.student
        else:
            return False
        
        # Parent can access their own children
        if user.user_type == 'parent':
            try:
                parent = user.parent_profile
                return parent.children.filter(id=student.id).exists()
            except Parent.DoesNotExist:
                return False
        
        # Teacher can access students in their classes
        if user.user_type == 'teacher':
            # Check if teacher is class teacher for student's class
            if student.current_class and student.current_class.class_teacher == user:
                return True
            
            # Check if teacher teaches any subjects to this student
            # (This would require a Subject-Teacher relationship in your models)
            # For now, we'll allow teachers to access all students in their school
            if student.school in user.schools.all():  # Assuming teachers have school relationships
                return True
        
        return False


class IsMessageParticipant(permissions.BasePermission):
    """
    Permission to check if user is participant in message thread
    """
    message = "You can only access message threads you're part of."
    
    def has_object_permission(self, request, view, obj):
        # For MessageThread objects
        if hasattr(obj, 'participants'):
            return request.user in obj.participants.all()
        
        # For Message objects
        if hasattr(obj, 'thread'):
            return request.user in obj.thread.participants.all()
        
        return False


class CanModifyConsent(permissions.BasePermission):
    """
    Permission for consent management
    - Parents can manage consent for their own children
    - Admins can view all consent records
    """
    message = "You can only manage consent for your own children."
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin can view all consent records
        if user.user_type == 'admin' and request.method in permissions.SAFE_METHODS:
            return True
        
        # Parents can manage consent for their own children
        if user.user_type == 'parent':
            try:
                parent = user.parent_profile
                return obj.parent == parent and parent.children.filter(id=obj.student.id).exists()
            except Parent.DoesNotExist:
                return False
        
        return False