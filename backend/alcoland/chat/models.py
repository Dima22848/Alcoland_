from django.core.exceptions import ValidationError
from django.db import models
from account.models import CustomUser

# ЧАТ (ЛИЧНЫЙ / ГРУППОВОЙ)
class Chat(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Название чата")
    is_group = models.BooleanField(default=False, verbose_name="Групповой чат")
    participants = models.ManyToManyField(CustomUser, related_name="chats", verbose_name="Участники")
    image = models.ImageField(upload_to="chat_images/", blank=True, null=True, verbose_name="Фото чата")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="created_chats", null=True,
                                blank=True, verbose_name="Создатель")
    admins = models.ManyToManyField(CustomUser, related_name="admin_chats", blank=True, verbose_name="Администраторы")

    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"

    def get_chat_image(self, user):
        """Для групповых чатов возвращает установленное изображение,
        для личных — аватар собеседника"""
        if self.is_group:
            return self.image.url if self.image else "/media/default_chat.png"

        participants = list(self.participants.exclude(id=user.id))  # Ищем собеседника
        if participants and participants[0].image:
            return participants[0].image.url  # Возвращаем его аватар

        return "/media/default_chat.png"

    def get_chat_display_name(self):
        """Формирование корректного имени чата"""
        if self.is_group:
            return self.name or "Без названия"
        participants = list(self.participants.all())
        if len(participants) == 2:
            nicknames = [user.nickname if user.nickname else "Неизвестный" for user in participants]
            return f"{nicknames[0]} и {nicknames[1]}"
        return "Личный чат"

    def __str__(self):
        return self.get_chat_display_name()

    def clean(self):
        """Проверка перед сохранением"""
        if self.is_group and not self.name:
            raise ValidationError({"name": "Название обязательно для группового чата."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class HiddenChat(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="hidden_chats")
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE, related_name="hidden_for")
    hidden_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'chat')


# СООБЩЕНИЕ
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages', verbose_name='Чат')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name='Отправитель')
    text = models.TextField(blank=True, null=True, verbose_name='Текст сообщения')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата отправки')

    # def clean(self):
    #     # Проверяем: либо есть текст, либо есть хотя бы одно вложение
    #     # attachments — это related_name для Attachment
    #     if not self.text and not self.attachments.exists():
    #         raise ValidationError("Нельзя отправить пустое сообщение. Добавьте текст или файл.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"

class Attachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    created_at = models.DateTimeField(auto_now_add=True)