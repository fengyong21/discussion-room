import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDiagnosisHistory } from '../api'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'

/** 根据分数返回颜色 */
function scoreColor(score) {
  if (score >= 80) return 'var(--green)'
  if (score >= 60) return 'var(--orange)'
  return 'var(--red)'
}

/** 根据分数返回背景色 */
function scoreBg(score) {
  if (score >= 80) return 'rgba(34,197,94,0.15)'
  if (score >= 60) return 'rgba(249,115,22,0.15)'
  return 'rgba(239,68,68,0.15)'
}

/** 格式化日期：只取 YYYY-MM-DD */
function formatDate(iso) {
  return iso?.slice(0, 10) || ''
}

export default function DiagnosisHistoryPage() {
  const navigate = useNavigate()
  const { data: history, loading, error, run } = useRequest(getDiagnosisHistory, [])

  useEffect(() => {
    run(20)
  }, [run])

  /** 计算变化值：当前项 - 上一项（列表按时间倒序，上一项即 index+1） */
  const getChange = (index) => {
    if (index >= history.length - 1) return null
    return history[index].overall_score - history[index + 1].overall_score
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <div
        className="flex items-center px-4 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ color: 'var(--text)' }}
          onClick={() => navigate('/profile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="flex-1 text-center text-[16px] font-semibold" style={{ color: 'var(--text)' }}>
          诊断历史
        </span>
        <div className="w-8" />
      </div>

      <div className="px-4 py-4">
        {/* 加载态 */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Skeleton className="w-[56px] h-[56px] rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="w-10 h-4" />
              </div>
            ))}
          </div>
        )}

        {/* 错误态 */}
        {!loading && error && (
          <ErrorBlock message={error} onRetry={() => run(20)} />
        )}

        {/* 空状态 */}
        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15h8" />
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
            </svg>
            <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>暂无诊断记录</p>
          </div>
        )}

        {/* 正常列表 */}
        {!loading && !error && history.length > 0 && (
          <>
            {/* 说明 */}
            <div className="mb-4">
              <span className="text-[13px]" style={{ color: 'var(--text3)' }}>
                共进行过 <span style={{ color: 'var(--text)', fontWeight: 600 }}>{history.length}</span> 次诊断
              </span>
            </div>

            {/* 历史列表 */}
            <div className="flex flex-col gap-3">
              {history.map((item, index) => {
                const change = getChange(index)
                const isFirst = index === 0
                const isLast = index === history.length - 1
                const label = isFirst ? '最新诊断' : isLast ? '首次诊断' : ''
                const color = scoreColor(item.overall_score)
                const bg = scoreBg(item.overall_score)

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl p-4 cursor-pointer"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    onClick={() => navigate(`/score?id=${item.id}`)}
                  >
                    {/* 分数方块 */}
                    <div
                      className="w-[56px] h-[56px] rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{ background: bg }}
                    >
                      <span className="text-[22px] font-bold leading-none" style={{ color }}>
                        {item.overall_score}
                      </span>
                      <span className="text-[10px] mt-[2px]" style={{ color }}>分</span>
                    </div>

                    {/* 日期和详情 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                          {formatDate(item.created_at)}
                        </span>
                        {item.source_level && (
                          <span
                            className="text-[10px] px-2 py-[1px] rounded-full"
                            style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}
                          >
                            {item.source_level}
                          </span>
                        )}
                        {label && (
                          <span
                            className="text-[10px] px-2 py-[1px] rounded-full"
                            style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                      <div className="text-[12px]" style={{ color: 'var(--text3)' }}>
                        推荐指数诊断报告
                      </div>
                    </div>

                    {/* 变化值 */}
                    <div className="shrink-0 w-[48px] text-right">
                      {change === null ? (
                        <span className="text-[13px]" style={{ color: 'var(--text3)' }}>
                          {'\u2014'}
                        </span>
                      ) : change > 0 ? (
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--green)' }}>
                          {'\u2191'}{change}
                        </span>
                      ) : change < 0 ? (
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--red)' }}>
                          {'\u2193'}{Math.abs(change)}
                        </span>
                      ) : (
                        <span className="text-[13px]" style={{ color: 'var(--text3)' }}>
                          {'\u2014'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
