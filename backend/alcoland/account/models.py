import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.contrib.auth.base_user import BaseUserManager
from uuid import uuid4


CITY_CHOICES = [
    ('', ''),
    ('kyiv', 'Киев'),
    ('kharkiv', 'Харьков'),
    ('odesa', 'Одесса'),
    ('dnipro', 'Днепр'),
    ('lviv', 'Львов'),
    ('zaporizhzhia', 'Запорожье'),
    ('vinnitsa', 'Винница'),
    ('mykolaiv', 'Николаев'),
    ('cherkasy', 'Черкассы'),
    ('chernihiv', 'Чернигов'),
    ('chernivtsi', 'Черновцы'),
    ('poltava', 'Полтава'),
    ('kherson', 'Херсон'),
    ('sumy', 'Сумы'),
    ('zhytomyr', 'Житомир'),
    ('ivano_frankivsk', 'Ивано-Франковск'),
    ('lutsk', 'Луцк'),
    ('ternopil', 'Тернополь'),
    ('uzhhorod', 'Ужгород'),
    ('kropyvnytskyi', 'Кропивницкий'),
    ('rivno', 'Ровно'),
    ('mariupol', 'Мариуполь'),
    ('sevastopol', 'Севастополь'),
    ('simferopol', 'Симферополь'),
]



class CustomUserManager(BaseUserManager):
    def create_user(self, email, nickname, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        if not nickname:
            raise ValueError('Nickname обязателен')

        email = self.normalize_email(email)
        user = self.model(email=email, nickname=nickname, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nickname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Суперпользователь должен иметь is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Суперпользователь должен иметь is_superuser=True.")

        return self.create_user(email, nickname, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    nickname = models.CharField(max_length=50, unique=True, verbose_name='Ник пользователя')
    email = models.EmailField(unique=True, verbose_name='Email пользователя')

    def upload_to_path(instance, filename):
        base_filename = os.path.basename(filename)  # очищает путь от вложений
        return f'avatars/user_{instance.nickname}/{base_filename}'


    image = models.ImageField(upload_to=upload_to_path, verbose_name='Аватарка пользователя',max_length=250, blank=True, null=True, validators=[FileExtensionValidator(['jpg', 'png', 'webp', 'jfif'])])

    USERNAME_FIELD = "email"  # Теперь логинимся по email
    REQUIRED_FIELDS = ["nickname"]

    objects = CustomUserManager()

    friends = models.ManyToManyField(
        'self',
        symmetrical=True,
        blank=True,
        related_name='user_friends'
    )
    # Для заявок в друзья
    ignored_requests = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="ignored_by")
    
    """Добавить друга"""
    def add_friend(self, friend):
        if friend != self and friend not in self.friends.all():
            self.friends.add(friend)

    """Удалить друга"""
    def remove_friend(self, friend):
        if friend in self.friends.all():
            self.friends.remove(friend)

    """Проверить, является ли пользователь другом"""
    def is_friend(self, friend):
        return friend in self.friends.all()


    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        blank=True
    )

    """Подписаться на пользователя"""
    def follow(self, user):
        if user != self and user not in self.following.all():
            self.following.add(user)

    """Отписаться от пользователя"""
    def unfollow(self, user):
        if user in self.following.all():
            self.following.remove(user)

    """Убрать пользователя из моих подписчиков"""
    def remove_follower(self, user):
        if self in user.following.all():
            user.following.remove(self)

    """Проверить, подписан ли текущий пользователь на другого"""
    def is_following(self, user):
        return user in self.following.all()

    """Проверить, подписан ли другой пользователь на текущего"""
    def is_followed_by(self, user):
        return user in self.followers.all()

    age = models.IntegerField(blank=True, null=True)
    city = models.CharField(
        max_length=50,
        choices=CITY_CHOICES,
        default='',
        null=True,
        blank=True,
        verbose_name='Город')
    profession = models.CharField(max_length=100, blank=True, null=True, verbose_name='Профессия')
    hobby = models.CharField(max_length=100, blank=True, null=True, verbose_name='Хобби')
    extra_info = models.TextField(blank=True, null=True, verbose_name='Побольше о себе')

    class Meta:
        verbose_name = 'Аккаунт'
        verbose_name_plural = 'Аккаунты'

    def save(self, *args, **kwargs):
        if self.image:
            img = Image.open(self.image)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            output = BytesIO()
            img.save(output, format="JPEG", quality=70)
            output.seek(0)
            # Всегда используем уникальное имя!
            ext = os.path.splitext(self.image.name)[1]
            unique_filename = f"{uuid4()}{ext}"
            self.image = ContentFile(output.read(), unique_filename)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nickname

class NewsFeed(models.Model):
    text = models.TextField(verbose_name='Текст')
    file = models.FileField(verbose_name='Файл или фото', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    profile = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name='Пользователь')

    class Meta:
        verbose_name = 'Запись новостной лента'
        verbose_name_plural = 'Записи новостной ленты'

    def __str__(self):
        return f'{self.profile} at {self.created_at}'

class NewsFeedComments(models.Model):
    text = models.TextField(verbose_name='Текст комментария')
    file = models.FileField(verbose_name='Файл или фото комментария', null=True, blank=True)
    created_at = models.DateTimeField(verbose_name='Дата создания', auto_now=True)
    profile = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name='Комментарий пользователя')
    newsfeed = models.ForeignKey(NewsFeed, on_delete=models.CASCADE, verbose_name='Чат')

    class Meta:
        verbose_name = 'Комментарий к записи в новостной лента'
        verbose_name_plural = 'Комментарии к записи в новостной лента'

    def __str__(self):
        return f'{self.profile} at {self.created_at} in new {self.newsfeed}'