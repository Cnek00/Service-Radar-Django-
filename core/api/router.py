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
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.utils.text import slugify

# User and Firm models for register endpoints
from users.models import User
from firm.models import Firm
from ninja import Schema
from firm.api import router as firm_management_router

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

    # Eğer kullanıcı süperuser ise tüm talepleri görsün (admin için)
    if getattr(user, 'is_superuser', False):
        referrals = ReferralRequest.objects.select_related(
            'requested_service',
            'requested_service__company'
        ).order_by('-created_at')
        return referrals

    # Kullanıcının firması üzerinden filtreleme yap (kullanıcı firmaya bağlı değilse erişim yok)
    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)
    # Resolve the corresponding Company for this Firm (we create a Company at firm registration).
    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)

    referrals = ReferralRequest.objects.filter(target_company=company).select_related(
        'requested_service',
        'requested_service__company'
    ).order_by('-created_at')
    
    return referrals

@router.post("/company/request/{request_id}/action", tags=["Firma Paneli"])
# Artık aksiyonu 'action: str' olarak değil, 'payload: RequestActionIn' olarak alıyoruz:
def request_action(request: HttpRequest, request_id: int, payload: RequestActionIn):
    """Firmaya gelen talebi kabul (accept) veya red (reject) eder."""

    user = request.auth

    # Get the referral; raise 404 if not found
    referral = get_object_or_404(ReferralRequest, id=request_id)

    # Eğer kullanıcı süperuser ise izin ver
    if getattr(user, 'is_superuser', False):
        allowed = True
    else:
        # Kullanıcının firması ile talebin hedef firması eşleşmeli
        user_firm = getattr(user, 'firm', None)
        if not user_firm:
            return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)

        company = Company.objects.filter(slug=user_firm.slug).first()
        if not company:
            return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)

        allowed = (referral.target_company_id == company.id)

    if not allowed:
        return JsonResponse({"detail": "Bu talep üzerinde işlem yapma yetkiniz yok."}, status=403)

    # Aksiyon değerine artık payload.action ile ulaşıyoruz:
    if payload.action == 'accept':
        if referral.status != 'pending':
            return JsonResponse({"detail": "Bu talep zaten işlenmiş."}, status=400)
        referral.status = 'accepted'
        referral.is_commission_due = True
        message = "Talep başarıyla kabul edildi."
    elif payload.action == 'reject':
        if referral.status != 'pending':
            return JsonResponse({"detail": "Bu talep zaten işlenmiş."}, status=400)
        referral.status = 'rejected'
        message = "Talep başarıyla reddedildi."
    else:
        return JsonResponse({"detail": "Geçersiz aksiyon."}, status=400)

    referral.save()

    return {"success": True, "message": message}


# =======================================================
# KULLANICI / FİRMA KAYIT ENDPOINTLERİ (PUBLIC)
# =======================================================


class UserRegisterIn(Schema):
    username: str
    email: str
    full_name: str
    password: str
    is_firm: bool = False


@router.post('/users/register', tags=['Kayıt'], auth=None)
def register_user(request: HttpRequest, payload: UserRegisterIn):
    """Basit müşteri kullanıcı kaydı. Eğer is_firm True ise firma kaydı için farklı endpoint kullanın."""
    # Basit validasyon
    if User.objects.filter(username=payload.username).exists() or User.objects.filter(email=payload.email).exists():
        return JsonResponse({'detail': 'Kullanıcı adı veya e-posta zaten kullanımda.'}, status=400)

    user = User.objects.create(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        password=make_password(payload.password),
        role='customer',
        is_active=True
    )

    return {'success': True, 'id': user.id}


class FirmRegisterIn(Schema):
    # Yönetici bilgileri
    username: str
    email: str
    full_name: str
    password: str

    # Firma bilgileri
    firm_name: str
    tax_number: str = ''
    legal_address: str = ''
    phone_number: str = ''
    location: str = ''
    working_hours: str = ''
    iban: str = ''


@router.post('/firm/register', tags=['Kayıt'], auth=None)
def register_firm_and_user(request: HttpRequest, payload: FirmRegisterIn):
    """Firma ve yönetici hesabı oluşturur. Basit, tek transaction içinde."""
    if User.objects.filter(username=payload.username).exists() or User.objects.filter(email=payload.email).exists():
        return JsonResponse({'detail': 'Kullanıcı adı veya e-posta zaten kullanımda.'}, status=400)

    # Firma adı uniqueness kontrolü
    if Firm.objects.filter(name=payload.firm_name).exists():
        return JsonResponse({'detail': 'Bu firma adı zaten kayıtlı.'}, status=400)

    try:
        with transaction.atomic():
            firm = Firm.objects.create(
                name=payload.firm_name,
                slug=slugify(payload.firm_name)[:50],
                location=payload.location,
                is_active=True
            )

            user = User.objects.create(
                username=payload.username,
                email=payload.email,
                full_name=payload.full_name,
                password=make_password(payload.password),
                role='firm_manager',
                is_active=True,
                firm=firm,
                is_firm_manager=True,
            )

            # Ayrıca core.Company objesini de oluşturalım ve firmaya eşleştirelim.
            # owner alanı nullable yaptığımız için burada None bırakıyoruz.
            company = Company.objects.create(
                owner=None,
                name=payload.firm_name,
                slug=slugify(payload.firm_name)[:50],
                description='',
                location_text=payload.location or ''
            )

    except Exception as e:
        return JsonResponse({'detail': f'Kayıt sırasında hata oluştu: {str(e)}'}, status=400)

    return {'success': True, 'firm_id': str(firm.id), 'user_id': user.id}


# =======================================================
# ADMIN ENDPOINTLER (Süperuser gerektirir)
# =======================================================


@router.get('/admin/referrals', tags=['Admin'])
def admin_all_referrals(request: HttpRequest):
    user = request.auth
    if not getattr(user, 'is_superuser', False):
        return JsonResponse({'detail': 'Süper kullanıcı yetkisi gereklidir.'}, status=403)

    referrals = ReferralRequest.objects.select_related('requested_service', 'requested_service__company').order_by('-created_at')
    return referrals


# =======================================================
# FİNİSALİZASYON: ROTAYI ANA API'YE EKLEME
# =======================================================

# Tüm fonksiyonlar tanımlandıktan sonra, core rotalarını /core prefix'i altına ekliyoruz.
api.add_router("/core", router)

# Firma yönetim router'ını core altında expose edelim (ör: /api/core/firm/management/...)
api.add_router("/core/firm/management", firm_management_router)