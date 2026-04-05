import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load session on mount + listen for auth changes
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, phone')
      .eq('id', authUser.id)
      .single()

    setUser({
      id: authUser.id,
      name: profile?.full_name || authUser.user_metadata?.full_name || '',
      email: authUser.email,
      phone: profile?.phone || '',
      role: profile?.role || 'customer',
    })
    setLoading(false)
  }

  const isAuthenticated = user?.role === 'admin'
  const isCustomer = user?.role === 'customer'

  const register = useCallback(async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // If email confirmation is disabled, user is logged in immediately
    if (data.user) {
      await loadProfile(data.user)
    }

    return { success: true }
  }, [])

  const loginCustomer = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return { success: false, error: 'Invalid email or password.' }
    }

    await loadProfile(data.user)
    return { success: true }
  }, [])

  // Admin uses the same Supabase Auth — role is checked from profiles table
  const loginAdmin = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return { success: false, error: 'Invalid credentials.' }
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      return { success: false, error: 'You do not have admin access.' }
    }

    await loadProfile(data.user)
    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not logged in.' }

    const profileUpdates = {}
    if (updates.name) profileUpdates.full_name = updates.name.trim()
    if (updates.email) profileUpdates.email = updates.email.trim().toLowerCase()

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    // If email changed, also update in auth
    if (updates.email) {
      await supabase.auth.updateUser({ email: updates.email.trim().toLowerCase() })
    }

    setUser(prev => ({
      ...prev,
      name: updates.name?.trim() || prev.name,
      email: updates.email?.trim().toLowerCase() || prev.email,
    }))

    return { success: true }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
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
