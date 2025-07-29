import axios from "axios";
import { User } from "../../slices/auth/usersSlice";
import { logout, setToken } from "../../slices/auth/authSlice";
import store from "../../store";

const API_BASE_URL = "http://localhost:8000/api";

interface AuthResponse {
    access: string;
    refresh?: string;
}

// Вспомогательная функция обновления токена
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
        });
        return response.data.access;
    } catch (error) {
        throw new Error("Ошибка обновления токена");
    }
};

// Обёртка для защищённых запросов с автоматическим обновлением access токена
const authorizedRequest = async <T>(callback: (accessToken: string) => Promise<T>): Promise<T> => {
    const state = store.getState();
    let accessToken = state.auth.token;
    const refreshToken = localStorage.getItem("refresh_token");

    try {
        return await callback(accessToken!);
    } catch (error: any) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            refreshToken
        ) {
            try {
                const newAccessToken = await refreshAccessToken(refreshToken);
                store.dispatch(setToken(newAccessToken));
                localStorage.setItem("access_token", newAccessToken);
                accessToken = newAccessToken;

                return await callback(accessToken);
            } catch {
                store.dispatch(logout());
                throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
            }
        } else {
            throw error;
        }
    }
};

export const loginUser = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/token/`, {
            email,
            password,
        });

        // Сохраняем refresh_token отдельно
        if (response.data.refresh) {
            localStorage.setItem("refresh_token", response.data.refresh);
        }

        if (response.data.access) {
            localStorage.setItem("access_token", response.data.access);
        }

        localStorage.setItem("user_email", email);

        return response.data;
    } catch (error) {
        throw new Error("Ошибка авторизации");
    }
};

export const fetchCurrentUser = async (token: string): Promise<User> => {
    return authorizedRequest(async (accessToken) => {
        const response = await axios.get<User[]>(`${API_BASE_URL}/users/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const email = localStorage.getItem("user_email");
        const user = response.data.find((user) => user.email === email);

        if (!user) throw new Error("Пользователь не найден");

        return user;
    });
};

export const fetchUsers = async (token: string): Promise<User[]> => {
    return authorizedRequest(async (accessToken) => {
        const response = await axios.get<User[]>(`${API_BASE_URL}/users/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return response.data;
    });
};

export const registerUser = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register/`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error("Ошибка регистрации");
    }
};

const fetchMe = async (): Promise<User> => {
    return authorizedRequest(async (accessToken) => {
        const response = await axios.get<User>(`${API_BASE_URL}/me/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    });
};


export const updateUserProfile = async (
    userId: number,
    updatedData: Partial<User>
): Promise<User> => {
    return authorizedRequest(async (accessToken) => {
        const response = await axios.patch<User>(
            `${API_BASE_URL}/users/${userId}/`,
            updatedData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    });
};


export const updateUserAvatar = async (
  userId: number,
  formData: FormData
): Promise<User> => {
  return authorizedRequest(async (accessToken) => {
    const response = await axios.patch<User>(
      `${API_BASE_URL}/users/${userId}/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Обязательно нужен multipart/form-data!
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  });
};


export const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    store.dispatch(logout());
};








