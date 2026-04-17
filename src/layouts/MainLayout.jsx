import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'

// 优化 Tab - House 图标
function HouseIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF4444' : '#8E9BB5'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

// 巨擘 Tab - Building 图标
function BuildingIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF4444' : '#8E9BB5'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22V18h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}

// 匠心 Tab - Factory 图标
function FactoryIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF4444' : '#8E9BB5'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20V8l5 4V8l5 4V4h8a1 1 0 011 1v15H2z" />
      <path d="M17 20v-4h-4v4" />
      <path d="M12 20v-4H8v4" />
      <path d="M7 20v-4H3v4" />
    </svg>
  )
}

// 甄选 Tab - Bowl 图标
function BowlIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF4444' : '#8E9BB5'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18c0 4.97-4.03 9-9 9s-9-4.03-9-9z" />
      <path d="M12 3v3" />
      <path d="M8 5l1 2" />
      <path d="M16 5l-1 2" />
    </svg>
  )
}

const tabItems = [
  { to: '/', label: '优化', icon: HouseIcon, end: true },
  { to: '/diagnosis', label: '巨擘', icon: BuildingIcon },
  { to: '/content', label: '匠心', icon: FactoryIcon },
  { to: '/ranking', label: '甄选', icon: BowlIcon },
]

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      {/* 主内容区域 */}
      <main className="pb-[56px]">
        <div className="mx-auto max-w-[480px] min-h-screen">
          <Outlet />
        </div>
      </main>

      {/* 底部 Tab 导航栏 */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ backgroundColor: '#0A1628', borderTop: '1px solid #1A2540' }}
      >
        <div className="flex items-center justify-around h-[56px] mx-auto max-w-[480px]">
          {tabItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            const IconComponent = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
              >
                <IconComponent active={isActive} />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: isActive ? '#FF4444' : '#8E9BB5' }}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </div>
        {/* 安全区域适配（iPhone 底部横条） */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  )
}

export default MainLayout
