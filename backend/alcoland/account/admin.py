from django.contrib import admin

from django.contrib import admin
from .models import CustomUser, NewsFeed, NewsFeedComments


# ========================= Админка для CustomUser ========================= #
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("nickname", "email", "city", "profession", "age", "image")
    list_filter = ("city", "profession", "age")
    search_fields = ("nickname", "email", "profession")
    filter_horizontal = ("friends", "following")  # Удобный выбор друзей и подписок
    fieldsets = (
        ("Основная информация", {
            "fields": ("nickname", "email", "password", "age", "city", "profession", "hobby", "extra_info", "image")
        }),
        ("Друзья и Подписки", {
            "fields": ("friends", "following")
        }),
        ("Права доступа", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Важные даты", {
            "fields": ("last_login", "date_joined")
        }),
    )

# ========================= Админка для NewsFeed ========================= #
@admin.register(NewsFeed)
class NewsFeedAdmin(admin.ModelAdmin):
    list_display = ("profile", "created_at", "text")
    list_filter = ("created_at", "profile")
    search_fields = ("profile__nickname", "text")
    readonly_fields = ("created_at",)  # Поле "Дата создания" только для чтения

# ========================= Админка для NewsFeedComments ========================= #
@admin.register(NewsFeedComments)
class NewsFeedCommentsAdmin(admin.ModelAdmin):
    list_display = ("profile", "newsfeed", "created_at", "text")
    list_filter = ("created_at", "profile", "newsfeed")
    search_fields = ("profile__nickname", "newsfeed__text", "text")
    readonly_fields = ("created_at",)


