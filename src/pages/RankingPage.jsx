import { useState } from 'react'

const rankingData = [
  {
    rank: 1,
    name: '陈记老北京炸酱面',
    rating: 4.8,
    geoScore: 95,
    trend: 3,
    isMine: false
  },
  {
    rank: 2,
    name: '老陕面庄',
    rating: 4.7,
    geoScore: 91,
    trend: 1,
    isMine: false
  },
  {
    rank: 3,
    name: '张小面·手工鲜面',
    rating: 4.6,
    geoScore: 87,
    trend: 5,
    isMine: true
  },
  {
    rank: 4,
    name: '兰州正宗牛肉拉面',
    rating: 4.5,
    geoScore: 82,
    trend: -2,
    isMine: false
  },
  {
    rank: 5,
    name: '川味面馆',
    rating: 4.3,
    geoScore: 76,
    trend: 0,
    isMine: false
  },
  {
    rank: 6,
    name: '面对面私房面',
    rating: 4.2,
    geoScore: 71,
    trend: 1,
    isMine: false
  }
]

function getRankBadge(rank) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-bold text-gray-900 shadow-lg shadow-yellow-500/20">
        1
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-sm font-bold text-gray-900 shadow-lg shadow-gray-400/20">
        2
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-amber-500/20">
        3
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-400">
      {rank}
    </div>
  )
}

function getTrendDisplay(trend) {
  if (trend > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        {trend}
      </span>
    )
  }
  if (trend < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-400 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {Math.abs(trend)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-gray-500 text-sm font-medium">
      —
    </span>
  )
}

function getProgressBarColor(score) {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 80) return 'bg-blue-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

function RankingCard({ item }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        item.isMine
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-gray-900 border-gray-800'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {getRankBadge(item.rank)}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-100">{item.name}</span>
              {item.isMine && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/30">
                  我的
                </span>
              )}
            </div>
          </div>
        </div>
        {getTrendDisplay(item.trend)}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-100">{item.rating}</span>
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[140px]">
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarColor(item.geoScore)}`}
              style={{ width: `${item.geoScore}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-200 w-8 text-right">{item.geoScore}</span>
        </div>
      </div>
    </div>
  )
}

function RankingPage() {
  const [industry, setIndustry] = useState('面馆')
  const [radius, setRadius] = useState('3km')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-100">竞品排行</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400">
          查看周边竞品数据排行，了解市场动态与竞争格局
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400 whitespace-nowrap">行业</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              <option value="面馆">面馆</option>
              <option value="火锅">火锅</option>
              <option value="烧烤">烧烤</option>
              <option value="奶茶">奶茶</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400 whitespace-nowrap">区域范围</label>
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
              {['1km', '3km', '5km'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    radius === r
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRefreshing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            刷新数据
          </button>
        </div>
      </div>

      {/* 排行表格 - 桌面端显示 */}
      <div className="hidden sm:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  排名
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  门店名称
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  平台评分
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  GEO评分
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  趋势
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {rankingData.map((item) => (
                <tr
                  key={item.rank}
                  className={`transition-colors ${
                    item.isMine
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    {getRankBadge(item.rank)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-100">
                        {item.name}
                      </span>
                      {item.isMine && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          我的门店
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-100">
                        {item.rating}
                      </span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressBarColor(item.geoScore)}`}
                          style={{ width: `${item.geoScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-200 w-8">
                        {item.geoScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTrendDisplay(item.trend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 排行卡片列表 - 手机端显示 */}
      <div className="sm:hidden space-y-3">
        {rankingData.map((item) => (
          <RankingCard key={item.rank} item={item} />
        ))}
      </div>

      {/* 底部分析卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 我的优势 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-100">我的优势</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-200">口味好评率高</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  用户评价中口味相关好评占比 92%，高于行业均值 15%
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-200">出餐速度快</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  平均出餐时间 8 分钟，效率评分领先周边竞品
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* 待改进项 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-100">待改进项</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-200">环境评分偏低</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  装修和卫生环境评分低于竞品均值，建议优化店内环境
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-200">缺少视频内容</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  竞品中 80% 已有短视频内容，建议尽快补充视频素材
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RankingPage
