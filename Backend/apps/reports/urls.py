from django.urls import path
from .views import AdminDashboardStats, ResourceListCreateView, InstituteConfigView, InstituteConfigPublicView

urlpatterns = [
    path("admin-dashboard/", AdminDashboardStats.as_view()),
    path("resources/", ResourceListCreateView.as_view()),
    path("institute-config/", InstituteConfigView.as_view()),
    path("institute-config/public/", InstituteConfigPublicView.as_view()),
]
