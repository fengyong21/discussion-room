import { useNavigate } from 'react-router-dom'

const stats = [
  {
    label: 'GEO 综合评分',
    value: '87',
    unit: '/100',
    change: '+12%',
    changeType: 'up',
    color: 'emerald',
    borderColor: 'border-t-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
  },
  {
    label: 'AI 生成内容',
    value: '24',
    unit: '篇',
    change: '+8 本周新增',
    changeType: 'up',
    color: 'blue',
    borderColor: 'border-t-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
  },
  {
    label: '搜索曝光量',
    value: '3.2',
    unit: '万',
    change: '+23%',
    changeType: 'up',
    color: 'amber',
    borderColor: 'border-t-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
  },
  {
    label: '竞品监控',
    value: '6',
    unit: '家',
    change: '稳定',
    changeType: 'neutral',
    color: 'purple',
    borderColor: 'border-t-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
  },
]

const quickActions = [
  {
    label: 'AI 一键诊断',
    desc: '全面诊断门店在线表现，获取优化建议',
    path: '/diagnosis',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    label: '生成种草文案',
    desc: 'AI 自动生成小红书、抖音等平台种草内容',
    path: '/content',
    gradient: 'from-blue-500/20 to-blue-600/5',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
  {
    label: '查看竞品排行',
    desc: '实时监控竞品搜索排名和曝光数据',
    path: '/ranking',
    gradient: 'from-amber-500/20 to-amber-600/5',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
]

const recentActivities = [
  {
    id: 1,
    action: '生成了小红书种草文案',
    detail: '《春季新品推荐 | 这家店太宝藏了》',
    time: '10 分钟前',
    type: 'content',
    dotColor: 'bg-blue-400',
  },
  {
    id: 2,
    action: '完成了门店诊断',
    detail: 'GEO 评分提升至 87 分',
    time: '1 小时前',
    type: 'diagnosis',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 3,
    action: '更新了竞品监控列表',
    detail: '新增 2 家竞品门店',
    time: '3 小时前',
    type: 'ranking',
    dotColor: 'bg-amber-400',
  },
  {
    id: 4,
    action: '生成了抖音短视频脚本',
    detail: '《探店打卡 | 隐藏菜单大公开》',
    time: '昨天 16:30',
    type: 'content',
    dotColor: 'bg-blue-400',
  },
  {
    id: 5,
    action: '门店信息已更新',
    detail: '修改了营业时间和联系电话',
    time: '昨天 10:15',
    type: 'settings',
    dotColor: 'bg-purple-400',
  },
]

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* 欢迎语 */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">工作台总览</h2>
        <p className="mt-1 text-gray-400 text-xs sm:text-sm">
          欢迎回来，示例商家。以下是您的门店运营数据概览。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-[#111827] border border-[#1e293b] border-t-2 ${stat.borderColor} rounded-xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20`}
          >
            <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-xs sm:text-sm text-gray-500">{stat.unit}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {stat.changeType === 'up' && (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              )}
              <span className={`text-xs font-medium ${
                stat.changeType === 'up' ? 'text-emerald-400' : 'text-gray-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作区 */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">快捷操作</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.gradient} border ${action.borderColor} rounded-xl p-4 sm:p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 group cursor-pointer`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${action.iconBg} rounded-lg flex items-center justify-center ${action.iconColor} mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{action.label}</h4>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 最近活动 */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">最近活动</h3>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
          <ul className="divide-y divide-[#1e293b]">
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-[#1e293b]/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${activity.dotColor}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-200">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.detail}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HomePage
