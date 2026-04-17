import { useState, useRef, useEffect } from 'react'

// 模拟 AI 回复数据
const mockAIReplies = [
  '根据我的分析，您的门店在百度地图的搜索排名表现不错，建议继续保持关键词优化策略。',
  '我注意到您门店的用户评价分数有所下降，建议关注近期差评并及时回复，同时可以推出一些活动引导顾客留下好评。',
  '关于内容优化，建议您每周至少发布2-3条短视频内容，展示门店特色菜品和用餐环境，这有助于提升在平台上的曝光率。',
  '综合来看，您的门店信息完整度还有提升空间。建议补充营业时间、停车位、Wi-Fi 等信息，这些细节会影响用户的到店决策。',
  '您的搜索排名在上个月有显著提升，特别是在"附近面馆"这个关键词上。建议继续优化图片质量和描述文案。',
]

function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function ChatPage() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState([
    { id: '1', title: '门店搜索排名分析', time: '今天 10:30' },
    { id: '2', title: '用户评价优化建议', time: '昨天 15:20' },
    { id: '3', title: '内容发布策略讨论', time: '3天前' },
  ])
  const [activeSession, setActiveSession] = useState('1')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // 初始化欢迎消息
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        role: 'ai',
        content: '你好！我是 GEO 智能助手，可以帮你分析门店的搜索排名、用户评价和内容优化等方面的问题。请问有什么可以帮你的？',
        time: new Date(),
      },
    ])
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [inputValue])

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

    // 模拟 API 调用延迟
    setTimeout(() => {
      const aiReply = mockAIReplies[Math.floor(Math.random() * mockAIReplies.length)]
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: aiReply,
        time: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    const newSession = {
      id: String(Date.now()),
      title: '新对话',
      time: '刚刚',
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSession(newSession.id)
    setMessages([
      {
        id: Date.now(),
        role: 'ai',
        content: '你好！我是 GEO 智能助手，可以帮你分析门店的搜索排名、用户评价和内容优化等方面的问题。请问有什么可以帮你的？',
        time: new Date(),
      },
    ])
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8 bg-gray-950 text-gray-100 rounded-none md:rounded-xl overflow-hidden">
      {/* 左侧对话历史 - 手机端隐藏，桌面端可切换 */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } hidden md:block transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-gray-800 bg-gray-900`}
      >
        <div className="w-72 h-full flex flex-col">
          {/* 新建对话按钮 */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建对话
            </button>
          </div>

          {/* 对话列表 */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                  activeSession === session.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <div className="text-sm font-medium truncate">{session.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{session.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 手机端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 手机端侧边栏滑出 */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <span className="text-sm font-medium text-gray-200">对话历史</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建对话
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSession(session.id)
                  setSidebarOpen(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                  activeSession === session.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <div className="text-sm font-medium truncate">{session.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{session.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主对话区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-gray-800 bg-gray-900/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-200">GEO 智能助手</div>
              <div className="text-[10px] sm:text-xs text-gray-500">在线</div>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                </div>
              )}
              <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-md'
                      : 'bg-gray-800 text-gray-200 rounded-bl-md'
                  }`}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <div
                  className={`text-[10px] sm:text-xs text-gray-500 mt-1 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(msg.time)}
                </div>
              </div>
            </div>
          ))}

          {/* 加载动画 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
              </div>
              <div className="bg-gray-800 text-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm">AI 正在思考</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-800 bg-gray-900/50 px-3 sm:px-4 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 sm:gap-3 bg-gray-800 rounded-2xl border border-gray-700 focus-within:border-emerald-500 transition-colors px-3 sm:px-4 py-2.5 sm:py-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题，AI 帮你分析..."
                rows={1}
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 text-sm resize-none outline-none max-h-40"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
                  inputValue.trim() && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600">
              按 Enter 发送，Shift + Enter 换行
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
