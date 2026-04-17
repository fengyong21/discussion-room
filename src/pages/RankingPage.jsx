import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRankingList } from '../api'

const industries = ['面馆', '火锅', '烧烤', '奶茶', '快餐', '咖啡', '甜品', '日料']
const radiusOptions = ['1km', '3km', '5km']

// 模拟数据（API 请求失败时使用）
const mockData = [
  { rank: 1, name: '老北京炸酱面', subtitle: '面道坊·手工面', score: 89, trend: 'up', isMine: false },
  { rank: 2, name: '陈记牛肉面', subtitle: '朝阳区·牛肉面', score: 82, trend: 'up', isMine: false },
  { rank: 3, name: '张小面·手工鲜面', subtitle: '我的门店', score: 76, trend: 'up', isMine: true },
  { rank: 4, name: '川味面馆', subtitle: '海淀区·川菜面', score: 65, trend: 'down', isMine: false },
  { rank: 5, name: '兰州拉面', subtitle: '丰台区·西北菜', score: 58, trend: 'flat', isMine: false },
  { rank: 6, name: '面对面私房面', subtitle: '东城区·私房面', score: 52, trend: 'up', isMine: false },
]

function getRankBadge(rank) {
  if (rank === 1) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#7A5800' }}>
        1
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
        style={{ background: 'linear-gradient(135deg, #E8E8E8, #A0A0A0)', color: '#555' }}>
        2
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
        style={{ background: 'linear-gradient(135deg, #CD7F32, #A0522D)', color: '#FFF' }}>
        3
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
      style={{ backgroundColor: '#1A2540', color: '#8E9BB5' }}>
      {rank}
    </div>
  )
}

function getTrendDisplay(trend) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium" style={{ color: '#00C853' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium" style={{ color: '#FF4444' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-sm font-medium" style={{ color: '#8E9BB5' }}>
      --
    </span>
  )
}

function getScoreColor(score) {
  if (score >= 80) return '#00C853'
  if (score >= 60) return '#FFB800'
  return '#FF4444'
}

function RankingCard({ item }) {
  const scoreColor = getScoreColor(item.score)

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{
        backgroundColor: '#111B2E',
        border: item.isMine ? '2px solid #2B7FFF' : '1px solid #1A2540',
      }}
    >
      <div className="flex items-center gap-3">
        {/* 排名 */}
        {getRankBadge(item.rank)}

        {/* 商家信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white truncate">{item.name}</span>
            {item.isMine && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap"
                style={{ backgroundColor: 'rgba(43,127,255,0.15)', color: '#2B7FFF', border: '1px solid rgba(43,127,255,0.3)' }}
              >
                我的
              </span>
            )}
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: '#8E9BB5' }}>
            {item.subtitle}
          </div>
        </div>

        {/* 推荐指数 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs" style={{ color: '#8E9BB5' }}>推荐</div>
            <div className="text-xl font-bold" style={{ color: scoreColor }}>
              {item.score}
            </div>
          </div>
          {getTrendDisplay(item.trend)}
        </div>
      </div>
    </div>
  )
}

function RankingPage() {
  const navigate = useNavigate()
  const [activeIndustry, setActiveIndustry] = useState('面馆')
  const [activeRadius, setActiveRadius] = useState('3km')
  const [rankingData, setRankingData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRanking = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const res = await getRankingList('nearby')
      if (res.ranking && res.ranking.length > 0) {
        const mapped = res.ranking.map((item) => ({
          rank: item.rank,
          name: item.name,
          subtitle: item.subtitle || item.district || '',
          score: item.geo_score || item.platform_score || 0,
          trend: item.trend > 0 ? 'up' : item.trend < 0 ? 'down' : 'flat',
          isMine: item.rank === res.my_rank,
        }))
        setRankingData(mapped)
      } else {
        setRankingData(mockData)
      }
    } catch (err) {
      console.warn('API请求失败，使用模拟数据:', err.message)
      setRankingData(mockData)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRanking()
  }, [])

  const handleIndustryChange = (industry) => {
    setActiveIndustry(industry)
    fetchRanking()
  }

  const handleRadiusChange = (radius) => {
    setActiveRadius(radius)
    fetchRanking()
  }

  const handleRefresh = () => {
    fetchRanking(false)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      {/* 顶部导航栏 - 蓝色渐变 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #2B7FFF, #1A5FCC)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-white text-lg font-bold">甄选排行</span>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20"
          onClick={() => {}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21v-7" />
            <path d="M4 10V3" />
            <path d="M12 21v-9" />
            <path d="M12 8V3" />
            <path d="M20 21v-5" />
            <path d="M20 12V3" />
            <path d="M1 14h6" />
            <path d="M9 8h6" />
            <path d="M17 16h6" />
          </svg>
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* 行业选择 - 横向滚动 */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => handleIndustryChange(industry)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                backgroundColor: activeIndustry === industry ? '#2B7FFF' : '#1A2540',
                color: activeIndustry === industry ? '#FFFFFF' : '#8E9BB5',
              }}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* 区域选择 */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ backgroundColor: '#111B2E' }}
        >
          {radiusOptions.map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeRadius === r ? '#2B7FFF' : 'transparent',
                color: activeRadius === r ? '#FFFFFF' : '#8E9BB5',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 排行标题 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">推荐指数排行</h2>
          <span className="text-xs" style={{ color: '#8E9BB5' }}>
            {activeIndustry} · {activeRadius}
          </span>
        </div>
      </div>

      {/* 排行列表 */}
      <div className="px-4 pb-4 space-y-3">
        {/* 加载状态 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full" style={{ border: '3px solid #1A2540' }} />
              <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '3px solid #2B7FFF', borderTopColor: 'transparent' }} />
            </div>
            <p className="text-sm" style={{ color: '#8E9BB5' }}>正在加载排行数据...</p>
          </div>
        )}

        {/* 错误提示 */}
        {!isLoading && error && rankingData.length === 0 && (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)' }}>
            <div className="flex items-center justify-center gap-2 mb-2" style={{ color: '#FF4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span className="text-sm font-medium">加载失败</span>
            </div>
            <p className="text-sm" style={{ color: '#FF4444' }}>{error}</p>
            <button
              onClick={() => fetchRanking()}
              className="mt-3 px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(255,68,68,0.2)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.3)' }}
            >
              重新加载
            </button>
          </div>
        )}

        {/* 排行卡片 */}
        {!isLoading && rankingData.map((item) => (
          <RankingCard key={item.rank} item={item} />
        ))}
      </div>

      {/* 底部刷新按钮 */}
      <div className="px-4 pb-6">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-opacity flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#2B7FFF',
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isRefreshing ? 'animate-spin' : ''}
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0115-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 01-15 6.7L3 16" />
          </svg>
          刷新排行数据
        </button>
      </div>
    </div>
  )
}

export default RankingPage
