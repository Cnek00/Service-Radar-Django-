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
from .schemas import ServiceSchema, ReferralRequestIn, ReferralRequestOut, RequestActionIn, CompanySchema, CompanyUpdateIn
from .schemas import CategorySchema, ServiceCreateIn
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.utils.text import slugify

# User and Firm models for register endpoints
from users.models import User
from firm.models import Firm
from ninja import Schema
from firm.api import router as firm_management_router
from users.api.router import router as users_management_router

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
def search_services(request: HttpRequest, query: str = None, location: str = None, category: str = None):
    """Hizmetleri anahtar kelime ve konuma göre arar."""
    
    services = Service.objects.select_related('company', 'category').all()
    
    if query:
        try:
            sqs = SearchQuerySet().filter(content=query)
            service_ids = [result.pk for result in sqs]
            services = services.filter(id__in=service_ids)
        except Exception:
            # If search fails, fall back to title/description search
            services = services.filter(
                Q(title__icontains=query) | Q(description__icontains=query) | Q(keywords__icontains=query)
            )

    if location:
        services = services.filter(company__location_text__icontains=location)
    
    if category:
        # Accept either category slug or name, handle null categories gracefully
        try:
            services = services.filter(
                Q(category__slug__iexact=category) | Q(category__name__icontains=category)
            )
        except Exception:
            # If category filter fails, just skip it
            pass
        
    return services


@router.get("/services/{service_id}", response=ServiceSchema, tags=["Müşteri"], auth=None)
def get_service_detail(request: HttpRequest, service_id: int):
    """Hizmetin detay bilgilerini getirir."""
    service = get_object_or_404(Service, id=service_id)
    return service


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
# Firma - Company yönetimi (Firma yöneticileri kendi şirket bilgilerini görebilir/güncelleyebilir)
# =======================================================
@router.get('/firm/company', response=CompanySchema, tags=['Firma Paneli'])
def get_my_company(request: HttpRequest):
    user = request.auth
    if getattr(user, 'is_superuser', False):
        # Süperuser için tüm şirketleri görme endpoint'i değil, tekil kullanım
        return JsonResponse({'detail': 'Süper kullanıcı bu endpointi doğrudan kullanamaz.'}, status=400)

    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)

    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)

    return company


@router.put('/firm/company', response=CompanySchema, tags=['Firma Paneli'])
def update_my_company(request: HttpRequest, payload: 'CompanyUpdateIn'):
    user = request.auth

    # Yalnızca firma yöneticileri veya süperuser izinli
    if not getattr(user, 'is_superuser', False) and not getattr(user, 'is_firm_manager', False):
        return JsonResponse({"detail": "Bu işlem için firma yöneticisi olmanız gerekir."}, status=403)

    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)

    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)

    # Güncellenebilir alanlar
    updatable = [
        'name', 'description', 'location_text', 'phone', 'email', 'tax_number',
        'trade_registry_number', 'logo', 'cover_image', 'working_hours', 'special_days',
        'min_order_amount', 'default_delivery_fee', 'estimated_delivery_time_minutes', 'delivery_areas'
    ]

    for field in updatable:
        if hasattr(payload, field):
            setattr(company, field, getattr(payload, field))

    company.save()
    return company


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


@router.post('/firm/register', tags=['Kayıt'])
def register_firm_and_user(request: HttpRequest, payload: FirmRegisterIn):
    """Firma ve yönetici hesabı oluşturur.

    DİKKAT: Bu endpoint artık yalnızca süperuser (admin) tarafından kullanılabilir.
    Yeni kullanıcıların varsayılan rolü müşteri (customer) olacaktır; firma ve yönetici
    atamalarını Django admin üzerinden yapabilirsiniz veya bu endpoint'i admin token
    ile çağırabilirsiniz.
    """
    user = getattr(request, 'auth', None)
    if not user or not getattr(user, 'is_superuser', False):
        return JsonResponse({'detail': 'Süper kullanıcı yetkisi gereklidir.'}, status=403)

    # Basit validasyon
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

            user_obj = User.objects.create(
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
            company = Company.objects.create(
                owner=None,
                name=payload.firm_name,
                slug=slugify(payload.firm_name)[:50],
                description='',
                location_text=payload.location or ''
            )

    except Exception as e:
        return JsonResponse({'detail': f'Kayıt sırasında hata oluştu: {str(e)}'}, status=400)

    return {'success': True, 'firm_id': str(firm.id), 'user_id': user_obj.id}


# =======================================================
# ADMIN ENDPOINTLER (Süperuser gerektirir)
# =======================================================

@router.get('/firm/services', response=List[ServiceSchema], tags=['Firma Paneli - Hizmetler'])
def list_firm_services(request: HttpRequest):
    """Firma yöneticisinin kendi firmalarının hizmetlerini listeler"""
    user = request.auth
    if not user:
        return JsonResponse({'detail': 'Yetkilendirme gerekli.'}, status=401)
    
    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)
    
    # Get company by firm slug
    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)
    
    services = Service.objects.filter(company=company).select_related('company', 'category')
    return list(services)


