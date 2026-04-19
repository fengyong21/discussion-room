import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const TOKEN_KEY = 'geo_token'
const MERCHANT_KEY = 'geo_merchant'

const AuthContext = createContext(null)

// 解码 JWT payload 获取 exp
function getTokenExp(token) {
  try {
    const base64 = token.split('.')[1]
    const payload = JSON.parse(atob(base64))
    return payload.exp ? payload.exp * 1000 : null // 转为毫秒
  } catch {
    return null
  }
}

// 判断 token 是否已过期
function isTokenExpired(token) {
  const exp = getTokenExp(token)
  if (!exp) return false // 无法解析则不主动过期
  return Date.now() >= exp
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY))
  const [merchant, setMerchant] = useState(() => {
    try { return JSON.parse(localStorage.getItem(MERCHANT_KEY)) } catch { return null }
  })
  const logoutRef = useRef(null)

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  useEffect(() => {
    if (merchant) localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant))
    else localStorage.removeItem(MERCHANT_KEY)
  }, [merchant])

  const login = (newToken, newMerchant) => {
    setToken(newToken)
    setMerchant(newMerchant)
  }

  const logout = useCallback(() => {
    setToken(null)
    setMerchant(null)
  }, [])

  // 保持 logout 引用最新
  logoutRef.current = logout

  // Token 过期检查 + 监听 auth:logout 事件
  useEffect(() => {
    // 定时检查 token 过期（每60秒）
    const timer = setInterval(() => {
      const currentToken = localStorage.getItem(TOKEN_KEY)
      if (currentToken && isTokenExpired(currentToken)) {
        logoutRef.current()
      }
    }, 60000)

    // 监听来自 request.js 401 处理的 auth:logout 事件
    const handleAuthLogout = () => {
      logoutRef.current()
    }
    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      clearInterval(timer)
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ token, merchant, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
