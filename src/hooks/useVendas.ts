import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export type PaymentType = 'Money' | 'Debit' | 'Credit' | 'PIX' | 'Other';

export interface SaleItem {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Sale {
  id: number;
  user_id: number;
  client_id: number | null;
  created_at: string;
  payment_type: PaymentType;
  items: SaleItem[];
  total_value: number;
}

export interface SaleCreate {
  client_id: number | null;
  payment_type: PaymentType;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export function useVendas() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      const response = await api.get('/sales/');
      return response.data as Sale[];
    },
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: async (novaVenda: SaleCreate) => {
      return await api.post('/sales/', novaVenda);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] }); 
    },
  });

  return {
    vendas: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createVenda: createMutation,
  };
}