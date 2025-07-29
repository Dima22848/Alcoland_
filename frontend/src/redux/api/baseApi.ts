import { fetchBaseQuery, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { refreshAccessToken } from './auth/authApi'; 
import { setToken, logout } from '../slices/auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://127.0.0.1:8000/api/',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const newAccessToken = await refreshAccessToken(refresh);
        localStorage.setItem('access_token', newAccessToken);
        api.dispatch(setToken(newAccessToken));

        // Повтор запроса с новым токеном
        result = await rawBaseQuery(args, api, extraOptions);
      } catch (error) {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};
