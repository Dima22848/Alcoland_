"""
URL configuration for alcoland project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Импортируем роутеры из всех приложений
from account.urls import router as account_router
from main.urls import router as newsfeed_router
from chat.urls import router as chat_router
from django.conf import settings
from django.conf.urls.static import static

# Создаем общий роутер и включаем все роутеры из приложений
# main_router = DefaultRouter()
# main_router.registry.extend(account_router.registry)
# main_router.registry.extend(newsfeed_router.registry)
# main_router.registry.extend(chat_router.registry)

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/', include(main_router.urls)),  # Основной API-роутер
    path('api/', include('account.urls')),  # Добавляем маршруты из account
    path('api/', include('chat.urls')),
    path('api/', include('main.urls')),
]
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:  # Только в режиме разработки
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
