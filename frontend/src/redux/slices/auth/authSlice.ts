import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import axios from "axios";

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

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const getInitialToken = (): string | null => {
  return localStorage.getItem("access_token");
};

const getInitialUser = (): User | null => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  user: getInitialUser(),
  loading: false,
  error: null,
};

// 🔹 Новый thunk — получить данные текущего пользователя с бэкенда
export const fetchCurrentUser = createAsyncThunk<User, string>(
  "auth/fetchCurrentUser",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить текущего пользователя");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("access_token", action.payload);
      } else {
        localStorage.removeItem("access_token");
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_email");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

// 🔸 Селекторы
export const selectIsAuthenticated = (state: RootState): boolean =>
  Boolean(state.auth.token);

export const selectUser = (state: RootState): User | null =>
  state.auth.user;

export const selectAuthLoading = (state: RootState): boolean =>
  state.auth.loading;

export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;






// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RootState } from "../../store";

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

// interface AuthState {
//   token: string | null;
//   user: User | null;
// }

// const getInitialToken = (): string | null => {
//   return localStorage.getItem("access_token");
// };

// const getInitialUser = (): User | null => {
//   const user = localStorage.getItem("user");
//   return user ? JSON.parse(user) : null;
// };

// const initialState: AuthState = {
//   token: getInitialToken(),
//   user: getInitialUser(),
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setToken: (state, action: PayloadAction<string | null>) => {
//       state.token = action.payload;
//       if (action.payload) {
//         localStorage.setItem("access_token", action.payload);
//       } else {
//         localStorage.removeItem("access_token");
//       }
//     },
//     setUser: (state, action: PayloadAction<User | null>) => {
//       state.user = action.payload;
//       if (action.payload) {
//         localStorage.setItem("user", JSON.stringify(action.payload));
//       } else {
//         localStorage.removeItem("user");
//       }
//     },
//     logout: (state) => {
//       state.token = null;
//       state.user = null;
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("user_email");
//     },
//   },
// });

// export const { setToken, setUser, logout } = authSlice.actions;
// export default authSlice.reducer;

// // Селекторы
// export const selectIsAuthenticated = (state: RootState): boolean =>
//   Boolean(state.auth.token);

// export const selectUser = (state: RootState): User | null =>
//   state.auth.user;








// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RootState } from "../../store";

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

// interface AuthState {
//   token: string | null;
//   user: User | null;
// }

// const initialState: AuthState = {
//   token: localStorage.getItem("access_token") || null,
//   user: localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") as string)
//     : null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setToken: (state, action: PayloadAction<string | null>) => {
//       state.token = action.payload;
//       if (action.payload) {
//         localStorage.setItem("access_token", action.payload);
//       } else {
//         localStorage.removeItem("access_token");
//       }
//     },
//     setUser: (state, action: PayloadAction<User | null>) => {
//       state.user = action.payload;
//       if (action.payload) {
//         localStorage.setItem("user", JSON.stringify(action.payload));
//       } else {
//         localStorage.removeItem("user");
//       }
//     },
//     logout: (state) => {
//       state.token = null;
//       state.user = null;
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("user_email");
//     },
//   },
// });

// export const { setToken, setUser, logout } = authSlice.actions;
// export default authSlice.reducer;

// export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
// export const selectUser = (state: RootState) => state.auth.user;












// import { createSlice, PayloadAction } from '@reduxjs/toolkit'; 
// import { RootState } from '../../store';

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


// interface AuthState {
//   token: string | null;
//   user: User | null;
// }

// const initialState: AuthState = {
//   token: localStorage.getItem('access_token') || null,
//   user: localStorage.getItem('user')
//     ? JSON.parse(localStorage.getItem('user') as string)
//     : null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setToken: (state, action: PayloadAction<string | null>) => {
//       state.token = action.payload;
//       if (action.payload) {
//         localStorage.setItem('access_token', action.payload);
//       } else {
//         localStorage.removeItem('access_token');
//       }
//     },
//     setUser: (state, action: PayloadAction<User | null>) => {
//       state.user = action.payload;
//       if (action.payload) {
//         localStorage.setItem('user', JSON.stringify(action.payload));
//       } else {
//         localStorage.removeItem('user');
//       }
//     },
//     logout: (state) => {
//       state.token = null;
//       state.user = null;
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('user');
//     },
//   },
// });

// export const { setToken, setUser, logout } = authSlice.actions;
// export default authSlice.reducer;

// export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
// export const selectUser = (state: RootState) => state.auth.user;


