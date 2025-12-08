// lib/api/modules/auth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../client';
import type { UserAuth, ApiResponse } from '@/types/api';

// Funzione base (rimane uguale)
const loginFn = async (email: string, password: string): Promise<ApiResponse<UserAuth>> => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

// Hook React Query per il login
export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      loginFn(email, password),
  });
};

// Per ottenere l'utente corrente
const getCurrentUserFn = async (): Promise<ApiResponse<UserAuth>> => {
  const response = await api.get("/users/me");
  return response.data;
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserFn,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });
};

// Logout
export const logout = async (): Promise<void> => {
  await api.post("/users/logout");
};