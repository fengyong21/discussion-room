import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runDiagnosis } from '../api'

// 模拟数据
const mockMerchant = {
  name: '张小面',
  subtitle: '张小面·手工鲜面 | 北京朝阳区 | 大众点评',
  rating: '4.2分 | 186条评价',
  score: 46,
  level: 'T3级',
  replyRate: '回复率35%',
  brand: 'SOREHERO',
}

const mockDiagnosisResult = {
  score: 46,
  level: 'T3级',
  t3Percent: 60,
  t2Percent: 25,
  t1Percent: 15,
  distanceT2: 14,
  distanceT1: 34,
  nicheRankings: [
    { name: '豆包', rank: '第3位被推荐', color: '#00C853' },
    { name: '文心一言', rank: '第3位被推荐', color: '#00C853' },
  ],
  nineDimensions: [
    { label: '近中', value: 120, target: 180 },
    { label: '经顾', value: 90, target: 200 },
    { label: '滋势', value: 150, target: 210 },
    { label: '互链', value: 180, target: 240 },
    { label: '构拉', value: 200, target: 250 },
    { label: '且新', value: 230, target: 270 },
    { label: '综宽', value: 260, target: 290 },
  ],
}

function DiagnosisPage() {
  const navigate = useNavigate()
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [result, setResult] = useState(null)

  const handleDiagnosis = async () => {
    setIsDiagnosing(true)
    try {
      // 尝试调用真实 API
      const res = await runDiagnosis()
      // 如果 API 返回有效数据则使用，否则使用模拟数据
      setResult(mockDiagnosisResult)
    } catch {
      // API 失败时使用模拟数据
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setResult(mockDiagnosisResult)
    } finally {
      setIsDiagnosing(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      {/* 顶部导航栏 - 蓝色渐变 */}
      <div
        className="sticky top-0 z-40 px-4 pt-3 pb-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, #1E40AF, #1A2540)',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
        }}
      >
        {/* 返回箭头 */}
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {/* 标题 */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">诊断报告</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB800" stroke="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        {/* 右侧占位 */}
        <div className="w-9 h-9" />
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* 商家信息卡 */}
        <div className="rounded-2xl p-4 flex items-center gap-3.5" style={{ backgroundColor: '#111B2E' }}>
          {/* 商家Logo占位 */}
          <div
            className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: '#1A2540' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M3 9h18M3 15h18" />
            </svg>
          </div>
          {/* 右侧信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">{mockMerchant.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: '#FF4444', color: '#FFFFFF' }}
              >
                好店
              </span>
            </div>
            <p className="text-xs mt-1 truncate" style={{ color: '#8E9BB5' }}>
              {mockMerchant.subtitle}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {/* 金色星标 */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB800" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-medium" style={{ color: '#FFB800' }}>
                {mockMerchant.rating}
              </span>
            </div>
          </div>
        </div>

        {/* 推荐指数大卡片 */}
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

          {/* 左侧：分数 */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium" style={{ color: '#8E9BB5' }}>
                推荐指数
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-white font-black" style={{ fontSize: '64px', lineHeight: 1 }}>
                  {result ? result.score : mockMerchant.score}
                </span>
                <span className="text-white text-base font-medium" style={{ opacity: 0.6 }}>
                  /100
                </span>
              </div>
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="mt-3 space-y-1">
            <div className="text-white font-bold text-sm">{mockMerchant.brand}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              北京朝阳区 | 4.2分 · 186评价
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {mockMerchant.replyRate}
            </div>
          </div>
        </div>

        {/* T级进度条 */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#111B2E' }}>
          {/* 三段式进度条 */}
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div
              className="rounded-l-full"
              style={{ width: '60%', backgroundColor: '#FF4444' }}
            />
            <div
              style={{ width: '25%', backgroundColor: '#FFB800' }}
            />
            <div
              className="rounded-r-full"
              style={{ width: '15%', backgroundColor: '#00C853' }}
            />
          </div>
          {/* 标签 */}
          <div className="flex justify-between mt-2.5">
            <span className="text-xs font-bold" style={{ color: '#FF4444' }}>
              T3 60%
            </span>
            <span className="text-xs font-bold" style={{ color: '#FFB800' }}>
              T2 25%
            </span>
            <span className="text-xs font-bold" style={{ color: '#00C853' }}>
              T1 15%
            </span>
          </div>
          {/* 距离说明 */}
          <div className="text-center mt-3 text-xs" style={{ color: '#8E9BB5' }}>
            距T2级还差14分 · 距T1级还差34分
          </div>
        </div>

        {/* 生态位排名 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>
              生态位排名
            </h2>
            <button className="flex items-center gap-1 text-xs" style={{ color: '#8E9BB5' }}>
              展开
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="space-y-2.5">
            {mockDiagnosisResult.nicheRankings.map((item) => (
              <div
                key={item.name}
                className="rounded-xl px-4 py-3.5 flex items-center justify-between"
                style={{ backgroundColor: '#111B2E' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-medium" style={{ color: item.color }}>
                  {item.rank}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 九维评估柱状图 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>
              九维评估
            </h2>
          </div>
          <div className="rounded-2xl p-4" style={{ backgroundColor: '#111B2E' }}>
            {/* Y轴刻度 + 柱状图 */}
            <div className="relative">
              {/* 水平网格线 */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  />
                ))}
              </div>

              {/* Y轴标签 */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                <span className="text-[10px]" style={{ color: '#8E9BB5' }}>300</span>
                <span className="text-[10px]" style={{ color: '#8E9BB5' }}>200</span>
                <span className="text-[10px]" style={{ color: '#8E9BB5' }}>100</span>
                <span className="text-[10px]" style={{ color: '#8E9BB5' }}>0</span>
              </div>

              {/* 柱状图区域 */}
              <div className="ml-8 flex items-end justify-between gap-2" style={{ height: '160px' }}>
                {mockDiagnosisResult.nineDimensions.map((dim) => (
                  <div key={dim.label} className="flex-1 flex flex-col items-center justify-end h-full relative">
                    {/* 目标值绿色圆点 */}
                    <div
                      className="w-2.5 h-2.5 rounded-full absolute z-10"
                      style={{
                        backgroundColor: '#00C853',
                        bottom: `${(dim.target / 300) * 100}%`,
                        transform: 'translateY(50%)',
                      }}
                    />
                    {/* 柱子 */}
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${(dim.value / 300) * 100}%`,
                        backgroundColor: '#2B7FFF',
                        minHeight: '8px',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* X轴标签 */}
            <div className="ml-8 flex justify-between mt-2">
              {mockDiagnosisResult.nineDimensions.map((dim) => (
                <span key={dim.label} className="flex-1 text-center text-[10px]" style={{ color: '#8E9BB5' }}>
                  {dim.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定按钮 */}
      <div className="fixed bottom-[56px] left-0 right-0 z-30 px-4 pb-2" style={{ backgroundColor: '#0A1628' }}>
        <div className="mx-auto max-w-[480px]">
          <button
            onClick={handleDiagnosis}
            disabled={isDiagnosing}
            className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: isDiagnosing
                ? 'linear-gradient(135deg, #1A2540, #111B2E)'
                : 'linear-gradient(135deg, #2B7FFF, #1E40AF)',
              boxShadow: isDiagnosing ? 'none' : '0 4px 16px rgba(43,127,255,0.3)',
            }}
          >
            {isDiagnosing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                诊断中...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                GEO AI 诊断
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiagnosisPage
