import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'
import { getReviewStats, getReviewList } from '../api'
import { AnimatedNumber, AnxietyBar } from '../components/UXComponents'

const platforms = [
  { key: '', label: '全部' },
  { key: 'dianping', label: '大众点评' },
  { key: 'meituan', label: '美团' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'douyin', label: '抖音' },
]

const platformColors = {
  dianping: '#ff6633',
  meituan: '#ffc300',
  xiaohongshu: '#ff2442',
  douyin: '#333',
}

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? '#f59e0b' : 'var(--bg-card2)'} stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function DistributionBar({ star, count, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-3 text-right" style={{ color: 'var(--text3)' }}>{star}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-card2)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: star >= 4 ? 'var(--green)' : star === 3 ? 'var(--orange)' : 'var(--red)' }} />
      </div>
      <span className="text-xs w-6" style={{ color: 'var(--text3)' }}>{count}</span>
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
  return d.toLocaleDateString('zh-CN')
}

export default function UserReviewsPage() {
  const navigate = useNavigate()
  const [activePlatform, setActivePlatform] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const statsReq = useRequest(getReviewStats)
  const listReq = useRequest(() => getReviewList({ platform: activePlatform, filter_type: activeFilter }))

  useEffect(() => {
    statsReq.run()
  }, [])

  useEffect(() => {
    listReq.run()
  }, [activePlatform, activeFilter])

  const stats = statsReq.data
  const reviews = listReq.data?.items || []

  const unrepliedBad = stats?.unreplied_bad || 0

  return (
    <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部 */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3" style={{ background: 'var(--bg)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 className="text-base font-bold">用户评价</h1>
      </div>

      {statsReq.error ? (
        <ErrorBlock message={statsReq.error} onRetry={statsReq.run} />
      ) : (
        <div className="px-5 space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                {statsReq.loading ? <Skeleton className="h-7 w-12 inline-block" /> : <AnimatedNumber value={stats?.avg_rating || 0} />}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>综合评分</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--blue)' }}>
                {statsReq.loading ? <Skeleton className="h-7 w-12 inline-block" /> : <AnimatedNumber value={stats?.total || 0} />}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>总评价数</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>
                {statsReq.loading ? <Skeleton className="h-7 w-12 inline-block" /> : `${stats?.good_rate || 0}%`}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>好评率</div>
            </div>
          </div>

          {/* 未回复差评焦虑提示 */}
          {!statsReq.loading && unrepliedBad > 0 && (
            <AnxietyBar
              type="danger"
              message={`您有 ${unrepliedBad} 条差评未回复，不及时回复可能导致潜在客户流失。`}
              action="立即回复"
              onAction={() => navigate('/reply')}
            />
          )}

          {/* 评分分布 */}
          {stats?.distribution && (
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold mb-3">评分分布</h3>
              <div className="space-y-1.5">
                {stats.distribution.map(d => (
                  <DistributionBar key={d.star} star={d.star} count={d.count} maxCount={Math.max(...stats.distribution.map(x => x.count), 1)} />
                ))}
              </div>
            </div>
          )}

          {/* 平台筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {platforms.map(p => (
              <button key={p.key} onClick={() => setActivePlatform(p.key)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: activePlatform === p.key ? 'var(--blue)' : 'var(--bg-card)',
                  color: activePlatform === p.key ? '#fff' : 'var(--text3)',
                  border: `1px solid ${activePlatform === p.key ? 'var(--blue)' : 'var(--border)'}`,
                }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* 评价列表 */}
          {listReq.loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl p-4" style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${r.is_bad ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: platformColors[r.platform] || 'var(--bg-card2)' }}>
                        {(r.username || '?')[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{r.username}</div>
                        <StarRating rating={r.rating} size={10} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs" style={{
                        background: `${platformColors[r.platform]}20`,
                        color: platformColors[r.platform],
                        fontSize: 10,
                      }}>{r.platform_name}</span>
                      {r.is_bad && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', fontSize: 10 }}>差评</span>}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text)' }}>{r.content}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>{timeAgo(r.review_time)}</span>
                    {r.replied ? (
                      <span className="text-xs" style={{ color: 'var(--green)' }}>已回复 ✓</span>
                    ) : (
                      <button className="text-xs font-medium px-2.5 py-1 rounded-md" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', border: 'none' }}
                        onClick={() => navigate('/reply')}>
                        去回复
                      </button>
                    )}
                  </div>

                  {/* 商家回复 */}
                  {r.replied && r.reply_content && (
                    <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-medium mb-1" style={{ color: 'var(--blue)' }}>商家回复</div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{r.reply_content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>暂无评价数据</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
