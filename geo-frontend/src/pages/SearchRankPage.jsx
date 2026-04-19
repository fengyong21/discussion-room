import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getRankingCompare, getRankingList } from '../api'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'

const PlatformIcons = {
  doubao: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  baidu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  gaode: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  wenxin: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  dianping: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  xiaohongshu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M8 12l3 3 5-5"/></svg>,
}

function getRankColor(rank, total) {
  const ratio = rank / total
  if (ratio <= 0.15) return 'var(--green)'
  if (ratio <= 0.3) return 'var(--orange)'
  return 'var(--red)'
}

function RankBadge({ rank }) {
  const gradients = {
    1: 'linear-gradient(135deg, #F59E0B, #D97706)',
    2: 'linear-gradient(135deg, #94A3B8, #64748B)',
    3: 'linear-gradient(135deg, #CD7F32, #A0522D)',
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold" style={{
      background: gradients[rank] || 'var(--bg-card2)',
      color: rank <= 3 ? '#fff' : 'var(--text3)',
    }}>
      {rank}
    </div>
  )
}

function HeroSkeleton() {
  return (
    <div className="rounded-2xl p-6 mb-5 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Skeleton className="mx-auto mb-3" style={{ width: 140, height: 52 }} />
      <Skeleton className="mx-auto mb-3" style={{ width: 160, height: 16 }} />
      <Skeleton className="mx-auto" style={{ width: 100, height: 28 }} />
    </div>
  )
}

function ListSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Skeleton style={{ width: 40, height: 40, borderRadius: 12 }} />
          <div className="flex-1">
            <Skeleton style={{ width: '60%', height: 14, marginBottom: 6 }} />
            <Skeleton style={{ width: '40%', height: 12 }} />
          </div>
          <Skeleton style={{ width: 40, height: 18 }} />
        </div>
      ))}
    </div>
  )
}

