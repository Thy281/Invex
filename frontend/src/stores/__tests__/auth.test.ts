import { describe, test, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../auth'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  })

  test('starts unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  test('login sets user and tokens', () => {
    const mockUser = {
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin' as const,
      active: true,
      theme: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    useAuthStore.getState().login({
      access_token: 'access-123',
      refresh_token: 'refresh-456',
      user: mockUser,
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('access-123')
    expect(state.refreshToken).toBe('refresh-456')
  })

  test('logout clears everything', () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Test', email: 't@t.com', role: 'admin', active: true, theme: 'system', created_at: '', updated_at: '' },
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
    })

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })

  test('setUser updates user', () => {
    const user = { id: '1', name: 'Test', email: 't@t.com', role: 'manager' as const, active: true, theme: 'system', created_at: '', updated_at: '' }
    useAuthStore.getState().setUser(user)

    expect(useAuthStore.getState().user).toEqual(user)
  })
})
