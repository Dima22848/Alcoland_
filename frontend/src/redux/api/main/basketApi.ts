import axios from 'axios';
import { OrderItemDTO, OrderResponse } from '../../slices/main/basketSlice';

const baseUrl = 'http://localhost:8000';
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === Отправить заказ (checkout) ===
export const checkoutOrder = async (items: OrderItemDTO[]): Promise<OrderResponse> => {
  const response = await axios.post(
    `${baseUrl}/api/orders/`,
    { items },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// === Получить заказы с поддержкой пагинации ===
export interface OrdersPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderResponse[];
}

// page (номер страницы), pageSize (размер страницы)
export const fetchOrders = async (
  page: number = 1,
  pageSize: number = 6
): Promise<OrdersPaginatedResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  const response = await axios.get(
    `${baseUrl}/api/orders/?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};










// import axios from 'axios';
// import { OrderItemDTO, OrderResponse } from '../../slices/main/basketSlice';

// const baseUrl = 'http://localhost:8000';
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access_token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// // === Отправить заказ (checkout) ===
// export const checkoutOrder = async (items: OrderItemDTO[]): Promise<OrderResponse> => {
//   const response = await axios.post(
//     `${baseUrl}/api/orders/`,
//     { items },
//     { headers: getAuthHeaders() }
//   );
//   return response.data;
// };

// // === Получить все заказы текущего пользователя ===
// export const fetchOrders = async (): Promise<OrderResponse[]> => {
//   const response = await axios.get(
//     `${baseUrl}/api/orders/`,
//     { headers: getAuthHeaders() }
//   );
//   return response.data;
// };










