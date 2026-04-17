import { useNavigate } from 'react-router-dom'

// 模拟数据
const profileData = {
  name: '张小面\u00AE 手工鲜面',
  phone: '138****0001',
  industry: '餐饮',
  city: '北京朝阳区',
  description: '专注手工鲜面，传承传统工艺，每日现做。精选优质小麦，手工揉制，口感劲道。招牌产品包括老坛酸菜面、红烧牛肉面、担担面等。',
  rating: '4.2',
  reviews: '186',
}

const infoItems = [
  { label: '手机号', value: profileData.phone, icon: 'phone' },
  { label: '行业', value: profileData.industry, icon: 'industry' },
  { label: '城市', value: profileData.city, icon: 'city' },
  { label: '门店简介', value: profileData.description, icon: 'desc' },
  { label: '大众点评', value: `${profileData.rating}分 \u00B7 ${profileData.reviews}条评价`, icon: 'rating' },
]

function InfoIcon({ type }) {
  switch (type) {
    case 'phone':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      )
    case 'industry':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7h-9M14 17H5M15 7l-5 10" />
        </svg>
      )
    case 'city':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'desc':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      )
    case 'rating':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E9BB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    default:
      return null
  }
}

function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen mx-auto max-w-[480px]" style={{ backgroundColor: '#0A1628' }}>
      {/* 顶部导航栏 */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #1E40AF, #0F172A)' }}
      >
        {/* 返回箭头 */}
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-base font-semibold text-white">个人资料</span>
        {/* 设置图标 */}
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* 商家头像和名称 */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
          style={{ background: 'linear-gradient(135deg, #2B7FFF, #7C4DFF)' }}
        >
          张
        </div>
        <h2 className="text-lg font-bold text-white">{profileData.name}</h2>
      </div>

      {/* 信息列表 */}
      <div className="px-4 space-y-0">
        {infoItems.map((item, index) => (
          <div
            key={item.label}
            className="flex items-start gap-3 py-4"
            style={{
              borderBottom: index < infoItems.length - 1 ? '1px solid #1A2540' : 'none',
            }}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" style={{ backgroundColor: '#1A2540' }}>
              <InfoIcon type={item.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs mb-1" style={{ color: '#8E9BB5' }}>
                {item.label}
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{
                  color: '#FFFFFF',
                  wordBreak: 'break-word',
                }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部编辑资料按钮 */}
      <div className="px-4 pt-8 pb-10">
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#2B7FFF' }}
        >
          编辑资料
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
