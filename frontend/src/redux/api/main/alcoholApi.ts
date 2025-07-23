import axios from 'axios';

const baseUrl = 'http://localhost:8000';

// Функция для получения данных о конкретном типе алкоголя
export const fetchAlcoholItems = async (type: string) => {
  const response = await axios.get(`${baseUrl}/api/alcohol/?type=${type}`);
  return response.data;
};
