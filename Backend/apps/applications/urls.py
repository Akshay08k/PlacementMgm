from django.urls import path
from .views import ApplicationCreate, ApplicationDetail, ApplicationList, ApplicationSelect

urlpatterns = [
    path("", ApplicationList.as_view()),
    path("apply/", ApplicationCreate.as_view()),
    path("<int:pk>/", ApplicationDetail.as_view()),
    path("<int:pk>/select/", ApplicationSelect.as_view()),
]
