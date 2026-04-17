import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendChatMessage } from '../api'

function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // 初始化欢迎消息
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        role: 'ai',
        content: '你好！我是你的GEO优化助手。请告诉我你的店铺名称和所在城市，我来帮你做一次AI推荐诊断。',
        time: new Date(),
      },
    ])
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      time: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const res = await sendChatMessage({ message: text })
      if (res.messages && res.messages.length > 0) {
        const aiMessages = res.messages.filter((m) => m.role === 'ai')
        aiMessages.forEach((m) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              role: 'ai',
              content: m.content,
              time: new Date(),
            },
          ])
        })
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || '网络错误，请稍后重试'
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          content: `抱歉，发生了错误：${errorMsg}`,
          time: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 解析诊断结果
  function parseDiagnosis(content) {
    try {
      const match = content.match(/\{[\s\S]*"score"[\s\S]*\}/)
      if (match) {
        return JSON.parse(match[0])
      }
    } catch (e) {
      // ignore
    }
    return null
  }

  function getScoreColor(score) {
    if (score >= 80) return '#00C853'
    if (score >= 60) return '#FFB800'
    return '#FF4444'
  }

  function getScoreLevel(score) {
    if (score >= 80) return 'T1级'
    if (score >= 60) return 'T2级'
    return 'T3级'
  }

  function getLevelColor(level) {
    if (level === 'T1级') return '#00C853'
    if (level === 'T2级') return '#FFB800'
    return '#FF4444'
  }

  function DiagnosisCard({ data }) {
    const score = data.score || 0
    const level = getScoreLevel(score)
    const scoreColor = getScoreColor(score)
    const levelColor = getLevelColor(level)

    return (
      <div
        className="mx-2 my-3 rounded-2xl p-5 relative overflow-hidden cursor-pointer"
        style={{ backgroundColor: '#FFFFFF' }}
        onClick={() => navigate('/diagnosis')}
      >
        {/* 红色丝带标签 */}
        <div
          className="absolute top-0 left-0 px-3 py-1 text-white text-xs font-bold rounded-br-lg"
          style={{ backgroundColor: levelColor }}
        >
          {level}
        </div>

        <div className="mt-2">
          {/* 标题 */}
          <div className="text-gray-500 text-sm mb-1">推荐指数</div>

          {/* 大数字 */}
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-bold" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="text-lg text-gray-400">分</span>
          </div>

          {/* 副标题 */}
          <div className="text-gray-400 text-sm mb-2">
            {score}/100 ({level})
          </div>

          {/* 状态 */}
          {score < 80 && (
            <div className="text-sm font-medium mb-3" style={{ color: scoreColor }}>
              有{data.issues || 3}项需立即优化!
            </div>
          )}

          {/* CTA 按钮 */}
          <button
            className="px-5 py-2.5 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: '#2B7FFF' }}
          >
            查看完整报告 &rarr;
          </button>
        </div>

        {/* 底部提示 */}
        <div className="text-center text-gray-400 text-xs mt-3">
          点击卡片查看详情
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0A1628' }}>
      {/* 顶部导航栏 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#0A1628' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#1A2540' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <div className="text-white text-lg font-bold leading-tight">AI 对话</div>
            <div className="text-xs leading-tight" style={{ color: '#8E9BB5' }}>GEO智能助手</div>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1A2540' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {/* AI 消息 */}
            {msg.role === 'ai' && (
              <div className="flex justify-start mb-1">
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed"
                  style={{ backgroundColor: '#1A2540', color: '#FFFFFF' }}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 用户消息 */}
            {msg.role === 'user' && (
              <div className="flex justify-end mb-1">
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed text-white"
                  style={{ backgroundColor: '#2B7FFF' }}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 诊断结果卡片 */}
            {msg.role === 'ai' && parseDiagnosis(msg.content) && (
              <DiagnosisCard data={parseDiagnosis(msg.content)} />
            )}

            {/* 来源标注 */}
            {msg.role === 'ai' && (
              <div className="text-xs mt-1 ml-1" style={{ color: '#8E9BB5' }}>
                豆包搜索检索
              </div>
            )}
          </div>
        ))}

        {/* 加载动画 */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-md"
              style={{ backgroundColor: '#1A2540' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm" style={{ color: '#8E9BB5' }}>AI 正在思考</span>
                <span className="flex gap-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: '#2B7FFF', animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: '#2B7FFF', animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: '#2B7FFF', animationDelay: '300ms' }}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <div
        className="sticky bottom-0 px-4 py-3"
        style={{ backgroundColor: '#0A1628', borderTop: '1px solid #1A2540' }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-3 rounded-full text-sm text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#1A2540' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
            style={{
              backgroundColor: inputValue.trim() && !isLoading ? '#2B7FFF' : '#1A2540',
              opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
