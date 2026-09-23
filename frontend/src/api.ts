import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

export const fetchKPIs = async () => { const { data } = await api.get('/kpis'); return data; };
export const fetchRevenueTrend = async () => { const { data } = await api.get('/revenue-trend'); return data; };
export const fetchCategoryPerformance = async () => { const { data } = await api.get('/category-performance'); return data; };
export const fetchChurnAnalysis = async () => { const { data } = await api.get('/churn-analysis'); return data; };
export const fetchCustomerMetrics = async () => { const { data } = await api.get('/customers/metrics'); return data; };
export const fetchProductMetrics = async () => { const { data } = await api.get('/products/metrics'); return data; };
export const fetchPromotions = async () => { const { data } = await api.get('/promotions'); return data; };
export const fetchGeographic = async () => { const { data } = await api.get('/geographic'); return data; };
export const fetchBehavior = async () => { const { data } = await api.get('/behavior'); return data; };
export const sendChatMessage = async (message: string) => { const { data } = await api.post('/chat', { message }); return data; };
