import { api } from './api';
import { AppUser } from '../context/AuthContext';

export interface UserProfile extends AppUser {
  address?: string;
  phone?: string;
}

const getUserProfile = (userId: string): Promise<UserProfile> => {
  return api.get<UserProfile>(`/users/${userId}/profile`);
};

const updateUserProfile = (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  return api.put<UserProfile>(`/users/${userId}/profile`, profileData);
};

export const userService = {
  getUserProfile,
  updateUserProfile,
};
