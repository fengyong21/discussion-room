import { useState } from 'react'

const mockProfile = {
  shop_name: '张小面·手工鲜面',
  phone: '13800000001',
  industry: '餐饮',
  city: '北京',
  district: '朝阳区',
  address: '建国路88号SOHO现代城B座1层',
  description: '专注手工鲜面，传承传统工艺，每日现做。',
  business_hours: '09:00-22:00',
}

const menuItems = [
  { key: 'shop', label: '门店信息', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'security', label: '账号安全', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { key: 'notification', label: '通知设置', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
]

const industryOptions = ['餐饮', '零售', '教育', '美容', '其他']

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        enabled ? 'bg-emerald-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('shop')
  const [profile, setProfile] = useState({ ...mockProfile })
  const [saved, setSaved] = useState(false)

  // 账号安全
  const [passwords, setPasswords] = useState({
    current: '',
    newPwd: '',
    confirm: '',
  })
  const [pwdMsg, setPwdMsg] = useState('')

  // 通知设置
  const [notifications, setNotifications] = useState({
    diagnosisDone: true,
    contentDone: true,
    rankingChange: false,
  })

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSaveProfile = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePwdChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
    setPwdMsg('')
  }

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.newPwd || !passwords.confirm) {
      setPwdMsg('请填写所有密码字段')
      return
    }
    if (passwords.newPwd.length < 6) {
      setPwdMsg('新密码长度不能少于6位')
      return
    }
    if (passwords.newPwd !== passwords.confirm) {
      setPwdMsg('两次输入的新密码不一致')
      return
    }
    setPwdMsg('密码修改成功')
    setPasswords({ current: '', newPwd: '', confirm: '' })
  }

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">设置</h2>
        <p className="mt-1 text-gray-500">管理您的账号和商家信息。</p>
      </div>

      <div className="flex gap-6">
        {/* 左侧导航菜单 */}
        <aside className="w-56 shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.key
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 右侧表单区域 */}
        <div className="flex-1 min-w-0">
          {/* ========== 门店信息 ========== */}
          {activeTab === 'shop' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-100">门店信息</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 门店名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    门店名称
                  </label>
                  <input
                    type="text"
                    value={profile.shop_name}
                    onChange={(e) => handleProfileChange('shop_name', e.target.value)}
                    className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* 手机号（只读） */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    手机号
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    readOnly
                    className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-500 px-3.5 py-2.5 text-sm cursor-not-allowed"
                  />
                </div>

                {/* 行业 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    行业
                  </label>
                  <select
                    value={profile.industry}
                    onChange={(e) => handleProfileChange('industry', e.target.value)}
                    className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
                  >
                    {industryOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#1a2236] text-gray-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 城市 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    城市
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* 区县 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    区县
                  </label>
                  <input
                    type="text"
                    value={profile.district}
                    onChange={(e) => handleProfileChange('district', e.target.value)}
                    className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* 营业时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    营业时间
                  </label>
                  <input
                    type="text"
                    value={profile.business_hours}
                    onChange={(e) => handleProfileChange('business_hours', e.target.value)}
                    placeholder="如 09:00-22:00"
                    className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* 详细地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  详细地址
                </label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* 门店简介 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  门店简介
                </label>
                <textarea
                  rows={3}
                  value={profile.description}
                  onChange={(e) => handleProfileChange('description', e.target.value)}
                  className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* 保存按钮 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                >
                  保存修改
                </button>
                {saved && (
                  <span className="text-sm text-emerald-400 animate-pulse">
                    已保存
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ========== 账号安全 ========== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* 修改密码 */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
                <h3 className="text-lg font-semibold text-gray-100">修改密码</h3>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      当前密码
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => handlePwdChange('current', e.target.value)}
                      placeholder="请输入当前密码"
                      className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      新密码
                    </label>
                    <input
                      type="password"
                      value={passwords.newPwd}
                      onChange={(e) => handlePwdChange('newPwd', e.target.value)}
                      placeholder="请输入新密码（至少6位）"
                      className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      确认新密码
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => handlePwdChange('confirm', e.target.value)}
                      placeholder="请再次输入新密码"
                      className="w-full rounded-lg bg-[#1a2236] border border-[#1e293b] text-gray-100 px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    修改密码
                  </button>
                  {pwdMsg && (
                    <span
                      className={`text-sm ${
                        pwdMsg === '密码修改成功' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {pwdMsg}
                    </span>
                  )}
                </div>
              </div>

              {/* 管理员密钥 */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-100">管理员密钥</h3>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      true
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        true ? 'bg-emerald-400' : 'bg-gray-400'
                      }`}
                    />
                    已配置
                  </span>
                  <span className="text-sm text-gray-500">
                    管理员密钥用于高级功能授权，请联系超级管理员配置。
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========== 通知设置 ========== */}
          {activeTab === 'notification' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-100">通知设置</h3>

              <div className="space-y-5">
                {/* 诊断完成通知 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">诊断完成通知</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      门店诊断任务完成后推送通知
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.diagnosisDone}
                    onChange={() => handleNotificationChange('diagnosisDone')}
                  />
                </div>

                <div className="border-t border-gray-800" />

                {/* 内容生成完成通知 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">内容生成完成通知</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      AI 内容生成任务完成后推送通知
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.contentDone}
                    onChange={() => handleNotificationChange('contentDone')}
                  />
                </div>

                <div className="border-t border-gray-800" />

                {/* 竞品排名变动通知 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">竞品排名变动通知</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      竞品排名发生显著变动时推送通知
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.rankingChange}
                    onChange={() => handleNotificationChange('rankingChange')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
