import { useState, useEffect, useCallback } from 'react'

const API = '/api/admin'
const ADMIN_KEY = 'geo-admin-2024'

const headers = {
  'Content-Type': 'application/json',
  'X-Admin-Key': ADMIN_KEY,
}

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <div style={{ color: 'var(--text3)', fontSize: 14 }}>加载中...</div>
    </div>
  )
}

/* ── 仪表盘 ── */
function Dashboard({ data }) {
  if (!data) return <Loading />
  const cards = [
    { label: '商家总数', value: data.total_merchants, sub: `今日 +${data.new_today}`, color: 'var(--blue)' },
    { label: '诊断次数', value: data.total_diagnoses, sub: `今日 ${data.diag_today}`, color: 'var(--purple)' },
    { label: 'AI对话', value: data.total_chats, sub: `今日 ${data.chat_today}`, color: 'var(--green)' },
    { label: '内容生成', value: data.total_contents, sub: '累计', color: 'var(--orange)' },
  ]
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>数据概览</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>诊断趋势（近7天）</h2>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {data.trend.map((t, i) => {
            const max = Math.max(...data.trend.map(x => x.count), 1)
            const h = Math.max(4, (t.count / max) * 100)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t.count}</span>
                <div style={{ width: '100%', height: h, borderRadius: 4, background: i === data.trend.length - 1 ? 'var(--blue)' : 'var(--bg-card2)', transition: 'height 0.3s' }} />
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{t.date}</span>
              </div>
            )
          })}
        </div>
      </div>
      {data.industry_dist.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>行业分布</h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)', marginBottom: 24 }}>
            {data.industry_dist.slice(0, 8).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', width: 60, flexShrink: 0 }}>{item.name}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-card2)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'var(--blue)', width: `${(item.count / data.total_merchants) * 100}%`, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)', width: 30, textAlign: 'right' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {data.city_dist.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>城市分布</h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            {data.city_dist.slice(0, 8).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', width: 60, flexShrink: 0 }}>{item.name}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-card2)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'var(--green)', width: `${(item.count / data.total_merchants) * 100}%`, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)', width: 30, textAlign: 'right' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── 商家列表 ── */
function Merchants() {
  const [data, setData] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchMerchants = useCallback(async (kw = '') => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/merchants?keyword=${encodeURIComponent(kw)}`, { headers })
      const json = await res.json()
      setData(json)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMerchants() }, [fetchMerchants])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="搜索商家名称/手机号"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchMerchants(keyword)}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={() => fetchMerchants(keyword)} style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: 'var(--blue)', color: '#fff', fontSize: 13, cursor: 'pointer',
        }}>搜索</button>
      </div>

      {loading && <Loading />}
      {data && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>共 {data.total} 个商家</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.items.map(m => (
              <div key={m.id} style={{
                background: 'var(--bg-card)', borderRadius: 10, padding: 14,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{m.shop_name}</span>
                  {m.latest_score != null && (
                    <span style={{
                      fontSize: 12, padding: '2px 8px', borderRadius: 10,
                      background: m.latest_score >= 80 ? 'rgba(34,197,94,0.15)' : m.latest_score >= 60 ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                      color: m.latest_score >= 80 ? 'var(--green)' : m.latest_score >= 60 ? 'var(--blue)' : 'var(--red)',
                    }}>
                      {m.latest_score}分 · {m.latest_level}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                  <span>📱 {m.phone}</span>
                  {m.industry && <span>🏢 {m.industry}</span>}
                  {m.city && <span>📍 {m.city}{m.district ? ` ${m.district}` : ''}</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                  <span>诊断 {m.diag_count} 次</span>
                  <span>对话 {m.chat_count} 次</span>
                  <span>注册 {m.created_at?.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── AI使用监控 ── */
function AiMonitor({ data }) {
  if (!data) return <Loading />
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>最近AI对话</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map(s => (
          <div key={s.id} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 14,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.merchant_name}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.updated_at?.slice(5, 16)}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              <span>📱 {s.merchant_phone}</span>
              <span style={{ marginLeft: 12 }}>💬 {s.msg_count} 条消息</span>
              {s.title && <span style={{ marginLeft: 12 }}>📌 {s.title}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 系统设置 ── */
function SystemConfig({ data }) {
  if (!data) return <Loading />
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>系统配置</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: '环境', value: data.env },
          { label: 'LLM服务商', value: data.llm_provider },
          { label: '限流（次/分钟）', value: data.rate_limit },
          { label: '管理员密钥', value: data.admin_key?.slice(0, 10) + '****' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 14,
            border: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, color: 'var(--text3)' }}>{item.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 主页面 ── */
const tabs = [
  { key: 'dashboard', label: '📊 数据概览' },
  { key: 'merchants', label: '👥 商家管理' },
  { key: 'monitor', label: '🤖 AI监控' },
  { key: 'config', label: '⚙️ 系统设置' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [chats, setChats] = useState(null)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch(`${API}/dashboard`, { headers }).then(r => r.json()).then(setDashboard).catch(console.error)
    fetch(`${API}/chats/recent`, { headers }).then(r => r.json()).then(setChats).catch(console.error)
    fetch(`${API}/system/config`, { headers }).then(r => r.json()).then(setConfig).catch(console.error)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '16px 16px 80px' }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>GEO 管理后台</h1>
        <a href="/" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>← 返回前台</a>
      </div>

      {/* Tab栏 */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--bg-card)', borderRadius: 10, padding: 4,
        border: '1px solid var(--border)',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
            background: activeTab === t.key ? 'var(--blue)' : 'transparent',
            color: activeTab === t.key ? '#fff' : 'var(--text3)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* 内容 */}
      {activeTab === 'dashboard' && <Dashboard data={dashboard} />}
      {activeTab === 'merchants' && <Merchants />}
      {activeTab === 'monitor' && <AiMonitor data={chats} />}
      {activeTab === 'config' && <SystemConfig data={config} />}
    </div>
  )
}
