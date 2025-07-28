from rest_framework import serializers
from django.contrib.auth import password_validation
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, NewsFeed, NewsFeedComments

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
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = CustomUser
        exclude = ("city",)

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



class NewsFeedSerializer(serializers.ModelSerializer):
    profile_id = serializers.SerializerMethodField()

    class Meta:
        model = NewsFeed
        fields = ['id', 'profile_id', 'text', 'file', 'created_at']

    def get_profile_id(self, obj):
        return obj.profile.id

class NewsFeedCommentsSerializer(serializers.ModelSerializer):
    profile_id = serializers.ReadOnlyField(source='profile.id')
    newsfeed_id = serializers.ReadOnlyField(source='newsfeed.id')

    class Meta:
        model = NewsFeedComments
        fields = ['id', 'profile_id', 'newsfeed_id', 'text', 'created_at']

    def create(self, validated_data):
        request = self.context.get("request")
        profile = request.user  # Получаем текущего пользователя
        newsfeed_id = self.initial_data.get("newsfeed_id")  # Получаем ID из запроса
        newsfeed = NewsFeed.objects.get(id=newsfeed_id)  # Получаем объект NewsFeed
        return NewsFeedComments.objects.create(profile=profile, newsfeed=newsfeed, **validated_data)

