import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMerchantProfile, updateMerchantProfile } from '../api'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'

/* ---------- 7 个可编辑字段定义 ---------- */
const FIELDS = [
  { key: 'shop_name', label: '门店名称', placeholder: '请输入门店名称', required: true },
  { key: 'address', label: '地址', placeholder: '请输入详细地址', required: true },
  { key: 'phone_number', label: '电话', placeholder: '请输入联系电话', type: 'tel', pattern: /^1[3-9]\d{9}$/, errorMsg: '请输入正确的手机号' },
  { key: 'business_hours', label: '营业时间', placeholder: '如 09:00-22:00', pattern: /^\d{2}:\d{2}-\d{2}:\d{2}$/, errorMsg: '格式：09:00-22:00' },
  { key: 'industry', label: '行业', placeholder: '请输入所属行业' },
  { key: 'city', label: '城市', placeholder: '请输入所在城市' },
  { key: 'district', label: '区域', placeholder: '请输入所在区域' },
]

/* ---------- 补充信息（暂无后端支持） ---------- */
const extraInfo = [
  { key: 'parking', label: '停车位', value: '', placeholder: '即将支持' },
  { key: 'wifi', label: 'WiFi', value: '', placeholder: '即将支持' },
  { key: 'specialties', label: '特色菜品', value: '即将支持', badge: true },
  { key: 'photos', label: '门店照片', value: '即将支持', badge: true },
  { key: 'video', label: '门店视频', value: '', placeholder: '即将支持' },
]

