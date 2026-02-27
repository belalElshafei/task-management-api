import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/register', data);
            return response.data;
        },
    });
};

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/login', data);
            return response.data;
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await apiClient.post('/auth/logout');
        },
        onSuccess: () => {
            queryClient.setQueryData(['user'], null);
        },
    });
};

export const useMe = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.get('/auth/me');
            return response.data.data;
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
    });
};
