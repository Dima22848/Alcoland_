from django.contrib import admin
from .models import Chat, Message, Attachment

# --- Вложения будут отображаться внутри сообщения в админке ---
class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ("file", "created_at", "preview")

    def preview(self, obj):
        if obj.file:
            if obj.file.url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp')):
                return f'<img src="{obj.file.url}" width="80" style="border-radius: 7px" />'
            elif obj.file.url.lower().endswith(('.mp4', '.webm', '.ogg')):
                return f'<video src="{obj.file.url}" width="120" height="70" controls />'
            else:
                return f'<a href="{obj.file.url}" target="_blank">Файл</a>'
        return "Нет файла"
    preview.short_description = "Превью"
    preview.allow_tags = True

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("chat", "sender", "text_preview", "created_at")
    list_filter = ("created_at", "chat")
    search_fields = ("sender__username", "text")
    readonly_fields = ("created_at",)
    inlines = [AttachmentInline]

    def text_preview(self, obj):
        """Отображает только первые 30 символов сообщения или 'Файл'"""
        return obj.text[:30] if obj.text else "Файл"
    text_preview.short_description = "Сообщение"

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("get_chat_name", "is_group", "created_at", "get_image_preview")
    list_filter = ("is_group", "created_at")
    search_fields = ("name", "participants__nickname")
    filter_horizontal = ("participants",)
    readonly_fields = ("created_at", "image")

    def get_chat_name(self, obj):
        """Корректное отображение имени чата в админке"""
        return obj.get_chat_display_name()
    get_chat_name.short_description = "Название чата"

    def get_image_preview(self, obj):
        """Отображение аватара в админке"""
        if obj.image:
            return f'<img src="{obj.image.url}" width="50" height="50" style="border-radius: 50%;" />'
        return "Нет фото"
    get_image_preview.short_description = "Фото"
    get_image_preview.allow_tags = True

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "file", "created_at")
    readonly_fields = ("created_at",)








# from django.contrib import admin
# from .models import Chat, Message
#
# @admin.register(Chat)
# class ChatAdmin(admin.ModelAdmin):
#     list_display = ("get_chat_name", "is_group", "created_at", "get_image_preview")
#     list_filter = ("is_group", "created_at")
#     search_fields = ("name", "participants__nickname")
#     filter_horizontal = ("participants",)
#     readonly_fields = ("created_at", "image")
#
#     def get_chat_name(self, obj):
#         """Корректное отображение имени чата в админке"""
#         return obj.get_chat_display_name()
#
#
#     def get_image_preview(self, obj):
#         """Отображение аватара в админке"""
#         if obj.image:
#             return f'<img src="{obj.image.url}" width="50" height="50" style="border-radius: 50%;" />'
#         return "Нет фото"
#
#     get_chat_name.short_description = "Название чата"
#     get_image_preview.short_description = "Фото"
#     get_image_preview.allow_tags = True
#
# @admin.register(Message)
# class MessageAdmin(admin.ModelAdmin):
#     list_display = ("chat", "sender", "text_preview", "created_at")
#     list_filter = ("created_at", "chat")
#     search_fields = ("sender__username", "text")
#     readonly_fields = ("created_at",)
#
#     def text_preview(self, obj):
#         """Отображает только первые 30 символов сообщения или 'Файл'"""
#         return obj.text[:30] if obj.text else "Файл"
#
#     text_preview.short_description = "Сообщение"


