import axios from "axios";

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

// Получить информацию о пользователе
export const fetchUser = async (userId: string) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw new Error("Не удалось загрузить данные пользователя");
  }
};

// Получить список друзей
export const fetchFriends = async (userId: string) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}/friends/`);
    return response.data;
  } catch (error) {
    throw new Error("Не удалось загрузить список друзей");
  }
};

// Получить всех пользователей (добавлено)
export const fetchUsers = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/users/");
    return response.data;
  } catch (error) {
    throw new Error("Не удалось загрузить список пользователей");
  }
};

// Добавить друга
export const addFriend = async (friendId: number) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `http://127.0.0.1:8000/api/users/${friendId}/add_friend/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Не удалось добавить друга");
  }
};

// Для заявок в друзья
export const ignoreRequest = async (userId: number) => {
  const token = localStorage.getItem("access_token");
  try {
    await axios.post(
      `http://127.0.0.1:8000/api/users/${userId}/ignore_request/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw new Error("Не удалось отклонить заявку");
  }
};

// Удалить друга
export const removeFriend = async (friendId: number) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `http://127.0.0.1:8000/api/users/${friendId}/remove_friend/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Не удалось удалить друга");
  }
};

// Подписаться на пользователя
export const follow = async (targetId: number) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `http://127.0.0.1:8000/api/users/${targetId}/follow/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Не удалось подписаться на пользователя");
  }
};


// Отписаться от пользователя
export const unfollow = async (targetId: number) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `http://127.0.0.1:8000/api/users/${targetId}/unfollow/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Не удалось отписаться от пользователя");
  }
};

// Удалить подписчика
export const removeFollower = async (followerId: number) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `http://127.0.0.1:8000/api/users/${followerId}/remove_follower/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Не удалось удалить подписчика");
  }
};


