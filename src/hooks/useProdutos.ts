import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Produto {
  id: number;
  name: string;
  qnt: number;
  description: string | null;
  price: number;
  category: string | null;
}

export function useProdutos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const response = await api.get('/products/');
      return response.data as Produto[];
    },
    staleTime: 1000 * 60 * 5, 
  });

  const createMutation = useMutation({
    mutationFn: async (novoProduto: any) => {
      return await api.post('/products/', novoProduto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; produto: any }) => {
      return await api.put(`/products/${data.id}`, data.produto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  return {
    produtos: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createProduto: createMutation,
    updateProduto: updateMutation,
    deleteProduto: deleteMutation,
  };
}