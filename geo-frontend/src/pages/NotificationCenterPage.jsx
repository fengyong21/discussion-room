import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest } from '../hooks/useRequest'
import { getReviewStats, getDiagnosisHistory } from '../api'
import { AnimatedNumber } from '../components/UXComponents'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

/* ── 生成智能通知 ── */
function generateNotifications(reviewStats, diagHistory) {
  const notifications = []

  // 差评预警
  if (reviewStats?.unreplied_bad > 0) {
    notifications.push({
      id: 'bad_review',
      type: 'danger',
      icon: '🔴',
      title: `${reviewStats.unreplied_bad}条差评待回复`,
      desc: '不及时回复差评可能影响潜在客户决策，建议30分钟内回复',
      time: new Date(Date.now() - 3600000).toISOString(),
      path: '/reply',
      read: false,
    })
  }

  // 新评价提醒
  if (reviewStats?.total > 0) {
    notifications.push({
      id: 'new_review',
      type: 'info',
      icon: '💬',
      title: '收到新的用户评价',
      desc: `综合评分 ${reviewStats.avg_rating}分，好评率 ${reviewStats.good_rate}%`,
      time: new Date(Date.now() - 7200000).toISOString(),
      path: '/reviews',
      read: false,
    })
  }

  // 诊断提醒
  if (diagHistory && diagHistory.length > 0) {
    const latest = diagHistory[0]
    notifications.push({
      id: 'diag_done',
      type: 'success',
      icon: '🔍',
      title: `诊断完成：${latest.overall_score || '--'}分`,
      desc: latest.source_level ? `来源等级 ${latest.source_level}，查看详细优化建议` : '查看详细分析报告',
      time: latest.created_at || new Date(Date.now() - 86400000).toISOString(),
      path: '/score',
      read: true,
    })
  } else {
    notifications.push({
      id: 'no_diag',
      type: 'warning',
      icon: '⚠️',
      title: '您还未进行首次诊断',
      desc: '同区域78%的商家已完成AI诊断，及时了解门店曝光状况',
      time: new Date(Date.now() - 172800000).toISOString(),
      path: '/chat?diag=1',
      read: false,
    })
  }

  // 系统通知
  notifications.push(
    { id: 'sys1', type: 'info', icon: '📢', title: '平台更新通知', desc: '新增AI智能回复功能，可一键生成个性化评价回复', time: new Date(Date.now() - 259200000).toISOString(), path: '/reply', read: true },
    { id: 'sys2', type: 'info', icon: '🎉', title: '欢迎使用GEO智能助手', desc: '完成每日任务获取积分，提升门店曝光和排名', time: new Date(Date.now() - 604800000).toISOString(), path: '/profile', read: true },
  )

  // 经营建议
  if (reviewStats?.reply_rate < 80) {
    notifications.push({
      id: 'tip_reply',
      type: 'warning',
      icon: '💡',
      title: '回复率有待提升',
      desc: `当前回复率${reviewStats.reply_rate}%，提升至90%以上可增加12%的回头客`,
      time: new Date(Date.now() - 432000000).toISOString(),
      path: '/reply',
      read: false,
    })
  }

  return notifications
}

const typeStyles = {
  danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
}

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
]

export default function NotificationCenterPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  const reviewReq = useRequest(getReviewStats)
  const diagReq = useRequest(getDiagnosisHistory)

  useEffect(() => {
    reviewReq.run()
    diagReq.run()
  }, [])

  const notifications = generateNotifications(reviewReq.data, diagReq.data)
  const filtered = activeFilter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  const handleRead = (notif) => {
    // 标记已读（本地）
    const read = JSON.parse(localStorage.getItem('geo_read_notifs') || '[]')
    if (!read.includes(notif.id)) {
      read.push(notif.id)
      localStorage.setItem('geo_read_notifs', JSON.stringify(read))
    }
    if (notif.path) navigate(notif.path)
  }

  return (
    <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部 */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3" style={{ background: 'var(--bg)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text')" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 className="text-base font-bold">消息中心</h1>
        {unreadCount > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--red)' }}>
            {unreadCount}
          </span>
        )}
      </div>

      <div className="px-5 space-y-3">
        {/* 筛选 */}
        <div className="flex gap-2">
          {filterTabs.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: activeFilter === f.key ? 'var(--blue)' : 'var(--bg-card)',
                color: activeFilter === f.key ? '#fff' : 'var(--text3)',
                border: `1px solid ${activeFilter === f.key ? 'var(--blue)' : 'var(--border)'}`,
              }}>
              {f.label} {f.key === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {/* 通知列表 */}
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map(n => {
              const style = typeStyles[n.type] || typeStyles.info
              return (
                <div key={n.id} className="rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ background: `${style.bg}`, border: `1px solid ${style.border}` }}
                  onClick={() => handleRead(n)}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--red)' }} />}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{n.desc}</p>
                      <span className="text-xs mt-1.5 block" style={{ color: 'var(--text3)' }}>{timeAgo(n.time)}</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-3"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              {activeFilter === 'unread' ? '没有未读消息' : '暂无通知'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
