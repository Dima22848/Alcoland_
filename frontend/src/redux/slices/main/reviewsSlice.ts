import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchReviews, sendReview, deleteReview, fetchMyReviews } from '../../api/main/reviewsApi';

// Интерфейс для типа Review
interface Review {
  id: number;
  text: string;
  created_at: string;
  author: { nickname: string; avatar: string | null } | string;
  rate: number;
  content_type: number;
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

interface ReviewsState {
  reviews: Review[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  status: 'idle',
  error: null,
};

// Асинхронный thunk для получения отзывов (по товару)
export const fetchReviewsAsync = createAsyncThunk(
  'reviews/fetchReviews',
  async ({ content_type, object_id }: { content_type: number; object_id: number }) => {
    const reviews = await fetchReviews(content_type, object_id);
    return reviews;
  }
);

// Асинхронный thunk для получения всех отзывов пользователя
export const fetchMyReviewsAsync = createAsyncThunk(
  'reviews/fetchMyReviews',
  async () => {
    const reviews = await fetchMyReviews();
    return reviews;
  }
);

// Асинхронный thunk для отправки отзыва
export const sendReviewAsync = createAsyncThunk(
  'reviews/sendReview',
  async (
    params: { content_type: number, object_id: number, text: string, rate: number },
    { dispatch }
  ) => {
    await sendReview(params);
    // После успешной отправки сразу подгружаем новые отзывы!
    const { content_type, object_id } = params;
    const reviews = await fetchReviews(content_type, object_id);
    return reviews;
  }
);

// Добавь новый thunk для удаления из профиля
export const deleteMyReviewAsync = createAsyncThunk(
  'reviews/deleteMyReview',
  async (reviewId: number, { dispatch }) => {
    await deleteReview(reviewId);
    // После удаления сразу подгружаем все отзывы пользователя!
    const reviews = await fetchMyReviews();
    return reviews;
  }
);

// Новый thunk для удаления отзыва
export const deleteReviewAsync = createAsyncThunk(
  'reviews/deleteReview',
  async (
    { reviewId, content_type, object_id }: { reviewId: number, content_type: number, object_id: number },
    { dispatch }
  ) => {
    await deleteReview(reviewId);
    // После удаления обновляем список отзывов
    const reviews = await fetchReviews(content_type, object_id);
    return reviews;
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    // Синхронные экшены при необходимости
  },
  extraReducers: (builder) => {
    builder
      // По товару
      .addCase(fetchReviewsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviewsAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      .addCase(deleteMyReviewAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchMyReviewsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyReviewsAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchMyReviewsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Не удалось загрузить отзывы';
      })
      // Отправка
      .addCase(sendReviewAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      // Удаление
      .addCase(deleteReviewAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      });
  },
});

export default reviewsSlice.reducer;










// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { fetchReviews, sendReview, deleteReview } from '../../api/main/reviewsApi';

// // Интерфейс для типа Review
// interface Review {
//   id: number;
//   text: string;
//   created_at: string;
//   author: { nickname: string; avatar: string | null } | string;
//   rate: number;
//   content_type: number;
//   object_id: number;
// }

// interface ReviewsState {
//   reviews: Review[];
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// const initialState: ReviewsState = {
//   reviews: [],
//   status: 'idle',
//   error: null,
// };

// // Асинхронный thunk для получения отзывов
// export const fetchReviewsAsync = createAsyncThunk(
//   'reviews/fetchReviews',
//   async ({ content_type, object_id }: { content_type: number; object_id: number }) => {
//     const reviews = await fetchReviews(content_type, object_id);
//     return reviews;
//   }
// );

// // Асинхронный thunk для отправки отзыва
// export const sendReviewAsync = createAsyncThunk(
//   'reviews/sendReview',
//   async (
//     params: { content_type: number, object_id: number, text: string, rate: number },
//     { dispatch }
//   ) => {
//     await sendReview(params);
//     // После успешной отправки сразу подгружаем новые отзывы!
//     const { content_type, object_id } = params;
//     const reviews = await fetchReviews(content_type, object_id);
//     return reviews;
//   }
// );

// // Новый thunk для удаления отзыва
// export const deleteReviewAsync = createAsyncThunk(
//   'reviews/deleteReview',
//   async (
//     { reviewId, content_type, object_id }: { reviewId: number, content_type: number, object_id: number },
//     { dispatch }
//   ) => {
//     await deleteReview(reviewId);
//     // После удаления обновляем список отзывов
//     const reviews = await fetchReviews(content_type, object_id);
//     return reviews;
//   }
// );

// const reviewsSlice = createSlice({
//   name: 'reviews',
//   initialState,
//   reducers: {
//     // Синхронные экшены при необходимости
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchReviewsAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchReviewsAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
//         state.status = 'succeeded';
//         state.reviews = action.payload;
//       })
//       .addCase(fetchReviewsAsync.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || 'Failed to fetch reviews';
//       })
//       .addCase(sendReviewAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
//         state.status = 'succeeded';
//         state.reviews = action.payload;
//       })
//       .addCase(deleteReviewAsync.fulfilled, (state, action: PayloadAction<Review[]>) => {
//         state.status = 'succeeded';
//         state.reviews = action.payload;
//       });
//   },
// });

// export default reviewsSlice.reducer;










