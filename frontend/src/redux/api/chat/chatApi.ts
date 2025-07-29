import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseApi"; // путь к обёртке как в newsFeedApi.ts

export interface ChatParticipant {
  id: number;
  nickname: string;
  role: "creator" | "admin" | "member";
  avatar?: string | null;
}

export interface Chat {
  id: number;
  is_group: boolean;
  name: string | null;
  image: string | null;
  participants: ChatParticipant[];
  participants_info: ChatParticipant[];
  creator?: number;
  admins?: number[];
  created_at?: string;
  last_message?: {
    text: string;
    sender: string;
    created_at: string;
  };
  display_name?: string;
  display_image?: string;
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Chats", "Participants"],
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => "/chats/",
      providesTags: ["Chats"],
    }),
    getChatById: builder.query<Chat, string | number>({
      query: (chatId) => `/chats/${chatId}/`,
      providesTags: ["Chats"],
    }),
    createGroupChat: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `/chats/`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Chats"],
    }),
    fetchOrCreateChatWithNickname: builder.mutation<Chat, string>({
      query: (nickname) => ({
        url: `/chats/with-nickname/${nickname}/`,
        method: "POST",
      }),
      invalidatesTags: ["Chats"],
    }),
    editChatName: builder.mutation<void, { chatId: number; name: string }>({
      query: ({ chatId, name }) => ({
        url: `/chats/${chatId}/`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["Chats"],
    }),
    updateChatAvatar: builder.mutation<void, { chatId: number; formData: FormData }>({
      query: ({ chatId, formData }) => ({
        url: `/chats/${chatId}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Chats"],
    }),
    inviteToChat: builder.mutation<void, { chatId: number; nickname: string }>({
      query: ({ chatId, nickname }) => ({
        url: `/chats/${chatId}/invite/`,
        method: "POST",
        body: { nickname },
      }),
      invalidatesTags: ["Participants"],
    }),
    hideChatForMe: builder.mutation<{ status: string }, number>({
      query: (chatId) => ({
        url: `/chats/${chatId}/hide_for_me/`,
        method: "POST",
      }),
      invalidatesTags: ["Chats"],
    }),
    deleteChat: builder.mutation<void, number>({
      query: (chatId) => ({
        url: `/chats/${chatId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chats"],
    }),
    getParticipants: builder.query<ChatParticipant[], number>({
      query: (chatId) => `/chats/${chatId}/participants/`,
      providesTags: ["Participants"],
    }),
    removeParticipant: builder.mutation<void, { chatId: number; userId: number }>({
      query: ({ chatId, userId }) => ({
        url: `/chats/${chatId}/remove_participant/`,
        method: "POST",
        body: { user_id: userId },
      }),
      invalidatesTags: ["Participants"],
    }),
    makeAdmin: builder.mutation<void, { chatId: number; userId: number }>({
      query: ({ chatId, userId }) => ({
        url: `/chats/${chatId}/make_admin/`,
        method: "POST",
        body: { user_id: userId },
      }),
      invalidatesTags: ["Participants"],
    }),
    revokeAdmin: builder.mutation<void, { chatId: number; userId: number }>({
      query: ({ chatId, userId }) => ({
        url: `/chats/${chatId}/revoke_admin/`,
        method: "POST",
        body: { user_id: userId },
      }),
      invalidatesTags: ["Participants"],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useEditChatNameMutation,
  useUpdateChatAvatarMutation,
  useInviteToChatMutation,
  useDeleteChatMutation,
  useHideChatForMeMutation,
  useGetParticipantsQuery,
  useRemoveParticipantMutation,
  useMakeAdminMutation,
  useRevokeAdminMutation,
  useFetchOrCreateChatWithNicknameMutation,
  useCreateGroupChatMutation,
} = chatApi;

export default chatApi;











// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const token = localStorage.getItem("access_token");

// export interface ChatParticipant {
//   id: number;
//   nickname: string;
//   role: "creator" | "admin" | "member";
//   avatar?: string | null;
// }

// export interface Chat {
//   id: number;
//   is_group: boolean;
//   name: string | null;
//   image: string | null;
//   participants: ChatParticipant[];
//   participants_info: ChatParticipant[];
//   creator?: number;
//   admins?: number[];
//   created_at?: string;
//   last_message?: {
//     text: string;
//     sender: string;
//     created_at: string;
//   };
//   display_name?: string;
//   display_image?: string;
// }

// export const chatApi = createApi({
//   reducerPath: "chatApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://127.0.0.1:8000/api",
//     prepareHeaders: (headers) => {
//       if (token) headers.set("Authorization", `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ["Chats", "Participants"],
//   endpoints: (builder) => ({
//     getChats: builder.query<Chat[], void>({
//       query: () => "/chats/",
//       providesTags: ["Chats"],
//     }),

//     getChatById: builder.query<Chat, string | number>({
//       query: (chatId) => `/chats/${chatId}/`,
//       providesTags: ["Chats"],
//     }),

//     createGroupChat: builder.mutation<any, FormData>({
//       query: (formData) => ({
//         url: `/chats/`,
//         method: "POST",
//         body: formData,
//       }),
//       invalidatesTags: ["Chats"],
//     }),

//     fetchOrCreateChatWithNickname: builder.mutation<Chat, string>({
//       query: (nickname) => ({
//         url: `/chats/with-nickname/${nickname}/`,
//         method: "POST",
//       }),
//       invalidatesTags: ["Chats"],
//     }),

//     editChatName: builder.mutation<void, { chatId: number; name: string }>({
//       query: ({ chatId, name }) => ({
//         url: `/chats/${chatId}/`,
//         method: "PATCH",
//         body: { name },
//       }),
//       invalidatesTags: ["Chats"],
//     }),

//     updateChatAvatar: builder.mutation<void, { chatId: number; formData: FormData }>({
//       query: ({ chatId, formData }) => ({
//         url: `/chats/${chatId}/`,
//         method: "PATCH",
//         body: formData,
//       }),
//       invalidatesTags: ["Chats"],
//     }),

//     inviteToChat: builder.mutation<void, { chatId: number; nickname: string }>({
//       query: ({ chatId, nickname }) => ({
//         url: `/chats/${chatId}/invite/`,
//         method: "POST",
//         body: { nickname },
//       }),
//       invalidatesTags: ["Participants"],
//     }),

//     // Новый эндпоинт: "Скрыть чат у себя"
//     hideChatForMe: builder.mutation<{ status: string }, number>({
//       query: (chatId) => ({
//         url: `/chats/${chatId}/hide_for_me/`,
//         method: "POST",
//       }),
//       invalidatesTags: ["Chats"],
//     }),

//     deleteChat: builder.mutation<void, number>({
//       query: (chatId) => ({
//         url: `/chats/${chatId}/`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["Chats"],
//     }),

//     getParticipants: builder.query<ChatParticipant[], number>({
//       query: (chatId) => `/chats/${chatId}/participants/`,
//       providesTags: ["Participants"],
//     }),

//     removeParticipant: builder.mutation<void, { chatId: number; userId: number }>({
//       query: ({ chatId, userId }) => ({
//         url: `/chats/${chatId}/remove_participant/`,
//         method: "POST",
//         body: { user_id: userId },
//       }),
//       invalidatesTags: ["Participants"],
//     }),

//     makeAdmin: builder.mutation<void, { chatId: number; userId: number }>({
//       query: ({ chatId, userId }) => ({
//         url: `/chats/${chatId}/make_admin/`,
//         method: "POST",
//         body: { user_id: userId },
//       }),
//       invalidatesTags: ["Participants"],
//     }),

//     revokeAdmin: builder.mutation<void, { chatId: number; userId: number }>({
//       query: ({ chatId, userId }) => ({
//         url: `/chats/${chatId}/revoke_admin/`,
//         method: "POST",
//         body: { user_id: userId },
//       }),
//       invalidatesTags: ["Participants"],
//     }),
//   }),
// });

// export const {
//   useGetChatsQuery,
//   useGetChatByIdQuery,
//   useEditChatNameMutation,
//   useUpdateChatAvatarMutation,
//   useInviteToChatMutation,
//   useDeleteChatMutation,
//   useHideChatForMeMutation,        
//   useGetParticipantsQuery,
//   useRemoveParticipantMutation,
//   useMakeAdminMutation,
//   useRevokeAdminMutation,
//   useFetchOrCreateChatWithNicknameMutation,
//   useCreateGroupChatMutation,
// } = chatApi;

// export default chatApi;














