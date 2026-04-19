import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { sendChatMessage, getDiagnosisHistory, runDiagnosis } from '../api'
import DiagnosisAnimation from '../components/DiagnosisAnimation'

/* ─── 打字机 Hook ─── */
function useTypewriter(fullText, speed = 25) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!fullText) { setDone(true); return }
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    const timer = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= fullText.length) {
        setDisplayed(fullText)
        setDone(true)
        clearInterval(timer)
      } else {
        setDisplayed(fullText.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(timer)
  }, [fullText, speed])

  return { displayed, done }
}

/* ─── 思考中动画组件 ─── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block w-[6px] h-[6px] rounded-full"
          style={{
            background: 'var(--blue)',
            animation: 'thinkBounce 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── 思考阶段展示（带文字提示） ─── */
function ThinkingBubble({ texts }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (step >= texts.length - 1) return
    const t = setTimeout(() => setStep(s => s + 1), 1200)
    return () => clearTimeout(t)
  }, [step, texts.length])

  return (
    <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text3)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animationDuration: '2s' }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span className="transition-all duration-300">{texts[step]}</span>
    </div>
  )
}

/* ─── AI 消息气泡（带打字机） ─── */
function AiMessage({ msg, isLatest, isTyping }) {
  const { displayed, done } = useTypewriter(
    isLatest && isTyping ? msg.content : msg.content,
    isLatest && isTyping ? 20 : 0
  )
  const text = isLatest && isTyping ? displayed : msg.content

  return (
    <div className="flex justify-start">
      <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[15px] font-bold text-white shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: '0 2px 8px rgba(59,130,246,0.25)' }}>G</div>
      <div className="max-w-[78%] px-4 py-3 text-[13px] leading-[1.7] whitespace-pre-wrap" style={{
        background: 'var(--bg-card)',
        color: 'var(--text)',
        borderRadius: '4px 16px 16px 16px',
        borderLeft: '3px solid var(--blue)',
      }}>
        {text}
        {isLatest && isTyping && !done && (
          <span className="inline-block w-[2px] h-[14px] ml-[2px] align-middle" style={{ background: 'var(--blue)', animation: 'cursorBlink 0.8s step-end infinite' }} />
        )}
      </div>
    </div>
  )
}

/* ─── 用户消息气泡 ─── */
function UserMessage({ msg }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] px-4 py-3 text-[13px] leading-[1.7] whitespace-pre-wrap" style={{
        background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
        color: '#fff',
        borderRadius: '16px 16px 4px 16px',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

