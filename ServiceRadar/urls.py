# ServiceRadar/urls.py (ANA PROJE)

from django.contrib import admin
from django.urls import path, include
# Yetkilendirmeli TEK API objesi import ediliyor
from core.api.router import api 

from users.serializers import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Sadece API objesinin URL'leri dahil ediliyor
    path('api/', api.urls), 
    
    path('accounts/', include('django.contrib.auth.urls')),
    path('haystack/', include('haystack.urls')),
]