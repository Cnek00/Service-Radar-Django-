# core/search_indexes.py
from haystack import indexes
from .models import Service

class ServiceIndex(indexes.SearchIndex, indexes.Indexable):
    """
    Hizmet Modelini Arama Motoru için İndeksler.
    """
    # text: Ana arama alanı. Bu alan zorunludur ve tüm metin verisini birleştirir.
    text = indexes.CharField(document=True, use_template=True)
    
    # title, description ve keywords alanlarını arama motorunda indeksle
    title = indexes.CharField(model_attr='title')
    description = indexes.CharField(model_attr='description')
    keywords = indexes.CharField(model_attr='keywords')

    # Hizmetin ait olduğu firmanın adı ile arama yapılmasını sağlar
    company_name = indexes.CharField(model_attr='company__name', indexed=True)

    # Coğrafi Arama için bu aşamada yer tutucu bırakıyoruz. (Şimdilik gerekmiyor.)
    # location_text = indexes.CharField(model_attr='company__location_text', indexed=False)

    def get_model(self):
        """Bu indeksin hangi modeli kullandığını belirtir."""
        return Service

    def index_queryset(self, using=None):
        """İndekslenecek tüm nesneleri döndürür."""
        return self.get_model().objects.all()