from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, MessageViewSet, FetchOrCreatePrivateChatByNicknameView
from django.urls import path

router = DefaultRouter()
router.register(r'chats', ChatViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    # Кастомный путь ДОБАВЛЯЕМ ЯВНО!
    path('chats/with-nickname/<str:nickname>/', FetchOrCreatePrivateChatByNicknameView.as_view(), name='fetch_or_create_private_chat_by_nickname'),
] + router.urls
