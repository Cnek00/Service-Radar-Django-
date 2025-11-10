# core/models.py
from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet
import os

# Ayarlardan Fernet Anahtarını çekin
# DİKKAT: settings.py dosyasında FERNET_KEY tanımladığınızdan emin olun!
FERNET = Fernet(settings.FERNET_KEY.encode('utf-8'))

# Rol Tabanlı Kullanıcı Modeli (Gelecekteki Yetkilendirme için)
class UserProfile(models.Model):
    # Django'nun varsayılan User modeli ile bire bir ilişki
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Kullanıcı Rolü (Firma, Müşteri, Admin)
    ROLE_CHOICES = [
        ('customer', 'Müşteri'),
        ('seller', 'Firma/Satıcı'),
        ('admin', 'Yönetici'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    
    def __str__(self):
        return f"{self.user.email} - {self.get_role_display()}"


# 1. Firma/İşletme Modeli (Hassas Veri Şifreleme İçerir)
class Company(models.Model):
    # Bir Firma, bir "seller" (satıcı) rolüne sahip UserProfile ile ilişkilidir
    # Owner may be missing for Companies created programmatically during firm registration.
    owner = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        limit_choices_to={'role': 'seller'},
        null=True,
        blank=True,
    )
    
    name = models.CharField(max_length=255, verbose_name="Firma Adı")
    slug = models.SlugField(unique=True, help_text="URL için küçük harf ve tire ile ayrılmış isim")
    description = models.TextField(verbose_name="Hizmet Açıklaması")
    location_text = models.CharField(max_length=255, verbose_name="Adres / Konum") # Coğrafi arama için başlangıç

    # Hassas Veri Alanı (Şifreli tutulacak)
    # Örn: Ödeme entegrasyon anahtarları, banka hesap bilgileri
    encrypted_sensitive_data = models.TextField(
        blank=True, null=True, 
        verbose_name="Şifreli Hassas Veri"
    )

    # Kolay Şifreleme/Şifre Çözme için Property
    def set_sensitive_data(self, raw_data):
        """Veriyi şifreleyip kaydeder."""
        if raw_data:
            encoded_data = raw_data.encode('utf-8')
            self.encrypted_sensitive_data = FERNET.encrypt(encoded_data).decode('utf-8')
        else:
            self.encrypted_sensitive_data = None

    def get_sensitive_data(self):
        """Şifreli veriyi çözüp döndürür."""
        if self.encrypted_sensitive_data:
            try:
                decoded_data = self.encrypted_sensitive_data.encode('utf-8')
                return FERNET.decrypt(decoded_data).decode('utf-8')
            except Exception as e:
                # Şifre çözme hatası (Örn: anahtar değişti)
                return f"[DECRYPT_ERROR: {e}]"
        return None
    
    # Python Property olarak tanımlama
    sensitive_data = property(get_sensitive_data, set_sensitive_data)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Firma/İşletme"
        verbose_name_plural = "Firmalar/İşletmeler"


# 2. Hizmet Modeli (Firma'nın sunduğu hizmetler)
class Service(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=255, verbose_name="Hizmet Başlığı")
    description = models.TextField(verbose_name="Hizmet Detayı")
    
    # Haystack/Arama için anahtar kelimeler/etiketler
    keywords = models.CharField(max_length=500, blank=True, verbose_name="Arama Anahtar Kelimeleri (Virgülle Ayrılmış)") 

    price_range_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Min. Fiyat")
    price_range_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Max. Fiyat")

    def __str__(self):
        return f"{self.company.name} - {self.title}"

    class Meta:
        verbose_name = "Hizmet"
        verbose_name_plural = "Hizmetler"

# 3. Yönlendirme Talebi Modeli (Komisyon ve Talep Takibi)
class ReferralRequest(models.Model):
    # İstemci tarafı (Müşteri)
    customer_email = models.EmailField(verbose_name="Müşteri E-Postası")
    customer_name = models.CharField(max_length=100, verbose_name="Müşteri Adı")
    
    # Hizmet sağlayıcı tarafı (Firma)
    target_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='received_requests')
    requested_service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, verbose_name="Talep Edilen Hizmet")

    # Talep Durumu (36 Saat Kuralı)
    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('accepted', 'Kabul Edildi'),
        ('rejected', 'Reddedildi'),
        ('timeout', 'Zaman Aşımı'), # 36 saat kuralı için
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Komisyon Takibi
    is_commission_due = models.BooleanField(default=False, verbose_name="Komisyon Kaydı Oluşturuldu mu?")
    commission_amount = models.DecimalField(max_digits=5, decimal_places=2, default=75.00, verbose_name="Kesilen Komisyon Tutarı")
    
    def __str__(self):
        return f"Talep: {self.customer_email} -> {self.target_company.name} ({self.status})"

    class Meta:
        verbose_name = "Yönlendirme Talebi"
        verbose_name_plural = "Yönlendirme Talepleri"