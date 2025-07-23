from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Chat, Message, Attachment
from .serializers import ChatSerializer, MessageSerializer, CustomUserSerializer
from account.models import CustomUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import HiddenChat


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.prefetch_related("participants").all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        chat = serializer.save(creator=self.request.user)
        participants = self.request.data.getlist('participants')
        if not participants:
            participants = []
        # добавляем себя
        participants.append(str(self.request.user.id))
        # уникальность
        unique_ids = set(map(int, participants))
        chat.participants.set(unique_ids)
        chat.save()

    # def get_queryset(self):
    #     queryset = Chat.objects.filter(participants=self.request.user)
    #     chat_id = self.request.query_params.get("chat")
    #     if chat_id:
    #         queryset = queryset.filter(id=chat_id)
    #     return queryset

    def get_queryset(self):
        user = self.request.user
        qs = Chat.objects.filter(participants=user)
        hidden = HiddenChat.objects.filter(user=user).values_list("chat_id", flat=True)
        return qs.exclude(id__in=hidden)

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        user = request.user
        if chat.creator != user and user not in chat.admins.all():
            return Response({"error": "Только создатель или админ может редактировать чат"}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        chat = self.get_object()
        if chat.creator != request.user:
            return Response({"error": "Только создатель может удалить чат"}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def hide_for_me(self, request, pk=None):
        user = request.user
        chat = self.get_object()
        HiddenChat.objects.get_or_create(user=user, chat=chat)
        return Response({"status": "Чат скрыт"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def unhide_for_me(self, request, pk=None):
        user = request.user
        chat = self.get_object()
        HiddenChat.objects.filter(user=user, chat=chat).delete()
        return Response({"status": "Чат возвращён"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        chat = self.get_object()
        users = chat.participants.all()
        data = []
        for user in users:
            role = "creator" if user == chat.creator else "admin" if user in chat.admins.all() else "member"
            data.append({
                "id": user.id,
                "nickname": user.nickname,
                "role": role,
                "image": user.image.url if user.image else None
            })
        return Response(data)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = chat.messages.all()
        return Response(MessageSerializer(messages, many=True).data)

    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        chat = self.get_object()
        user_id = request.data.get('user_id')
        user = CustomUser.objects.get(id=user_id)
        if user not in chat.participants.all():
            chat.participants.add(user)
            return Response({"status": "Participant added"})
        return Response({"status": "User is already a participant"}, status=400)

    @action(detail=True, methods=["post"])
    def invite(self, request, pk=None):
        chat = self.get_object()
        nickname = request.data.get("nickname")
        try:
            user = CustomUser.objects.get(nickname=nickname)
        except CustomUser.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
        if user in chat.participants.all():
            return Response({"status": "Уже в чате"}, status=400)
        chat.participants.add(user)
        return Response({"status": f"{nickname} добавлен в чат"})

    @action(detail=True, methods=['post'])
    def remove_participant(self, request, pk=None):
        chat = self.get_object()
        user = request.user
        user_id = request.data.get('user_id')
        if chat.creator != user and user not in chat.admins.all():
            return Response({"error": "Нет прав удалять участников"}, status=403)
        target = CustomUser.objects.get(id=user_id)
        if target in chat.participants.all():
            chat.participants.remove(target)
            chat.admins.remove(target)
            return Response({"status": "Participant removed"})
        return Response({"status": "User is not a participant"}, status=400)

    @action(detail=True, methods=["post"])
    def make_admin(self, request, pk=None):
        chat = self.get_object()
        user = request.user
        user_id = request.data.get("user_id")
        if chat.creator != user:
            return Response({"error": "Только создатель чата может назначать админов"}, status=403)
        try:
            target = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
        if target not in chat.participants.all():
            return Response({"error": "Пользователь не в чате"}, status=400)
        chat.admins.add(target)
        return Response({"status": f"{target.nickname} назначен админом"})

    @action(detail=True, methods=["post"])
    def revoke_admin(self, request, pk=None):
        chat = self.get_object()
        user = request.user
        user_id = request.data.get("user_id")
        if chat.creator != user:
            return Response({"error": "Только создатель чата может снимать админов"}, status=403)
        try:
            target = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
        chat.admins.remove(target)
        return Response({"status": f"{target.nickname} больше не админ"})

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.select_related("chat", "sender").all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        chat_id = self.request.query_params.get('chat')
        user = self.request.user

        queryset = Message.objects.select_related("chat", "sender")

        if chat_id:
            # Показываем сообщения ТОЛЬКО если пользователь — участник
            queryset = queryset.filter(chat_id=chat_id, chat__participants=user)

        else:
            # Без параметра chat — ничего не возвращаем
            queryset = queryset.none()

        return queryset

    def perform_create(self, serializer):
        # Сохраняем сообщение
        message = serializer.save(sender=self.request.user)
        # Сохраняем вложения
        files = self.request.FILES.getlist('files')
        for file in files:
            Attachment.objects.create(message=message, file=file)

class FetchOrCreatePrivateChatByNicknameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, nickname):
        user = request.user
        try:
            target = CustomUser.objects.get(nickname=nickname)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        chat = Chat.objects.filter(is_group=False, participants=user).filter(participants=target).first()
        if not chat:
            chat = Chat.objects.create(is_group=False)
            chat.participants.add(user, target)
            chat.save()

        return Response({"chat_id": chat.id})

