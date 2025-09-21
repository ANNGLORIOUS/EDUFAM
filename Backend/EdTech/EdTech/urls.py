"""
URL configuration for EdTech project.

"""
from django.contrib import admin
<<<<<<< HEAD
from django.urls import path,include
=======
from django.urls import path , include
>>>>>>> f20a918b82813f64a53335e8c9a29bebbda66318

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
