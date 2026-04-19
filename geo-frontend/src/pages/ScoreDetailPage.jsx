import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getDiagnosisHistory, getDiagnosisDetail, runDiagnosis } from '../api'
import { useRequest, Skeleton, ErrorBlock } from '../hooks/useRequest'

/* ---------- 维度配置 ---------- */
const DIMENSION_CONFIG = {
  authority: { name: '权威性', desc: '行业认证、获奖记录、品牌背书', icon: 'shield' },
  verifiability: { name: '可验证性', desc: '资质证书、检测报告、官方认证', icon: 'check-circle' },
  precision: { name: '精准性', desc: '产品描述量化数据、服务规格明确', icon: 'target' },
  timeliness: { name: '时效性', desc: '信息更新频率、内容新鲜度', icon: 'clock' },
  consistency: { name: '一致性', desc: '各平台信息统一、品牌形象一致', icon: 'link' },
  completeness: { name: '完整性', desc: '商家基础信息填写完善程度', icon: 'list-check' },
  machine_readability: { name: '机器可读性', desc: 'Schema结构化数据、SEO优化', icon: 'code' },
  permanence: { name: '永久性', desc: '独立官网、永久链接、内容存续', icon: 'infinity' },
  citation_network: { name: '引用网络', desc: '媒体报道、第三方引用、外链', icon: 'share-2' },
}

/* ---------- 维度图标 SVG ---------- */
function DimensionIcon({ icon }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (icon) {
    case 'shield':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    case 'check-circle':
      return <svg {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    case 'target':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    case 'link':
      return <svg {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    case 'list-check':
      return <svg {...props}><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><line x1="13" y1="6" x2="21" y2="6"/><line x1="13" y1="12" x2="21" y2="12"/><line x1="13" y1="18" x2="21" y2="18"/></svg>
    case 'code':
      return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'infinity':
      return <svg {...props}><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z"/></svg>
    case 'share-2':
      return <svg {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    default:
      return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>
  }
}

/* ---------- 维度改进建议模板 ---------- */
const DIMENSION_TIPS = {
  authority: {
    low: ['申请行业权威认证（如ISO认证、行业资质证书）', '争取获得行业协会或官方机构的推荐背书', '在平台展示获奖记录和荣誉资质'],
    mid: ['补充更多行业认证和获奖信息', '争取媒体报道或权威机构推荐', '完善品牌故事和行业地位描述'],
    high: ['持续维护行业认证的有效性', '定期更新获奖和荣誉信息'],
  },
  verifiability: {
    low: ['上传营业执照和食品经营许可证', '添加食品安全检测报告', '展示卫生评级和检查合格证明'],
    mid: ['补充更多资质证书和检测报告', '添加员工健康证明和培训证书', '展示第三方质量认证'],
    high: ['定期更新资质证书的有效期', '添加最新的检测报告'],
  },
  precision: {
    low: ['量化产品描述（如"12道招牌菜"而非"多种菜品"）', '明确服务规格（如"可容纳50人"）', '添加具体的价格区间和套餐信息'],
    mid: ['细化产品参数和服务描述', '添加更多量化数据（营业面积、停车位等）', '补充菜单的详细描述和图片'],
    high: ['定期更新产品信息和价格', '添加季节性菜单和限时优惠'],
  },
  timeliness: {
    low: ['立即更新过期的营业时间和联系方式', '添加最新的活动和促销信息', '上传近期门店实拍照片'],
    mid: ['保持每周更新一次内容', '及时回复用户评价和咨询', '定期更新菜单和价格信息'],
    high: ['保持信息实时更新', '添加每日特惠和限时活动'],
  },
  consistency: {
    low: ['统一各平台门店名称和地址', '确保电话号码在所有平台一致', '同步营业时间到所有平台'],
    mid: ['统一品牌Logo和视觉风格', '确保各平台菜品描述一致', '同步价格信息到所有平台'],
    high: ['定期检查各平台信息一致性', '保持品牌形象的统一性'],
  },
  completeness: {
    low: ['补充门店基本信息（地址、电话、营业时间）', '添加门店照片和环境展示', '完善菜品菜单和价格信息'],
    mid: ['补充停车位、WiFi等便民信息', '添加特色菜品推荐和招牌菜', '完善门店视频介绍'],
    high: ['添加更多细节信息提升完整度', '补充用户常见问题的回答'],
  },
  machine_readability: {
    low: ['添加结构化数据标记（Schema.org）', '优化标题和描述的SEO关键词', '确保图片有正确的alt标签'],
    mid: ['添加面包屑导航和站点地图', '优化页面加载速度', '添加JSON-LD结构化数据'],
    high: ['持续优化SEO表现', '监控搜索引擎排名变化'],
  },
  permanence: {
    low: ['建立独立官网或品牌主页', '创建永久性的内容链接', '在权威平台建立官方账号'],
    mid: ['优化官网内容和SEO', '建立品牌百科词条', '在更多平台建立官方存在'],
    high: ['维护官网的长期稳定性', '持续发布优质原创内容'],
  },
  citation_network: {
    low: ['主动联系本地生活媒体进行报道', '鼓励用户在社交平台分享体验', '与周边商家互推建立外链'],
    mid: ['争取行业媒体的报道和推荐', '参与本地商业联盟和协会活动', '建立KOL和达人合作关系'],
    high: ['维护媒体关系和报道频率', '扩大品牌影响力和引用网络'],
  },
}

function getTipsForDimension(key, ratio) {
  const tips = DIMENSION_TIPS[key]
  if (!tips) return []
  if (ratio < 0.6) return tips.low
  if (ratio < 0.8) return tips.mid
  return tips.high
}

/* ---------- 工具函数 ---------- */
function getScoreColor(ratio) {
  if (ratio >= 0.8) return 'var(--green)'
  if (ratio >= 0.6) return 'var(--orange)'
  return 'var(--red)'
}

function getScoreGlow(ratio) {
  if (ratio >= 0.8) return 'var(--green-glow)'
  if (ratio >= 0.6) return 'var(--orange-glow)'
  return 'var(--red-glow)'
}

function getLevelColor(level) {
  if (level === 'T1') return 'var(--green)'
  if (level === 'T2') return 'var(--orange)'
  return 'var(--red)'
}

function getLevelBg(level) {
  if (level === 'T1') return 'var(--green-glow)'
  if (level === 'T2') return 'var(--orange-glow)'
  return 'var(--red-glow)'
}

function getNextLevelInfo(level, score) {
  if (level === 'T1') return { nextLevel: null, gap: 0 }
  if (level === 'T2') return { nextLevel: 'T1', gap: 80 - score }
  return { nextLevel: 'T2', gap: 60 - score }
}

/* ---------- 骨架屏 ---------- */
function ScoreSkeleton() {
  return (
    <div className="px-5 space-y-5">
      <Skeleton className="w-full h-48 rounded-2xl" />
      <Skeleton className="w-full h-32 rounded-2xl" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="w-full h-24 rounded-xl" />
      ))}
    </div>
  )
}

