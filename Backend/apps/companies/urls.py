from django.urls import path
from .views import (
    CompanyDashboardStats,
    CompanyProfileDetail,
    CompanyProfileList,
    JobApproval,
    JobDetail,
    JobListCreate,
)
from .upload_views import UploadCompanyImagesView, RemoveCompanyImageView

urlpatterns = [
    path("profile/", CompanyProfileDetail.as_view()),
    path("profile/list/", CompanyProfileList.as_view()),
    path("profile/upload-images/", UploadCompanyImagesView.as_view()),
    path("profile/remove-image/", RemoveCompanyImageView.as_view()),
    path("dashboard/", CompanyDashboardStats.as_view()),
    path("jobs/", JobListCreate.as_view()),
    path("jobs/<int:pk>/", JobDetail.as_view()),
    path("jobs/<int:pk>/approve/", JobApproval.as_view()),
]
