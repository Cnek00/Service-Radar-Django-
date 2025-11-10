# firm/permissions.py

from ninja.security import HttpBearer
from users.models import User

# Kullanıcının JWT token'ı ile giriş yapıp yapmadığını ve bir firmaya bağlı olup olmadığını kontrol eder.
# Bu, firma panelindeki tüm işlemlerin temel iznidir.
class IsFirmEmployee(HttpBearer):
    def authenticate(self, request, token):
        # Django Ninja, token doğrulamasını (JWT) zaten yapmıştır.
        # Biz sadece kullanıcının bir firmaya bağlı olup olmadığını kontrol ediyoruz.
        if not hasattr(request, 'auth') or not request.auth:
            return None # Kullanıcı doğrulanmadı
        
        user: User = request.auth # Doğrulanmış kullanıcı
        
        # Süper Adminler her şeye erişebilir (Admin Panelini atlamak için)
        if user.is_superuser:
            return user
        
        # Normal çalışan veya yönetici olmalı
        if user.firm is not None:
            return user
            
        return None # Firmanın çalışanı değil

# Sadece Firma Yöneticisi yetkisine sahip kullanıcıların erişimine izin verir.
class IsFirmManager(IsFirmEmployee):
    def authenticate(self, request, token):
        # Önce IsFirmEmployee kuralını uygula
        user = super().authenticate(request, token)
        
        if user is None:
            return None
            
        # Eğer Süper Admin ise izin ver (her şeye erişir)
        if user.is_superuser:
            return user
        
        # Firma Yöneticisi yetkisine sahipse izin ver
        if user.is_firm_manager:
            return user
            
        return None # Yetki yok