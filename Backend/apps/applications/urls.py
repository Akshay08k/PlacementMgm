from django.urls import path
from .views import (
    ApplicationAdvanceRound,
    ApplicationCreate,
    ApplicationDetail,
    ApplicationList,
    ApplicationReject,
    ApplicationSelect,
    ApplicationShortlist,
)

urlpatterns = [
    path("", ApplicationList.as_view()),
    path("apply/", ApplicationCreate.as_view()),
    path("<int:pk>/", ApplicationDetail.as_view()),
    path("<int:pk>/select/", ApplicationSelect.as_view()),
    path("<int:pk>/shortlist/", ApplicationShortlist.as_view()),
    path("<int:pk>/reject/", ApplicationReject.as_view()),
    path("<int:pk>/advance-round/", ApplicationAdvanceRound.as_view()),
]
