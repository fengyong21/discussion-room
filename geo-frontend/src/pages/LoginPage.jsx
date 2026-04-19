import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendCode, verifyCode } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  // 组件卸载时清理倒计时
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) return
    setError('')
    try {
      await sendCode(phone)
      setCountdown(60)
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            timerRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError('发送失败，请重试')
    }
  }

  const handleLogin = async () => {
    if (!phone || !code) return
    setLoading(true)
    setError('')
    try {
      const res = await verifyCode(phone, code)
      login(res.token, { id: res.merchant_id, shop_name: res.shop_name })
      navigate('/', { replace: true })
    } catch (err) {
      setError('登录失败，请检查验证码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}
          >
            <span className="text-2xl font-black text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold">GEO智能助手</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text3)' }}>
            商家AI推荐优化平台
          </p>
        </div>

        {/* 输入框 */}
        <div className="space-y-4">
          <input
            value={phone}
            onChange={e => { setPhone(e.target.value); setError('') }}
            maxLength={11}
            type="tel"
            placeholder="请输入手机号"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-card2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-glow)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
          <div className="flex gap-3">
            <input
              value={code}
              onChange={e => { setCode(e.target.value); setError('') }}
              maxLength={6}
              type="text"
              placeholder="验证码"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-card2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-glow)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap"
              style={{
                background: countdown > 0 ? 'var(--bg-card2)' : 'var(--blue-glow)',
                color: countdown > 0 ? 'var(--text3)' : 'var(--blue-light)',
                border: '1px solid var(--border)',
              }}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>

          {/* 内联错误提示 */}
          {error && (
            <p className="text-xs text-center" style={{ color: 'var(--red)' }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !phone || !code}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
            style={{
              background: (loading || !phone || !code) ? 'var(--bg-card2)' : 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
              boxShadow: (loading || !phone || !code) ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
              opacity: (loading || !phone || !code) ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                登录中...
              </span>
            ) : '登录'}
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text3)' }}>
          登录即同意<a href="#" className="underline" style={{ color: 'var(--blue)' }}>《用户协议》</a>和<a href="#" className="underline" style={{ color: 'var(--blue)' }}>《隐私政策》</a>
        </p>
      </div>
    </div>
  )
}
