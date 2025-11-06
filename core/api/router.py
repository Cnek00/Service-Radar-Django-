# core/api/router.py

from ninja import Router 
from typing import List, Optional
from django.shortcuts import get_object_or_404
from django.db.models import Q

from core.models import Service, Company, ReferralRequest
from .schemas import ServiceSchema, ReferralRequestIn, ReferralRequestOut 
from django.http import HttpRequest, JsonResponse
from haystack.query import SearchQuerySet # Haystack'i burada import edelim

# Router objesini tanımlayın
router = Router() 

# =======================================================
# 0. API DURUM KONTROLÜ
# =======================================================

@router.get("/status", tags=["Genel"])
def status(request):
    """API'nin çalışıp çalışmadığını kontrol eder."""
    return {"status": "ok", "message": "ServiceRadar API is running!"}


# =======================================================
# 1. MÜŞTERİ İÇİN API ENDPOINTLERİ (Keşif ve Talep)
# =======================================================

@router.get("/services/search", response=List[ServiceSchema], tags=["Müşteri Arama"])
def search_services(request: HttpRequest, query: str = None, location: str = None):
    """Hizmetleri anahtar kelime ve konuma göre arar."""
    
    # Başlangıçta tüm hizmetleri getir (Hiçbir filtre uygulanmazsa varsayılan)
    services = Service.objects.select_related('company').all()
    
    # 1. Arama Motorunu (Haystack) Kullanma
    if query:
        # Arama motorunu kullanarak ID'leri alıyoruz
        sqs = SearchQuerySet().filter(content=query)
        service_ids = [result.pk for result in sqs]
        
        # Sadece arama sonuçlarındaki ID'lere sahip Hizmetleri getir
        services = services.filter(id__in=service_ids)

    # 2. Konum Filtrelemesi
    if location:
        services = services.filter(company__location_text__icontains=location)
        
    return services.select_related('company') 

# core/api/router.py

# core/api/router.py

# ... (fonksiyonun üst kısmı)

@router.post("/referral/create", response={201: ReferralRequestOut}, tags=["Müşteri Talep"])
def create_referral_request(request: HttpRequest, payload: ReferralRequestIn):
    """Müşteri bir firmadan hizmet talebi oluşturur."""
    
    company = get_object_or_404(Company, id=payload.target_company_id)
    service = get_object_or_404(Service, id=payload.requested_service_id)
    
    referral = ReferralRequest.objects.create(
        target_company=company,
        requested_service=service,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        # description=payload.description
    )
    
    # REFERRAL OBJESİNİ VE İLİŞKİLERİNİ TEKRAR ÇEKİYORUZ (Önceki hatayı önlemek için)
    final_referral = ReferralRequest.objects.select_related(
        'requested_service', 
        'requested_service__company'
    ).get(id=referral.id)
    
    # Artık elle formatlama yapmaya gerek yok, Pydantic halledecek.
    return 201, final_referral
# =======================================================
# 2. FİRMA İÇİN API ENDPOINTLERİ (Yönetim) - YETKİLENDİRME GEREKLİ
# =======================================================

@router.get("/company/requests/pending", response=List[ReferralRequestOut], tags=["Firma Yönetim"])
def get_pending_requests(request: HttpRequest):
    """Firmaya gelen BEKLEYEN (pending) talepleri listeler."""
    
    # YETKİLENDİRME (Şimdilik boş, ileride request.user kullanılacak)
    # Eğer test için belli bir Company ID ile çalışıyorsanız:
    # return ReferralRequest.objects.filter(target_company_id=1, status='pending').order_by('-created_at')
    
    # Şimdilik güvenlik gerektirmeden boş liste dönelim ki hata vermesin
    return []

@router.post("/company/request/{request_id}/action", tags=["Firma Yönetim"])
def request_action(request: HttpRequest, request_id: int, action: str):
    """Firmaya gelen talebi kabul (accept) veya red (reject) eder."""
    
    # YETKİLENDİRME yapılır...
    
    referral = get_object_or_404(ReferralRequest, id=request_id)
    
    if action == 'accept':
        referral.status = 'accepted'
        referral.is_commission_due = True 
        message = "Talep başarıyla kabul edildi."
    elif action == 'reject':
        referral.status = 'rejected'
        message = "Talep başarıyla reddedildi."
    else:
        return JsonResponse({"detail": "Geçersiz aksiyon."}, status=400)

    referral.save()
    
    return {"success": True, "message": message}