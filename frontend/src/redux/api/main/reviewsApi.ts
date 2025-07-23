import axios from 'axios';

export interface Review {
  id: number;
  author: string | { nickname: string; avatar: string | null };
  content_type: number;
  text: string;
  created_at: string;
  rate: number;
  object_id: number;
  alcohol_info?: {
    id: number;
    name: string;
    price: number;
    image: string;
    type: string; // beer, vino, vodka, cognak
    slug?: string;
  };
}

// URL API для отзывов
const API_URL = 'http://127.0.0.1:8000/api/reviews/';

// Загрузка отзывов по content_type и object_id
export const fetchReviews = async (
  content_type: number,
  object_id: number
): Promise<Review[]> => {
  const response = await axios.get(API_URL, {
    params: {
      content_type,
      object_id,
    },
  });
  return response.data;
};

// Получить все отзывы текущего пользователя (Мои отзывы)
export const fetchMyReviews = async (): Promise<Review[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_URL}my/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Отправка нового отзыва
interface SendReviewParams {
  content_type: number;
  object_id: number;
  text: string;
  rate: number;
}

export const sendReview = async ({
  content_type,
  object_id,
  text,
  rate,
}: SendReviewParams): Promise<Review> => {
  const token = localStorage.getItem('access_token');

  const response = await axios.post(
    API_URL,
    { content_type, object_id, text, rate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Удаление отзыва по id
export const deleteReview = async (reviewId: number): Promise<void> => {
  const token = localStorage.getItem('access_token');
  await axios.delete(`${API_URL}${reviewId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};










// import axios from 'axios';

// export interface Review {
//   id: number;
//   author: string | { nickname: string; avatar: string | null };
//   content_type: number;
//   text: string;
//   created_at: string;
//   rate: number;
//   object_id: number;
// }

// // URL API для отзывов
// const API_URL = 'http://127.0.0.1:8000/api/reviews/';

// // Загрузка отзывов по content_type и object_id
// export const fetchReviews = async (
//   content_type: number,
//   object_id: number
// ): Promise<Review[]> => {
//   const response = await axios.get(API_URL, {
//     params: {
//       content_type,
//       object_id,
//     },
//   });
//   return response.data;
// };

// // Отправка нового отзыва
// interface SendReviewParams {
//   content_type: number;
//   object_id: number;
//   text: string;
//   rate: number;
// }

// export const sendReview = async ({
//   content_type,
//   object_id,
//   text,
//   rate,
// }: SendReviewParams): Promise<Review> => {
//   const token = localStorage.getItem('access_token');

//   const response = await axios.post(
//     API_URL,
//     { content_type, object_id, text, rate },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return response.data;
// };

// // Удаление отзыва по id
// export const deleteReview = async (reviewId: number): Promise<void> => {
//   const token = localStorage.getItem('access_token');
//   await axios.delete(`${API_URL}${reviewId}/`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };









