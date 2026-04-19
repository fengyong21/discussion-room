import { useState, useEffect, useCallback, useRef } from 'react'

/* ── Confetti 纸屑庆祝动画 ── */
export function Confetti({ trigger, duration = 2000 }) {
  const [particles, setParticles] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899']
    const items = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 300,
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 80,
    }))
    setParticles(items)
    timerRef.current = setTimeout(() => setParticles([]), duration)
    return () => clearTimeout(timerRef.current)
  }, [trigger, duration])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: '-10px',
          left: `${p.x}%`,
          width: p.size,
          height: p.size * 0.6,
          borderRadius: 2,
          background: p.color,
          transform: `rotate(${p.rotation}deg)`,
          animation: `confettiFall ${1.2 + Math.random() * 0.8}s ease-in ${p.delay}ms forwards`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); }
        }
      `}</style>
    </div>
  )
}

/* ── 数字滚动动画 ── */
export function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = typeof value === 'number' ? value : parseFloat(value) || 0
    prevRef.current = end
    if (start === end) { setDisplay(end); return }

    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{display}</span>
}

/* ── 成功弹窗 ── */
export function SuccessPopup({ show, title = '操作成功', subtitle = '', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [show, onClose])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: '24px 32px',
        border: '1px solid var(--border)', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        animation: 'successPop 0.4s ease',
      }}>
        <div style={{ fontSize: 40, marginBottom: 8, animation: 'successBounce 0.6s ease' }}>🎉</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text3)' }}>{subtitle}</div>}
      </div>
      <style>{`
        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes successBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

/* ── 进度环（店铺完善度） ── */
export function CompletionRing({ percent, size = 64, strokeWidth = 5, label }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (percent / 100) * circumference
  const center = size / 2
  const color = percent >= 80 ? 'var(--green)' : percent >= 50 ? 'var(--blue)' : 'var(--orange)'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--bg-card2)" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${center} ${center})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x={center} y={center} textAnchor="middle" dominantBaseline="central" fill={color} fontSize="14" fontWeight="bold">{percent}%</text>
      </svg>
      {label && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</span>}
    </div>
  )
}

/* ── 焦虑提示条 ── */
export function AnxietyBar({ type = 'warning', message, action, onAction }) {
  const styles = {
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', icon: '⚠️' },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', icon: '🔴' },
    info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6', icon: '💡' },
  }
  const s = styles[type] || styles.info

  return (
    <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <span style={{ fontSize: 16, lineHeight: '20px' }}>{s.icon}</span>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 13, color: s.color, lineHeight: '18px' }}>{message}</p>
        {action && (
          <button onClick={onAction} className="mt-1.5 text-xs font-semibold px-3 py-1 rounded-md" style={{ background: s.border, color: s.color }}>
            {action}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── 按钮涟漪效果 ── */
export function RippleButton({ children, onClick, style, className, color = 'var(--blue)' }) {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
    onClick?.(e)
  }

  return (
    <button className={`relative overflow-hidden ${className || ''}`} onClick={handleClick} style={style}>
      {children}
      {ripples.map(r => (
        <span key={r.id} style={{
          position: 'absolute', left: r.x - 10, top: r.y - 10,
          width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          animation: 'rippleEffect 0.6s ease-out forwards',
        }} />
      ))}
      <style>{`
        @keyframes rippleEffect {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </button>
  )
}
