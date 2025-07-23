import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface NewsFeedComment {
  id: number;
  profile_id: number;
  newsfeed_id: number;
  text: string;
  created_at: string;
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
      query: (newComment) => {
        console.log("Запрос к API:", newComment); // ← Проверь, передаётся ли newsfeed_id
        return {
          url: 'comments/',
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newComment),
        };
      },
    }),    
  }),
});

export const { useGetCommentsByNewsFeedIdQuery, useCreateCommentMutation } = newsFeedCommentsApi;






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
//     addComment: builder.mutation<NewsFeedComment, Partial<NewsFeedComment>>({
//       query: (newComment) => ({
//         url: 'comments/',
//         method: 'POST',
//         body: newComment,
//       }),
//     }),
//   }),
// });

// export const { useGetCommentsByNewsFeedIdQuery, useAddCommentMutation } = newsFeedCommentsApi;
