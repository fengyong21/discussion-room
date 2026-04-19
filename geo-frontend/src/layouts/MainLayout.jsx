import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useRequest } from '../hooks/useRequest'
import { getReviewStats } from '../api'

const IconHome = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconDiagnose = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
  </svg>
)
const IconContent = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
)
const IconReview = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconProfile = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const tabs = [
  { path: '/', Icon: IconHome, label: '首页' },
  { path: '/chat', Icon: IconDiagnose, label: '诊断' },
  { path: '/content', Icon: IconContent, label: '内容' },
  { path: '/reviews', Icon: IconReview, label: '评价', badge: 'dynamic' },
  { path: '/profile', Icon: IconProfile, label: '我的' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [badgeCount, setBadgeCount] = useState(0)

  const reviewReq = useRequest(getReviewStats)

  useEffect(() => {
    // 延迟加载，避免影响首屏
    const timer = setTimeout(() => {
      reviewReq.run()
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (reviewReq.data) {
      setBadgeCount(reviewReq.data.unreplied_bad || 0)
    }
  }, [reviewReq.data])

  const activeTab = tabs.findIndex(t => t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path))

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)]">
      <div className="flex-1 overflow-y-auto pb-[80px]">
        <Outlet />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(8,13,25,0.92)] backdrop-blur-xl border-t border-[var(--border)] flex items-center justify-around px-2 pb-[18px] safe-bottom z-10" style={{ minHeight: '72px' }}>
        {tabs.map((tab, i) => {
          const count = tab.badge === 'dynamic' ? badgeCount : tab.badge
          return (
            <div
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 cursor-pointer flex-1 relative py-1 ${i === activeTab ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`}
            >
              {i === activeTab && <div className="absolute -top-[18px] w-5 h-[3px] rounded-full bg-[var(--blue)]" />}
              <div className="relative">
                <div className={`w-[26px] h-[26px] rounded-[10px] flex items-center justify-center ${i === activeTab ? 'bg-[var(--blue-glow)]' : ''}`}>
                  <tab.Icon color={i === activeTab ? 'var(--blue)' : 'var(--text3)'} />
                </div>
                {count && Number(count) > 0 && (
                  <span className="absolute -top-[6px] -right-[8px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-white font-bold px-[3px]"
                    style={{ fontSize: 9, background: 'var(--red)', lineHeight: '16px' }}>
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