/* ─── 主页面 ─── */
export default function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { merchant } = useAuth()
  const shopName = merchant?.shop_name || '我的门店'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showDiagAnim, setShowDiagAnim] = useState(false)
  const [typingMsgId, setTypingMsgId] = useState(null) // 当前正在打字的消息ID
  const messagesEndRef = useRef(null)

  const diagReq = useRequest(getDiagnosisHistory)

  useEffect(() => { diagReq.run() }, [])

  useEffect(() => {
    if (searchParams.get('diag') === '1') {
      handleRunDiagnosis()
    }
  }, [])

  const latestDiag = (diagReq.data || [])[0]

  // 添加AI消息（带打字机效果）
  const addAiMessage = useCallback((content) => {
    const id = Date.now()
    setMessages(prev => [...prev, { id, role: 'ai', content }])
    setTypingMsgId(id)
    // 打字完成后清除状态
    setTimeout(() => setTypingMsgId(null), content.length * 20 + 500)
    return id
  }, [])

  const handleRunDiagnosis = async () => {
    if (showDiagAnim || sending) return
    setShowDiagAnim(true)
  }

  const onDiagAnimDone = async () => {
    setShowDiagAnim(false)
    setSending(true)
    try {
      const result = await runDiagnosis()
      if (result) {
        const content = `诊断完成！你的门店综合评分为 **${result.overall_score || '--'}** 分，来源等级 **${result.source_level || '--'}**。\n\n${result.suggestions ? result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') : '点击下方"查看报告"了解详细优化建议。'}`
        addAiMessage(content)
        diagReq.run()
      }
    } catch (err) {
      addAiMessage('诊断请求失败，请稍后再试。')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMsgId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    if (text === '帮我诊断' || text === '一键诊断') {
      setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }])
      setInput('')
      handleRunDiagnosis()
      return
    }

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }])
    setInput('')
    setSending(true)

    try {
      const result = await sendChatMessage(text, sessionId)
      if (result && result.messages) {
        // 找到AI回复
        const aiMsgs = result.messages.filter(m => m.role === 'assistant')
        if (aiMsgs.length > 0) {
          // 合并所有AI回复内容
          const fullContent = aiMsgs.map(m => m.content).join('\n\n')
          addAiMessage(fullContent)
        }
        if (result.session_id) {
          setSessionId(result.session_id)
        }
      }
    } catch (err) {
      addAiMessage('抱歉，请求出了点问题，请稍后再试。')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 判断最后一条消息是否正在打字
  const lastMsg = messages[messages.length - 1]
  const isLastTyping = lastMsg?.role === 'ai' && typingMsgId === lastMsg?.id

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]" style={{ background: 'var(--bg)' }}>
      {showDiagAnim && <DiagnosisAnimation onDone={onDiagAnimDone} />}

      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 py-3 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          <div>
            <div className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>AI优化助手</div>
            <div className="text-[11px]" style={{ color: sending ? 'var(--blue)' : 'var(--text3)' }}>
              {sending ? '正在思考...' : '在线 · 随时为你解答'}
            </div>
          </div>
        </div>
      </div>

      {/* 诊断摘要条 */}
      {latestDiag && (
        <div className="mx-4 mt-3 rounded-xl p-3 flex items-center justify-between cursor-pointer" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/score')}>
          <div className="flex items-center gap-2">
            <span className="text-[13px]" style={{ color: 'var(--text)' }}>{shopName}</span>
            <span className="text-[11px] px-2 py-[1px] rounded-full font-medium" style={{
              background: latestDiag.source_level === 'T1' ? 'var(--green-glow)' : latestDiag.source_level === 'T2' ? 'var(--orange-glow)' : 'var(--red-glow)',
              color: latestDiag.source_level === 'T1' ? 'var(--green)' : latestDiag.source_level === 'T2' ? 'var(--orange)' : 'var(--red)',
            }}>
              {latestDiag.source_level} · {latestDiag.overall_score}分
            </span>
          </div>
          <div className="text-[12px] px-3 py-1 rounded-lg" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}>查看报告</div>
        </div>
      )}

      {/* 对话消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-[100px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text3)' }}>
            <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: '0 8px 32px rgba(59,130,246,0.2)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--text)' }}>GEO智能助手</p>
            <p className="text-[13px] mb-5">我可以帮你诊断门店、优化排名、生成内容</p>
            <div className="flex flex-wrap gap-2 justify-center px-4">
              {[
                { q: '帮我诊断', icon: '🔍' },
                { q: '怎么优化排名', icon: '📈' },
                { q: '生成选购指南', icon: '📝' },
                { q: '竞品对比', icon: '⚔️' },
              ].map(({ q, icon }) => (
                <span key={q} className="px-4 py-2 rounded-xl text-[13px] cursor-pointer transition-all active:scale-95 flex items-center gap-1.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => { setInput(q) }}>
                  <span>{icon}</span>
                  <span>{q}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1
              if (msg.role === 'user') return <UserMessage key={msg.id} msg={msg} />
              return (
                <AiMessage
                  key={msg.id}
                  msg={msg}
                  isLatest={isLast}
                  isTyping={isLastTyping && isLast}
                />
              )
            })}
            {/* 思考中动画 */}
            {sending && !showDiagAnim && (
              <div className="flex justify-start">
                <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[15px] font-bold text-white shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: '0 2px 8px rgba(59,130,246,0.25)' }}>G</div>
                <div className="px-4 py-3" style={{ background: 'var(--bg-card)', borderRadius: '4px 16px 16px 16px', borderLeft: '3px solid var(--blue)' }}>
                  <ThinkingBubble texts={['正在分析你的问题...', '检索门店数据...', '生成优化建议...']} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 底部输入栏 */}
      <div className="fixed bottom-[72px] left-0 right-0 px-4 py-3" style={{ background: 'rgba(8,13,25,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="问我任何优化问题..." disabled={sending} className="flex-1 h-[42px] px-4 rounded-xl text-[14px] outline-none transition-all" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', opacity: sending ? 0.6 : 1 }} onFocus={(e) => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-glow)'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
          <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all active:scale-90" style={{ background: input.trim() && !sending ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))' : 'var(--bg-card)', border: input.trim() && !sending ? 'none' : '1px solid var(--border)', boxShadow: input.trim() && !sending ? '0 2px 12px rgba(59,130,246,0.3)' : 'none' }} onClick={handleSend}>
            {sending ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : 'var(--text3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
