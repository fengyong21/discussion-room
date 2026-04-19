import { useState, useEffect, useCallback } from 'react'

const steps = [
  { label: '正在采集门店数据', icon: '📡', duration: 1200 },
  { label: '分析搜索排名', icon: '🔍', duration: 1000 },
  { label: '评估内容质量', icon: '📝', duration: 1000 },
  { label: '对比同行表现', icon: '📊', duration: 1000 },
  { label: '生成优化建议', icon: '✨', duration: 800 },
]

export default function DiagnosisAnimation({ onDone }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0)

  const animate = useCallback(() => {
    let elapsed = 0
    let stepIdx = 0
    setCurrentStep(0)

    const tick = () => {
      elapsed += 50
      const pct = Math.min(100, (elapsed / totalDuration) * 100)
      setProgress(pct)

      // 计算当前步骤
      let acc = 0
      for (let i = 0; i < steps.length; i++) {
        acc += steps[i].duration
        if (elapsed < acc) {
          stepIdx = i
          break
        }
        if (i === steps.length - 1) stepIdx = i
      }
      setCurrentStep(stepIdx)

      if (elapsed < totalDuration) {
        requestAnimationFrame(tick)
      } else {
        setProgress(100)
        setCurrentStep(steps.length - 1)
        setTimeout(() => {
          setDone(true)
          setTimeout(() => onDone?.(), 400)
        }, 500)
      }
    }

    requestAnimationFrame(tick)
  }, [onDone, totalDuration])

  useEffect(() => {
    animate()
  }, [animate])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      {/* 背景光效 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)',
            animation: 'diagPulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* 扫描圆环 */}
      <div className="relative mb-8">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* 背景圆 */}
          <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg-card2)" strokeWidth="6" />
          {/* 进度圆 */}
          <circle cx="80" cy="80" r="70" fill="none"
            stroke="url(#diagGrad)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)}
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          {/* 扫描光点 */}
          {!done && (
            <circle cx="80" cy="80" r="4" fill="var(--blue)"
              style={{
                filter: 'drop-shadow(0 0 6px var(--blue))',
                transformOrigin: '80px 80px',
                animation: `diagRotate ${totalDuration}ms linear forwards`,
              }}
            />
          )}
          <defs>
            <linearGradient id="diagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--blue)" />
              <stop offset="100%" stopColor="var(--purple)" />
            </linearGradient>
          </defs>
        </svg>

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {done ? (
            <div className="text-4xl" style={{ animation: 'diagBounce 0.5s ease' }}>✅</div>
          ) : (
            <>
              <div className="text-3xl mb-1" style={{ animation: 'diagBounce 1s ease-in-out infinite' }}>
                {currentStep >= 0 ? steps[currentStep].icon : '⚡'}
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {Math.round(progress)}%
              </div>
            </>
          )}
        </div>
      </div>

      {/* 步骤列表 */}
      <div className="w-[260px] space-y-3">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep && !done
          const isDone = idx < currentStep || done
          return (
            <div key={idx} className="flex items-center gap-3 transition-all duration-300"
              style={{
                opacity: isDone ? 0.5 : isActive ? 1 : 0.25,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
              }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-300"
                style={{
                  background: isDone ? 'var(--green-glow)' : isActive ? 'var(--blue-glow)' : 'var(--bg-card2)',
                  border: isDone ? '1.5px solid var(--green)' : isActive ? '1.5px solid var(--blue)' : '1.5px solid var(--border)',
                }}>
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span style={{ color: isActive ? 'var(--blue)' : 'var(--text3)', fontSize: '12px' }}>{step.icon}</span>
                )}
              </div>
              <span className="text-sm transition-all duration-300"
                style={{
                  color: isActive ? 'var(--text)' : isDone ? 'var(--text3)' : 'var(--text3)',
                  fontWeight: isActive ? 600 : 400,
                }}>
                {step.label}
              </span>
              {isActive && (
                <div className="ml-auto flex gap-0.5">
                  <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--blue)', animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--blue)', animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--blue)', animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 底部提示 */}
      <p className="mt-8 text-xs" style={{ color: 'var(--text3)' }}>
        {done ? '诊断完成！' : '正在智能分析中，请稍候...'}
      </p>

      {/* 内联动画样式 */}
      <style>{`
        @keyframes diagPulse {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(-50%, 0) scale(1.1); opacity: 0.25; }
        }
        @keyframes diagRotate {
          from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        @keyframes diagBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
