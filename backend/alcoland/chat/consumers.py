import json
import asyncio
from django.utils.timezone import now
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, Chat

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """При подключении пользователя к WebSocket"""
        try:
            self.chat_id = self.scope['url_route']['kwargs']['chat_id']
            self.room_group_name = f'chat_{self.chat_id}'

            # Присоединяемся к группе
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

            print(f"✅ WebSocket подключен: чат {self.chat_id}")
        except Exception as e:
            print(f"❌ Ошибка при подключении WebSocket: {e}")
            await self.close()

    async def disconnect(self, close_code):
        """При отключении пользователя"""
        try:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            print(f"🔴 WebSocket отключен: чат {self.chat_id}")
        except Exception as e:
            print(f"❌ Ошибка при отключении: {e}")

    async def receive(self, text_data):
        print(f"📩 Получено сообщение: {text_data}")

        try:
            data = json.loads(text_data)
            message_text = data.get("text", "").strip()
            sender_id = data.get("sender_id")

            print(f"📌 Разобранные данные: message_text={message_text}, sender_id={sender_id}, chat_id={self.chat_id}")

            if not message_text or not sender_id:
                print("❌ Ошибка: сообщение или sender_id отсутствуют!")
                return

            # Сохраняем сообщение в базе данных
            message = await self.save_message(sender_id, message_text)

            # Отправляем сообщение в WebSocket
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message.text,
                    "sender_id": message.sender.id,
                    "sender_nickname": message.sender.username,
                    "created_at": message.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                },
            )

        except Exception as e:
            print(f"❌ Ошибка в receive(): {e}")


    async def chat_message(self, event):
        """Отправляет сообщение в WebSocket"""
        try:
            await self.send(text_data=json.dumps({
                "message": event["message"],
                "sender_id": event["sender_id"],
                "sender_nickname": event["sender_nickname"],
                "created_at": event["created_at"],
            }))
        except Exception as e:
            print(f"❌ Ошибка в chat_message(): {e}")

    @database_sync_to_async
    def get_user(self, sender_id):
        """Получает пользователя из базы"""
        try:
            return User.objects.get(id=sender_id)
        except User.DoesNotExist:
            print(f"⚠️ Ошибка: Пользователь с ID {sender_id} не найден")
            return None

    @database_sync_to_async
    def get_chat(self, chat_id):
        """Получает чат из базы"""
        try:
            return Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            print(f"⚠️ Ошибка: Чат с ID {chat_id} не найден")
            return None

    async def save_message(self, sender_id, message_text):
        print(f"💾 Сохранение сообщения в БД: sender_id={sender_id}, chat_id={self.chat_id}, text={message_text}")

        try:
            sender = await database_sync_to_async(User.objects.get)(id=sender_id)
            chat = await database_sync_to_async(Chat.objects.get)(id=self.chat_id)

            message = await database_sync_to_async(Message.objects.create)(
                chat=chat, sender=sender, text=message_text, created_at=now()
            )

            print(f"✅ Сообщение сохранено: {message.id}")

            return message

        except Exception as e:
            print(f"❌ Ошибка в save_message(): {e}")


