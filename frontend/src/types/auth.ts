export type Role = 'admin' | 'manager' | 'operator' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (res: LoginResponse) => void
  logout: () => void
  setUser: (user: User) => void
}
