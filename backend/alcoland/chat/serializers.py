from rest_framework import serializers
from .models import Chat, Message, Attachment
from account.models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'nickname', 'image']


class ChatSerializer(serializers.ModelSerializer):
    participants = CustomUserSerializer(many=True, read_only=True)
    name = serializers.CharField(required=False)
    image = serializers.ImageField(required=False)
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    admins = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )
    display_name = serializers.SerializerMethodField()
    display_image = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    participants_info = serializers.SerializerMethodField()  # можно убрать

    class Meta:
        model = Chat
        fields = [
            'id', 'name', 'is_group', 'participants', 'creator', 'admins', 'image',
            'created_at', 'last_message', 'display_name', 'display_image', 'participants_info',
        ]

    def update(self, instance, validated_data):
        image = validated_data.pop("image", None)
        if image:
            instance.image = image
        return super().update(instance, validated_data)

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if last:
            return {
                "text": last.text,
                "sender": last.sender.nickname,
                "created_at": last.created_at
            }
        return None

    def get_display_image(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return None

        user = request.user
        if obj.is_group:
            return obj.get_chat_image(request.user)

        participants = obj.participants.exclude(id=user.id)
        if participants.exists():
            sobesednik = participants.first()
            return sobesednik.image.url if sobesednik.image else "/media/default_avatar.png"

        return "/media/default_avatar.png"

    def get_display_name(self, obj):
        if obj.is_group:
            return obj.name

        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return None

        user = request.user
        participants = obj.participants.exclude(id=user.id)

        if participants.exists():
            sobesednik = participants.first()
            return sobesednik.nickname or sobesednik.username

        return "Неизвестный собеседник"

    def get_participants_info(self, obj):
        users = obj.participants.all()
        return [
            {
                "id": user.id,
                "nickname": user.nickname,
                "avatar": user.image.url if user.image else None,
                "role": (
                    "creator" if obj.creator_id == user.id else
                    "admin" if user in obj.admins.all() else
                    "member"
                )
            }
            for user in users
        ]

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    # sender = serializers.HiddenField(default=serializers.CurrentUserDefault())
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())
    sender = CustomUserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'text', 'attachments', 'created_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

    def validate(self, data):
        request = self.context.get("request")
        files = request.FILES.getlist('files') if request else []
        if not data.get('text') and not files:
            raise serializers.ValidationError("Нельзя отправить пустое сообщение. Добавьте текст или файл.")
        return data
