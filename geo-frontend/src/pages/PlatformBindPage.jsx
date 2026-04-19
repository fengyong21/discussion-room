import { useNavigate } from 'react-router-dom'

/* ---------- 模拟数据 ---------- */
const platforms = [
  {
    key: 'wechat',
    name: '微信公众号',
    bound: true,
    gradient: 'linear-gradient(135deg, #07c160, #2aae67)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.84 13.186c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
      </svg>
    ),
  },
  {
    key: 'xiaohongshu',
    name: '小红书',
    bound: true,
    gradient: 'linear-gradient(135deg, #ff2442, #ff5c77)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2zm0-3h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2zm0-3h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2z" />
      </svg>
    ),
  },
  {
    key: 'douyin',
    name: '抖音',
    bound: false,
    gradient: 'linear-gradient(135deg, #111, #333)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    key: 'weibo',
    name: '微博',
    bound: false,
    gradient: 'linear-gradient(135deg, #e6162d, #f5373b)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM20.196 9.4a5.06 5.06 0 0 0-4.746-1.176l-.3.075a.5.5 0 0 1-.606-.358.5.5 0 0 1 .358-.606l.3-.075A6.06 6.06 0 0 1 20.6 8.6a.5.5 0 0 1-.404.8z" />
      </svg>
    ),
  },
  {
    key: 'zhihu',
    name: '知乎',
    bound: false,
    gradient: 'linear-gradient(135deg, #0066ff, #3388ff)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078h5.202L12.2 8.2l1.39 1.39 1.07-1.07.07.07c.4.4.7.8.9 1.2l.01.01H7.685zm-1.39 5.85h8.4l-.3.6c-.5 1-1.2 1.9-2 2.6l-.1.1 1.4 1.4-1.1 1.1-1.4-1.4-1.4 1.4-1.1-1.1 1.4-1.4-.1-.1c-.8-.7-1.5-1.6-2-2.6l-.3-.6zm-2.5 5.4h12.4v1.4H3.795z" />
      </svg>
    ),
  },
  {
    key: 'dianping',
    name: '大众点评商家',
    bound: true,
    gradient: 'linear-gradient(135deg, #ff6633, #ff8855)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    key: 'meituan',
    name: '美团商家',
    bound: true,
    gradient: 'linear-gradient(135deg, #ffc300, #ffdd57)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    key: 'baidu',
    name: '百度地图商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #2196F3, #42a5f5)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
      </svg>
    ),
  },
  {
    key: 'gaode',
    name: '高德地图商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #1a9fff, #4db8ff)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
      </svg>
    ),
  },
  {
    key: 'eleme',
    name: '饿了么商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #0097ff, #3db4ff)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M21.21 15.89C10 15.89 5 11.57 5 6.42h2c0 4.24 4.37 7.47 14.21 7.47v2zM3 9h18v2H3zm18 4H3v2h18z" />
      </svg>
    ),
  },
  {
    key: 'koubei',
    name: '口碑商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #ff6a00, #ff8c33)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
  {
    key: 'taobao',
    name: '淘宝商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #ff5000, #ff7733)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: 'pinduoduo',
    name: '拼多多商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #e02e24, #f04840)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
  },
  {
    key: '58tongcheng',
    name: '58同城商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #ff6600, #ff8833)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
  {
    key: 'tiktok',
    name: 'TikTok（海外）',
    bound: false,
    gradient: 'linear-gradient(135deg, #25f4ee, #fe2c55)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    key: 'google',
    name: 'Google商家',
    bound: false,
    gradient: 'linear-gradient(135deg, #4285f4, #34a853)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
]

export default function PlatformBindPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <div
        className="flex items-center px-4 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          className="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg"
          style={{ color: 'var(--text)' }}
          onClick={() => navigate('/profile')}
        >
          &lsaquo;
        </button>
        <span className="flex-1 text-center text-[16px] font-semibold" style={{ color: 'var(--text)' }}>
          平台绑定
        </span>
        <div className="w-8" />
      </div>

      <div className="px-4 py-4">
        {/* 说明文字 */}
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text3)' }}>
            绑定平台后可自动同步评价数据和排名信息
          </p>
        </div>

        {/* 平台列表 */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {platforms.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-[14px]"
              style={{
                borderBottom: index < platforms.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.gradient }}
                >
                  {item.icon}
                </div>
                <span className="text-[14px]" style={{ color: 'var(--text)' }}>
                  {item.name}
                </span>
              </div>
              {item.bound ? (
                <span
                  className="text-[12px] px-3 py-[4px] rounded-full font-medium"
                  style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}
                >
                  {'\u2713'} 已绑定
                </span>
              ) : (
                <button
                  className="text-[12px] px-3 py-[4px] rounded-full font-medium"
                  style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}
                >
                  去绑定
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
