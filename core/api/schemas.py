# core/api/schemas.py
from ninja import Schema
from typing import List, Optional
from datetime import datetime
from typing import Literal

# Genel hata şeması: API hata cevaplarında ortak olarak kullanılır
class ErrorSchema(Schema):
    detail: str

# --- MÜŞTERİ ÇIKIŞ ŞEMALARI (Veri gösterimi) ---

class CompanySchema(Schema):
    """Firma Bilgilerini Müşteriye Göstermek İçin."""
    id: int
    name: str
    slug: str
    description: str
    location_text: str
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_number: Optional[str] = None
    trade_registry_number: Optional[str] = None
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    min_order_amount: Optional[float] = None
    default_delivery_fee: Optional[float] = None
    estimated_delivery_time_minutes: Optional[int] = None

class ServiceSchema(Schema):
    """Hizmet Bilgilerini Müşteriye Göstermek İçin."""
    id: int
    title: str
    description: str
    price_range_min: Optional[float]
    price_range_max: Optional[float]
    company: CompanySchema # Ait olduğu firmanın detayları
    category: Optional['CategorySchema'] = None
    

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
    
    # users/schemas.py (veya API şemalarınızın bulunduğu dosya)

from ninja import Schema
# ... diğer import'lar ...

class TokenSchema(Schema):
    # Mevcut alanlar
    access: str
    refresh: str
    
    # YENİ KRİTİK ALAN
    is_superuser: bool


class CompanyUpdateIn(Schema):
    name: Optional[str]
    description: Optional[str]
    location_text: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    tax_number: Optional[str]
    trade_registry_number: Optional[str]
    logo: Optional[str]
    cover_image: Optional[str]
    working_hours: Optional[dict]
    special_days: Optional[dict]
    min_order_amount: Optional[float]
    default_delivery_fee: Optional[float]
    estimated_delivery_time_minutes: Optional[int]
    delivery_areas: Optional[dict]


class CategorySchema(Schema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None


class ServiceCreateIn(Schema):
    """Firma tarafından hizmet oluştururken kullanılır."""
    title: str
    description: str
    price_range_min: float
    price_range_max: float
    category: Optional[int] = None  # Category ID