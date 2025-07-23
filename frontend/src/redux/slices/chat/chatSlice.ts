import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Интерфейс для чата
interface Chat {
    id: string;
    name: string;
    is_group: boolean;
    participants: string[]; // ID пользователей
    image: string | null;
    created_at: string;

}

interface ChatState {
    chats: Chat[];
}

const initialState: ChatState = {
    chats: [],
};

const chatSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<Chat[]>) => {
            state.chats = action.payload;
        },
        updateChat: (state, action: PayloadAction<Chat>) => {
            const index = state.chats.findIndex(chat => chat.id === action.payload.id);
            if (index !== -1) {
                state.chats[index] = { ...state.chats[index], ...action.payload };
            } else {
                state.chats.push(action.payload);
            }
        },
    },
});

export const { setChats, updateChat } = chatSlice.actions;
export default chatSlice.reducer;

