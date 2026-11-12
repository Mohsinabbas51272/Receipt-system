import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getReceipts = async () => {
  const response = await api.get('/receipts');
  return response.data;
};

export const getReceiptById = async (id) => {
  const response = await api.get(`/receipts/${id}`);
  return response.data;
};

export const createReceipt = async (receiptData) => {
  const response = await api.post('/receipts', receiptData);
  return response.data;
};

export const updateReceipt = async (id, receiptData) => {
  const response = await api.put(`/receipts/${id}`, receiptData);
  return response.data;
};

export const deleteReceipt = async (id) => {
  const response = await api.delete(`/receipts/${id}`);
  return response.data;
};

export const checkApiHealth = async () => {
  const response = await api.get('/');
  return response.data;
};

export default api;
