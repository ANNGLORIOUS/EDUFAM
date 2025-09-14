from rest_framework import permissions
from core.models import Parent, Student

# Permission to check if user is a parent
class IsParent(permissions.BasePermission):
    
    message = "You must be a parent to access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.user_type != 'parent':
            return False
        
        try:
            request.user.parent_profile
            return True
        except Parent.DoesNotExist:
            Parent.objects.create(user=request.user)
            return True

# Permission to check if parent has access to specific student
class IsParentOfStudent(permissions.BasePermission):
    message = "You can only access your own children's data."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.user_type != 'parent':
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):

        try:
            parent = request.user.parent_profile
        except Parent.DoesNotExist:
            return False
        
        if isinstance(obj, Student):
            return parent.children.filter(id=obj.id).exists()
        
        if hasattr(obj, 'student'):
            return parent.children.filter(id=obj.student.id).exists()
        
        return False
    
    def has_view_permission(self, request, view):
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.user_type != 'parent':
            return False
        
        student_id = view.kwargs.get('student_id') or view.kwargs.get('pk')
        if not student_id:
            return True  
        
        try:
            parent = request.user.parent_profile
            return parent.children.filter(id=student_id).exists()
        except (Parent.DoesNotExist, Student.DoesNotExist, ValueError):
            return False

# Permission to check if user is a teacher
class IsTeacher(permissions.BasePermission):
    message = "You must be a teacher to access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.user_type == 'teacher'

# Permission to check if user is an admin
class IsAdmin(permissions.BasePermission):
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

# Permission to check if user is owner of the object
class IsOwnerOrReadOnly(permissions.BasePermission):
      
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.owner == request.user

# Permission to check if user can access student data
class CanAccessStudent(permissions.BasePermission):
    message = "You don't have permission to access this student's data."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.user_type in ['parent', 'teacher', 'admin']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if user.user_type == 'admin':
            return True
        
        if isinstance(obj, Student):
            student = obj
        elif hasattr(obj, 'student'):
            student = obj.student
        else:
            return False
        
        if user.user_type == 'parent':
            try:
                parent = user.parent_profile
                return parent.children.filter(id=student.id).exists()
            except Parent.DoesNotExist:
                return False
        
        if user.user_type == 'teacher':
            if student.current_class and student.current_class.class_teacher == user:
                return True
            
            if student.school in user.schools.all():  
                return True
        
        return False

# Permission to check if user is participant in message thread
class IsMessageParticipant(permissions.BasePermission):
    
    message = "You can only access message threads you're part of."
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'participants'):
            return request.user in obj.participants.all()
        
        if hasattr(obj, 'thread'):
            return request.user in obj.thread.participants.all()
        
        return False

# Permission to manage consent records
class CanModifyConsent(permissions.BasePermission):

    message = "You can only manage consent for your own children."
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if user.user_type == 'admin' and request.method in permissions.SAFE_METHODS:
            return True
        
        if user.user_type == 'parent':
            try:
                parent = user.parent_profile
                return obj.parent == parent and parent.children.filter(id=obj.student.id).exists()
            except Parent.DoesNotExist:
                return False
        
        return False