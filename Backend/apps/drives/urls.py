from django.urls import path
from .views import DriveCreate, DriveDetail, DriveList, DriveApplicationList, DriveApplicationAttendanceUpdate, DriveApproval

urlpatterns = [
    path("", DriveList.as_view()),
    path("create/", DriveCreate.as_view()),
    path("<int:pk>/", DriveDetail.as_view()),
    path("<int:pk>/approve/", DriveApproval.as_view()),
    path("<int:pk>/applications/", DriveApplicationList.as_view()),
    path("<int:pk>/applications/<int:app_id>/attendance/", DriveApplicationAttendanceUpdate.as_view()),
]
