import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface NewsFeedComment {
  id: number;
  profile_id: number;
  newsfeed_id: number;
  text: string;
  created_at: string;
  likes_count: number;          
  dislikes_count: number;       
  is_liked_by_me: boolean;      
  is_disliked_by_me: boolean;  
}


export const newsFeedCommentsApi = createApi({
  reducerPath: 'newsFeedCommentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8000/api/',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCommentsByNewsFeedId: builder.query<NewsFeedComment[], number>({
      query: (newsfeed_id) => `comments/?newsfeed=${newsfeed_id}`,
    }),
    createComment: builder.mutation<NewsFeedComment, Partial<NewsFeedComment>>({
      query: (newComment) => ({
        url: 'comments/',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      }),
    }),
    deleteComment: builder.mutation<{ success: boolean }, number>({
      query: (commentId) => ({
        url: `comments/${commentId}/`,
        method: 'DELETE',
      }),
    }),
    likeComment: builder.mutation<{ status: string }, number>({
      query: (commentId) => ({
        url: `comments/${commentId}/like/`,
        method: "POST",
      }),
    }),
    dislikeComment: builder.mutation<{ status: string }, number>({
      query: (commentId) => ({
        url: `comments/${commentId}/dislike/`,
        method: "POST",
      }),
    }),
  }),
});

export const { 
  useGetCommentsByNewsFeedIdQuery, 
  useCreateCommentMutation, 
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useDislikeCommentMutation 
} = newsFeedCommentsApi;










// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// interface NewsFeedComment {
//   id: number;
//   profile_id: number;
//   newsfeed_id: number;
//   text: string;
//   created_at: string;
// }

// export const newsFeedCommentsApi = createApi({
//   reducerPath: 'newsFeedCommentsApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'http://127.0.0.1:8000/api/',
//     prepareHeaders: (headers) => {
//       const token = localStorage.getItem("access_token");
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     getCommentsByNewsFeedId: builder.query<NewsFeedComment[], number>({
//       query: (newsfeed_id) => `comments/?newsfeed=${newsfeed_id}`,
//     }),
//     createComment: builder.mutation<NewsFeedComment, Partial<NewsFeedComment>>({
//       query: (newComment) => {
//         console.log("Запрос к API:", newComment); // ← Проверь, передаётся ли newsfeed_id
//         return {
//           url: 'comments/',
//           method: 'POST',
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(newComment),
//         };
//       },
//     }),    
//   }),
// });

// export const { useGetCommentsByNewsFeedIdQuery, useCreateCommentMutation } = newsFeedCommentsApi;





