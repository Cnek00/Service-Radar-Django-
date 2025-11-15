from ninja import Router
from django.shortcuts import get_object_or_404
from typing import List
from users.models import CustomerAddress
from users.schemas import CustomerAddressIn, CustomerAddressOut
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class GlobalAuth(HttpBearer):
    """
    JWT (Bearer Token) kullanarak yetkilendirmeyi yönetir.
    Django Simple JWT kütüphanesini kullanır.
    """
    def authenticate(self, request, token):
        try:
            validated_token = JWTAuthentication().get_validated_token(token)
            user = JWTAuthentication().get_user(validated_token)
            
            if user and user.is_active:
                return user
            return None
            
        except AuthenticationFailed:
            return None
        except Exception:
            return None


router = Router()
auth = GlobalAuth()


@router.get("/addresses", response=List[CustomerAddressOut], auth=auth)
def list_addresses(request):
    """
    Kullanıcının tüm adreslerini listele
    """
    user = request.auth  # JWT auth'dan kullanıcı bilgisi
    addresses = CustomerAddress.objects.filter(user=user).order_by('-is_default', '-created_at')
    return addresses


@router.post("/addresses", response=CustomerAddressOut, auth=auth)
def create_address(request, payload: CustomerAddressIn):
    """
    Yeni adres oluştur
    """
    user = request.auth
    
    # Eğer is_default=True ise diğer varsayılan adresleri false yap
    if payload.is_default:
        CustomerAddress.objects.filter(user=user, is_default=True).update(is_default=False)
    
    address = CustomerAddress.objects.create(
        user=user,
        full_address=payload.full_address,
        street=payload.street,
        district=payload.district,
        city=payload.city,
        postal_code=payload.postal_code,
        phone=payload.phone,
        is_default=payload.is_default
    )
    return address


@router.get("/addresses/{address_id}", response=CustomerAddressOut, auth=auth)
def get_address(request, address_id: int):
    """
    Tek bir adres detayını getir
    """
    user = request.auth
    address = get_object_or_404(CustomerAddress, id=address_id, user=user)
    return address


@router.put("/addresses/{address_id}", response=CustomerAddressOut, auth=auth)
def update_address(request, address_id: int, payload: CustomerAddressIn):
    """
    Adres güncelle
    """
    user = request.auth
    address = get_object_or_404(CustomerAddress, id=address_id, user=user)
    
    # Eğer is_default=True ise diğer varsayılan adresleri false yap
    if payload.is_default and not address.is_default:
        CustomerAddress.objects.filter(user=user, is_default=True).update(is_default=False)
    
    # Alanları güncelle
    address.full_address = payload.full_address
    address.street = payload.street
    address.district = payload.district
    address.city = payload.city
    address.postal_code = payload.postal_code
    address.phone = payload.phone
    address.is_default = payload.is_default
    address.save()
    
    return address


@router.delete("/addresses/{address_id}", auth=auth)
def delete_address(request, address_id: int):
    """
    Adres sil
    """
    user = request.auth
    address = get_object_or_404(CustomerAddress, id=address_id, user=user)
    address.delete()
    return {"message": "Adres başarıyla silindi"}


@router.put("/addresses/{address_id}/default", response=CustomerAddressOut, auth=auth)
def set_default_address(request, address_id: int):
    """
    Bir adresi varsayılan olarak ayarla
    """
    user = request.auth
    address = get_object_or_404(CustomerAddress, id=address_id, user=user)
    
    # Diğer varsayılan adresleri false yap
    CustomerAddress.objects.filter(user=user, is_default=True).update(is_default=False)
    
    # Bu adresi varsayılan yap
    address.is_default = True
    address.save()
    
    return address