/* ---------- 主页面 ---------- */
export default function ScoreDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlId = searchParams.get('id')

  const detailReq = useRequest(getDiagnosisDetail)
  const historyReq = useRequest(getDiagnosisHistory)
  const rediagReq = useRequest(runDiagnosis)

  const data = detailReq.data
  const loading = detailReq.loading || historyReq.loading
  const error = detailReq.error || historyReq.error
  const [expandedDim, setExpandedDim] = useState(null)

  const fetchDetail = useCallback(async (id) => {
    await detailReq.run(id)
  }, [detailReq])

  const loadLatest = useCallback(async () => {
    const history = await historyReq.run(1)
    if (history && history.length > 0) {
      const latestId = history[0].id
      await fetchDetail(latestId)
    }
  }, [historyReq, fetchDetail])

  useEffect(() => {
    if (urlId) {
      fetchDetail(urlId)
    } else {
      loadLatest()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRediagnose = async () => {
    const result = await rediagReq.run()
    if (result) {
      // 诊断完成后刷新数据
      const newId = result.diagnosis_id || result.id
      if (newId) {
        await fetchDetail(newId)
      } else {
        await loadLatest()
      }
    }
  }

  const handleRetry = () => {
    detailReq.reset()
    historyReq.reset()
    if (urlId) {
      fetchDetail(urlId)
    } else {
      loadLatest()
    }
  }

  /* ---- 无数据（历史为空） ---- */
  if (!loading && !error && !urlId && historyReq.data?.length === 0 && !data) {
    return (
      <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="flex items-center px-4 py-4 sticky top-0 z-10" style={{ background: 'var(--bg)' }}>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center mr-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={() => navigate(-1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-base font-bold">推荐指数详情</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>
          </svg>
          <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>暂无诊断记录</p>
          <button
            className="mt-4 px-6 py-2.5 rounded-xl text-white font-semibold text-sm active:scale-[0.98] transition-transform"
            style={{
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            }}
            onClick={handleRediagnose}
            disabled={rediagReq.loading}
          >
            {rediagReq.loading ? '诊断中...' : '开始首次诊断'}
          </button>
        </div>
      </div>
    )
  }

  const overallScore = data?.overall_score ?? 0
  const sourceLevel = data?.source_level ?? 'T3'
  const nineDimensions = data?.nine_dimensions ?? {}
  const keyFindings = data?.key_findings ?? []
  const { nextLevel, gap } = getNextLevelInfo(sourceLevel, overallScore)

  return (
    <div className="pb-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ===== 顶部导航栏 ===== */}
      <div
        className="flex items-center px-4 py-4 sticky top-0 z-10"
        style={{ background: 'var(--bg)' }}
      >
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center mr-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          onClick={() => navigate(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">推荐指数详情</h1>
      </div>

      {/* ===== 错误状态 ===== */}
      {error && (
        <div className="px-5 mt-4">
          <ErrorBlock message={error} onRetry={handleRetry} />
        </div>
      )}

      {/* ===== 加载骨架屏 ===== */}
      {loading && <ScoreSkeleton />}

      {/* ===== 正常内容 ===== */}
      {!loading && data && (
        <div className="px-5 space-y-5">
          {/* ===== 大号分数展示区 ===== */}
          <div
            className="rounded-2xl p-6 text-center card-shine"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <span
                className="text-5xl font-black"
                style={{
                  color: getScoreColor(overallScore / 100),
                  textShadow: `0 0 30px ${getScoreColor(overallScore / 100)}40`,
                }}
              >
                {overallScore}
              </span>
              <span className="text-lg" style={{ color: 'var(--text3)' }}>
                /100
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 mb-1">
              <span
                className="px-3 py-1 rounded-lg text-sm font-bold"
                style={{
                  background: getLevelBg(sourceLevel),
                  color: getLevelColor(sourceLevel),
                }}
              >
                {sourceLevel}级
              </span>
            </div>
            {nextLevel && (
              <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                距{nextLevel}还差{Math.max(0, gap)}分
              </p>
            )}
          </div>

          {/* ===== T级进度条 ===== */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <h3 className="text-sm font-semibold mb-4">等级进度</h3>
            <div className="relative mb-6">
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-card2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${overallScore}%`,
                    background: 'linear-gradient(90deg, var(--red) 0%, var(--orange) 60%, var(--green) 100%)',
                  }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-700"
                style={{
                  left: `calc(${overallScore}% - 8px)`,
                  background: getScoreColor(overallScore / 100),
                  borderColor: 'var(--bg-card)',
                  boxShadow: `0 0 8px ${getScoreColor(overallScore / 100)}`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--text3)' }}>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'var(--red-glow)', color: 'var(--red)' }}
                >
                  T3
                </span>
                <span>0-59</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'var(--orange-glow)', color: 'var(--orange)' }}
                >
                  T2
                </span>
                <span>60-79</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'var(--green-glow)', color: 'var(--green)' }}
                >
                  T1
                </span>
                <span>80+</span>
              </div>
            </div>
          </div>

          {/* ===== 关键发现 ===== */}
          {keyFindings.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="text-sm font-semibold mb-3">关键发现</h3>
              <div className="space-y-2">
                {keyFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl"
                    style={{ background: 'var(--bg-card2)' }}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                      style={{
                        background: idx === 0 ? 'var(--red-glow)' : idx === 1 ? 'var(--orange-glow)' : 'var(--blue-glow)',
                        color: idx === 0 ? 'var(--red)' : idx === 1 ? 'var(--orange)' : 'var(--blue)',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                      {finding}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== 九维评估列表 ===== */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text2)' }}>
              维度评估
              <span className="text-[11px] font-normal ml-2" style={{ color: 'var(--text3)' }}>点击查看改进建议</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(DIMENSION_CONFIG).map(([key, config]) => {
                const dim = nineDimensions[key]
                const score = dim?.score ?? 0
                const max = dim?.max ?? 1
                const ratio = score / max
                const percent = Math.round(ratio * 100)
                const analysis = dim?.analysis ?? ''
                const isExpanded = expandedDim === key
                const tips = getTipsForDimension(key, ratio)

                return (
                  <div
                    key={key}
                    className="rounded-xl overflow-hidden transition-all cursor-pointer"
                    style={{
                      background: 'var(--bg-card)',
                      border: isExpanded ? '1px solid var(--blue)' : '1px solid var(--border)',
                    }}
                    onClick={() => setExpandedDim(isExpanded ? null : key)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: getScoreGlow(ratio), color: getScoreColor(ratio) }}>
                          <DimensionIcon icon={config.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{config.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold" style={{ color: getScoreColor(ratio) }}>{score}/{max}</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                          </div>
                          <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>{config.desc}</p>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card2)' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: getScoreColor(ratio) }} />
                          </div>
                          {analysis && !isExpanded && (
                            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text2)' }}>{analysis}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* 展开区域：改进建议 */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="mt-3 pt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <span className="text-[13px] font-semibold" style={{ color: 'var(--blue)' }}>
                              {ratio < 0.6 ? '急需改进' : ratio < 0.8 ? '优化建议' : '保持优势'}
                            </span>
                          </div>
                          {analysis && (
                            <p className="text-xs mb-3 leading-relaxed px-3 py-2 rounded-lg" style={{ color: 'var(--text2)', background: 'var(--bg-card2)' }}>{analysis}</p>
                          )}
                          <div className="space-y-2">
                            {tips.map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card2)' }}>
                                <span className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}>{i + 1}</span>
                                <span className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{tip}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-center">
                            <span className="text-[11px] px-3 py-1 rounded-full" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}>
                              预计可提升 {Math.round((1 - ratio) * 15)} 分
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ===== 重新诊断按钮 ===== */}
          <button
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            }}
            onClick={handleRediagnose}
            disabled={rediagReq.loading}
          >
            {rediagReq.loading ? '诊断中...' : '重新诊断'}
          </button>
        </div>
      )}
    </div>
  )
}
