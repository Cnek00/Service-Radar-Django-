# firm/schemas.py

from ninja import Schema
from typing import Optional, List

# --- ÇIKIŞ ŞEMALARI (Response) ---

class UserSchema(Schema):
    """
    Firma çalışanı listeleme/gösterme şeması
    """
    id: int
    username: str
    email: str
    full_name: str
    # Firmanın kendi içindeki yetkisi
    is_firm_manager: bool 
    # Sisteme ilk eklendiğinde belirlenen rol
    role: str 

class FirmSchema(Schema):
    """
    Kullanıcının bağlı olduğu Firma bilgileri şeması
    """
    name: str
    location: Optional[str] = None
    slug: str
    
# --- GİRİŞ ŞEMALARI (Request) ---

class FirmEmployeeCreateSchema(Schema):
    """
    Yeni Firma Çalışanı oluşturma isteği
    """
    email: str
    username: str
    full_name: str
    password: str

class FirmEmployeeUpdateSchema(Schema):
    """
    Firma Çalışanının yetkilerini güncelleme isteği
    """
    # Tek yapabildiğimiz yetkisini değiştirmek
    is_firm_manager: bool