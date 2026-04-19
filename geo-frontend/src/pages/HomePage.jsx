import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'
import { getMerchantProfile, getDiagnosisHistory, getRankingList } from '../api'
import { Confetti, AnimatedNumber, CompletionRing, AnxietyBar, RippleButton } from '../components/UXComponents'

const Ico = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  doc: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  health: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  pen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  bot: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  trophy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
}

const actions = [
  { label: '一键诊断', desc: 'AI全面分析', path: '/chat?diag=1', color: 'var(--blue)', icon: Ico.health },
  { label: '生成文案', desc: '智能内容创作', path: '/content', color: 'var(--purple)', icon: Ico.pen },
  { label: '查看排行', desc: '同行对比', path: '/search-rank', color: 'var(--green)', icon: Ico.chart },
  { label: 'AI问答', desc: '智能咨询', path: '/chat', color: 'var(--orange)', icon: Ico.bot },
]

function RingProgress({ score, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const center = size / 2
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--orange)' : 'var(--red)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--bg-card2)" strokeWidth={strokeWidth} />
      <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={circumference - progress}
        transform={`rotate(-90 ${center} ${center})`} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={center} y={center - 6} textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize="28" fontWeight="bold">
        <AnimatedNumber value={score} />
      </text>
      <text x={center} y={center + 18} textAnchor="middle" dominantBaseline="central" fill="var(--text3)" fontSize="12">/100</text>
    </svg>
  )
}

