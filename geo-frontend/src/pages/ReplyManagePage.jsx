import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'
import { getReviewStats, getReviewList, replyReview, aiReplyReview } from '../api'
import { AnimatedNumber, Confetti, SuccessPopup, RippleButton } from '../components/UXComponents'

const filters = [
  { key: 'all', label: '全部' },
  { key: 'unreplied', label: '未回复' },
  { key: 'bad', label: '差评' },
  { key: 'replied', label: '已回复' },
]

const platformColors = {
  dianping: '#ff6633', meituan: '#ffc300', xiaohongshu: '#ff2442', douyin: '#333',
}

function StarRating({ rating, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : 'var(--bg-card2)'} stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function ReplyModal({ review, onClose, onSuccess }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await replyReview(review.id, text.trim())
      onSuccess()
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl p-5" style={{ background: 'var(--bg-card)', animation: 'slideUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold">回复评价</h3>
          <button onClick={onClose} className="p-1" style={{ color: 'var(--text3)' }}>✕</button>
        </div>

        {/* 原评价 */}
        <div className="p-3 rounded-lg mb-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{review.username}</span>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-xs" style={{ color: 'var(--text2)' }}>{review.content}</p>
        </div>

        {/* 回复输入 */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入您的回复..."
          rows={3}
          className="w-full p-3 rounded-xl text-sm resize-none outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />

        <RippleButton className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: text.trim() ? 'var(--blue)' : 'var(--bg-card2)', color: text.trim() ? '#fff' : 'var(--text3)', border: 'none' }}
          onClick={handleSubmit}>
          {sending ? '发送中...' : '发送回复'}
        </RippleButton>

        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      </div>
    </div>
  )
}

function AiReplyModal({ review, onClose, onSuccess }) {
  const [status, setStatus] = useState('generating') // generating, done
  const [reply, setReply] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchReply = async () => {
      try {
        const res = await aiReplyReview(review.id)
        if (!cancelled) {
          setReply(res.reply || '')
          setStatus('done')
        }
      } catch (e) {
        if (!cancelled) {
          setReply('AI生成失败，请重试')
          setStatus('done')
        }
      }
    }
    fetchReply()
    return () => { cancelled = true }
  }, [review.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: 'var(--bg-card)', animation: 'slideUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          {status === 'generating' ? (
            <>
              <div className="text-3xl mb-2" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>🤖</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>AI正在生成回复...</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>分析评价内容，生成个性化回复</p>
              <div className="flex justify-center gap-1 mt-3">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--blue)', animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>回复已生成</p>
            </>
          )}
        </div>

        {reply && (
          <div className="p-3 rounded-lg mb-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{reply}</p>
          </div>
        )}

        {status === 'done' && (
          <RippleButton className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--green)', color: '#fff', border: 'none' }}
            onClick={() => { onSuccess(); onClose() }}>
            采用此回复
          </RippleButton>
        )}

        <style>{`
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        `}</style>
      </div>
    </div>
  )
}

export default function ReplyManagePage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [replyTarget, setReplyTarget] = useState(null)
  const [aiTarget, setAiTarget] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const statsReq = useRequest(getReviewStats)
  const listReq = useRequest(() => getReviewList({ filter_type: activeFilter }))

  useEffect(() => {
    statsReq.run()
  }, [])

  useEffect(() => {
    listReq.run()
  }, [activeFilter])

  const stats = statsReq.data
  const reviews = listReq.data?.items || []

  const handleReplySuccess = () => {
    setReplyTarget(null)
    setShowConfetti(true)
    setShowSuccess(true)
    statsReq.run()
    listReq.run()
  }

  const handleAiSuccess = () => {
    setShowConfetti(true)
    setShowSuccess(true)
    statsReq.run()
    listReq.run()
  }

  return (
    <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Confetti trigger={showConfetti} />
      <SuccessPopup show={showSuccess} title="回复成功" subtitle="顾客会感受到您的用心" onClose={() => setShowSuccess(false)} />

      {/* 顶部 */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3" style={{ background: 'var(--bg)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 className="text-base font-bold">评价回复</h1>
      </div>

      {statsReq.error ? (
        <ErrorBlock message={statsReq.error} onRetry={statsReq.run} />
      ) : (
        <div className="px-5 space-y-4">
          {/* 统计卡片 */}
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold" style={{ color: 'var(--blue)' }}>
                  {statsReq.loading ? <Skeleton className="h-6 w-10 inline-block" /> : `${stats?.reply_rate || 0}%`}
                </div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>回复率</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: 'var(--red)' }}>
                  {statsReq.loading ? <Skeleton className="h-6 w-10 inline-block" /> : <AnimatedNumber value={stats?.unreplied_bad || 0} />}
                </div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>未回复差评</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: 'var(--green)' }}>
                  {statsReq.loading ? <Skeleton className="h-6 w-10 inline-block" /> : <AnimatedNumber value={stats?.replied_count || 0} />}
                </div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>已回复</div>
              </div>
            </div>
          </div>

          {/* 筛选标签 */}
          <div className="flex gap-2">
            {filters.map(f => {
              const count = f.key === 'all' ? (stats?.total || 0) : f.key === 'unreplied' ? ((stats?.total || 0) - (stats?.replied_count || 0)) : f.key === 'bad' ? (stats?.bad_count || 0) : (stats?.replied_count || 0)
              return (
                <button key={f.key} onClick={() => setActiveFilter(f.key)} className="relative px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: activeFilter === f.key ? 'var(--blue)' : 'var(--bg-card)',
                    color: activeFilter === f.key ? '#fff' : 'var(--text3)',
                    border: `1px solid ${activeFilter === f.key ? 'var(--blue)' : 'var(--border)'}`,
                  }}>
                  {f.label}
                  {!statsReq.loading && count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{
                      fontSize: 9, background: activeFilter === f.key ? 'var(--blue)' : 'var(--red)',
                    }}>{count > 99 ? '99+' : count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 评价列表 */}
          {listReq.loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl p-4" style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${r.is_bad && !r.replied ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: platformColors[r.platform] || 'var(--bg-card2)' }}>
                        {(r.username || '?')[0]}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{r.username}</span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: `${platformColors[r.platform]}20`, color: platformColors[r.platform], fontSize: 10 }}>{r.platform_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarRating rating={r.rating} />
                      {r.is_bad && <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', fontSize: 10 }}>差评</span>}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>{r.content}</p>

                  {r.replied && r.reply_content ? (
                    <div className="p-3 rounded-lg mb-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-medium mb-1" style={{ color: 'var(--green)' }}>✓ 我的回复</div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{r.reply_content}</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <RippleButton className="flex-1 py-2 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)' }}
                        onClick={() => setAiTarget(r)}>
                        🤖 AI回复
                      </RippleButton>
                      <RippleButton className="flex-1 py-2 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--purple)', border: '1px solid rgba(139,92,246,0.2)' }}
                        onClick={() => setReplyTarget(r)}>
                        ✏️ 手动回复
                      </RippleButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>全部回复完成！</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>继续保持，及时回复每一条评价</p>
            </div>
          )}
        </div>
      )}

      {/* 弹窗 */}
      {replyTarget && <ReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} onSuccess={handleReplySuccess} />}
      {aiTarget && <AiReplyModal review={aiTarget} onClose={() => setAiTarget(null)} onSuccess={handleAiSuccess} />}
    </div>
  )
}
