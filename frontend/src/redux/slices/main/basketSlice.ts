import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { checkoutOrder, fetchOrders, OrdersPaginatedResponse } from '../../api/main/basketApi';

// Типы
export interface BasketAddDTO {
  content_type: number;
  object_id: number;
  quantity: number;
}
export interface BasketItem {
  id: number;
  content_type: number;
  object_id: number;
  quantity: number;
  alcohol: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}
export interface OrderItemDTO {
  content_type: number;
  object_id: number;
  quantity: number;
  price: number;
}
export interface OrderResponse {
  id: number;
  user: number | null;
  created_at: string;
  status: string;
  items: any[];
}

const BASKET_LS_KEY = 'basket';
function loadFromLocalStorage(): BasketItem[] {
  try {
    const data = localStorage.getItem(BASKET_LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function saveToLocalStorage(state: BasketItem[]) {
  localStorage.setItem(BASKET_LS_KEY, JSON.stringify(state));
}

// ===== Новый тип состояния =====
interface BasketSliceState {
  items: BasketItem[];
  orders: OrderResponse[];
  ordersPage: number;
  ordersHasMore: boolean;
  ordersTotal: number;
  loadingOrders: boolean;
  errorOrders: string | null;
}

// ===== InitialState =====
const initialState: BasketSliceState = {
  items: loadFromLocalStorage(),
  orders: [],
  ordersPage: 1,
  ordersHasMore: true,
  ordersTotal: 0,
  loadingOrders: false,
  errorOrders: null,
};

// ===== THUNKS =====
export const checkoutOrderThunk = createAsyncThunk<OrderResponse, OrderItemDTO[]>(
  'basket/checkoutOrder',
  async (items, { dispatch }) => {
    const order = await checkoutOrder(items);
    dispatch(clearBasket());
    return order;
  }
);

// AJAX пагинация по заказам (лента, page)
export const fetchOrdersPaginatedThunk = createAsyncThunk<
  OrdersPaginatedResponse,
  { page?: number, pageSize?: number },
  { rejectValue: string }
>(
  'basket/fetchOrdersPaginated',
  async ({ page = 1, pageSize = 6 }, { rejectWithValue }) => {
    try {
      return await fetchOrders(page, pageSize);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// ===== SLICE =====
const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    addItemToBasket(state, action: PayloadAction<{
      content_type: number, object_id: number, quantity: number,
      alcohol: { id: number, name: string, price: number, image: string }
    }>) {
      const idx = state.items.findIndex(i =>
        i.content_type === action.payload.content_type &&
        i.object_id === action.payload.object_id
      );
      if (idx !== -1) {
        state.items[idx].quantity += action.payload.quantity;
      } else {
        const newId = Date.now();
        state.items.push({ ...action.payload, id: newId });
      }
      saveToLocalStorage(state.items);
    },
    increaseQty(state, action: PayloadAction<number>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.quantity += 1;
      saveToLocalStorage(state.items);
    },
    decreaseQty(state, action: PayloadAction<number>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      saveToLocalStorage(state.items);
    },
    clearBasket(state) {
      saveToLocalStorage([]);
      state.items = [];
    },
    removeItemLocal(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveToLocalStorage(state.items);
    },
    initBasket(state, action: PayloadAction<BasketItem[]>) {
      saveToLocalStorage(action.payload);
      state.items = action.payload;
    },
    resetOrders(state) {
      state.orders = [];
      state.ordersPage = 1;
      state.ordersHasMore = true;
      state.ordersTotal = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutOrderThunk.fulfilled, (state, action) => {
        // Корзина уже очищена
      })
      .addCase(fetchOrdersPaginatedThunk.pending, (state) => {
        state.loadingOrders = true;
        state.errorOrders = null;
      })
      .addCase(fetchOrdersPaginatedThunk.fulfilled, (state, action) => {
        const page = Number(action.meta.arg.page ?? 1);
        if (page === 1) {
          state.orders = action.payload.results;
        } else {
          state.orders = [...state.orders, ...action.payload.results];
        }
        state.ordersPage = page;
        state.ordersHasMore = !!action.payload.next;
        state.ordersTotal = action.payload.count;
        state.loadingOrders = false;
      })
      .addCase(fetchOrdersPaginatedThunk.rejected, (state, action) => {
        state.loadingOrders = false;
        state.errorOrders = action.payload || 'Ошибка при загрузке заказов';
      });
  },
});

export const {
  addItemToBasket,
  increaseQty,
  decreaseQty,
  clearBasket,
  removeItemLocal,
  initBasket,
  resetOrders,
} = basketSlice.actions;
export default basketSlice.reducer;









// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { checkoutOrder, fetchOrders } from '../../api/main/basketApi';

// // Типы
// export interface BasketAddDTO {
//   content_type: number;
//   object_id: number;
//   quantity: number;
// }
// export interface BasketItem {
//   id: number;
//   content_type: number;
//   object_id: number;
//   quantity: number;
//   alcohol: {
//     id: number;
//     name: string;
//     price: number;
//     image: string;
//   };
// }
// export interface OrderItemDTO {
//   content_type: number;
//   object_id: number;
//   quantity: number;
//   price: number;
// }
// export interface OrderResponse {
//   id: number;
//   user: number | null;
//   created_at: string;
//   status: string;
//   items: any[];
// }

// // ===== LocalStorage Helpers =====
// const BASKET_LS_KEY = 'basket';
// function loadFromLocalStorage(): BasketItem[] {
//   try {
//     const data = localStorage.getItem(BASKET_LS_KEY);
//     return data ? JSON.parse(data) : [];
//   } catch {
//     return [];
//   }
// }
// function saveToLocalStorage(state: BasketItem[]) {
//   localStorage.setItem(BASKET_LS_KEY, JSON.stringify(state));
// }

// // ===== Новый тип состояния =====
// interface BasketSliceState {
//   items: BasketItem[];
//   orders: OrderResponse[];
//   loadingOrders: boolean;
//   errorOrders: string | null;
// }

// // ===== InitialState =====
// const initialState: BasketSliceState = {
//   items: loadFromLocalStorage(),
//   orders: [],
//   loadingOrders: false,
//   errorOrders: null,
// };

// // ===== THUNKS =====
// export const checkoutOrderThunk = createAsyncThunk<OrderResponse, OrderItemDTO[]>(
//   'basket/checkoutOrder',
//   async (items, { dispatch }) => {
//     const order = await checkoutOrder(items);
//     dispatch(clearBasket());
//     return order;
//   }
// );

// export const fetchOrdersThunk = createAsyncThunk<OrderResponse[], void>(
//   'basket/fetchOrders',
//   async () => {
//     return await fetchOrders();
//   }
// );

// // ===== SLICE =====
// const basketSlice = createSlice({
//   name: 'basket',
//   initialState,
//   reducers: {
//     addItemToBasket(state, action: PayloadAction<{content_type: number, object_id: number, quantity: number, alcohol: {id: number, name: string, price: number, image: string}}>) {
//       const idx = state.items.findIndex(i =>
//         i.content_type === action.payload.content_type &&
//         i.object_id === action.payload.object_id
//       );
//       if (idx !== -1) {
//         state.items[idx].quantity += action.payload.quantity;
//       } else {
//         const newId = Date.now();
//         state.items.push({ ...action.payload, id: newId });
//       }
//       saveToLocalStorage(state.items);
//     },
//     increaseQty(state, action: PayloadAction<number>) {
//       const item = state.items.find(i => i.id === action.payload);
//       if (item) item.quantity += 1;
//       saveToLocalStorage(state.items);
//     },
//     decreaseQty(state, action: PayloadAction<number>) {
//       const item = state.items.find(i => i.id === action.payload);
//       if (item && item.quantity > 1) item.quantity -= 1;
//       saveToLocalStorage(state.items);
//     },
//     clearBasket(state) {
//       saveToLocalStorage([]);
//       state.items = [];
//     },
//     removeItemLocal(state, action: PayloadAction<number>) {
//       state.items = state.items.filter(i => i.id !== action.payload);
//       saveToLocalStorage(state.items);
//     },
//     initBasket(state, action: PayloadAction<BasketItem[]>) {
//       saveToLocalStorage(action.payload);
//       state.items = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(checkoutOrderThunk.fulfilled, (state, action) => {
//         // Корзина уже очищена
//       })
//       .addCase(fetchOrdersThunk.pending, (state) => {
//         state.loadingOrders = true;
//         state.errorOrders = null;
//       })
//       .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
//         state.orders = action.payload;
//         state.loadingOrders = false;
//       })
//       .addCase(fetchOrdersThunk.rejected, (state, action) => {
//         state.loadingOrders = false;
//         state.errorOrders = action.error.message || 'Ошибка при загрузке заказов';
//       });
//   },
// });

// export const {
//   addItemToBasket,
//   increaseQty,
//   decreaseQty,
//   clearBasket,
//   removeItemLocal,
//   initBasket,
// } = basketSlice.actions;
// export default basketSlice.reducer;

























