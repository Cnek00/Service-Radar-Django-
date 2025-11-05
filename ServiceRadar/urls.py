# ServiceRadar/urls.py
from django.contrib import admin
from django.urls import path, include

# Django Ninja API'si için gerekli
from ninja import NinjaAPI
from core.api import router as core_router # core/api.py dosyasını daha sonra oluşturacağız

# API nesnesini oluştur
api = NinjaAPI(
    title="ServiceRadar API", 
    description="Hizmet Eşleştirme ve Yönetim API'si",
)

# Router'ları API'ye dahil et
api.add_router("/core/", core_router) 

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Google OAuth ve Allauth
    path('accounts/', include('allauth.urls')), 
    
    # Django Ninja API
    path('api/', api.urls), # Tüm API çağrıları /api/ altında toplanacak
]