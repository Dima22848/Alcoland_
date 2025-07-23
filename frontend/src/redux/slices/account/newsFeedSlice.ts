// src/features/newsfeed/newsfeedSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { newsFeedApi } from '../../api/account/newsFeedApi';

// Интерфейс состояния
interface NewsfeedState {
  newsfeed: Post[];
}

// Интерфейс для каждого поста (повторяется, чтобы не забыть добавить типы)
interface Post {
  id: number;
  profile_id: number;
  text: string;
  file: string | null;
  created_at: string;
}

const initialState: NewsfeedState = {
  newsfeed: [],
};

const newsfeedSlice = createSlice({
  name: 'newsfeed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        newsFeedApi.endpoints.getNewsfeed.matchFulfilled,
        (state, action) => {
          state.newsfeed = action.payload;
        }
      )
      .addMatcher(
        newsFeedApi.endpoints.getNewsfeedByProfile.matchFulfilled,
        (state, action) => {
          state.newsfeed = action.payload;
        }
      );
  },
});

export default newsfeedSlice.reducer;