export default function StoreInfoPage() {
  const navigate = useNavigate()

  const {
    data: profile,
    loading,
    error,
    run: fetchProfile,
  } = useRequest(getMerchantProfile)

  const {
    loading: saving,
    run: saveProfile,
  } = useRequest(updateMerchantProfile)

  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingNavigate, setPendingNavigate] = useState(null)
  const initialFormRef = useRef({})
  const hasSavedRef = useRef(false)

  /* 初始化表单 */
  useEffect(() => {
    if (profile) {
      const init = {
        shop_name: profile.shop_name || '',
        address: profile.address || '',
        phone_number: profile.phone_number || '',
        business_hours: profile.business_hours || '',
        industry: profile.industry || '',
        city: profile.city || '',
        district: profile.district || '',
      }
      setForm(init)
      initialFormRef.current = { ...init }
    }
  }, [profile])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  /* 自动隐藏 toast */
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  /* 检测表单是否有修改 */
  const isDirty = useCallback(() => {
    return FIELDS.some(f => (form[f.key] || '') !== (initialFormRef.current[f.key] || ''))
  }, [form])

  /* 表单校验 */
  const validate = useCallback(() => {
    const newErrors = {}
    FIELDS.forEach(f => {
      const val = (form[f.key] || '').trim()
      if (f.required && !val) {
        newErrors[f.key] = `${f.label}不能为空`
      } else if (val && f.pattern && !f.pattern.test(val)) {
        newErrors[f.key] = f.errorMsg || `${f.label}格式不正确`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    // 清除该字段的错误
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  /* 计算信息完整度 */
  const filledCount = FIELDS.filter(f => form[f.key] && form[f.key].trim()).length
  const completeness = Math.round((filledCount / FIELDS.length) * 100)
  const remaining = FIELDS.length - filledCount

  /* 保存 */
  const handleSave = useCallback(async () => {
    if (!validate()) {
      setToast('请检查表单中的错误')
      return
    }
    const payload = {}
    FIELDS.forEach(f => {
      if (form[f.key] && form[f.key].trim()) {
        payload[f.key] = form[f.key].trim()
      }
    })
    const result = await saveProfile(payload)
    if (result) {
      setToast('保存成功')
      initialFormRef.current = { ...form }
      hasSavedRef.current = true
    }
  }, [form, saveProfile, validate])

  /* 离开提醒 */
  const handleNavigateBack = useCallback(() => {
    if (isDirty() && !hasSavedRef.current) {
      setShowLeaveConfirm(true)
      setPendingNavigate(() => () => navigate('/profile'))
    } else {
      navigate('/profile')
    }
  }, [isDirty, navigate])

  const confirmLeave = useCallback(() => {
    setShowLeaveConfirm(false)
    if (pendingNavigate) {
      pendingNavigate()
      setPendingNavigate(null)
    }
  }, [pendingNavigate])

  /* ---- 加载态 ---- */
  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="flex items-center px-4 py-3 sticky top-0 z-10" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="flex-1 h-5 mx-4" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <div className="px-4 py-4">
          <Skeleton className="w-full h-[88px] mb-4" />
          <Skeleton className="w-full h-[280px] mb-4" />
          <Skeleton className="w-full h-[220px]" />
        </div>
      </div>
    )
  }

  /* ---- 错误态 ---- */
  if (error) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="flex items-center px-4 py-3 sticky top-0 z-10" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--text)' }} onClick={() => navigate('/profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="flex-1 text-center text-[16px] font-semibold" style={{ color: 'var(--text)' }}>门店信息</span>
          <div className="w-8" />
        </div>
        <ErrorBlock message={error} onRetry={fetchProfile} />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 py-3 sticky top-0 z-10" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--text)' }} onClick={handleNavigateBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="flex-1 text-center text-[16px] font-semibold" style={{ color: 'var(--text)' }}>门店信息</span>
        <div className="w-8" />
      </div>

      <div className="px-4 py-4 pb-[100px]">
        {/* 信息完整度 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px]" style={{ color: 'var(--text3)' }}>信息完整度</span>
            <span className="text-[13px] font-semibold" style={{ color: completeness >= 80 ? 'var(--green)' : completeness >= 50 ? 'var(--orange)' : 'var(--red)' }}>{completeness}%</span>
          </div>
          <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--bg-card2)' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${completeness}%`,
              background: completeness >= 80 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : completeness >= 50 ? 'linear-gradient(90deg, #f97316, #fb923c)' : 'linear-gradient(90deg, #ef4444, #f87171)',
            }} />
          </div>
          <div className="text-[11px] mt-2" style={{ color: 'var(--text3)' }}>
            {remaining > 0
              ? `再补充${remaining}项信息可提升完整度，有助于提高推荐指数`
              : '信息已全部填写完成，推荐指数将获得加成'}
          </div>
        </div>

        {/* 基本信息卡片 */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>基本信息</span>
          </div>
          {FIELDS.map((item, index) => {
            const displayValue = form[item.key] || ''
            const isUnset = !displayValue
            const hasError = errors[item.key]
            return (
              <div key={item.key} className="px-4 py-[12px]" style={{ borderBottom: index < FIELDS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] w-[80px] shrink-0" style={{ color: hasError ? 'var(--red)' : 'var(--text3)' }}>
                    {item.label}{item.required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
                  </span>
                  <input
                    className="flex-1 text-right text-[13px] bg-transparent outline-none"
                    style={{
                      color: hasError ? 'var(--red)' : isUnset ? 'var(--text3)' : 'var(--blue)',
                    }}
                    type={item.type || 'text'}
                    value={displayValue}
                    placeholder={item.placeholder || '未设置'}
                    onChange={e => handleChange(item.key, e.target.value)}
                    onBlur={() => {
                      // 失焦时校验
                      if (form[item.key] && item.pattern && !item.pattern.test(form[item.key])) {
                        setErrors(prev => ({ ...prev, [item.key]: item.errorMsg }))
                      }
                    }}
                  />
                  <span className="ml-2 text-[14px]" style={{ color: 'var(--text3)' }}>&rsaquo;</span>
                </div>
                {hasError && (
                  <div className="text-[11px] mt-1 text-right pr-[28px]" style={{ color: 'var(--red)' }}>{hasError}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* 补充信息卡片 */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>补充信息</span>
            <span className="text-[11px] px-[6px] py-[1px] rounded-full" style={{ background: 'var(--bg-card2)', color: 'var(--text3)' }}>即将支持</span>
          </div>
          {extraInfo.map((item, index) => (
            <div key={item.key} className="flex items-center justify-between px-4 py-[12px]" style={{ borderBottom: index < extraInfo.length - 1 ? '1px solid var(--border)' : 'none', opacity: 0.5 }}>
              <span className="text-[13px] w-[80px] shrink-0" style={{ color: 'var(--text3)' }}>{item.label}</span>
              {item.badge ? (
                <span className="text-[12px] px-2 py-[2px] rounded-full" style={{ background: 'var(--bg-card2)', color: 'var(--text3)' }}>{item.value}</span>
              ) : (
                <span className="text-[13px]" style={{ color: 'var(--text3)' }}>{item.value || item.placeholder}</span>
              )}
              <span className="ml-2 text-[14px]" style={{ color: 'var(--text3)' }}>&rsaquo;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-[13px] font-medium text-white shadow-lg" style={{
          background: toast === '保存成功' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          backdropFilter: 'blur(8px)',
          animation: 'storeFadeInOut 2s ease-in-out',
        }}>
          {toast}
        </div>
      )}

      {/* 离开确认弹窗 */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-[16px] font-semibold text-center mb-2" style={{ color: 'var(--text)' }}>未保存的修改</div>
            <div className="text-[13px] text-center mb-5" style={{ color: 'var(--text3)' }}>你有未保存的修改，确定要离开吗？</div>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl text-[14px] font-medium" style={{ background: 'var(--bg-card2)', color: 'var(--text2)' }} onClick={() => setShowLeaveConfirm(false)}>继续编辑</button>
              <button className="flex-1 py-2.5 rounded-xl text-[14px] font-medium text-white" style={{ background: 'var(--red)' }} onClick={confirmLeave}>放弃修改</button>
            </div>
          </div>
        </div>
      )}

      {/* 底部保存按钮 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 z-20" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <button
          className="w-full py-3 rounded-xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          )}
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>

      <style>{`
        @keyframes storeFadeInOut {
          0% { opacity: 0; transform: translate(-50%, -8px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          75% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
      `}</style>
    </div>
  )
}
