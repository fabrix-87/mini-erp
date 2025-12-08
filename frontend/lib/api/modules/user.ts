// lib/api/modules/user.ts

import api from '../client';

// ============ USER PROFILE ============
export const getUser = async () => {
  const response = await api.get('/users/me');
  return response.data.data; // Ritorna i dati utente + UserDetails
};

export const updateUserProfile = async (profileData: {
  username?: string;
  email?: string;
}) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const updateUserDetails = async (details: {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio?: string;
}) => {
  const response = await api.put('/users/details', details);
  return response.data;
};

// ============ USER MANAGEMENT (Admin) ============
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data; // Array di utenti con dettagli
};

export const updateUserRole = async (id: number, role: string) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

export const toggleUserActive = async (id: number) => {
  const response = await api.patch(`/users/${id}/toggle-active`);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
