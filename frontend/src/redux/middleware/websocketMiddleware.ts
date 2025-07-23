import { Middleware } from "@reduxjs/toolkit";
import { addMessage } from "../slices/chat/messageSlice";
import { updateChat } from "../slices/chat/chatSlice";

const WEBSOCKET_URL = "ws://127.0.0.1:8000/ws/chat/";

// Интерфейс для WebSocket-действий
interface WebSocketAction {
    type: string;
    payload?: {
        chatId: number;
    };
}

export const websocketMiddleware: Middleware = store => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let currentChatId: number | null = null;

    const connect = (chatId: number) => {
        if (socket !== null) {
            socket.close();
        }

        currentChatId = chatId;
        const token = localStorage.getItem('token');
        socket = new WebSocket(`${WEBSOCKET_URL}${chatId}/?token=${token}`);

        socket.onopen = () => {
            console.log(`WebSocket подключен к чату ${chatId}.`);
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
        };

        socket.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "new_message") {
                    store.dispatch(addMessage(data.message));
                } else if (data.type === "chat_updated") {
                    store.dispatch(updateChat(data.chat));
                }
            } catch (error) {
                console.error("Ошибка парсинга WebSocket-сообщения:", error);
            }
        };

        socket.onclose = () => {
            console.warn(`WebSocket для чата ${chatId} закрыт. Переподключение через 3 секунды...`);
            reconnectTimeout = setTimeout(() => {
                if (currentChatId !== null) {
                    store.dispatch({ type: "WEBSOCKET_CONNECT", payload: { chatId: currentChatId } });
                }
            }, 3000);
        };

        socket.onerror = error => {
            console.error("WebSocket ошибка:", error);
            if (socket) {
                socket.close();
            }
        };
    };

    return next => action => {
        const typedAction = action as WebSocketAction; // ✅ Принудительное приведение типа

        if (typedAction.type === "WEBSOCKET_CONNECT" && typedAction.payload?.chatId !== undefined) {
            connect(typedAction.payload.chatId);
        } else if (typedAction.type === "WEBSOCKET_DISCONNECT") {
            if (socket !== null) {
                socket.close();
                socket = null;
                console.log("WebSocket отключен вручную.");
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
        }

        return next(action);
    };
};


