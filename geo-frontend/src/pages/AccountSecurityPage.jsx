import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

/* ---------- 即将支持标签 ---------- */
function ComingSoonTag() {
  return (
    <span className="text-[11px] px-[6px] py-[1px] rounded-full" style={{ background: 'var(--bg-card2)', color: 'var(--text3)' }}>
      即将支持
    </span>
  )
}

export default function AccountSecurityPage() {
  const navigate = useNavigate()
  const { merchant, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // 从真实数据中提取信息
  const phone = merchant?.phone_number || ''
  const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'
  const shopName = merchant?.shop_name || ''
  const createdDays = merchant?.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(merchant.created_at).getTime()) / 86400000))
    : 1

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderCard = (title, items, showComingSoon = false) => (
    <div
      className="rounded-xl overflow-hidden mb-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
        {showComingSoon && <ComingSoonTag />}
      </div>
      {items.map((item, index) => (
        <div
          key={item.key}
          className="flex items-center justify-between px-4 py-[12px]"
          style={{
            borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: item.disabled ? 0.5 : 1,
          }}
        >
          <div className="flex items-center gap-2">
            {item.icon && (
              <span style={{ color: 'var(--text3)' }}>{item.icon}</span>
            )}
            <span className="text-[13px]" style={{ color: 'var(--text3)' }}>
              {item.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[13px]"
              style={{ color: item.warn ? 'var(--orange)' : item.value === '未绑定' || item.value === '未设置' ? 'var(--text3)' : 'var(--blue)' }}
            >
              {item.value}
            </span>
            {!item.disabled && (
              <span className="text-[14px]" style={{ color: 'var(--text3)' }}>&rsaquo;</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  // 登录信息 - 使用真实数据
  const loginItems = [
    { key: 'shop', label: '绑定门店', value: shopName || '未设置', icon: '🏪' },
    { key: 'phone', label: '手机号', value: maskedPhone, icon: '📱' },
    { key: 'days', label: '注册天数', value: `${createdDays}天`, icon: '📅' },
  ]

  // 安全设置 - 标记为即将支持，移除假交互
  const securityItems = [
    { key: 'password', label: '登录密码', value: '已设置', icon: '🔒', disabled: true },
    { key: 'twoStep', label: '两步验证', value: '未开启', icon: '🛡️', warn: true, disabled: true },
    { key: 'devices', label: '登录设备管理', value: '即将支持', icon: '💻', disabled: true },
  ]

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
          账号安全
        </span>
        <div className="w-8" />
      </div>

      <div className="px-4 py-4 pb-[100px]">
        {/* 安全评分概览 */}
        <div
          className="rounded-xl p-4 mb-4 flex items-center gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
            <span className="text-[22px] font-bold" style={{ color: 'var(--orange)' }}>60</span>
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>安全评分</div>
            <div className="text-[12px]" style={{ color: 'var(--text3)' }}>建议开启两步验证以提升账号安全等级</div>
            <div className="w-full h-[4px] rounded-full mt-2 overflow-hidden" style={{ background: 'var(--bg-card2)' }}>
              <div className="h-full rounded-full" style={{ width: '60%', background: 'var(--orange)' }} />
            </div>
          </div>
        </div>

        {/* 登录信息 - 真实数据 */}
        {renderCard('账号信息', loginItems)}

        {/* 安全设置 - 标记即将支持 */}
        {renderCard('安全设置', securityItems, true)}
      </div>

      {/* 退出登录确认弹窗 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-[16px] font-semibold text-center mb-2" style={{ color: 'var(--text)' }}>确认退出登录？</div>
            <div className="text-[13px] text-center mb-5" style={{ color: 'var(--text3)' }}>退出后需要重新输入验证码登录</div>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium"
                style={{ background: 'var(--bg-card2)', color: 'var(--text2)' }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                取消
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium text-white"
                style={{ background: 'var(--red)' }}
                onClick={handleLogout}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部退出登录按钮 */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-3 z-20"
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
      >
        <button
          className="w-full py-3 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: 'var(--red)' }}
          onClick={() => setShowLogoutConfirm(true)}
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
