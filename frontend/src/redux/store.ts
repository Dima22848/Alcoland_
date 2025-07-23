import { useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import basketReducer from "./slices/main/basketSlice";
import reviewsReducer from "./slices/main/reviewsSlice";
import purchaseHistoryReducer from "./slices/main/purchaseHistorySlice";
import alcoholReducer from "./slices/main/alcoholSlice";
import chatReducer from "./slices/chat/chatSlice";
import messageReducer from "./slices/chat/messageSlice";
import authReducer from "./slices/auth/authSlice";
import usersReducer from "./slices/auth/usersSlice";

// ✅ Импорт API
import { chatApi } from "./api/chat/chatApi";
import { messageApi } from "./api/chat/messageApi";
import { newsFeedApi } from "./api/account/newsFeedApi";
import { newsFeedCommentsApi } from "./api/account/newsFeedCommentsApi"; // ✅ API комментариев

// ✅ Импорт WebSocket middleware
import { websocketMiddleware } from "./middleware/websocketMiddleware";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    basket: basketReducer,
    reviews: reviewsReducer,
    purchaseHistory: purchaseHistoryReducer,
    alcohol: alcoholReducer,
    chat: chatReducer,
    message: messageReducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [newsFeedApi.reducerPath]: newsFeedApi.reducer,
    [newsFeedCommentsApi.reducerPath]: newsFeedCommentsApi.reducer, // ✅ Добавляем редюсер комментариев
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(chatApi.middleware)
      .concat(messageApi.middleware)
      .concat(newsFeedApi.middleware)
      .concat(newsFeedCommentsApi.middleware) // ✅ Подключаем middleware для комментариев
      .concat(websocketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;







// import { useDispatch } from "react-redux";
// import { configureStore } from "@reduxjs/toolkit";
// import basketReducer from "./slices/main/basketSlice";
// import reviewsReducer from "./slices/main/reviewsSlice";
// import purchaseHistoryReducer from "./slices/main/purchaseHistorySlice";
// import alcoholReducer from "./slices/main/alcoholSlice";
// import chatReducer from "./slices/chat/chatSlice";
// import messageReducer from "./slices/chat/messageSlice";
// import authReducer from "./slices/auth/authSlice";
// import usersReducer from "./slices/auth/usersSlice";

// // ✅ Импорт API
// import { chatApi } from "./api/chat/chatApi";
// import { messageApi } from "./api/chat/messageApi";

// // ✅ Импорт WebSocket middleware
// import { websocketMiddleware } from "./middleware/websocketMiddleware";

// const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     users: usersReducer,
//     basket: basketReducer,
//     reviews: reviewsReducer,
//     purchaseHistory: purchaseHistoryReducer,
//     alcohol: alcoholReducer,
//     chat: chatReducer,
//     message: messageReducer,
//     [chatApi.reducerPath]: chatApi.reducer, // Добавляем API-редюсер
//     [messageApi.reducerPath]: messageApi.reducer, // Добавляем API-редюсер
//   },
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware()
//       .concat(chatApi.middleware)
//       .concat(messageApi.middleware)
//       .concat(websocketMiddleware), // ✅ Подключаем WebSocket middleware
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export const useAppDispatch = () => useDispatch<AppDispatch>();

// export default store;

