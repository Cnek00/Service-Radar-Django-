from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CustomerAddressIn(BaseModel):
    """
    Adres oluşturma/güncelleme için giriş schema'sı
    """
    full_address: str
    street: str
    district: str
    city: str
    postal_code: str
    phone: str
    is_default: Optional[bool] = False


class CustomerAddressOut(BaseModel):
    """
    Adres çıkış schema'sı
    """
    id: int
    full_address: str
    street: str
    district: str
    city: str
    postal_code: str
    phone: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
