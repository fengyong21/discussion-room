import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * 通用请求 hook - 封装 loading/error/data 状态
 * @param {Function} apiFn - 返回 Promise 的 API 函数
 * @param {*} initialData - 初始数据
 */
export function useRequest(apiFn, initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  // 组件卸载时 abort 当前请求
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const run = useCallback(async (...args) => {
    // abort 上一次未完成的请求
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)
    try {
      // 将 signal 作为最后一个参数传递给 apiFn
      const result = await apiFn(...args, controller.signal)
      setData(result)
      return result
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // 请求被取消，不更新状态
        return null
      }
      const msg = err?.response?.data?.detail || err?.message || '请求失败'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])

  return { data, loading, error, run, reset, setData }
}

/**
 * 加载态骨架屏组件
 */
export function Skeleton({ className, style }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className || ''}`}
      style={{ background: 'var(--bg-card2)', ...style }}
    />
  )
}

/**
 * 空状态组件
 */
export function EmptyState({ message = '暂无数据', icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon || (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>
        </svg>
      )}
      <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>{message}</p>
    </div>
  )
}

/**
 * 错误提示组件
 */
export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <p className="text-sm mt-2" style={{ color: 'var(--red)' }}>{message}</p>
      {onRetry && (
        <button
          className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}
          onClick={onRetry}
        >
          重试
        </button>
      )}
    </div>
  )
}
