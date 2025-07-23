from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
import jwt

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Извлечь токен из query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token')
        if token:
            token = token[0]  # взять первый токен

            # Проверка токена и получение пользователя
            scope['user'] = await self.get_user(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        try:
            payload = jwt.decode(token, 'YOUR_SECRET_KEY', algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])
            return user
        except Exception:
            return AnonymousUser()
