from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer, ChangePasswordSerializer
from rest_framework.decorators import api_view, permission_classes

from .models import CustomUser, NewsFeed, NewsFeedComments, NewsFeedReaction, CommentReaction
from .serializers import CustomUserSerializer, NewsFeedSerializer, NewsFeedCommentsSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(CustomUserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        user = request.user

        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({'old_password': 'Старый пароль неверен.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'status': 'Пароль успешно изменён'})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    # permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        serializer.is_valid(raise_exception=True)

        # Защита: если image — это строка, удаляем
        image = request.FILES.get("image", None)
        if not image and "image" in serializer.validated_data:
            serializer.validated_data.pop("image")

        self.perform_update(serializer)

        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def friends(self, request, pk=None):
        user = self.get_object()
        friends = user.friends.all()
        serializer = CustomUserSerializer(friends, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_friend(self, request, pk=None):
        """Добавление в друзья (взаимная дружба)"""
        user = request.user
        friend = self.get_object()

        # Добавляем в друзья (двусторонне)
        user.friends.add(friend)
        friend.friends.add(user)

        # Удаляем подписки и подписчиков (если они были)
        user.following.remove(friend)
        user.followers.remove(friend)
        friend.following.remove(user)
        friend.followers.remove(user)

        return Response({"status": "Пользователь добавлен в друзья"})

    # Для заявок в друзья
    @action(detail=True, methods=["post"])
    def ignore_request(self, request, pk=None):
        user = request.user
        target = self.get_object()

        # пользователь может отклонить заявку только если тот на него подписан
        if user.followers.filter(id=target.id).exists():
            user.ignored_requests.add(target)
            return Response({"status": "заявка отклонена"})

        return Response({"error": "Нет активной заявки от этого пользователя"}, status=400)

    @action(detail=True, methods=["post"])
    def remove_friend(self, request, pk=None):
        user = request.user
        friend = self.get_object()

        # Удаляем дружбу в обе стороны
        user.friends.remove(friend)
        friend.friends.remove(user)

        # Друг становится подписчиком
        friend.following.add(user)
        user.ignored_requests.add(friend)  # 👈 игнорируем заявку, чтобы он не появился в списке на заявку в друзья

        return Response({"status": "друг удалён, и теперь подписчик"})

    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        """Подписка на пользователя"""
        user = request.user
        target_user = self.get_object()
        user.follow(target_user)
        return Response({"status": "Following"})

    @action(detail=True, methods=["post"])
    def unfollow(self, request, pk=None):
        """Отписка от пользователя"""
        user = request.user
        target_user = self.get_object()
        user.unfollow(target_user)
        return Response({"status": "Unfollowed"})

    @action(detail=True, methods=["post"])
    def remove_follower(self, request, pk=None):
        """Удаление подписчика"""
        user = request.user
        follower_user = self.get_object()
        follower_user.unfollow(user)
        return Response({"status": "Follower removed"})


class NewsFeedViewSet(viewsets.ModelViewSet):
    queryset = NewsFeed.objects.all()
    serializer_class = NewsFeedSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = NewsFeed.objects.all().annotate(
            likes_count=Count("reactions", filter=Q(reactions__reaction="like")),
            dislikes_count=Count("reactions", filter=Q(reactions__reaction="dislike")),
        ).prefetch_related("reactions")

        profile_id = self.request.query_params.get("profile")
        if profile_id:
            queryset = queryset.filter(profile_id=profile_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    # 👍 Лайк
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        newsfeed = self.get_object()
        user = request.user
        reaction, created = NewsFeedReaction.objects.get_or_create(
            user=user, newsfeed=newsfeed,
            defaults={"reaction": NewsFeedReaction.LIKE}
        )

        if not created:
            if reaction.reaction == NewsFeedReaction.LIKE:
                reaction.delete()
                return Response({"status": "Лайк удалён"})
            reaction.reaction = NewsFeedReaction.LIKE
            reaction.save()
            return Response({"status": "Обновлено на лайк"})
        return Response({"status": "Поставлен лайк"})

    # 👎 Дизлайк
    @action(detail=True, methods=["post"])
    def dislike(self, request, pk=None):
        newsfeed = self.get_object()
        user = request.user
        reaction, created = NewsFeedReaction.objects.get_or_create(
            user=user, newsfeed=newsfeed,
            defaults={"reaction": NewsFeedReaction.DISLIKE}
        )

        if not created:
            if reaction.reaction == NewsFeedReaction.DISLIKE:
                reaction.delete()
                return Response({"status": "Дизлайк удалён"})
            reaction.reaction = NewsFeedReaction.DISLIKE
            reaction.save()
            return Response({"status": "Обновлено на дизлайк"})
        return Response({"status": "Поставлен дизлайк"})


class NewsFeedCommentsViewSet(viewsets.ModelViewSet):
    queryset = NewsFeedComments.objects.all()
    serializer_class = NewsFeedCommentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = NewsFeedComments.objects.all().annotate(
            likes_count=Count("reactions", filter=Q(reactions__reaction="like")),
            dislikes_count=Count("reactions", filter=Q(reactions__reaction="dislike")),
        ).prefetch_related("reactions")

        newsfeed_id = self.request.query_params.get("newsfeed")
        if newsfeed_id:
            queryset = queryset.filter(newsfeed_id=newsfeed_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    # 👍 Лайк
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        reaction, created = CommentReaction.objects.get_or_create(
            user=user, comment=comment,
            defaults={"reaction": CommentReaction.LIKE}
        )

        if not created:
            if reaction.reaction == CommentReaction.LIKE:
                reaction.delete()
                return Response({"status": "Лайк удалён"})
            reaction.reaction = CommentReaction.LIKE
            reaction.save()
            return Response({"status": "Обновлено на лайк"})
        return Response({"status": "Поставлен лайк"})

    # 👎 Дизлайк
    @action(detail=True, methods=["post"])
    def dislike(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        reaction, created = CommentReaction.objects.get_or_create(
            user=user, comment=comment,
            defaults={"reaction": CommentReaction.DISLIKE}
        )

        if not created:
            if reaction.reaction == CommentReaction.DISLIKE:
                reaction.delete()
                return Response({"status": "Дизлайк удалён"})
            reaction.reaction = CommentReaction.DISLIKE
            reaction.save()
            return Response({"status": "Обновлено на дизлайк"})
        return Response({"status": "Поставлен дизлайк"})