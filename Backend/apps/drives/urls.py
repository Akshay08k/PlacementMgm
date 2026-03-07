from django.urls import path
from .views import DriveCreate, DriveDetail, DriveList

urlpatterns = [
    path("", DriveList.as_view()),
    path("create/", DriveCreate.as_view()),
    path("<int:pk>/", DriveDetail.as_view()),
]
