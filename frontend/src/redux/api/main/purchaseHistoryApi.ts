import axios from 'axios';

const baseUrl = 'http://localhost:8000'

// Функция для получения истории покупок
export const fetchPurchaseHistory = async () => {
  const response = await axios.get(`${baseUrl}/api/purchase-history`);
  return response.data;
};
