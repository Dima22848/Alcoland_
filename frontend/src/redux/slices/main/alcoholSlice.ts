import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAlcoholItems } from "../../api/main/alcoholApi";

// Интерфейс данных алкоголя
export interface AlcoholItemData {
  id: number;
  name: string;
  price: number; // Приведение price к числу
  description: string;
  country: string;
  image: string;
  alcoholtype: number; // 1 - пиво, 2 - коньяк, 3 - водка, 4 - вино
  type: string; // Указываем, что type всегда строка
  slug: string;
  reviews_count?: number;
  created_at?: string;

  // Новое поле!
  field_verbose_names?: { [key: string]: string };

  // Опциональные поля
  aroma?: string;
  taste?: string;
  aftertaste?: string;
  composition?: string;
  combition_with?: string;
  style?: string;
  color?: string;
  sugar_supply?: string;
  volume?: string;
  strength?: string;
  excerpt?: string;
  supply_temperature?: string;
  serving_temperature?: string;
}

interface AlcoholState {
  items: AlcoholItemData[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AlcoholState = {
  items: [],
  status: "idle",
  error: null,
};

// Thunk для загрузки алкоголя по типу
export const loadAlcoholItems = createAsyncThunk(
  "alcohol/loadAlcoholItems",
  async (type: string): Promise<AlcoholItemData[]> => {
    const items = await fetchAlcoholItems(type);
    return items.map((item: AlcoholItemData) => ({
      ...item,
      price: Number(item.price), // Приведение price к числу
      type: item.type ?? "", // Гарантируем, что type всегда строка
    }));
  }
);

const alcoholSlice = createSlice({
  name: "alcohol",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAlcoholItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadAlcoholItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(loadAlcoholItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Ошибка загрузки данных";
      });
  },
});

export default alcoholSlice.reducer;










// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchAlcoholItems } from "../../api/main/alcoholApi";

// // Интерфейс данных алкоголя
// export interface AlcoholItemData {
//   id: number;
//   name: string;
//   price: number; // Приведение price к числу
//   description: string;
//   country: string;
//   image: string;
//   alcoholtype: number; // 1 - пиво, 2 - коньяк, 3 - водка, 4 - вино
//   type: string; // Указываем, что type всегда строка
//   slug: string;
//   reviews_count?: number;
//   created_at?: string;


//   // Опциональные поля
//   aroma?: string;
//   taste?: string;
//   aftertaste?: string;
//   composition?: string;
//   combition_with?: string;
//   style?: string;
//   color?: string;
//   sugar_supply?: string;
//   volume?: string;
//   strength?: string;
//   excerpt?: string;
//   supply_temperature?: string;
//   serving_temperature?: string;
// }

// interface AlcoholState {
//   items: AlcoholItemData[];
//   status: "idle" | "loading" | "succeeded" | "failed";
//   error: string | null;
// }

// const initialState: AlcoholState = {
//   items: [],
//   status: "idle",
//   error: null,
// };

// // Thunk для загрузки алкоголя по типу
// export const loadAlcoholItems = createAsyncThunk(
//   "alcohol/loadAlcoholItems",
//   async (type: string): Promise<AlcoholItemData[]> => {
//     const items = await fetchAlcoholItems(type);
//     return items.map((item: AlcoholItemData) => ({
//       ...item,
//       price: Number(item.price), // Приведение price к числу
//       type: item.type ?? "", // Гарантируем, что type всегда строка
//     }));
//   }
// );

// const alcoholSlice = createSlice({
//   name: "alcohol",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(loadAlcoholItems.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(loadAlcoholItems.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.items = action.payload;
//       })
//       .addCase(loadAlcoholItems.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message || "Ошибка загрузки данных";
//       });
//   },
// });

// export default alcoholSlice.reducer;
