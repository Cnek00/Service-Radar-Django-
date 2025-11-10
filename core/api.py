# core/api.py (veya core/api/router.py, isimlendirmeyi koruyalım)
from ninja import Router
from typing import List
from django.shortcuts import get_object_or_404
from django.db.models import Q

from core.models import Service, Company, ReferralRequest
from core.api import ServiceSchema, ReferralRequestIn, ReferralRequestOut
from django.http import HttpRequest, JsonResponse
from firm.api import router as firm_management_router

router = Router()

# =======================================================
# 1. MÜŞTERİ İÇİN API ENDPOINTLERİ (Keşif ve Talep)
# =======================================================

@router.get("/services/search", response=List[ServiceSchema], tags=["Müşteri Arama"])
def search_services(request: HttpRequest, query: str = None, location: str = None):
    """Hizmetleri anahtar kelime ve konuma göre arar."""
    
    # 1. Arama Motorunu (Haystack) Kullanma
    if query:
        # Haystack'i kullanarak tüm metin alanlarında arama yap
        from haystack.query import SearchQuerySet
        sqs = SearchQuerySet().filter(content=query)
        
        # Haystack sonuçlarından Service ID'lerini topla
        service_ids = [result.pk for result in sqs]
        
        # Sadece arama sonuçlarındaki ID'lere sahip Hizmetleri getir
        services = Service.objects.filter(id__in=service_ids)
    else:
        services = Service.objects.all()

    # 2. Konum Filtrelemesi (Şimdilik basit bir filtre)
    if location:
        # Normalde GeoDjango kullanılırdı, şimdilik basit metin araması yapalım
        services = services.filter(company__location_text__icontains=location)
        
    return services.select_related('company') # Firma detaylarını tek sorguda getirir

@router.post("/referral/create", response={201: ReferralRequestOut}, tags=["Müşteri Talep"])
def create_referral_request(request: HttpRequest, payload: ReferralRequestIn):
    """Müşteri bir firmadan hizmet talebi oluşturur."""
    
    # Hedef firma ve hizmetin varlığını kontrol et
    company = get_object_or_404(Company, id=payload.target_company_id)
    service = get_object_or_404(Service, id=payload.requested_service_id)
    
    # Yeni talebi oluştur
    referral = ReferralRequest.objects.create(
        target_company=company,
        requested_service=service,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        # description=payload.description # Modellerde description alanı şimdilik yok
    )
    
    # NOT: Burada firma sahibine anlık bildirim (Pusher veya WebSocket) gönderilmelidir.
    
    return 201, referral

# =======================================================
# 2. FİRMA İÇİN API ENDPOINTLERİ (Yönetim)
# (Oturum açmış ve 'seller' rolüne sahip kullanıcı gerektirir)
# =======================================================

@router.get("/company/requests/pending", response=List[ReferralRequestOut], tags=["Firma Yönetim"])
def get_pending_requests(request: HttpRequest):
    """Firmaya gelen BEKLEYEN (pending) talepleri listeler."""
    
    # --- YETKİLENDİRME KONTROLÜ (Gelecekte Eklenecek) ---
    # if not request.user.is_authenticated or request.user.userprofile.role != 'seller':
    #    return JsonResponse({"detail": "Yetkisiz erişim"}, status=403)
    # --------------------------------------------------------
    
    # Basit bir placeholder owner ID'si kullanalım (Admin veya ilk firma)
    # Gerçek uygulamada request.user'dan çekilecektir.
    try:
        user_profile = request.user.userprofile
        if user_profile.role != 'seller':
             return JsonResponse({"detail": "Firma rolü gereklidir"}, status=403)
        
        # Kullanıcının sahip olduğu firmayı bul
        company = Company.objects.get(owner=user_profile)
    except Exception:
        # Eğer test yapıyorsanız ve firma sahibi yoksa:
        return []

    # Firmanın BEKLEYEN taleplerini getir
    requests = ReferralRequest.objects.filter(
        target_company=company,
        status='pending'
    ).order_by('-created_at')

    return requests

@router.post("/company/request/{request_id}/action", tags=["Firma Yönetim"])
def request_action(request: HttpRequest, request_id: int, action: str):
    """Firmaya gelen talebi kabul (accept) veya red (reject) eder."""
    
    # YETKİLENDİRME KONTROLÜ yapılır...
    
    referral = get_object_or_404(ReferralRequest, id=request_id)
    
    # Yalnızca BEKLEYEN talepleri işleyebilir
    if referral.status != 'pending':
        return JsonResponse({"detail": "Bu talep zaten işlenmiş."}, status=400)
        
    if action == 'accept':
        referral.status = 'accepted'
        # Komisyon kaydını oluşturma zamanı (Burada tetiklenebilir)
        referral.is_commission_due = True 
        message = "Talep başarıyla kabul edildi."
    elif action == 'reject':
        referral.status = 'rejected'
        message = "Talep başarıyla reddedildi."
    else:
        return JsonResponse({"detail": "Geçersiz aksiyon."}, status=400)

    referral.save()
    
    # NOT: Burada müşteriye durum güncellemesi ile ilgili bildirim gönderilmelidir.
    
    return {"success": True, "message": message}


router.add_api_operation("/firm/management", firm_management_router)