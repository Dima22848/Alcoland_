import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Account {
  id: number;
  friends?: number[];
  following?: number[];
  followers?: number[];
  city_display?: string;
  nickname: string;
  image?: string;
  age?: number;
  profession?: string;
  hobby?: string;
  extra_info?: string; 
}

interface AccountState {
  user: any;
  friends: any[];
}

const initialState: AccountState = {
  user: null,
  friends: [],
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setFriends: (state, action: PayloadAction<any[]>) => {
      state.friends = action.payload;
    },
  },
});

export const { setUser, setFriends } = accountSlice.actions;
export default accountSlice.reducer;
