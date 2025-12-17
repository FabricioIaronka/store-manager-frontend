import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Cliente {
  id: number;
  name: string;
  surname: string;
  number: string;
  email: string;
  cpf: string;
}

export function useClientes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await api.get('/clients/');
      return response.data as Cliente[];
    },
    refetchOnWindowFocus: false, 
  });

  const createMutation = useMutation({
    mutationFn: async (novoCliente: any) => {
      return await api.post('/clients/', novoCliente);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; cliente: any }) => {
      return await api.put(`/clients/${data.id}`, data.cliente);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  return {
    clientes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createCliente: createMutation,
    updateCliente: updateMutation,
    deleteCliente: deleteMutation,
  };
}