import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { fetchUsers as fetchUsersApi } from "../../api/auth/authApi";

export interface User {
  id: number;
  nickname: string;
  email: string;
  image: string;
  city_display?: string;
  age?: number;
  profession?: string;
  hobby?: string;
  extra_info?: string;
  friends: number[];
  following: number[];
  followers: number[];
  ignored_requests: number[];
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Асинхронное действие
export const fetchUsers = createAsyncThunk<User[], string>(
  "users/fetchUsers",
  async (token, { rejectWithValue }) => {
    try {
      return await fetchUsersApi(token);
    } catch (err: any) {
      return rejectWithValue("Не удалось загрузить пользователей");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Селекторы
export const selectUsers = (state: RootState): User[] => state.users.users;

export const selectUserById = (state: RootState, userId: number): User | undefined =>
  state.users.users.find((user) => user.id === userId);

export const selectUsersLoading = (state: RootState): boolean => state.users.loading;
export const selectUsersError = (state: RootState): string | null => state.users.error;

export default usersSlice.reducer;















// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { RootState } from "../../store";
// import { fetchUsers as fetchUsersApi } from "../../api/auth/authApi";

// export interface User {
//   id: number;
//   nickname: string;
//   email: string;
//   image: string;
//   city_display?: string;
//   age?: number;
//   profession?: string;
//   hobby?: string;
//   extra_info?: string;
//   friends: number[];
//   following: number[];
//   followers: number[];
// }

// interface UsersState {
//   users: User[];
//   loading: boolean;
// }

// const initialState: UsersState = {
//   users: [],
//   loading: false,
// };

// export const fetchUsers = createAsyncThunk(
//   "users/fetchUsers",
//   async (token: string) => {
//     return await fetchUsersApi(token);
//   }
// );

// const usersSlice = createSlice({
//   name: "users",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUsers.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchUsers.fulfilled, (state, action) => {
//         state.users = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchUsers.rejected, (state) => {
//         state.loading = false;
//       });
//   },
// });

// export const selectUsers = (state: RootState) => state.users.users;
// export const selectUserById = (state: RootState, userId: number) =>
//   state.users.users.find((user) => user.id === userId);

// export default usersSlice.reducer;




// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { RootState } from "../../store";
// import { fetchUsers as fetchUsersApi } from "../../api/auth/authApi";

// export interface User {
//     id: number;
//     nickname: string;
//     email: string;
//     image: string;
//     city_display?: string;
//     age?: number;
//     profession?: string;
//     hobby?: string;
//     extra_info?: string;
//     friends: number[];
//     following: number[];
//     followers: number[];
// }

// interface UsersState {
//     users: User[];
//     loading: boolean;
// }

// const initialState: UsersState = {
//     users: [],
//     loading: false,
// };

// export const fetchUsers = createAsyncThunk("users/fetchUsers", async (token: string) => {
//     return await fetchUsersApi(token);
// });

// const usersSlice = createSlice({
//     name: "users",
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchUsers.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchUsers.fulfilled, (state, action) => {
//                 state.users = action.payload;
//                 state.loading = false;
//             })
//             .addCase(fetchUsers.rejected, (state) => {
//                 state.loading = false;
//             });
//     },
// });

// export const selectUsers = (state: RootState) => state.users.users;
// export const selectUserById = (state: RootState, userId: number) =>
//     state.users.users.find((user: User) => user.id === userId);

// export default usersSlice.reducer;
