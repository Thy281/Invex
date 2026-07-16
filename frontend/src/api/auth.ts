import api from './client'
import type { User } from '@/types/auth'

export async function updateProfile(data: { theme?: string }): Promise<User> {
  const { data: user } = await api.patch<User>('/auth/me', data)
  return user
}
