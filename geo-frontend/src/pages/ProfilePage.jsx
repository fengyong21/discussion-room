import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { useRequest, Skeleton } from '../hooks/useRequest'
import { getDiagnosisHistory, getReviewStats, getMerchantProfile } from '../api'
import { AnimatedNumber } from '../components/UXComponents'

const menuGroup1 = [
  {
    label: '每日任务',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    path: '/tasks',
    badge: null,
  },
  {
    label: '门店信息',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    path: '/store-info',
    badge: null,
  },
  {
    label: '平台绑定管理',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    path: '/platforms',
    badge: null,
  },
  {
    label: '诊断历史',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    path: '/diagnosis-history',
    badge: null,
  },
]

const menuGroup2 = [
  {
    label: '消息通知',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    path: '/notifications',
    badge: 'dynamic', // 动态计算
  },
  {
    label: '通知设置',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    path: '/notification-settings',
    badge: null,
  },
  {
    label: '账号安全',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    path: '/security',
    badge: null,
  },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { merchant, logout } = useAuth()

  const profileReq = useRequest(getMerchantProfile)
  const diagReq = useRequest(getDiagnosisHistory)
  const reviewReq = useRequest(getReviewStats)

  useEffect(() => {
    profileReq.run()
    diagReq.run()
    reviewReq.run()
  }, [])

  const shopName = merchant?.shop_name || '加载中...'
  const firstChar = shopName.charAt(0)
  const profile = profileReq.data
  const history = diagReq.data || []
  const latest = history[0]
  const previous = history[1]
  const score = latest?.overall_score || 0
  const level = latest?.source_level || '--'
  const trend = (latest && previous) ? (latest.overall_score - previous.overall_score) : 0

  const levelColor = level === 'T1' ? 'var(--green)' : level === 'T2' ? 'var(--orange)' : 'var(--red)'
  const levelBg = level === 'T1' ? 'var(--green-glow)' : level === 'T2' ? 'var(--orange-glow)' : 'var(--red-glow)'

  const unreadBad = reviewReq.data?.unreplied_bad || 0

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="px-4 py-4 pb-[90px]" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 头像区 */}
      <div className="flex flex-col items-center pt-4 mb-6">
        <div className="relative mb-3">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[28px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
            {firstChar}
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2" style={{ background: 'var(--green)', borderColor: 'var(--bg)' }} />
        </div>
        <div className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>{shopName}</div>
        <div className="text-[12px] mt-1" style={{ color: 'var(--text3)' }}>
          {profile?.city ? `${profile.city}${profile.district ? ' ' + profile.district : ''}` : '--'} · {profile?.industry || '--'}
        </div>
      </div>

      {/* 推荐指数卡片 */}
      <div className="rounded-xl p-4 mb-5 cursor-pointer" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={() => navigate('/score')}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] mb-2" style={{ color: 'var(--text3)' }}>推荐指数</div>
            <div className="flex items-end gap-2">
              <span className="text-[36px] font-bold leading-none" style={{ color: 'var(--text)' }}>
                {diagReq.loading ? <Skeleton className="h-9 w-16 inline-block" /> : <AnimatedNumber value={score} />}
              </span>
              <span className="text-[14px] mb-1" style={{ color: 'var(--text3)' }}>/100</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[12px] px-3 py-[3px] rounded-full font-medium" style={{ background: levelBg, color: levelColor }}>
              {level}
            </span>
            {trend !== 0 && (
              <div className="flex items-center gap-1 text-[12px]" style={{ color: trend > 0 ? 'var(--green)' : 'var(--red)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={trend > 0 ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"}/>
                </svg>
                {trend > 0 ? '+' : ''}{trend}分
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--blue)' }}>
            {diagReq.loading ? <Skeleton className="h-5 w-8 inline-block" /> : history.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>诊断次数</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--green)' }}>
            {reviewReq.loading ? <Skeleton className="h-5 w-8 inline-block" /> : `${reviewReq.data?.reply_rate || 0}%`}
          </div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>回复率</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--orange)' }}>
            {reviewReq.loading ? <Skeleton className="h-5 w-8 inline-block" /> : reviewReq.data?.total || 0}
          </div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>总评价</div>
        </div>
      </div>

      {/* 功能菜单第一组 */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {menuGroup1.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-[14px] cursor-pointer active:bg-[rgba(255,255,255,0.03)] transition-colors"
            style={{ borderBottom: index < menuGroup1.length - 1 ? '1px solid var(--border)' : 'none' }}
            onClick={() => navigate(item.path)}>
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card2)' }}>
                {item.icon}
              </div>
              <span className="text-[14px]" style={{ color: 'var(--text)' }}>{item.label}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
      </div>

      {/* 功能菜单第二组 */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {menuGroup2.map((item, index) => {
          const badgeCount = item.badge === 'dynamic' ? unreadBad : item.badge
          return (
            <div key={item.label} className="flex items-center justify-between px-4 py-[14px] cursor-pointer active:bg-[rgba(255,255,255,0.03)] transition-colors"
              style={{ borderBottom: index < menuGroup2.length - 1 ? '1px solid var(--border)' : 'none' }}
              onClick={() => navigate(item.path)}>
              <div className="flex items-center gap-3">
                <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center relative" style={{ background: 'var(--bg-card2)' }}>
                  {item.icon}
                  {badgeCount && Number(badgeCount) > 0 && (
                    <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                      style={{ background: 'var(--red)' }}>{badgeCount}</span>
                  )}
                </div>
                <span className="text-[14px]" style={{ color: 'var(--text)' }}>{item.label}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )
        })}
      </div>

      {/* 退出登录 */}
      <button className="w-full py-3 rounded-xl text-sm font-medium mb-4"
        style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
        onClick={handleLogout}>
        退出登录
      </button>

      {/* 底部版本号 */}
      <div className="text-center text-[11px]" style={{ color: 'var(--text3)' }}>
        GEO智能助手 v1.1.0
      </div>
    </div>
  )
}
