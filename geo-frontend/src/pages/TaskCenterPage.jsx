import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRequest, Skeleton } from '../hooks/useRequest'
import { getDiagnosisHistory, getReviewStats } from '../api'
import { Confetti, SuccessPopup, AnimatedNumber, CompletionRing, RippleButton } from '../components/UXComponents'

/* ── 任务定义 ── */
function buildTasks(diagCount, reviewStats) {
  const tasks = [
    { id: 'checkin', label: '每日签到', desc: '签到获取活跃积分', icon: '📅', points: 5, type: 'checkin' },
    { id: 'diagnose', label: '门店诊断', desc: '运行AI诊断分析', icon: '🔍', points: 20, type: 'action', done: diagCount > 0, path: '/chat?diag=1' },
    { id: 'reply_bad', label: '回复差评', desc: '回复所有未处理的差评', icon: '💬', points: 15, type: 'action', done: (reviewStats?.unreplied_bad || 0) === 0, path: '/reply' },
    { id: 'content', label: '生成文案', desc: '创建一条推广文案', icon: '✍️', points: 15, type: 'action', done: false, path: '/content' },
    { id: 'store_info', label: '完善门店信息', desc: '补充门店详细资料', icon: '🏪', points: 10, type: 'action', done: false, path: '/store-info' },
    { id: 'rank_check', label: '查看同行排行', desc: '了解竞争对手表现', icon: '📊', points: 5, type: 'action', done: false, path: '/search-rank' },
  ]
  return tasks
}

export default function TaskCenterPage() {
  const navigate = useNavigate()
  const { merchant } = useAuth()
  const [checkedIn, setCheckedIn] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successTitle, setSuccessTitle] = useState('')

  const diagReq = useRequest(getDiagnosisHistory)
  const reviewReq = useRequest(getReviewStats)

  useEffect(() => {
    diagReq.run()
    reviewReq.run()
    // 检查今日签到
    const today = new Date().toISOString().slice(0, 10)
    const checkins = JSON.parse(localStorage.getItem('geo_checkins') || '[]')
    if (checkins.includes(today)) setCheckedIn(true)
  }, [])

  const tasks = buildTasks(
    (diagReq.data || []).length,
    reviewReq.data,
  )

  const doneCount = tasks.filter(t => t.done || (t.id === 'checkin' && checkedIn)).length
  const totalPoints = tasks.reduce((sum, t) => sum + (t.done || (t.id === 'checkin' && checkedIn) ? t.points : 0), 0)
  const percent = Math.round((doneCount / tasks.length) * 100)

  const handleCheckin = () => {
    if (checkedIn) return
    const today = new Date().toISOString().slice(0, 10)
    const checkins = JSON.parse(localStorage.getItem('geo_checkins') || '[]')
    checkins.push(today)
    localStorage.setItem('geo_checkins', JSON.stringify(checkins))
    setCheckedIn(true)
    setShowConfetti(true)
    setSuccessTitle('签到成功！+5积分')
    setShowSuccess(true)
  }

  const handleTask = (task) => {
    if (task.done) return
    navigate(task.path)
  }

  // 连续签到天数
  const checkins = JSON.parse(localStorage.getItem('geo_checkins') || '[]')
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (checkins.includes(key)) streak++
    else break
  }

  return (
    <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Confetti trigger={showConfetti} />
      <SuccessPopup show={showSuccess} title={successTitle} subtitle="继续完成其他任务获取更多积分" onClose={() => setShowSuccess(false)} />

      {/* 顶部 */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3" style={{ background: 'var(--bg)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 className="text-base font-bold">每日任务</h1>
      </div>

      <div className="px-5 space-y-4">
        {/* 签到卡片 */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📅</span>
                <span className="text-base font-bold">{checkedIn ? '今日已签到' : '今日未签到'}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                {streak > 0 ? `已连续签到 ${streak} 天，继续保持！` : '签到获取活跃积分，解锁更多权益'}
              </p>
            </div>
            <RippleButton className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: checkedIn ? 'var(--bg-card2)' : 'var(--blue)',
                color: checkedIn ? 'var(--text3)' : '#fff',
                border: 'none',
              }}
              onClick={handleCheckin}>
              {checkedIn ? '✓ 已签到' : '立即签到'}
            </RippleButton>
          </div>
          {/* 连续签到进度 */}
          <div className="flex gap-1 mt-4">
            {[1,2,3,4,5,6,7].map(d => (
              <div key={d} className="flex-1 h-1.5 rounded-full" style={{
                background: d <= streak ? 'var(--blue)' : 'var(--bg-card2)',
              }} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--text3)' }}>本周签到</span>
            <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>{streak}/7天</span>
          </div>
        </div>

        {/* 任务进度 */}
        <div className="flex items-center gap-4">
          <CompletionRing percent={percent} size={52} strokeWidth={4} />
          <div className="flex-1">
            <div className="text-sm font-semibold">今日进度</div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
              已完成 {doneCount}/{tasks.length} 项任务
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--orange)' }}>
              累计 <AnimatedNumber value={totalPoints} /> 积分
            </p>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="space-y-3">
          {tasks.map(task => {
            const isDone = task.done || (task.id === 'checkin' && checkedIn)
            return (
              <div key={task.id} className="rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                  opacity: isDone ? 0.7 : 1,
                }}
                onClick={() => task.type === 'action' && handleTask(task)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: isDone ? 'rgba(34,197,94,0.1)' : 'var(--bg-card2)' }}>
                  {isDone ? '✅' : task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{task.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text3)' }}>{task.desc}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold" style={{ color: isDone ? 'var(--green)' : 'var(--orange)' }}>
                    +{task.points}
                  </div>
                  {!isDone && task.type === 'action' && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--blue)' }}>去完成 ›</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 积分说明 */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-2">💡 积分说明</h3>
          <div className="space-y-1.5 text-xs" style={{ color: 'var(--text3)' }}>
            <p>• 每日签到 +5分，连续7天额外奖励20分</p>
            <p>• 完成门店诊断 +20分（每日首次）</p>
            <p>• 回复所有差评 +15分</p>
            <p>• 生成推广文案 +15分</p>
            <p>• 积分可用于兑换平台流量券和高级功能</p>
          </div>
        </div>
      </div>
    </div>
  )
}
