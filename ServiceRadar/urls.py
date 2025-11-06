# ServiceRadar/urls.py

from django.contrib import admin
from django.urls import path, include
from ninja import NinjaAPI # <-- NinjaAPI import edilmeli

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
    path('api/', api.urls), # <-- Tüm API trafiği /api/ altında toplanır
    # Oturum açma, çıkış vs için allauth'u dahil etme:
    path('accounts/', include('allauth.urls')), 
    path('haystack/', include('haystack.urls')), 
]