from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, CustomUserViewSet, NewsFeedViewSet, NewsFeedCommentsViewSet, ChangePasswordView
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import RegisterView

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'newsfeed', NewsFeedViewSet)
router.register(r'comments', NewsFeedCommentsViewSet)

urlpatterns = router.urls

urlpatterns += [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
