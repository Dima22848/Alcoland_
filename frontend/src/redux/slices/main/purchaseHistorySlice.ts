import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPurchaseHistory } from '../../api/main/purchaseHistoryApi';

export const loadPurchaseHistory = createAsyncThunk('purchaseHistory/loadPurchaseHistory', async () => {
  const history = await fetchPurchaseHistory();
  return history;
});

const purchaseHistorySlice = createSlice({
  name: 'purchaseHistory',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadPurchaseHistory.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default purchaseHistorySlice.reducer;

