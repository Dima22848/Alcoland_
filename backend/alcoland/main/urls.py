from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlcoholViewSet, ReviewsViewSet, OrderViewSet, PurchaseHistoryViewSet

# Создаем роутер и регистрируем ViewSet-ы
router = DefaultRouter()
router.register(r'alcohol', AlcoholViewSet, basename='alcohol')
router.register(r'reviews', ReviewsViewSet, basename='reviews')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'purchase-history', PurchaseHistoryViewSet, basename='purchase-history')

urlpatterns = [
    path('', include(router.urls)),  # Включаем маршруты, созданные роутером
]
