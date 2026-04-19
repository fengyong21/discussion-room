// 时间格式化（相对时间）
export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = Date.now()
  const date = new Date(dateStr)
  const diff = now - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString('zh-CN')
}

// 平台颜色映射
export const platformColors = {
  '大众点评': { bg: 'rgba(255,106,0,0.12)', color: '#FF6A00' },
  '抖音': { bg: 'rgba(0,0,0,0.12)', color: '#fff' },
  '小红书': { bg: 'rgba(255,42,65,0.12)', color: '#FF2A41' },
  '百度地图': { bg: 'rgba(66,133,244,0.12)', color: '#4285F4' },
  '高德地图': { bg: 'rgba(0,168,107,0.12)', color: '#00A86B' },
  '美团': { bg: 'rgba(255,212,0,0.12)', color: '#FFD400' },
}

// 星级评分组件
export function StarRating({ rating, size = 14 }) {
  return (
    <div className="inline-flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24" fill={star <= rating ? '#FBBF24' : 'none'} stroke={star <= rating ? '#FBBF24' : 'var(--text3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}
