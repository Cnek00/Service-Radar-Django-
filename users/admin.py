from django.contrib import admin
from .models import User, CustomerAddress

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'firm', 'is_active')
    list_filter = ('role', 'is_active', 'firm')
    search_fields = ('email', 'full_name', 'username')

@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ('city', 'street', 'phone', 'user', 'is_default', 'created_at')
    list_filter = ('city', 'is_default', 'created_at')
    search_fields = ('user__email', 'city', 'street', 'phone')
    readonly_fields = ('created_at', 'updated_at')
