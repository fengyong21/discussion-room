import request from './request'

// 获取当前商家ID（从localStorage，带简单缓存）
let _cachedMerchantId = null
function getMerchantId() {
  if (_cachedMerchantId !== null) return _cachedMerchantId
  try {
    const m = JSON.parse(localStorage.getItem('geo_merchant'))
    _cachedMerchantId = m?.id || null
    return _cachedMerchantId
  } catch { return null }
}

// 认证
export const sendCode = (phone) => request.post('/api/auth/send-code', { phone })
export const verifyCode = (phone, code) => request.post('/api/auth/verify-code', { phone, code })

// 商家
export const getMerchantProfile = () => request.get('/api/merchant/profile')
export const updateMerchantProfile = (data) => request.put('/api/merchant/profile', data)
export const getMerchantStats = () => request.get(`/api/merchant/stats/${getMerchantId()}`)

// 诊断（路径与后端对齐）
export const runDiagnosis = () => request.post('/api/diagnosis/run')
export const getDiagnosisHistory = (limit = 10) => request.get(`/api/diagnosis/history/${getMerchantId()}`, { params: { limit } })
export const getDiagnosisDetail = (id) => request.get(`/api/diagnosis/${id}`)

// 内容（路径与后端对齐）
export const generateContent = (data) => request.post('/api/content/generate', data)
export const getContentList = (limit = 20) => request.get(`/api/content/list/${getMerchantId()}`, { params: { limit } })
export const getContentDetail = (id) => request.get(`/api/content/${id}`)
export const editContent = (contentId, instruction) => request.put('/api/content/edit', { content_id: contentId, instruction })
export const publishContent = (id) => request.put(`/api/content/${id}/publish`)
export const deleteContent = (id) => request.delete(`/api/content/${id}`)

// 对话（路径与后端对齐）
export const getChatSessions = (limit = 20) => request.get(`/api/chat/history/${getMerchantId()}`, { params: { limit } })
export const getSessionMessages = (sessionId) => request.get(`/api/chat/session/${sessionId}`)
export const sendChatMessage = (message, sessionId = null) => request.post('/api/chat/send', { message, session_id: sessionId })

// 排行（路径与后端对齐）
export const getRankingCompare = () => request.get('/api/rankings/compare')
export const getRankingList = (rankType = 'nearby') => request.get(`/api/rankings/list/${rankType}`)

// 证据链
export const getEvidenceList = () => request.get(`/api/merchant/evidence/${getMerchantId()}`)
export const createEvidence = (data) => request.post('/api/merchant/evidence', data)

// 评价管理
export const getReviewStats = () => request.get('/api/reviews/stats')
export const getReviewList = (params = {}) => request.get('/api/reviews/list', { params })
export const replyReview = (reviewId, content) => request.post('/api/reviews/reply', { review_id: reviewId, content })
export const aiReplyReview = (reviewId) => request.post('/api/reviews/ai-reply', { review_id: reviewId, content: '' })
