from rest_framework import serializers
from django.contrib.auth import password_validation
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, NewsFeed, NewsFeedComments,  CITY_CHOICES

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['nickname'] = user.nickname  # Добавляем nickname в токен
        return token

    def validate(self, attrs):
        email = attrs.get("email")  # Логинимся по email
        password = attrs.get("password")

        user = CustomUser.objects.filter(email=email).first()  # Проверяем пользователя по email
        if user and user.check_password(password):
            return super().validate(attrs)  # Отдаем токен
        raise serializers.ValidationError("Неверный email или пароль")


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    friends = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True, required=False)
    following = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True, required=False)
    followers = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True, required=False)
    nickname = serializers.CharField(required=False, allow_blank=True)
    city_display = serializers.CharField(source="get_city_display", read_only=True)
    ignored_requests = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    image = serializers.ImageField(required=False)
    city = serializers.ChoiceField(choices=CITY_CHOICES, required=False, allow_blank=True)
    favorite_alcohol = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = "__all__"

    def create(self, validated_data):
        email = validated_data.get('email')
        password = validated_data.pop('password')

        if email and 'nickname' not in validated_data:
            validated_data['nickname'] = email.split('@')[0]

        validated_data.pop('friends', None)
        validated_data.pop('followers', None)
        validated_data.pop('following', None)

        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        # 🛡️ Защита от повторной обработки upload_to
        image = validated_data.get("image", None)
        if image and not hasattr(image, 'file'):
            # Это не файл, а строка (старый путь) — удаляем
            validated_data.pop("image")

        # 👇 Обновление полей, кроме связей
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class NewsFeedCommentsSerializer(serializers.ModelSerializer):
    profile_id = serializers.ReadOnlyField(source="profile.id")
    newsfeed_id = serializers.ReadOnlyField(source="newsfeed.id")

    is_liked_by_me = serializers.SerializerMethodField()
    is_disliked_by_me = serializers.SerializerMethodField()

    likes_count = serializers.IntegerField(read_only=True)
    dislikes_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = NewsFeedComments
        fields = [
            "id",
            "profile_id",
            "newsfeed_id",
            "text",
            "created_at",
            "likes_count",
            "dislikes_count",
            "is_liked_by_me",
            "is_disliked_by_me",
        ]

    def get_is_liked_by_me(self, obj):
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        return obj.reactions.filter(user=user, reaction="like").exists()

    def get_is_disliked_by_me(self, obj):
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        return obj.reactions.filter(user=user, reaction="dislike").exists()

    def create(self, validated_data):
        request = self.context.get("request")
        profile = getattr(request.user, "profile", request.user)  # фикс: если у тебя есть Profile
        newsfeed_id = self.initial_data.get("newsfeed_id")
        newsfeed = NewsFeed.objects.get(id=newsfeed_id)
        return NewsFeedComments.objects.create(profile=profile, newsfeed=newsfeed, **validated_data)


class NewsFeedSerializer(serializers.ModelSerializer):
    profile_id = serializers.ReadOnlyField(source="profile.id")

    is_liked_by_me = serializers.SerializerMethodField()
    is_disliked_by_me = serializers.SerializerMethodField()

    likes_count = serializers.IntegerField(read_only=True)
    dislikes_count = serializers.IntegerField(read_only=True)

    # 👇 добавляем связанные комментарии
    comments = NewsFeedCommentsSerializer(
        many=True,
        read_only=True,
        source="newsfeedcomments_set"  # если в модели нет related_name
    )

    class Meta:
        model = NewsFeed
        fields = [
            "id",
            "profile_id",
            "text",
            "file",
            "created_at",
            "likes_count",
            "dislikes_count",
            "is_liked_by_me",
            "is_disliked_by_me",
            "comments",  # обязательно включаем
        ]

    def get_is_liked_by_me(self, obj):
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        return obj.reactions.filter(user=user, reaction="like").exists()

    def get_is_disliked_by_me(self, obj):
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        return obj.reactions.filter(user=user, reaction="dislike").exists()

    def create(self, validated_data):
        request = self.context.get("request")
        profile = getattr(request.user, "profile", request.user)  # фикс
        return NewsFeed.objects.create(profile=profile, **validated_data)