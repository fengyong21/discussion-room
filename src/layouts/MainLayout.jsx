import { Outlet, NavLink } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* 顶部导航 */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-100">
                GEO 智能助手
              </h1>
              <span className="ml-2 text-sm text-gray-500">商家管理后台</span>
            </div>
            <nav className="flex space-x-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                首页
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                AI 对话
              </NavLink>
              <NavLink
                to="/diagnosis"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                诊断
              </NavLink>
              <NavLink
                to="/content"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                内容
              </NavLink>
              <NavLink
                to="/ranking"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                排行
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                设置
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
