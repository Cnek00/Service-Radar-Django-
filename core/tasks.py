# core/tasks.py
from datetime import timedelta
from django.utils import timezone
from core.models import ReferralRequest
from django.db.models import Q # Karmaşık sorgular için

def check_referral_timeout():
    """
    36 saatten fazla beklemede olan talepleri zaman aşımına uğratır (Timeout).
    Bu fonksiyon, Q-Cluster tarafından periyodik olarak çağrılacaktır.
    """
    thirty_six_hours_ago = timezone.now() - timedelta(hours=36)
    
    # 36 saati geçmiş ve hala 'pending' (beklemede) durumundaki talepleri bul
    requests_to_timeout = ReferralRequest.objects.filter(
        status='pending',
        created_at__lt=thirty_six_hours_ago # created_at, 36 saat öncesinden küçük (yani daha eski)
    )

    count = requests_to_timeout.count()
    
    if count > 0:
        # Durumu 'timeout' olarak güncelle
        requests_to_timeout.update(status='timeout', updated_at=timezone.now())
        print(f"[{timezone.now().isoformat()}] {count} adet talep 36 saat kuralından dolayı zaman aşımına uğratıldı.")
    else:
        print(f"[{timezone.now().isoformat()}] Zaman aşımına uğrayan talep bulunamadı.")
        
    # Geriye dönük komisyon kayıtlarını da kontrol edebiliriz (İsteğe bağlı ek özellik)
    # create_commission_records() 

    # Django-Q ile başarılı görev dönüşü
    return f"Timeout kontrolü tamamlandı. {count} talep güncellendi."


# Örn: Haftalık Komisyon Raporu oluşturma taslağı
def generate_weekly_commission_report():
    """
    Haftalık komisyon raporunu oluşturur ve ilgili firmalara e-posta gönderir (şimdilik sadece loglar).
    """
    # ... Bu kısım kompleks sorgu ve raporlama mantığını içerir ...
    print(f"[{timezone.now().isoformat()}] Haftalık komisyon raporu oluşturma görevi çalıştı.")
    return "Haftalık raporlama tamamlandı."