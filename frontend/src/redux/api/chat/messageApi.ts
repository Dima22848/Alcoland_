import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Интерфейс для сообщения
interface Message {
  id: number;
  chat: number; // ID чата
  sender: {
    id: number;
    nickname: string;
  };
  text: string;
  file: string | null;
  file_url: string | null;
  created_at: string;
}

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:8000/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token"); // получаем при каждом запросе
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMessagesByChatId: builder.query<Message[], string>({
      query: (chatId) => `/messages/?chat=${chatId}`,
    }),
  }),
});

export const { useGetMessagesByChatIdQuery } = messageApi;
export default messageApi;







// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Интерфейс для сообщения
// interface Message {
//     id: number;
//     chat: number; // ID чата
//     sender: {
//         id: number;
//         nickname: string;
//     };
//     text: string;
//     file: string | null;
//     file_url: string | null;
//     created_at: string;
// }

// const token = localStorage.getItem("access_token"); // Получаем токен из localStorage

// export const messageApi = createApi({
//     reducerPath: "messageApi",
//     baseQuery: fetchBaseQuery({
//         baseUrl: "http://127.0.0.1:8000/api",
//         prepareHeaders: (headers) => {
//             // Добавляем токен в заголовки запроса, если он есть
//             if (token) {
//                 headers.set("Authorization", `Bearer ${token}`);
//             }
//             return headers;
//         },
//     }),
//     endpoints: (builder) => ({
//         getMessagesByChatId: builder.query<Message[], string>({
//             query: (chatId) => `/messages/?chat=${chatId}`,
//         }),
//     }),
// });

// export const { useGetMessagesByChatIdQuery } = messageApi;
// export default messageApi;
