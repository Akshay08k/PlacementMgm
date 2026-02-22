from django.urls import path
from .views import  StudentDashboardView

urlpatterns = [
    path("", StudentDashboardView.as_view(), name="dashboard-root"),
    # path("register/", RegisterView.as_view(), name="register"),
    path("student/dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
]