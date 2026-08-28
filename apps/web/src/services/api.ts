import axios from 'axios';
import { IProduct, CreateProductDTO, UpdateProductDTO, PaginatedResult, ProductsSummary } from '@shared/types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers['x-telegram-init-data'] = initData;
  } else {
    config.headers['x-dev-user-id'] = '123456789';
  }
  return config;
});

export const fetchProducts = async (params: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get<{ success: boolean; data: PaginatedResult<IProduct> }>('/products', { params });
  return response.data.data;
};

export const fetchProductsSummary = async () => {
  const response = await api.get<{ success: boolean; data: ProductsSummary }>('/summary');
  return response.data.data;
};

export const createProductApi = async (data: CreateProductDTO) => {
  const response = await api.post<{ success: boolean; data: IProduct }>('/products', data);
  return response.data.data;
};

export const updateProductApi = async (id: string, data: UpdateProductDTO) => {
  const response = await api.put<{ success: boolean; data: IProduct }>(`/products/${id}`, data);
  return response.data.data;
};

export const deleteProductApi = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/products/${id}`);
  return response.data;
};

export const exportExcelApi = async (ids?: string[]) => {
  const response = await api.get('/export/excel', {
    params: { ids: ids?.join(',') },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportPdfApi = async (mode: 'table' | 'label', ids?: string[]) => {
  const response = await api.get('/export/pdf', {
    params: { mode, ids: ids?.join(',') },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products_${mode}_${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};