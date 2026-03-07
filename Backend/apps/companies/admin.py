from django.contrib import admin
from .models import CompanyProfile, Job


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "industry", "created_at"]
    search_fields = ["name", "user__email"]


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "status", "num_vacancies", "created_at"]
    list_filter = ["status"]
    search_fields = ["title", "company__name"]
