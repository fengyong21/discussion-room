import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContentList } from '../api'
import { useRequest, Skeleton, ErrorBlock, EmptyState } from '../hooks/useRequest'
import { RippleButton } from '../components/UXComponents'

const categories = ['全部', '种草文案', '评价回复']

const contentTypeMap = {
  purchase_guide: '种草文案',
  faq: '评价回复',
}

const statusConfig = {
  draft:     { label: '查看',   color: 'var(--blue)',  bg: 'var(--blue-glow)' },
  published: { label: '已发布', color: 'var(--green)', bg: 'var(--green-glow)' },
  failed:    { label: '失败',   color: 'var(--red)',   bg: 'var(--red-glow)' },
}

const gradientMap = {
  purchase_guide: 'linear-gradient(135deg, var(--blue), var(--purple))',
  faq: 'linear-gradient(135deg, var(--orange), var(--red))',
}

const TypeIcons = {
  '种草文案': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  '评价回复': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
}

function formatRelativeTime(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay === 1) return '昨天'
  if (diffDay < 7) return `${diffDay}天前`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`
  return `${Math.floor(diffDay / 30)}个月前`
}

/* ── 内容预览弹窗 ── */
function PreviewModal({ item, onClose, onCopy }) {
  const typeName = contentTypeMap[item.content_type] || item.content_type
  const gradient = gradientMap[item.content_type] || gradientMap.purchase_guide
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content || '')
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = item.content || ''
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--bg-card)', animation: 'slideUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: gradient }}>
              {(TypeIcons[typeName] || TypeIcons['种草文案'])}
            </div>
            <div>
              <div className="text-sm font-bold">{item.title}</div>
              <div className="text-xs" style={{ color: 'var(--text3)' }}>{typeName} · {formatRelativeTime(item.created_at)}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-lg" style={{ color: 'var(--text3)' }}>✕</button>
        </div>

        {/* 内容预览 */}
        <div className="rounded-xl p-4 mb-4 whitespace-pre-wrap text-sm leading-relaxed" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          {item.content || '暂无内容'}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <RippleButton className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: copied ? 'var(--green)' : 'var(--blue)', color: '#fff', border: 'none' }}
            onClick={handleCopy}>
            {copied ? '✓ 已复制' : '📋 复制文案'}
          </RippleButton>
          <RippleButton className="py-2.5 px-4 rounded-xl text-sm font-medium"
            style={{ background: 'var(--bg-card2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            onClick={onClose}>
            关闭
          </RippleButton>
        </div>

        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      </div>
    </div>
  )
}

export default function ContentWorkshopPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [toast, setToast] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)

  const { data, loading, error, run } = useRequest(getContentList, null)

  useEffect(() => { run(20) }, [run])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const contents = data?.contents || []

  const stats = useMemo(() => {
    const total = contents.length
    const published = contents.filter(c => c.status === 'published').length
    const draft = contents.filter(c => c.status === 'draft').length
    return [
      { label: '已生成', value: total, color: 'var(--blue)', bg: 'var(--blue-glow)' },
      { label: '已发布', value: published, color: 'var(--green)', bg: 'var(--green-glow)' },
      { label: '草稿',   value: draft, color: 'var(--orange)', bg: 'var(--orange-glow)' },
    ]
  }, [contents])

  const filteredList = useMemo(() => {
    if (activeCategory === '全部') return contents
    const targetType = Object.entries(contentTypeMap).find(([, v]) => v === activeCategory)?.[0]
    return targetType ? contents.filter(c => c.content_type === targetType) : contents
  }, [contents, activeCategory])

  const handleCopyDirect = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content || '')
      setToast('✓ 已复制到剪贴板')
    } catch {
      setToast('复制失败，请手动复制')
    }
  }

  return (
    <div className="px-4 py-4 pb-[90px]" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[20px] font-bold" style={{ color: 'var(--text)' }}>内容工坊</div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--text3)' }}>AI帮你生成优化内容</div>
        </div>
        <div className="w-[36px] h-[36px] rounded-xl flex items-center justify-center cursor-pointer"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          onClick={() => navigate('/chat')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-[24px] font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 分类 */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <div key={cat} className="px-4 py-[6px] rounded-full text-[12px] cursor-pointer whitespace-nowrap shrink-0"
            style={{
              background: activeCategory === cat ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))' : 'var(--bg-card)',
              color: activeCategory === cat ? '#fff' : 'var(--text2)',
              border: activeCategory === cat ? 'none' : '1px solid var(--border)',
            }}
            onClick={() => setActiveCategory(cat)}>
            {cat}
          </div>
        ))}
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="flex flex-col gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <Skeleton className="w-[44px] h-[44px] rounded-xl shrink-0" />
              <div className="flex-1"><Skeleton className="h-[13px] w-3/4 rounded mb-2" /><Skeleton className="h-[11px] w-1/2 rounded" /></div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && <ErrorBlock message={error} onRetry={() => run(20)} />}

      {!loading && !error && filteredList.length === 0 && <EmptyState message="暂无内容，点击右上角 + 生成" />}

      {/* 内容列表 */}
      {!loading && !error && filteredList.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {filteredList.map((item) => {
            const typeName = contentTypeMap[item.content_type] || item.content_type
            const config = statusConfig[item.status] || statusConfig.draft
            const gradient = gradientMap[item.content_type] || gradientMap.purchase_guide
            const icon = TypeIcons[typeName] || TypeIcons['种草文案']
            // 内容摘要（取前40字）
            const summary = (item.content || '').slice(0, 40) + ((item.content || '').length > 40 ? '...' : '')

            return (
              <div key={item.id} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0" style={{ background: gradient, color: '#fff' }}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPreviewItem(item)}>
                    <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{item.title}</div>
                    <div className="text-[11px] mt-1 truncate" style={{ color: 'var(--text3)' }}>{summary}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{typeName} · {formatRelativeTime(item.created_at)}</div>
                  </div>
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-1.5 rounded-lg" style={{ background: 'var(--bg-card2)', border: 'none' }}
                      onClick={() => handleCopyDirect(item)} title="复制">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                    <div className={`px-3 py-[5px] rounded-lg text-[11px] font-medium ${item.status === 'draft' ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{ background: config.bg, color: config.color }}
                      onClick={() => item.status === 'draft' ? setPreviewItem(item) : null}>
                      {config.label}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 底部入口 */}
      <div className="rounded-xl p-4 flex items-center justify-between cursor-pointer"
        style={{ background: 'linear-gradient(135deg, var(--bg-card2), var(--bg-card))', border: '1px solid var(--border)' }}
        onClick={() => navigate('/search-rank')}>
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-white text-sm"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--blue))' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <div>
            <div className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>竞品排行</div>
            <div className="text-[11px]" style={{ color: 'var(--text3)' }}>查看同行业门店排名对比</div>
          </div>
        </div>
        <span className="text-[16px]" style={{ color: 'var(--text3)' }}>&rsaquo;</span>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-[13px] font-medium z-50"
          style={{ background: 'var(--bg-card)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'fadeInOut 2s ease-in-out forwards' }}>
          {toast}
        </div>
      )}

      {/* 预览弹窗 */}
      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} onCopy={() => setToast('✓ 已复制到剪贴板')} />}

      <style>{`
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translate(-50%, -8px); }
          15%  { opacity: 1; transform: translate(-50%, 0); }
          75%  { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
      `}</style>
    </div>
  )
}
