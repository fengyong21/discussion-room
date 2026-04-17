import { useState } from 'react'
import { runDiagnosis } from '../api'

// 将 API 返回的 score 映射为 level
function scoreToLevel(score) {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'warn'
  return 'bad'
}

const diagnosisTypes = [
  { key: 'all', label: '综合诊断' },
  { key: 'search', label: '搜索排名' },
  { key: 'review', label: '用户评价' },
  { key: 'content', label: '内容质量' },
]

const levelConfig = {
  excellent: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    label: '优秀',
  },
  good: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    label: '良好',
  },
  warn: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/20',
    label: '待改进',
  },
  bad: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20',
    label: '需关注',
  },
}

function getScoreColor(score) {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 75) return 'text-blue-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

function getScoreRingColor(score) {
  if (score >= 90) return 'stroke-emerald-400'
  if (score >= 75) return 'stroke-blue-400'
  if (score >= 60) return 'stroke-yellow-400'
  return 'stroke-red-400'
}

function getScoreBgRing(score) {
  if (score >= 90) return 'stroke-emerald-400/20'
  if (score >= 75) return 'stroke-blue-400/20'
  if (score >= 60) return 'stroke-yellow-400/20'
  return 'stroke-red-400/20'
}

function DiagnosisItem({ item, index }) {
  const [expanded, setExpanded] = useState(false)
  const config = levelConfig[item.level]

  return (
    <div
      className={`bg-gray-800/50 rounded-xl border ${config.border} p-4 sm:p-5 transition-all hover:bg-gray-800/70`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* 图标 */}
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          {item.level === 'excellent' && (
            <svg className={`w-5 h-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {item.level === 'good' && (
            <svg className={`w-5 h-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {item.level === 'warn' && (
            <svg className={`w-5 h-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {item.level === 'bad' && (
            <svg className={`w-5 h-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-200">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{item.desc}</p>
              </div>
              {/* 评分 */}
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(item.score)}`}>
                  {item.score}
                </div>
                <div className={`text-[10px] sm:text-xs mt-0.5 ${config.color}`}>
                  {config.label}
                </div>
              </div>
            </div>

          {/* 改进建议（可展开） */}
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {expanded ? '收起建议' : '查看改进建议'}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm text-gray-300">{item.suggestion}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DiagnosisPage() {
  const [diagnosisType, setDiagnosisType] = useState('all')
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState(null)
  const [error, setError] = useState(null)

  const handleDiagnosis = async () => {
    setIsDiagnosing(true)
    setDiagnosisResult(null)
    setError(null)

    try {
      const res = await runDiagnosis()
      // API 返回 { id, overall_score, dimensions: [{name, score, analysis, suggestion}], created_at }
      const mappedResult = {
        overall_score: res.overall_score,
        items: (res.dimensions || []).map((dim) => ({
          title: dim.name,
          desc: dim.analysis || '',
          score: dim.score,
          level: scoreToLevel(dim.score),
          suggestion: dim.suggestion || '',
        })),
      }
      setDiagnosisResult(mappedResult)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || '诊断失败，请稍后重试'
      setError(errorMsg)
    } finally {
      setIsDiagnosing(false)
    }
  }

  const circumference = 2 * Math.PI * 54

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100">门店诊断</h2>
        <p className="mt-2 text-gray-400">
          全面诊断门店在线表现，获取针对性优化建议。
        </p>
      </div>

      {/* 顶部操作区 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* 开始诊断按钮 */}
        <button
          onClick={handleDiagnosis}
          disabled={isDiagnosing}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            isDiagnosing
              ? 'bg-emerald-600/50 text-emerald-300 cursor-wait'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
          }`}
        >
          {isDiagnosing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              诊断中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              开始诊断
            </>
          )}
        </button>

        {/* 诊断类型选择 - 手机端横向滚动 */}
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50 overflow-x-auto w-full sm:w-auto flex-shrink-0">
          {diagnosisTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setDiagnosisType(type.key)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                diagnosisType === type.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 加载动画 */}
      {isDiagnosing && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-emerald-500"
                strokeLinecap="round"
                strokeDasharray="80 200"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-gray-400 text-sm">正在分析门店数据，请稍候...</p>
        </div>
      )}

      {/* 错误提示 */}
      {!isDiagnosing && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">诊断失败</span>
          </div>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={handleDiagnosis}
            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors border border-red-500/30"
          >
            重新诊断
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!isDiagnosing && !diagnosisResult && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <p className="text-gray-500 text-base">暂无诊断记录，点击上方按钮开始诊断</p>
          <p className="text-gray-600 text-sm mt-1">我们将从多个维度分析您的门店表现</p>
        </div>
      )}

      {/* 诊断结果 */}
      {!isDiagnosing && diagnosisResult && (
        <div className="space-y-6">
          {/* 综合评分卡片 */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
              {/* 环形评分 */}
              <div className="flex-shrink-0">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      strokeWidth="8"
                      className={getScoreBgRing(diagnosisResult.overall_score)}
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className={getScoreRingColor(diagnosisResult.overall_score)}
                      strokeDasharray={`${(diagnosisResult.overall_score / 100) * circumference} ${circumference}`}
                      style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(diagnosisResult.overall_score)}`}>
                      {diagnosisResult.overall_score}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">综合评分</span>
                  </div>
                </div>
              </div>

              {/* 评分说明 */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-200">综合诊断结果</h3>
                <p className="text-sm text-gray-400 mt-1">
                  您的门店整体表现良好，搜索排名和用户评价表现优秀，但内容丰富度和信息完整性仍需加强。
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-gray-400">优秀</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs text-gray-400">良好</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="text-xs text-gray-400">待改进</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-400">需关注</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 诊断项列表 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-300">诊断详情</h3>
            {diagnosisResult.items.map((item, index) => (
              <DiagnosisItem key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DiagnosisPage
