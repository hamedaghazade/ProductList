import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, createProductApi, updateProductApi, deleteProductApi } from '../services/api';
import { CreateProductDTO, UpdateProductDTO } from '@shared/types/product';

export const useProducts = (search: string = '') => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts({ search, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDTO) => createProductApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-summary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDTO }) => updateProductApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-summary'] });
    },
  });

  return { productsQuery, createMutation, updateMutation, deleteMutation };
};