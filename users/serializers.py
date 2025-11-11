from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Özel JWT Token Serializer'ı. Token'a ek kullanıcı bilgilerini (claim) ekler.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Token'a özel claim'ler ekle
        token['full_name'] = user.full_name or user.username
        token['is_superuser'] = user.is_superuser
        token['is_firm_manager'] = user.is_firm_manager

        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Özel JWT Token endpoint'i. CustomTokenObtainPairSerializer'ı kullanır.
    """
    serializer_class = CustomTokenObtainPairSerializer
