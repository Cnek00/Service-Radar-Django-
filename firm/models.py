# firm/models.py

from django.db import models
import uuid

class Firm(models.Model):
    """
    Sistemdeki bir firmayı temsil eden temel model.
    """
    # Benzersiz, okunabilir bir ID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=255, unique=True, verbose_name="Firma Adı")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="URL Slug")
    location = models.CharField(max_length=100, blank=True, null=True, verbose_name="Firma Konumu")
    
    # Firmanın sistemde aktif olup olmadığı
    is_active = models.BooleanField(default=True, verbose_name="Aktif Mi?")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Firma"
        verbose_name_plural = "Firmalar"
        ordering = ['name']

    def __str__(self):
        return self.name

# Not: Firmaya ait hizmetler (Service) ve talepler (Referral)
# daha sonra buraya veya 'core' uygulamasına eklenecektir.