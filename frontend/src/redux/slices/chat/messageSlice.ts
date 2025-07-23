import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Интерфейс для сообщения
interface Message {
    id: number;
    chat: number;
    sender: {
        id: number;
        nickname: string;
    };
    text: string;
    file: string | null;
    file_url: string | null;
    created_at: string;
}

interface MessageState {
    messages: { [chatId: number]: Message[] }; // сообщения для каждого чата по идентификатору
}

const initialState: MessageState = {
    messages: {},
};

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<{ chatId: number; messages: Message[] }>) => {
            const { chatId, messages } = action.payload;
            state.messages[chatId] = messages; // Заменяем сообщения в конкретном чате
        },
          
        addMessage: (state, action: PayloadAction<Message>) => {
            console.log("addMessage received:", action.payload); // Логирование данных
            const { chat } = action.payload;

            if (!state.messages[chat]) {
                state.messages[chat] = [];
            }

            state.messages[chat].push(action.payload); 
        },

        clearMessages: (state, action: PayloadAction<number>) => {
        delete state.messages[action.payload];
        },

    },
});

export const { setMessages, addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;












// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// // Интерфейс для сообщения
// interface Message {
//     id: number;
//     chat: number;
//     sender: {
//         id: number;
//         nickname: string;
//     };
//     text: string;
//     file: string | null;
//     file_url: string | null;
//     created_at: string;
// }

// interface MessageState {
//     messages: { [chatId: number]: Message[] }; // сообщения для каждого чата по идентификатору
//     // messages: Record<string, Message[]>;
// }

// const initialState: MessageState = {
//     messages: {},
// };

// const messageSlice = createSlice({
//     name: "messages",
//     initialState,
//     reducers: {
//         setMessages: (state, action: PayloadAction<{ chatId: number; messages: Message[] }>) => {
//             console.log("setMessages received:", action.payload); // Логирование данных
//             state.messages[action.payload.chatId] = action.payload.messages;
//         },
//         addMessage: (state, action: PayloadAction<Message>) => {
//             console.log("addMessage received:", action.payload); // Логирование данных
//             const { chat } = action.payload;

//             if (!state.messages[chat]) {
//                 state.messages[chat] = [];
//             }

//             state.messages[chat].push(action.payload); 
//         },
//     },
// });

// export const { setMessages, addMessage } = messageSlice.actions;
// export default messageSlice.reducer;