/* ── 个性化问候 ── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了'
}

/* ── 店铺完善度计算 ── */
function calcCompletion(profile) {
  if (!profile) return { percent: 0, items: [] }
  const checks = [
    { label: '门店名称', done: !!profile.shop_name },
    { label: '行业分类', done: !!profile.industry },
    { label: '所在城市', done: !!profile.city },
    { label: '详细地址', done: !!profile.address },
    { label: '营业时间', done: !!profile.business_hours },
    { label: '门店头像', done: !!profile.avatar_url },
    { label: '联系电话', done: !!profile.phone_number },
    { label: '首次诊断', done: false }, // 由外部设置
  ]
  const done = checks.filter(c => c.done).length
  return { percent: Math.round((done / checks.length) * 100), items: checks }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { merchant } = useAuth()
  const shopName = merchant?.shop_name || '加载中...'
  const [showConfetti, setShowConfetti] = useState(false)

  const profileReq = useRequest(getMerchantProfile)
  const diagReq = useRequest(getDiagnosisHistory)
  const rankReq = useRequest(() => getRankingList('nearby'))

  useEffect(() => {
    profileReq.run()
    diagReq.run()
    rankReq.run()
  }, [])

  const history = diagReq.data || []
  const latest = history[0]
  const previous = history[1]
  const score = latest?.overall_score || 0
  const level = latest?.source_level || 'T3'
  const trend = (latest && previous) ? (latest.overall_score - previous.overall_score) : 0
  const gapToNext = level === 'T3' ? Math.max(0, 60 - score) : level === 'T2' ? Math.max(0, 80 - score) : 0
  const nextLevel = level === 'T3' ? 'T2' : level === 'T2' ? 'T1' : '已满级'

  const levelColor = level === 'T1' ? 'var(--green)' : level === 'T2' ? 'var(--orange)' : 'var(--red)'
  const levelBg = level === 'T1' ? 'var(--green-glow)' : level === 'T2' ? 'var(--orange-glow)' : 'var(--red-glow)'

  const rankData = rankReq.data || {}
  const myRank = rankData.my_rank || 0
  const rankingList = (rankData.ranking || []).slice(0, 3)

  // 店铺完善度
  const completion = calcCompletion(profileReq.data)
  const hasDiagnosed = history.length > 0
  const finalCompletion = hasDiagnosed
    ? { ...completion, percent: Math.min(100, completion.percent + Math.round(100 / completion.items.length)), items: completion.items.map(it => it.label === '首次诊断' ? { ...it, done: true } : it) }
    : completion

  // 焦虑提示
  const anxietyMessages = []
  if (hasDiagnosed && score > 0 && score < 60) {
    anxietyMessages.push({ type: 'danger', msg: `您的推荐指数仅${score}分，低于同行平均水平。不及时优化可能导致门店曝光持续下降。`, action: '立即优化', path: '/chat?diag=1' })
  }
  if (trend < -5) {
    anxietyMessages.push({ type: 'danger', msg: `推荐指数较上次下降${Math.abs(trend)}分，可能影响了您的搜索排名。`, action: '查看原因', path: '/score' })
  } else if (trend < 0) {
    anxietyMessages.push({ type: 'warning', msg: `推荐指数小幅下降${Math.abs(trend)}分，建议关注数据变化趋势。`, action: '查看详情', path: '/score' })
  }
  if (hasDiagnosed && myRank > 10) {
    anxietyMessages.push({ type: 'warning', msg: `当前排名第${myRank}位，前10名商家的平均曝光量是您的3.2倍。`, action: '查看排行', path: '/search-rank' })
  }
  if (!hasDiagnosed) {
    anxietyMessages.push({ type: 'info', msg: `您还未进行首次诊断，同区域78%的商家已完成AI诊断并优化了门店曝光。`, action: '免费诊断', path: '/chat?diag=1' })
  }

  const stats = [
    { label: '搜索排名', value: myRank > 0 ? `第${myRank}位` : '--', sub: myRank > 0 ? `共${(rankData.ranking || []).length}家` : '暂无数据', path: '/search-rank', color: 'var(--blue)', icon: Ico.search },
    { label: '推荐指数', value: score > 0 ? `${score}分` : '--', sub: `${level}级`, path: '/score', color: levelColor, icon: Ico.star },
    { label: '诊断次数', value: history.length > 0 ? `${history.length}次` : '0次', sub: '累计诊断', path: '/diagnosis-history', color: 'var(--purple)', icon: Ico.doc },
    { label: '同行对比', value: myRank > 0 ? `#${myRank}` : '--', sub: rankData.my_score ? `${rankData.my_score}分` : '暂无', path: '/search-rank', color: 'var(--green)', icon: Ico.chat },
  ]

  const loading = profileReq.loading || diagReq.loading || rankReq.loading
  const error = profileReq.error || diagReq.error || rankReq.error

  const handleRetry = () => {
    profileReq.run()
    diagReq.run()
    rankReq.run()
  }

  // 首次诊断后庆祝
  useEffect(() => {
    if (history.length === 1 && score > 0) {
      const timer = setTimeout(() => setShowConfetti(true), 500)
      return () => clearTimeout(timer)
    }
  }, [history.length, score])

  return (
    <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Confetti trigger={showConfetti} />

      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ background: 'var(--bg)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
            <span className="text-sm font-black text-white">G</span>
          </div>
          <span className="text-base font-bold">GEO智能助手</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-1" onClick={() => navigate('/notifications')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--red)' }} />
          </button>
          <button className="p-1" onClick={() => navigate('/chat')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* 个性化问候 */}
        <div className="pt-2">
          <h2 className="text-xl font-bold">{getGreeting()}，{shopName}{' '}
            {hasDiagnosed && score >= 80 && <span style={{ fontSize: 18 }}>🏆</span>}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {hasDiagnosed
              ? (score >= 80 ? '门店表现优秀，继续保持！' : score >= 60 ? '还有提升空间，点击下方优化' : '门店急需优化，建议立即行动')
              : '完成首次诊断，解锁门店AI推荐分析'}
          </p>
        </div>

        {/* 焦虑提示条 */}
        {!loading && anxietyMessages.length > 0 && (
          <div className="space-y-2">
            {anxietyMessages.slice(0, 2).map((a, i) => (
              <AnxietyBar key={i} type={a.type} message={a.msg} action={a.action} onAction={() => navigate(a.path)} />
            ))}
          </div>
        )}

        {error ? (
          <ErrorBlock message={error} onRetry={handleRetry} />
        ) : (
          <>
            {/* 推荐指数概览卡片 */}
            <div className="rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/score')}>
              {loading ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="w-[120px] h-[120px] rounded-full" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>推荐指数</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: levelBg, color: levelColor }}>{level}</span>
                    </div>
                    {trend !== 0 && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold" style={{ color: trend > 0 ? 'var(--green)' : 'var(--red)' }}>
                          {trend > 0 ? '↑' : '↓'}<AnimatedNumber value={Math.abs(trend)} />分
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>较上次</span>
                      </div>
                    )}
                    {gapToNext > 0 && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                        距{nextLevel}还差<strong style={{ color: 'var(--orange)' }}>{gapToNext}分</strong>，完善店铺信息可加速提升
                      </p>
                    )}
                    {score >= 80 && (
                      <p className="text-xs mt-2" style={{ color: 'var(--green)' }}>
                        ✨ 已超越同区域{Math.min(85, 60 + score)}%的商家
                      </p>
                    )}
                  </div>
                  <RingProgress score={score} />
                </div>
              )}
            </div>

            {/* 店铺完善度 + 4个数据卡片 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 店铺完善度卡片 */}
              <div className="rounded-xl p-4 cursor-pointer active:scale-[0.97] transition-transform" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/store-info')}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: 'var(--purple)' }}>{Ico.trophy}</span>
                  <span className="text-xs" style={{ color: 'var(--text2)' }}>店铺完善度</span>
                </div>
                <div className="flex justify-center">
                  <CompletionRing percent={finalCompletion.percent} size={56} strokeWidth={4} />
                </div>
                <p className="text-xs text-center mt-1" style={{ color: 'var(--text3)' }}>
                  {finalCompletion.percent >= 100 ? '已完善' : `还差${finalCompletion.items.filter(i => !i.done).length}项`}
                </p>
              </div>

              {/* 搜索排名 */}
              <div className="rounded-xl p-4 cursor-pointer active:scale-[0.97] transition-transform" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/search-rank')}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: 'var(--blue)' }}>{Ico.search}</span>
                  <span className="text-xs" style={{ color: 'var(--text2)' }}>搜索排名</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--blue)' }}>
                  {loading ? <Skeleton className="h-6 w-16 inline-block" /> : (myRank > 0 ? `第${myRank}位` : '--')}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{myRank > 0 ? `共${(rankData.ranking || []).length}家` : '暂无数据'}</p>
              </div>

              {/* 推荐指数 */}
              <div className="rounded-xl p-4 cursor-pointer active:scale-[0.97] transition-transform" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/score')}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: levelColor }}>{Ico.star}</span>
                  <span className="text-xs" style={{ color: 'var(--text2)' }}>推荐指数</span>
                </div>
                <p className="text-xl font-bold" style={{ color: levelColor }}>
                  {loading ? <Skeleton className="h-6 w-16 inline-block" /> : (score > 0 ? `${score}分` : '--')}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{level}级</p>
              </div>

              {/* 诊断次数 */}
              <div className="rounded-xl p-4 cursor-pointer active:scale-[0.97] transition-transform" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/diagnosis-history')}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: 'var(--purple)' }}>{Ico.doc}</span>
                  <span className="text-xs" style={{ color: 'var(--text2)' }}>诊断次数</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--purple)' }}>
                  {loading ? <Skeleton className="h-6 w-16 inline-block" /> : `${history.length}次`}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>累计诊断</p>
              </div>
            </div>

            {/* 快捷操作 */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text2)' }}>快捷操作</h3>
              <div className="grid grid-cols-4 gap-3">
                {actions.map(action => (
                  <RippleButton key={action.label}
                    className="flex flex-col items-center gap-2 py-3 rounded-xl active:scale-95 transition-transform"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    onClick={() => navigate(action.path)}>
                    <span style={{ color: 'var(--text2)' }}>{action.icon}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{action.label}</span>
                  </RippleButton>
                ))}
              </div>
            </div>

            {/* 同行排行 */}
            <div className="rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/search-rank')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">同行排行</h3>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>查看全部 ›</span>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : rankingList.length > 0 ? (
                <div className="space-y-3">
                  {rankingList.map(item => (
                    <div key={item.rank} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                        background: item.rank === 1 ? 'linear-gradient(135deg, #F59E0B, #D97706)' : item.rank === 2 ? 'linear-gradient(135deg, #94A3B8, #64748B)' : item.rank === 3 ? 'linear-gradient(135deg, #CD7F32, #A0522D)' : 'var(--bg-card2)',
                        color: item.rank <= 3 ? '#fff' : 'var(--text3)',
                      }}>{item.rank}</span>
                      <span className="flex-1 text-sm truncate">{item.is_self ? `${item.shop_name} (我的)` : item.shop_name}</span>
                      <span className="text-sm font-bold" style={{ color: item.is_self ? 'var(--blue)' : 'var(--text2)' }}>{item.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <p className="text-sm" style={{ color: 'var(--text3)' }}>暂无排行数据</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>完成首次诊断后即可查看同行对比</p>
                </div>
              )}
            </div>

            {/* 沉默成本提示 */}
            {!loading && hasDiagnosed && score < 70 && (
              <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08))', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 16 }}>💰</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--red)' }}>潜在损失估算</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                  根据您的当前推荐指数，预计每月因曝光不足流失约<strong style={{ color: 'var(--red)' }}>30-50个</strong>潜在客户。
                  完善门店信息并优化内容，预计可提升<strong style={{ color: 'var(--green)' }}>35%</strong>的门店曝光量。
                </p>
                <RippleButton className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--red)', color: '#fff', border: 'none' }}
                  onClick={() => navigate('/chat?diag=1')}>
                  立即优化，减少损失
                </RippleButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
