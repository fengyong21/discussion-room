import request from './request'

// 认证
export const sendCode = (phone) =>
  request.post('/auth/send-code', { phone }, { headers: { 'X-Admin-Key': 'geo-admin-2024' } })
export const verifyCode = (phone, code) =>
  request.post('/auth/verify-code', { phone, code })

// 商家
export const getMerchantProfile = () => request.get('/merchant/profile')
export const updateMerchantProfile = (data) => request.put('/merchant/profile', data)

// AI 对话
export const sendChatMessage = (data) => request.post('/chat/send', data)
export const getChatHistory = (params) => request.get('/chat/history', { params })

// 内容生成
export const generateContent = (data) => request.post('/content/generate', data)
export const getContentList = (params) => request.get('/content/list', { params })

// 诊断
export const runDiagnosis = (data) => request.post('/diagnosis/run', data)
export const getDiagnosisHistory = (params) => request.get('/diagnosis/history', { params })

// 竞品排行
export const getRankingList = (rankType) => request.get(`/rankings/list/${rankType}`)
