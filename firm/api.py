# firm/api.py

from ninja import Router
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.contrib.auth.hashers import make_password
from typing import List

from users.models import User
from firm.schemas import UserSchema, FirmEmployeeCreateSchema, FirmEmployeeUpdateSchema
from firm.permissions import IsFirmManager, IsFirmEmployee # Firma izinleri
from core.api.schemas import ErrorSchema # Varsayılan hata şeması

# Firmaya ait router
router = Router(tags=["firm-management"])

# =======================================================
# Firma Çalışanı Yönetimi (Sadece Firma Yöneticisi Erişir)
# =======================================================

@router.get(
    "/users", 
    response={200: List[UserSchema], 403: ErrorSchema}, 
    auth=IsFirmEmployee # Sadece bir firmaya bağlı olanlar görsün
)
def list_firm_employees(request):
    """
    Firma Yöneticisi/Çalışanı kendi firmasına ait kullanıcıları listeler.
    """
    user: User = request.auth
    
    # Süper Admin ise tüm kullanıcıları getir (Test amaçlı)
    if user.is_superuser:
        # Süper Admin ise firması olmayanları da görmeli
        return User.objects.all().order_by('username')
    
    # Firmanın ID'si üzerinden filtreleme
    if user.firm:
        employees = User.objects.filter(firm=user.firm).order_by('username')
        return employees
        
    return 403, {"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}


@router.post(
    "/users", 
    response={201: UserSchema, 400: ErrorSchema, 403: ErrorSchema}, 
    auth=IsFirmManager # Sadece Firma Yöneticisi ekleyebilir
)
def create_firm_employee(request, payload: FirmEmployeeCreateSchema):
    """
    Firma Yöneticisi, kendi firmasına yeni çalışan ekler.
    """
    manager: User = request.auth
    
    if not manager.firm:
        # Normalde IsFirmManager bu kontrolü yapar, ama bir kez daha.
        return 403, {"detail": "Bu işlemi yapmak için bir firmaya bağlı olmanız gerekir."}

    # Kullanıcının zaten var olup olmadığını kontrol et
    if User.objects.filter(username=payload.username).exists() or \
       User.objects.filter(email=payload.email).exists():
        return 400, {"detail": "Bu kullanıcı adı veya e-posta adresi zaten kullanımda."}

    try:
        # Yeni kullanıcı oluştur
        new_user = User.objects.create(
            username=payload.username,
            email=payload.email,
            full_name=payload.full_name,
            # Rol: Firma Çalışanı olarak başlar
            role='firm_employee',
            # Kendi firmasına bağlı olarak oluşturur
            firm=manager.firm, 
            # Şifreyi hash'le
            password=make_password(payload.password), 
            # Yeni kullanıcı aktif ve personel olarak işaretlenir
            is_staff=True,
            is_active=True
        )
        return 201, new_user
    
    except IntegrityError:
        return 400, {"detail": "Veritabanı bütünlüğü hatası (Kullanıcı adı veya e-posta benzersiz değil)."}
    except Exception as e:
        return 400, {"detail": f"Kullanıcı oluşturulurken bir hata oluştu: {str(e)}"}


@router.put(
    "/users/{user_id}", 
    response={200: UserSchema, 400: ErrorSchema, 403: ErrorSchema, 404: ErrorSchema}, 
    auth=IsFirmManager # Sadece Firma Yöneticisi güncelleyebilir
)
def update_firm_employee_role(request, user_id: int, payload: FirmEmployeeUpdateSchema):
    """
    Firma Yöneticisi, kendi firmasına ait bir çalışanın yetkisini (is_firm_manager) günceller.
    """
    manager: User = request.auth
    
    # Yöneticinin firmasını al
    target_firm = manager.firm
    if not target_firm:
        return 403, {"detail": "Bu işlemi yapmak için bir firmaya bağlı olmanız gerekir."}
        
    # Güncellenecek kullanıcıyı bul ve kendi firmasına ait olduğunu kontrol et
    employee = get_object_or_404(User, id=user_id)
    
    # Yetki Kontrolü: Güncellenen kullanıcı, yöneticinin firmasına ait olmalı
    if employee.firm != target_firm:
        return 403, {"detail": "Sadece kendi firmanızın kullanıcılarını güncelleyebilirsiniz."}
        
    # Kontrol: Bir yönetici kendi yetkisini düşüremez (basit koruma)
    if employee.id == manager.id and employee.is_firm_manager == True and payload.is_firm_manager == False:
        return 400, {"detail": "Kendi yöneticilik yetkinizi kaldıramazsınız."}

    # Güncelleme işlemi
    employee.is_firm_manager = payload.is_firm_manager
    # Rolü de otomatik güncelleyelim (Opsiyonel ama mantıklı)
    employee.role = 'firm_manager' if payload.is_firm_manager else 'firm_employee'
    
    employee.save()
    
    return employee


@router.delete(
    "/users/{user_id}", 
    response={204: None, 403: ErrorSchema, 404: ErrorSchema}, 
    auth=IsFirmManager
)
def delete_firm_employee(request, user_id: int):
    """
    Firma Yöneticisi, kendi firmasına ait bir çalışanı siler.
    """
    manager: User = request.auth
    target_firm = manager.firm
    
    if not target_firm:
        return 403, {"detail": "Bu işlemi yapmak için bir firmaya bağlı olmanız gerekir."}
        
    employee = get_object_or_404(User, id=user_id)
    
    # Yetki Kontrolü: Silinen kullanıcı, yöneticinin firmasına ait olmalı
    if employee.firm != target_firm:
        return 403, {"detail": "Sadece kendi firmanızın kullanıcılarını silebilirsiniz."}
    
    # Kontrol: Bir yönetici kendini silemez
    if employee.id == manager.id:
        return 400, {"detail": "Kendi hesabınızı silemezsiniz."}

    # Silme işlemi
    employee.delete()
    
    return 204, None