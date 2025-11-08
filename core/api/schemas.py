# core/api/schemas.py
from ninja import Schema
from typing import List, Optional
from datetime import datetime
from typing import Literal

# --- MÜŞTERİ ÇIKIŞ ŞEMALARI (Veri gösterimi) ---

class CompanySchema(Schema):
    """Firma Bilgilerini Müşteriye Göstermek İçin."""
    id: int
    name: str
    slug: str
    description: str
    location_text: str

class ServiceSchema(Schema):
    """Hizmet Bilgilerini Müşteriye Göstermek İçin."""
    id: int
    title: str
    description: str
    price_range_min: Optional[float]
    price_range_max: Optional[float]
    company: CompanySchema # Ait olduğu firmanın detayları
    

# --- MÜŞTERİ GİRİŞ ŞEMALARI (Veri Alma) ---

class ReferralRequestIn(Schema):
    """Müşteriden Talep Almak İçin."""
    target_company_id: int # Hangi firmaya talep gönderiliyor
    requested_service_id: int # Hangi hizmet için talep
    customer_name: str
    customer_email: str
    description: str # Müşterinin ek notları

# --- FİRMA ÇIKIŞ ŞEMALARI (Talep Yönetimi) ---

class ReferralRequestOut(Schema):
    """Firma Panelinde Görüntülenmek Üzere Talep Bilgileri."""
    id: int
    customer_name: str
    customer_email: str
    status: str
    # BURAYI DÜZELTİYORUZ: str yerine datetime kullanıyoruz
    created_at: datetime # <-- ARTIK DATETIME OBJESİ BEKLİYORUZ
    requested_service: ServiceSchema
    commission_amount: float
    
    
class RequestActionIn(Schema):
    # Aksiyon sadece 'accept' veya 'reject' olabilir
    action: Literal["accept", "reject"]