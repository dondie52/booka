import { createContext, useContext, useState, useCallback } from 'react'
import storageService from '../services/storageService'

const AuthContext = createContext()

// Admin credentials (MVP — replace with backend auth later)
const ADMIN_CREDENTIALS = { email: 'admin@bookheaven.co.bw', password: 'bookheaven2024' }

function getUsers() {
  return storageService.get(storageService.KEYS.USERS, [])
}

function saveUsers(users) {
  storageService.set(storageService.KEYS.USERS, users)
}

function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'h_' + Math.abs(hash).toString(36)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    storageService.get(storageService.KEYS.CURRENT_USER, null)
  )

  const isAuthenticated = user?.role === 'admin'
  const isCustomer = user?.role === 'customer'

  const register = useCallback((name, email, password) => {
    const users = getUsers()
    const normalizedEmail = email.trim().toLowerCase()

    if (users.find(u => u.email === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: 'customer',
      createdAt: new Date().toISOString(),
    }

    saveUsers([...users, newUser])

    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: 'customer' }
    setUser(sessionUser)
    storageService.set(storageService.KEYS.CURRENT_USER, sessionUser)

    return { success: true }
  }, [])

  const loginCustomer = useCallback((email, password) => {
    const users = getUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const found = users.find(u => u.email === normalizedEmail && u.passwordHash === hashPassword(password))

    if (!found) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const sessionUser = { id: found.id, name: found.name, email: found.email, role: 'customer' }
    setUser(sessionUser)
    storageService.set(storageService.KEYS.CURRENT_USER, sessionUser)

    return { success: true }
  }, [])

  const loginAdmin = useCallback((email, password) => {
    if (email.trim().toLowerCase() === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const sessionUser = { id: 'admin', name: 'Admin', email: ADMIN_CREDENTIALS.email, role: 'admin' }
      setUser(sessionUser)
      storageService.set(storageService.KEYS.CURRENT_USER, sessionUser)
      storageService.set(storageService.KEYS.AUTH, true)
      return { success: true }
    }
    return { success: false, error: 'Invalid admin credentials.' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    storageService.remove(storageService.KEYS.CURRENT_USER)
    storageService.remove(storageService.KEYS.AUTH)
  }, [])

  const updateProfile = useCallback((updates) => {
    if (!user || user.role !== 'customer') return { success: false, error: 'Not logged in.' }

    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx === -1) return { success: false, error: 'User not found.' }

    if (updates.name) users[idx].name = updates.name.trim()
    if (updates.email) {
      const normalizedEmail = updates.email.trim().toLowerCase()
      const emailTaken = users.find(u => u.email === normalizedEmail && u.id !== user.id)
      if (emailTaken) return { success: false, error: 'Email already in use.' }
      users[idx].email = normalizedEmail
    }

    saveUsers(users)

    const sessionUser = { ...user, name: users[idx].name, email: users[idx].email }
    setUser(sessionUser)
    storageService.set(storageService.KEYS.CURRENT_USER, sessionUser)

    return { success: true }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isCustomer,
      register,
      loginCustomer,
      loginAdmin,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
