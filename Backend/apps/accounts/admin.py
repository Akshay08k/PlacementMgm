from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "role", "is_staff", "is_active"]
    list_filter = ["role", "is_staff"]
    search_fields = ["email", "username"]
    ordering = ["email"]
    fieldsets = BaseUserAdmin.fieldsets + ((None, {"fields": ("role",)}),)
