from django.urls import path
from .views import (
    CompanyDashboardStats,
    CompanyProfileDetail,
    CompanyProfileList,
    JobApproval,
    JobDetail,
    JobListCreate,
)

urlpatterns = [
    path("profile/", CompanyProfileDetail.as_view()),
    path("profile/list/", CompanyProfileList.as_view()),
    path("dashboard/", CompanyDashboardStats.as_view()),
    path("jobs/", JobListCreate.as_view()),
    path("jobs/<int:pk>/", JobDetail.as_view()),
    path("jobs/<int:pk>/approve/", JobApproval.as_view()),
]
