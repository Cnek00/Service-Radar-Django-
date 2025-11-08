# core/api/router.py

from ninja import Router, NinjaAPI
from typing import List, Optional
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import HttpRequest, JsonResponse


# 3rd Party Auth/Search Imports
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from haystack.query import SearchQuerySet 

# Local Imports
from core.models import Service, Company, ReferralRequest
from .schemas import ServiceSchema, ReferralRequestIn, ReferralRequestOut , RequestActionIn

# =======================================================
# YETKİLENDİRME (AUTHENTICATION) SINIFI
# =======================================================

class GlobalAuth(HttpBearer):
    """
    JWT (Bearer Token) kullanarak yetkilendirmeyi yönetir.
    Django Simple JWT kütüphanesini kullanır.
    """
    def authenticate(self, request, token):
        try:
            # JWT doğrulamasını yapıyoruz
            validated_token = JWTAuthentication().get_validated_token(token)
            user = JWTAuthentication().get_user(validated_token)
            
            if user and user.is_active:
                # Başarılı olursa USER objesi döner. Bu, request.auth olur.
                return user
            return None
            
        except AuthenticationFailed:
            return None
        except Exception:
            return None


# =======================================================
# NINJA API VE ROUTER TANIMLARI
# =======================================================

# 1. Yetkilendirmeli Ana API objesini tanımlıyoruz.
api = NinjaAPI(auth=GlobalAuth())

# 2. Rota gruplaması için Router objesini tanımlıyoruz.
router = Router() 

# Rotanın API'ye eklenmesi, tüm fonksiyonlar tanımlandıktan sonra EN SONDA yapılacaktır.


# =======================================================
# 0. API DURUM KONTROLÜ (Herkese Açık)
# =======================================================

@router.get("/status", tags=["Genel"], auth=None)
def status(request):
    """API'nin çalışıp çalışmadığını kontrol eder."""
    return {"status": "ok", "message": "ServiceRadar API is running!"}


# =======================================================
# 1. MÜŞTERİ İÇİN API ENDPOINTLERİ (Herkese Açık)
# =======================================================

@router.get("/services/search", response=List[ServiceSchema], tags=["Müşteri Arama"], auth=None)
def search_services(request: HttpRequest, query: str = None, location: str = None):
    """Hizmetleri anahtar kelime ve konuma göre arar."""
    
    services = Service.objects.select_related('company').all()
    
    if query:
        sqs = SearchQuerySet().filter(content=query)
        service_ids = [result.pk for result in sqs]
        services = services.filter(id__in=service_ids)

    if location:
        services = services.filter(company__location_text__icontains=location)
        
    return services.select_related('company') 

@router.post("/referral/create", response={201: ReferralRequestOut}, tags=["Müşteri Talep"], auth=None)
def create_referral_request(request: HttpRequest, payload: ReferralRequestIn):
    """Müşteri bir firmadan hizmet talebi oluşturur."""
    
    company = get_object_or_404(Company, id=payload.target_company_id)
    service = get_object_or_404(Service, id=payload.requested_service_id)
    
    referral = ReferralRequest.objects.create(
        target_company=company,
        requested_service=service,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
    )
    
    final_referral = ReferralRequest.objects.select_related(
        'requested_service', 
        'requested_service__company'
    ).get(id=referral.id)
    
    return 201, final_referral


# =======================================================
# 2. FİRMA İÇİN API ENDPOINTLERİ (Yönetim) - JWT KORUMALI
# =======================================================

# Bu rotalar, varsayılan GlobalAuth ayarını kullanır ve JWT token gerektirir.

@router.get("/firm/my-referrals", response=List[ReferralRequestOut], tags=["Firma Paneli"])
def list_my_referrals(request: HttpRequest):
    """Firmaya ait tüm talepleri listeler. JWT yetkilendirme gereklidir."""
    
    # GlobalAuth başarılı olduğu için request.auth artık USER objesidir.
    user = request.auth 
    
    # GEÇİCİ ÇÖZÜM: Test firması ID'si ile filtreleme (user.profile.company_id kullanılacak)
    TEST_COMPANY_ID = 1 
    
    referrals = ReferralRequest.objects.filter(target_company_id=TEST_COMPANY_ID).select_related(
        'requested_service',
        'requested_service__company'
    ).order_by('-created_at')
    
    return referrals

@router.post("/company/request/{request_id}/action", tags=["Firma Paneli"])
# Artık aksiyonu 'action: str' olarak değil, 'payload: RequestActionIn' olarak alıyoruz:
def request_action(request: HttpRequest, request_id: int, payload: RequestActionIn):
    """Firmaya gelen talebi kabul (accept) veya red (reject) eder."""
    
    user = request.auth 
    TEST_COMPANY_ID = 1 

    referral = get_object_or_404(ReferralRequest, id=request_id, target_company_id=TEST_COMPANY_ID)
    
    # Aksiyon değerine artık payload.action ile ulaşıyoruz:
    if payload.action == 'accept':
        referral.status = 'accepted'
        referral.is_commission_due = True 
        message = "Talep başarıyla kabul edildi."
    elif payload.action == 'reject':
        referral.status = 'rejected'
        message = "Talep başarıyla reddedildi."
    else:
        # Literal kullandığımız için bu else bloğuna düşmesi beklenmez, ama güvenlik için kalsın.
        return JsonResponse({"detail": "Geçersiz aksiyon."}, status=400)

    referral.save()
    
    return {"success": True, "message": message}


# =======================================================
# FİNİSALİZASYON: ROTAYI ANA API'YE EKLEME
# =======================================================

# Tüm fonksiyonlar tanımlandıktan sonra, core rotalarını /core prefix'i altına ekliyoruz.
api.add_router("/core", router)