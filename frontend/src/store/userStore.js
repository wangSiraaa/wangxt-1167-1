import React, { createContext, useContext, useState, useCallback } from 'react'
import { getToken, setToken, removeToken } from '../utils/auth'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null)
  const [token, setTokenState] = useState(getToken())

  const login = useCallback((userToken, user) => {
    setToken(userToken)
    setTokenState(userToken)
    setUserInfo(user)
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setTokenState(null)
    setUserInfo(null)
  }, [])

  const updateUserInfo = useCallback((info) => {
    setUserInfo((prev) => ({ ...prev, ...info }))
  }, [])

  const value = {
    userInfo,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    updateUserInfo
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext
