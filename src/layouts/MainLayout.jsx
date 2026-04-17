import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('merchant')
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/', icon: '📊', label: '工作台', end: true },
    { to: '/chat', icon: '🤖', label: 'AI对话' },
    { to: '/content', icon: '📝', label: '内容' },
    { to: '/diagnosis', icon: '🔍', label: '诊断' },
    { to: '/ranking', icon: '🏆', label: '排行' },
    { to: '/settings', icon: '⚙️', label: '设置' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex">
      {/* 左侧导航栏 - 桌面端显示，手机端隐藏 */}
      <aside className="hidden md:flex w-60 bg-[#0f1629] border-r border-[#1e293b] flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-black text-lg">
              G
            </div>
            <div>
              <div className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                GEO 智能助手
              </div>
              <div className="text-[10px] text-gray-600">商家管理后台 v1.0</div>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="text-[11px] text-gray-600 uppercase tracking-wider px-3 mb-2">核心功能</div>
          <NavItem to="/" icon="📊" label="工作台" end />
          <NavItem to="/chat" icon="🤖" label="AI 对话" />
          <NavItem to="/content" icon="📝" label="内容生成" />
          <NavItem to="/diagnosis" icon="🔍" label="门店诊断" />
          <NavItem to="/ranking" icon="🏆" label="竞品排行" />

          <div className="text-[11px] text-gray-600 uppercase tracking-wider px-3 mb-2 mt-6">设置</div>
          <NavItem to="/settings" icon="⚙️" label="门店信息" />
        </nav>

        {/* 底部商家信息 */}
        <div className="px-3 py-4 border-t border-[#1e293b]">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              张
            </div>
            <div>
              <div className="text-xs font-medium text-gray-300">张小面·手工鲜面</div>
              <div className="text-[10px] text-gray-600">专业版</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 右侧主内容 */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* 底部 Tab 导航栏 - 手机端显示，桌面端隐藏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f1629] border-t border-[#1e293b]">
        <div className="flex items-center justify-around h-14 px-1">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors"
              >
                <span className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-emerald-400 font-medium' : 'text-gray-500'
                  }`}
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

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
          isActive
            ? 'bg-emerald-500/10 text-emerald-400 font-medium'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      {label}
    </NavLink>
  )
}

export default MainLayout