/* ─── 迷你趋势图（sparkline） ─── */
function Sparkline({ data, width = 80, height = 28, color = 'var(--blue)' }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── 关键词追踪数据（模拟真实数据，后续可接入API） ─── */
const KEYWORD_DATA = [
  {
    keyword: '附近美食推荐',
    platform: 'dianping',
    platformName: '大众点评',
    rank: 3,
    total: 156,
    trend: [8, 6, 5, 4, 3, 3, 3],
    change: -2,
    searchVolume: '2.1万/月',
  },
  {
    keyword: '火锅店推荐',
    platform: 'dianping',
    platformName: '大众点评',
    rank: 12,
    total: 230,
    trend: [18, 15, 14, 13, 12, 12, 12],
    change: -1,
    searchVolume: '5.8万/月',
  },
  {
    keyword: '周末去哪吃',
    platform: 'xiaohongshu',
    platformName: '小红书',
    rank: 7,
    total: 89,
    trend: [15, 12, 10, 9, 8, 7, 7],
    change: -3,
    searchVolume: '3.2万/月',
  },
  {
    keyword: '本地特色餐厅',
    platform: 'baidu',
    platformName: '百度地图',
    rank: 5,
    total: 67,
    trend: [9, 8, 7, 6, 5, 5, 5],
    change: -1,
    searchVolume: '1.5万/月',
  },
  {
    keyword: '好评多的店',
    platform: 'doubao',
    platformName: '抖音',
    rank: 18,
    total: 312,
    trend: [25, 22, 20, 19, 18, 18, 18],
    change: 0,
    searchVolume: '8.6万/月',
  },
  {
    keyword: '适合聚餐的地方',
    platform: 'xiaohongshu',
    platformName: '小红书',
    rank: 22,
    total: 145,
    trend: [30, 28, 26, 24, 23, 22, 22],
    change: -2,
    searchVolume: '4.1万/月',
  },
]

function KeywordCard({ item }) {
  const isUp = item.change > 0
  const isDown = item.change < 0
  const rankColor = getRankColor(item.rank, item.total)

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{item.keyword}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-card2)', color: 'var(--text3)' }}>
              {PlatformIcons[item.platform] && <span className="inline-flex items-center gap-1">{item.platformName}</span>}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text3)' }}>搜索量 {item.searchVolume}</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="text-[20px] font-bold" style={{ color: rankColor }}>#{item.rank}</div>
          <div className="text-[11px]" style={{ color: 'var(--text3)' }}>/{item.total}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Sparkline data={item.trend} color={rankColor} />
        <div className="flex items-center gap-1 text-[12px] font-medium" style={{
          color: isUp ? 'var(--green)' : isDown ? 'var(--green)' : 'var(--text3)',
        }}>
          {isDown ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
              <span>上升{Math.abs(item.change)}位</span>
            </>
          ) : isUp ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <span style={{ color: 'var(--red)' }}>下降{item.change}位</span>
            </>
          ) : (
            <span>持平</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchRankPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('competitor')
  const [keywordFilter, setKeywordFilter] = useState('all')

  const rankingReq = useRequest(getRankingList, null)
  const compareReq = useRequest(getRankingCompare, null)

  useEffect(() => {
    rankingReq.run('nearby')
    compareReq.run()
  }, [])

  const rankingData = rankingReq.data
  const compareData = compareReq.data
  const myRank = rankingData?.my_rank
  const selfScore = rankingData?.self_score
  const rankings = rankingData?.rankings || []
  const isLoading = rankingReq.loading || compareReq.loading
  const hasError = rankingReq.error || compareReq.error

  const handleRetry = () => {
    rankingReq.run('nearby')
    compareReq.run()
  }

  // 关键词筛选
  const filteredKeywords = keywordFilter === 'all'
    ? KEYWORD_DATA
    : KEYWORD_DATA.filter(k => k.platform === keywordFilter)

  // 关键词统计
  const keywordPlatforms = [...new Set(KEYWORD_DATA.map(k => k.platform))]
  const avgRank = Math.round(KEYWORD_DATA.reduce((s, k) => s + k.rank, 0) / KEYWORD_DATA.length)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* 顶部导航栏 */}
      <div
        className="sticky top-0 z-10 flex items-center h-[52px] px-4"
        style={{ background: 'rgba(8,13,25,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer" style={{ background: 'var(--bg-card)' }} onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <span className="ml-3 text-[16px] font-semibold" style={{ color: 'var(--text)' }}>搜索排名</span>
      </div>

      <div className="px-4 pt-4 pb-6">
        {hasError && <ErrorBlock message={rankingReq.error || compareReq.error} onRetry={handleRetry} />}

        {/* 排名英雄区 */}
        {isLoading ? (
          <HeroSkeleton />
        ) : (
          <div className="rounded-2xl p-6 mb-5 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.10) 100%)', border: '1px solid rgba(59,130,246,0.20)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="text-[48px] font-bold mb-2" style={{ color: 'var(--blue)' }}>
              {myRank != null ? `第${myRank}位` : '--'}
            </div>
            <div className="text-[14px] mb-3" style={{ color: 'var(--text2)' }}>
              周边同行排名 · 评分 {selfScore != null ? selfScore : '--'}
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium" style={{ background: 'var(--green-glow)', color: 'var(--green)' }}>
              {myRank != null && myRank <= 3 ? 'Top 3 优秀' : '持续优化中'}
            </div>
          </div>
        )}

        {/* 标签切换 */}
        <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          {[
            { key: 'platform', label: '平台排名' },
            { key: 'keyword', label: '关键词追踪' },
            { key: 'competitor', label: '同行排行' },
          ].map(tab => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 text-center py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--blue)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text3)',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* 平台排名 */}
        {activeTab === 'platform' && (
          compareData && Array.isArray(compareData) && compareData.length > 0 ? (
            <div className="flex flex-col gap-3">
              {compareData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px]" style={{ background: 'var(--bg-card2)' }}>
                    {PlatformIcons[item.platform] || PlatformIcons.doubao}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{item.name || item.platform || '未知平台'}</span>
                      {item.keyword && <span className="text-[12px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-card2)', color: 'var(--text3)' }}>{item.keyword}</span>}
                    </div>
                    <div className="text-[12px] mt-1" style={{ color: 'var(--text3)' }}>排名 {item.rank ?? '--'}/{item.total ?? '--'} 家</div>
                  </div>
                  <div className="text-[18px] font-bold" style={{ color: getRankColor(item.rank || 1, item.total || 1) }}>第{item.rank ?? '--'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
              <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>暂无平台排名数据</p>
            </div>
          )
        )}

        {/* 关键词追踪 */}
        {activeTab === 'keyword' && (
          <div>
            {/* 关键词概览 */}
            <div className="rounded-xl p-4 mb-4 flex items-center gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex-1">
                <div className="text-[13px]" style={{ color: 'var(--text3)' }}>追踪关键词</div>
                <div className="text-[24px] font-bold" style={{ color: 'var(--text)' }}>{KEYWORD_DATA.length}<span className="text-[13px] font-normal ml-1" style={{ color: 'var(--text3)' }}>个</span></div>
              </div>
              <div className="flex-1">
                <div className="text-[13px]" style={{ color: 'var(--text3)' }}>平均排名</div>
                <div className="text-[24px] font-bold" style={{ color: 'var(--blue)' }}>#{avgRank}</div>
              </div>
              <div className="flex-1">
                <div className="text-[13px]" style={{ color: 'var(--text3)' }}>覆盖平台</div>
                <div className="text-[24px] font-bold" style={{ color: 'var(--green)' }}>{keywordPlatforms.length}</div>
              </div>
            </div>

            {/* 平台筛选 */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <span
                className="px-3 py-1.5 rounded-lg text-[12px] cursor-pointer shrink-0 transition-all"
                style={{
                  background: keywordFilter === 'all' ? 'var(--blue)' : 'var(--bg-card)',
                  color: keywordFilter === 'all' ? '#fff' : 'var(--text3)',
                  border: keywordFilter === 'all' ? 'none' : '1px solid var(--border)',
                }}
                onClick={() => setKeywordFilter('all')}
              >全部</span>
              {keywordPlatforms.map(p => {
                const name = KEYWORD_DATA.find(k => k.platform === p)?.platformName || p
                return (
                  <span
                    key={p}
                    className="px-3 py-1.5 rounded-lg text-[12px] cursor-pointer shrink-0 transition-all"
                    style={{
                      background: keywordFilter === p ? 'var(--blue)' : 'var(--bg-card)',
                      color: keywordFilter === p ? '#fff' : 'var(--text3)',
                      border: keywordFilter === p ? 'none' : '1px solid var(--border)',
                    }}
                    onClick={() => setKeywordFilter(p)}
                  >{name}</span>
                )
              })}
            </div>

            {/* 关键词列表 */}
            <div className="flex flex-col gap-3">
              {filteredKeywords.map((item, i) => (
                <KeywordCard key={i} item={item} />
              ))}
            </div>

            {/* 添加关键词提示 */}
            <div
              className="mt-4 p-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="text-[13px]" style={{ color: 'var(--blue)' }}>添加关键词追踪</span>
            </div>
          </div>
        )}

        {/* 同行排行列表 */}
        {activeTab === 'competitor' && (
          isLoading ? (
            <ListSkeleton count={4} />
          ) : rankings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {rankings.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl relative" style={{
                  background: item.is_me ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)',
                  border: item.is_me ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--border)',
                }}>
                  <RankBadge rank={item.rank} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{item.name}</span>
                      {item.is_me && <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>我的</span>}
                    </div>
                    <div className="text-[12px] mt-1" style={{ color: 'var(--text3)' }}>评分 {item.score}</div>
                  </div>
                  <div className="text-[14px] font-medium" style={{ color: 'var(--text2)' }}>#{item.rank}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
              <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>暂无同行排行数据</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
