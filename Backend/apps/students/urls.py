from django.urls import path
from .views import (
    CourseListCreate,
    DepartmentListCreate,
    StudentExcelImport,
    StudentBanAPIView,
    StudentProfileDetail,
    StudentProfileList,
    StudentProfileMe,
    TriggerStudentVerificationEmails,
)
from .upload_views import GenerateResumePDFView, UploadResumeView

urlpatterns = [
    path("departments/", DepartmentListCreate.as_view()),
    path("courses/", CourseListCreate.as_view()),
    path("", StudentProfileList.as_view()),
    path("import-excel/", StudentExcelImport.as_view()),
    path("trigger-verification-emails/", TriggerStudentVerificationEmails.as_view()),
    path("me/", StudentProfileMe.as_view(), name="student-me"),
    path("upload-resume/", UploadResumeView.as_view()),
    path("generate-resume-pdf/", GenerateResumePDFView.as_view()),
    path("<int:pk>/", StudentProfileDetail.as_view()),
    path("<int:pk>/ban/", StudentBanAPIView.as_view()),
]
