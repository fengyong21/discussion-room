import { useNavigate } from 'react-router-dom'

// 生态位排名模拟数据
const nicheRankings = [
  { name: '豆包', rank: '第3位', trend: '+', dotColor: '#7C4DFF' },
  { name: '文心一言', rank: '第3位', trend: '', dotColor: '#2B7FFF' },
  { name: 'Kimi', rank: '第3位', trend: '+', dotColor: '#00BCD4' },
]

// 行业榜单模拟数据
const industryRanking = [
  {
    rank: 1,
    name: '老北京炸酱面',
    score: 89,
    isMine: false,
    emoji: '🥇',
  },
  {
    rank: 2,
    name: '张小面 手工鲜面',
    score: 76,
    isMine: true,
    emoji: null,
  },
  {
    rank: 3,
    name: '川味面馆',
    score: 65,
    isMine: false,
    emoji: null,
  },
]

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      {/* 顶部区域：Logo + 用户头像 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* App Logo - 蓝色渐变圆形G图标 */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base"
            style={{ background: 'linear-gradient(135deg, #2B7FFF, #00BCD4)' }}
          >
            G
          </div>
          <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            GEO智能助手
          </span>
        </div>
        {/* 用户头像 */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #2B7FFF, #7C4DFF)' }}
        >
          张
        </button>
      </div>

      {/* 问候区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            你好，张小面～！
          </h1>
          <p className="text-xs mt-1" style={{ color: '#8E9BB5' }}>
            你的店铺AI推荐状态一览
          </p>
        </div>
        {/* 红色圆形+按钮 */}
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FF4444' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* 推荐指数仪表盘 */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E40AF, #0F172A)' }}
      >
        {/* 右上角T3级标签 */}
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: '#FF4444', color: '#FFFFFF' }}
        >
          T3级
        </div>

        {/* 标签 */}
        <span className="text-xs font-medium" style={{ color: '#8E9BB5' }}>
          推荐指数
        </span>

        {/* 超大数字 */}
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-white font-black" style={{ fontSize: '72px', lineHeight: 1 }}>
            46
          </span>
          <span className="text-white text-lg font-medium" style={{ opacity: 0.7 }}>
            /100
          </span>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: '46%',
                background: 'linear-gradient(90deg, #00BCD4, #2B7FFF)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 生态位排名区域 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>
            生态位排名
          </h2>
          <button className="flex items-center justify-center w-6 h-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {nicheRankings.map((item) => (
            <div
              key={item.name}
              className="flex-shrink-0 rounded-xl px-4 py-3 flex items-center gap-2.5 min-w-[130px]"
              style={{ backgroundColor: '#111B2E' }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.dotColor }}
              />
              <div>
                <div className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>
                  {item.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: '#8E9BB5' }}>
                  {item.rank} {item.trend && <span style={{ color: '#00C853' }}>{item.trend}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 行业榜单区域 */}
      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: '#FFFFFF' }}>
          行业榜单
        </h2>
        <div className="space-y-2.5">
          {industryRanking.map((item) => (
            <div
              key={item.rank}
              className="rounded-xl px-4 py-3.5 flex items-center gap-3"
              style={{
                backgroundColor: '#111B2E',
                border: item.isMine ? '1.5px solid #2B7FFF' : '1.5px solid transparent',
              }}
            >
              {/* 排名标识 */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {item.emoji ? (
                  <span className="text-xl">{item.emoji}</span>
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: '#1A2540', color: '#8E9BB5' }}
                  >
                    {item.rank}
                  </div>
                )}
              </div>

              {/* 店铺名称 */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: item.isMine ? '#2B7FFF' : '#FFFFFF' }}
                >
                  {item.name}
                  {item.isMine && (
                    <span
                      className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(43,127,255,0.15)', color: '#2B7FFF' }}
                    >
                      我的
                    </span>
                  )}
                </div>
              </div>

              {/* 推荐指数 */}
              <div className="flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: '#FFB800' }}>
                  {item.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部导航指示器 */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === 2 ? '16px' : '6px',
              height: '6px',
              backgroundColor: i === 2 ? '#2B7FFF' : '#1A2540',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage
