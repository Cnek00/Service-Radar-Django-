# users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from firm.models import Firm # YENİ OLUŞTURDUĞUMUZ FİRM MODELİNİ İMPORT ET

class User(AbstractUser):
    """
    Özel Kullanıcı Modelimiz.
    Django'nun varsayılan kullanıcı modelini genişletir.
    """
    
    # Kullanıcının hangi firmaya bağlı olduğunu gösteren kritik alan
    # Adminler (is_superuser=True) bir firmaya bağlı olmayabilir, o yüzden null=True
    firm = models.ForeignKey(
        Firm, 
        on_delete=models.CASCADE, 
        related_name='employees', 
        null=True, 
        blank=True,
        verbose_name="Bağlı Firma"
    )

    # Firmanın kendi içinde yönetici yetkisi (Sistem Admini değil)
    is_firm_manager = models.BooleanField(
        default=False, 
        verbose_name="Firma Yöneticisi mi?"
    )

    # Kullanıcının tam adı (firstname ve lastname yerine kullanılabilir)
    full_name = models.CharField(max_length=255, blank=True, verbose_name="Tam Ad")
    
    # Kullanıcı kaydolduktan sonraki ek işlemler için bu alanı kullanabiliriz.
    # Örneğin: 'manager' bir kullanıcı 'employee' olarak rol alır.
    role = models.CharField(max_length=50, default='customer', choices=[
        ('customer', 'Müşteri'),
        ('firm_employee', 'Firma Çalışanı'),
        ('firm_manager', 'Firma Yöneticisi'),
        ('admin', 'Süper Admin')
    ])

    class Meta:
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"
        
    # Python'un varsayılan User modelinin üzerine yazıldığı için 
    # __str__ metodunu kullanıyoruz
    def __str__(self):
        return self.email or self.username


class CustomerAddress(models.Model):
    """
    Müşteri adres modeli.
    Her müşteri birden fazla adres kaydedebilir (ev, iş, vb.).
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses',
        verbose_name="Kullanıcı"
    )
    
    full_address = models.CharField(
        max_length=500,
        verbose_name="Tam Adres"
    )
    
    street = models.CharField(
        max_length=255,
        verbose_name="Sokak/Cadde"
    )
    
    district = models.CharField(
        max_length=100,
        verbose_name="İlçe"
    )
    
    city = models.CharField(
        max_length=100,
        verbose_name="Şehir"
    )
    
    postal_code = models.CharField(
        max_length=10,
        verbose_name="Posta Kodu"
    )
    
    phone = models.CharField(
        max_length=20,
        verbose_name="Telefon"
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name="Varsayılan Adres"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Oluşturma Tarihi"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Güncelleme Tarihi"
    )
    
    class Meta:
        verbose_name = "Müşteri Adresi"
        verbose_name_plural = "Müşteri Adresleri"
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.city} - {self.street} ({self.user.email})"