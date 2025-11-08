# ServiceRadar/urls.py

from django.contrib import admin
from django.urls import path, include
from ninja import NinjaAPI # <-- NinjaAPI import edilmeli
from core.api.router import api

from rest_framework_simplejwt.views import (TokenObtainPairView , TokenRefreshView)

# 1. Router'ları içe aktarma
from core.api.router import router as core_router 
# Eğer diğer router'lar olsaydı onlar da buraya gelirdi

# 2. Ana Ninja API objesini oluşturma
api = NinjaAPI(title="ServiceRadar API", version="1.0.0")

# 3. Router'ı Ana API'ye Ekleme
api.add_router("/core", core_router) # <-- Core router'ı /core yoluyla ekleme

# 4. urlpatterns'i düzenleme
urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT AUTH ROTALARI:
    # 1. /auth/token/: Kullanıcı adı/şifre gönderilir, access ve refresh token alınır
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # 2. /auth/token/refresh/: Eskimiş access token'ı yenileme token'ı ile yeniler
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ... (Diğer rotalarınız)
    path('api/', api.urls),
    
    path('accounts/', include('django.contrib.auth.urls')),
    path('haystack/', include('haystack.urls')),
]