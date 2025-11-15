# core/admin.py
from django.contrib import admin
from .models import UserProfile, Company, Service, ReferralRequest, Category

# UserProfile modelini Admin'de göster (Kullanıcı Rolü takibi için)
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'description')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'location_text')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'category', 'price_range_min', 'price_range_max')
    list_filter = ('company', 'category')
    search_fields = ('title', 'description', 'keywords')
    raw_id_fields = ('category',)


@admin.register(ReferralRequest)
class ReferralRequestAdmin(admin.ModelAdmin):
    list_display = ('target_company', 'customer_email', 'status', 'created_at', 'is_commission_due')
    list_filter = ('status', 'target_company', 'is_commission_due')
    search_fields = ('customer_email', 'target_company__name')
    readonly_fields = ('created_at', 'updated_at')