import { useState } from 'react'
import { generateContent } from '../api'

// 分类 Tab 数据
const categoryTabs = [
  { key: 'all', label: '全部' },
  { key: 'source', label: '信源建设' },
  { key: 'marketing', label: '内容营销' },
  { key: 'trust', label: '信任构建' },
]

// 内容列表模拟数据
const contentItems = [
  {
    id: 1,
    title: 'Q&A问答！必礼',
    subtitle: 'SUIDOALIES',
    iconBg: '#2B7FFF',
    iconType: 'document',
    action: null,
  },
  {
    id: 2,
    title: '数据图表，结构化',
    subtitle: 'ROSPY DESRPT',
    iconBg: '#FF8C00',
    iconType: 'chart',
    action: { label: '管理', color: '#EC4899' },
  },
  {
    id: 3,
    title: '改进报告，信任',
    subtitle: 'RBEVB FCHI',
    iconBg: '#FF8C00',
    iconType: 'report',
    action: { label: '查看', color: '#EC4899' },
  },
]

function ContentPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const merchantStr = localStorage.getItem('merchant')
      let merchant_id = ''
      if (merchantStr) {
        try {
          const merchant = JSON.parse(merchantStr)
          merchant_id = merchant.id || merchant.merchant_id || ''
        } catch {
          // ignore
        }
      }
      await generateContent({
        merchant_id,
        content_type: 'purchase_guide',
        topic: '门店内容生成',
      })
    } catch {
      // 模拟生成延迟
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      {/* 顶部区域 */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 用户头像 */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2B7FFF, #7C4DFF)' }}
            >
              张
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                内容工坊
              </h1>
              <p className="text-xs mt-0.5" style={{ color: '#8E9BB5' }}>
                GEO AI 助手
              </p>
            </div>
          </div>
          {/* 蓝色圆形+按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#2B7FFF' }}
          >
            {isGenerating ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="4" />
                <path className="opacity-75" fill="#FFFFFF" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 统计行 */}
      <div className="px-4 mt-3">
        <div className="flex gap-2.5">
          {[
            { value: '12', unit: '篇', label: '已生成' },
            { value: '8', unit: '', label: '发布' },
            { value: '72', unit: '', label: '平均评分' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-xl py-3.5 flex flex-col items-center justify-center"
              style={{ backgroundColor: '#111B2E' }}
            >
              <div className="flex items-baseline gap-0.5">
                <span className="text-white font-black text-2xl">{stat.value}</span>
                {stat.unit && (
                  <span className="text-white text-xs font-medium">{stat.unit}</span>
                )}
              </div>
              <span className="text-[11px] mt-1" style={{ color: '#8E9BB5' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 分类Tab导航 */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: '#111B2E' }}>
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? '#2B7FFF' : 'transparent',
                color: activeTab === tab.key ? '#FFFFFF' : '#8E9BB5',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 特色内容卡片（2个大卡片横排） */}
      <div className="px-4 mt-4">
        <div className="flex gap-3">
          {/* 左卡 - 绿色渐变 */}
          <div
            className="flex-[1.6] rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #00C853, #009624)', minHeight: '120px' }}
          >
            <div className="relative z-10">
              <div className="text-white font-bold text-base">选购指南</div>
              <div className="text-white font-bold text-base mt-0.5">AI友爱</div>
              <div className="text-white/70 text-[11px] mt-2">技术白皮书</div>
            </div>
            {/* 装饰大字 */}
            <div className="absolute -bottom-2 -right-2 text-white/10 font-black" style={{ fontSize: '80px' }}>
              S
            </div>
          </div>

          {/* 右卡 - 紫色渐变 */}
          <div
            className="flex-1 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #7C4DFF, #5E35B1)', minHeight: '120px' }}
          >
            {/* 标签 */}
            <div
              className="self-end px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
            >
              平均评分
            </div>
            {/* 分数 */}
            <div>
              <div className="text-white font-black" style={{ fontSize: '40px', lineHeight: 1 }}>
                72
              </div>
              <div className="text-white/60 text-xs mt-1">全部</div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容列表区域标题 */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
            CONTENT STRATEGY
          </h2>
          <button className="flex items-center gap-1 text-xs" style={{ color: '#8E9BB5' }}>
            批量生成
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* 内容列表 */}
      <div className="px-4 mt-3 pb-4 space-y-3">
        {contentItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
            style={{ backgroundColor: '#111B2E' }}
          >
            {/* 左侧图标 */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.iconBg }}
            >
              {item.iconType === 'document' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              )}
              {item.iconType === 'chart' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              )}
              {item.iconType === 'report' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8M16 17H8" />
                </svg>
              )}
            </div>

            {/* 中间文字 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>
                {item.title}
              </div>
              <div className="text-[11px] mt-0.5 truncate" style={{ color: '#8E9BB5' }}>
                {item.subtitle}
              </div>
            </div>

            {/* 右侧操作 */}
            {item.action ? (
              <button
                className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                style={{
                  backgroundColor: `${item.action.color}20`,
                  color: item.action.color,
                }}
              >
                {item.action.label}
              </button>
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A2540' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContentPage
