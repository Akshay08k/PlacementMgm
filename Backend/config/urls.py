from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/companies/', include('apps.companies.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/drives/', include('apps.drives.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/reports/', include('apps.reports.urls')),
]
