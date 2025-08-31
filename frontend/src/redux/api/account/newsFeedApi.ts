import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseApi';

// Интерфейс для каждого поста
export interface Post {
  id: number;
  profile_id: number;
  text: string;
  file: string | null;
  created_at: string;
  likes_count: number;
  dislikes_count: number;
  is_liked_by_me: boolean;
  is_disliked_by_me: boolean;
}

export const newsFeedApi = createApi({
  reducerPath: 'newsFeedApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getNewsfeed: builder.query<Post[], void>({
      query: () => 'newsfeed/',
    }),
    getNewsfeedByProfile: builder.query<Post[], number>({
      query: (profileId) => `newsfeed/?profile=${profileId}`,
    }),
    createPost: builder.mutation<Post, FormData>({
      query: (formData) => ({
        url: 'newsfeed/',
        method: 'POST',
        body: formData,
      }),
    }),
    deletePost: builder.mutation<{ success: boolean; id: number }, number>({
      query: (postId) => ({
        url: `newsfeed/${postId}/`,
        method: "DELETE",
      }),
    }),
    likePost: builder.mutation<{ status: string }, number>({
      query: (postId) => ({
        url: `newsfeed/${postId}/like/`,
        method: "POST",
      }),
    }),
    dislikePost: builder.mutation<{ status: string }, number>({
      query: (postId) => ({
        url: `newsfeed/${postId}/dislike/`,
        method: "POST",
      }),
    }),
  }),
});

export const { 
  useGetNewsfeedQuery, 
  useGetNewsfeedByProfileQuery, 
  useCreatePostMutation, 
  useDeletePostMutation,
  useLikePostMutation,
  useDislikePostMutation
} = newsFeedApi;








// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// // Интерфейс для каждого поста
// interface Post {
//   id: number;
//   profile_id: number;
//   text: string;
//   file: string | null;
//   created_at: string;
// }

// const baseQuery = fetchBaseQuery({
//   baseUrl: 'http://127.0.0.1:8000/api/',
//   prepareHeaders: (headers) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// export const newsFeedApi = createApi({
//   reducerPath: 'newsFeedApi',
//   baseQuery: baseQuery,
//   endpoints: (builder) => ({
//     getNewsfeed: builder.query<Post[], void>({
//       query: () => 'newsfeed/',
//     }),
//     getNewsfeedByProfile: builder.query<Post[], number>({
//       query: (profileId) => `newsfeed/?profile=${profileId}`,
//     }),
//   }),
// });

// export const { useGetNewsfeedQuery, useGetNewsfeedByProfileQuery } = newsFeedApi;






