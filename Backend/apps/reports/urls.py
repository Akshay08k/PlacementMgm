from django.urls import path
from .views import AdminDashboardStats, ResourceListCreateView, InstituteConfigView

urlpatterns = [
    path("admin-dashboard/", AdminDashboardStats.as_view()),
    path("resources/", ResourceListCreateView.as_view()),
    path("institute-config/", InstituteConfigView.as_view()),
]
