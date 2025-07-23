import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NewsFeedComment {
  id: number;
  profile_id: number;
  newsfeed_id: number;
  text: string;
  created_at: string;
}

interface NewsFeedCommentsState {
  comments: NewsFeedComment[];
}

const initialState: NewsFeedCommentsState = {
  comments: [],
};

const newsFeedCommentsSlice = createSlice({
  name: 'newsFeedComments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<NewsFeedComment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<NewsFeedComment>) => {
      state.comments.push(action.payload);
    },
  },
});

export const { setComments, addComment } = newsFeedCommentsSlice.actions;
export default newsFeedCommentsSlice.reducer;