@router.post('/firm/services', response=ServiceSchema, tags=['Firma Paneli - Hizmetler'])
def create_firm_service(request: HttpRequest, payload: ServiceCreateIn):
    """Firma yöneticisi yeni hizmet oluşturur"""
    user = request.auth
    if not user:
        return JsonResponse({'detail': 'Yetkilendirme gerekli.'}, status=401)
    
    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)
    
    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)
    
    try:
        service = Service.objects.create(
            company=company,
            title=payload.title,
            description=payload.description,
            price_range_min=payload.price_range_min,
            price_range_max=payload.price_range_max,
            category_id=payload.category,
        )
        return service
    except Exception as e:
        return JsonResponse({'detail': f'Hizmet oluşturma hatası: {str(e)}'}, status=400)


@router.get('/firm/services/{service_id}', response=ServiceSchema, tags=['Firma Paneli - Hizmetler'])
def get_firm_service(request: HttpRequest, service_id: int):
    """Firma yöneticisi kendi hizmetini görüntüler"""
    user = request.auth
    if not user:
        return JsonResponse({'detail': 'Yetkilendirme gerekli.'}, status=401)
    
    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)
    
    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)
    
    service = get_object_or_404(Service, id=service_id, company=company)
    return service


@router.put('/firm/services/{service_id}', response=ServiceSchema, tags=['Firma Paneli - Hizmetler'])
def update_firm_service(request: HttpRequest, service_id: int, payload: ServiceCreateIn):
    """Firma yöneticisi kendi hizmetini günceller"""
    user = request.auth
    if not user:
        return JsonResponse({'detail': 'Yetkilendirme gerekli.'}, status=401)
    
    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)
    
    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)
    
    service = get_object_or_404(Service, id=service_id, company=company)
    
    service.title = payload.title
    service.description = payload.description
    service.price_range_min = payload.price_range_min
    service.price_range_max = payload.price_range_max
    if payload.category:
        service.category_id = payload.category
    service.save()
    
    return service


@router.delete('/firm/services/{service_id}', tags=['Firma Paneli - Hizmetler'])
def delete_firm_service(request: HttpRequest, service_id: int):
    """Firma yöneticisi hizmetini siler"""
    user = request.auth
    if not user:
        return JsonResponse({'detail': 'Yetkilendirme gerekli.'}, status=401)
    
    user_firm = getattr(user, 'firm', None)
    if not user_firm:
        return JsonResponse({"detail": "Bu işlem için bir firmaya bağlı olmanız gerekir."}, status=403)
    
    company = Company.objects.filter(slug=user_firm.slug).first()
    if not company:
        return JsonResponse({"detail": "Firmaya ait şirket kaydı bulunamadı."}, status=404)
    
    service = get_object_or_404(Service, id=service_id, company=company)
    service.delete()
    
    return {"success": True, "message": "Hizmet başarıyla silindi."}


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

# Kullanıcı yönetim router'ını expose edelim (ör: /api/users/addresses)
api.add_router("/users", users_management_router)


# Kategori listeleme (Herkese açık)
@router.get('/categories', response=List[CategorySchema], tags=['Katalog'], auth=None)
def list_categories(request: HttpRequest):
    from core.models import Category
    return Category.objects.all().order_by('name')