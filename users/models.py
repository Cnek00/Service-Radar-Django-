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