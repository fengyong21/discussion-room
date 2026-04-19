import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'geo_notification_settings'

const pushGroup = [
  { key: 'diagnosis_done', label: '诊断完成提醒', desc: '门店诊断完成后立即通知', defaultOn: true },
  { key: 'rank_change', label: '排名变动提醒', desc: '搜索排名发生变化时通知', defaultOn: true },
  { key: 'new_review', label: '新评价提醒', desc: '收到新的用户评价时通知', defaultOn: true },
  { key: 'bad_review', label: '差评预警', desc: '收到1-2星差评时立即通知', defaultOn: true },
  { key: 'content_ready', label: '内容生成完成', desc: 'AI内容生成完毕后通知', defaultOn: false },
  { key: 'weekly_report', label: '周报推送', desc: '每周一推送上周数据周报', defaultOn: false },
]

const methodGroup = [
  { key: 'sms', label: '短信通知', desc: '通过手机短信接收通知', defaultOn: false },
  { key: 'wechat_push', label: '微信公众号推送', desc: '通过微信公众号接收通知', defaultOn: true },
  { key: 'in_app', label: '站内消息', desc: '在APP内推送消息通知', defaultOn: true },
]

const quietGroup = [
  { key: 'quiet_hours', label: '免打扰时段', desc: '22:00 - 08:00 期间不推送通知', defaultOn: false },
]

function Toggle({ on, onToggle }) {
  return (
    <button
      className="relative w-[44px] h-[24px] rounded-full shrink-0 transition-colors duration-200"
      style={{
        background: on ? 'var(--blue)' : 'var(--bg-card2)',
        border: on ? 'none' : '1px solid var(--border)',
      }}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
    >
      <div
        className="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200"
        style={{ left: on ? '22px' : '2px' }}
      />
    </button>
  )
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => {
    // 从 localStorage 恢复
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    // 默认值
    const init = {}
    ;[...pushGroup, ...methodGroup, ...quietGroup].forEach(item => {
      init[item.key] = item.defaultOn
    })
    return init
  })
  const [toast, setToast] = useState(null)

  // 自动保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  // 自动隐藏 toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  const toggle = useCallback((key) => {
    setSettings(prev => {
      const newVal = !prev[key]
      const label = [...pushGroup, ...methodGroup, ...quietGroup].find(g => g.key === key)?.label || key
      setToast(`${label}已${newVal ? '开启' : '关闭'}`)
      return { ...prev, [key]: newVal }
    })
  }, [])

  const enabledCount = Object.values(settings).filter(Boolean).length
  const totalCount = Object.keys(settings).length

  const renderGroup = (title, items, showBadge = false) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-medium px-1" style={{ color: 'var(--text3)' }}>{title}</span>
        {showBadge && (
          <span className="text-[11px] px-[6px] py-[1px] rounded-full" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}>
            {items.filter(i => settings[i.key]).length}/{items.length} 已开启
          </span>
        )}
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            className="flex items-center justify-between px-4 py-[14px]"
            style={{
              borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div className="flex-1 mr-3">
              <div className="text-[14px] mb-[2px]" style={{ color: 'var(--text)' }}>
                {item.label}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text3)' }}>
                {item.desc}
              </div>
            </div>
            <Toggle on={settings[item.key]} onToggle={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <div
        className="flex items-center px-4 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          className="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg"
          style={{ color: 'var(--text)' }}
          onClick={() => navigate('/profile')}
        >
          &lsaquo;
        </button>
        <span className="flex-1 text-center text-[16px] font-semibold" style={{ color: 'var(--text)' }}>
          通知设置
        </span>
        <div className="w-8" />
      </div>

      <div className="px-4 py-4">
        {/* 通知概览 */}
        <div
          className="rounded-xl p-4 mb-5 flex items-center gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center" style={{ background: 'var(--blue-glow)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>通知管理</div>
            <div className="text-[12px]" style={{ color: 'var(--text3)' }}>
              已开启 {enabledCount}/{totalCount} 项通知
            </div>
            <div className="w-full h-[4px] rounded-full mt-2 overflow-hidden" style={{ background: 'var(--bg-card2)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(enabledCount / totalCount) * 100}%`, background: 'var(--blue)' }}
              />
            </div>
          </div>
        </div>

        {renderGroup('推送通知', pushGroup, true)}
        {renderGroup('通知方式', methodGroup, true)}
        {renderGroup('其他', quietGroup)}
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div
          className="fixed top-20 left-1/2 z-50 px-5 py-2.5 rounded-full text-[13px] font-medium text-white shadow-lg"
          style={{
            background: 'rgba(34, 197, 94, 0.9)',
            backdropFilter: 'blur(8px)',
            animation: 'notifToast 1.8s ease-in-out',
          }}
        >
          {toast}
        </div>
      )}

      <style>{`
        @keyframes notifToast {
          0% { opacity: 0; transform: translate(-50%, -8px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          75% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
      `}</style>
    </div>
  )
}
