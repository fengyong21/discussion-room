import { useState } from 'react'

const mockResults = {
  xiaohongshu: `🍜 藏在朝阳区的神仙面馆！张小面·手工鲜面

姐妹们！！这家面馆我真的回购了无数次...

📍 地址：北京市朝阳区xxx路xx号
💰 人均：25元
⏰ 推荐：招牌牛肉面、酸辣粉

#北京美食 #面馆推荐 #朝阳美食 #手工面`,
  video: `【分镜1 - 开场 0-3秒】
特写：一碗热气腾腾的手工面，筷子挑起面条
旁白："这碗面，我愿意排队一小时"

【分镜2 - 制作过程 3-10秒】
镜头：师傅手工揉面、拉面的过程
旁白："每天现做，每一根都是功夫"`,
  review: `感谢您的五星好评！🎉 很高兴您喜欢我们的手工鲜面。我们坚持每天现做，用心做好每一碗面。期待您下次光临，记得试试我们的新菜品哦～`
}

const contentTypes = [
  {
    id: 'xiaohongshu',
    label: '小红书种草文案',
    icon: '📱',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/30',
    activeBg: 'bg-emerald-500/20'
  },
  {
    id: 'video',
    label: '短视频脚本',
    icon: '🎥',
    bgClass: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-400/60',
    activeBorder: 'border-blue-400 ring-2 ring-blue-400/30',
    activeBg: 'bg-blue-500/20'
  },
  {
    id: 'review',
    label: '评价回复模板',
    icon: '📰',
    bgClass: 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-400/60',
    activeBorder: 'border-yellow-400 ring-2 ring-yellow-400/30',
    activeBg: 'bg-yellow-500/20'
  }
]

function ContentPage() {
  const [selectedType, setSelectedType] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [history, setHistory] = useState([])

  // 小红书表单状态
  const [xiaohongshuInput, setXiaohongshuInput] = useState('')
  const [xiaohongshuLength, setXiaohongshuLength] = useState('300')

  // 短视频表单状态
  const [videoTopic, setVideoTopic] = useState('')
  const [videoDuration, setVideoDuration] = useState('15')

  // 评价回复表单状态
  const [reviewScene, setReviewScene] = useState('good')

  const handleGenerate = () => {
    if (!selectedType) return
    setIsGenerating(true)
    setGeneratedResult('')

    setTimeout(() => {
      const result = mockResults[selectedType]
      setGeneratedResult(result)
      setIsGenerating(false)

      const typeLabels = {
        xiaohongshu: '小红书种草文案',
        video: '短视频脚本',
        review: '评价回复模板'
      }

      const newHistoryItem = {
        id: Date.now(),
        type: typeLabels[selectedType],
        typeId: selectedType,
        title:
          selectedType === 'xiaohongshu'
            ? xiaohongshuInput || '门店种草文案'
            : selectedType === 'video'
            ? videoTopic || '短视频脚本'
            : reviewScene === 'good'
            ? '好评感谢回复'
            : reviewScene === 'bad'
            ? '差评安抚回复'
            : '中性评价回复',
        time: new Date().toLocaleString('zh-CN'),
        content: result
      }

      setHistory((prev) => [newHistoryItem, ...prev])
    }, 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult).then(() => {
      alert('已复制到剪贴板')
    })
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleNewContent = () => {
    setSelectedType(null)
    setGeneratedResult('')
    setXiaohongshuInput('')
    setVideoTopic('')
    setReviewScene('good')
  }

  const handleHistoryItemClick = (item) => {
    setSelectedType(item.typeId)
    setGeneratedResult(item.content)
  }

  return (
    <div className="space-y-6">
      {/* 顶部操作区 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">内容生成</h2>
          <p className="mt-1 text-sm text-gray-400">
            AI 智能生成营销内容，提升门店曝光
          </p>
        </div>
        <button
          onClick={handleNewContent}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          生成新内容
        </button>
      </div>

      {/* 内容类型选择 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedType(type.id)
              setGeneratedResult('')
            }}
            className={`relative p-5 rounded-xl border-2 transition-all text-left ${
              selectedType === type.id
                ? `${type.activeBorder} ${type.activeBg}`
                : `${type.bgClass} border-transparent`
            }`}
          >
            <div className="text-3xl mb-3">{type.icon}</div>
            <div className="text-base font-semibold text-gray-100">
              {type.label}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {type.id === 'xiaohongshu' && '一键生成种草笔记，吸引流量'}
              {type.id === 'video' && '智能编排分镜脚本，高效拍摄'}
              {type.id === 'review' && '专业话术模板，提升口碑'}
            </div>
            {selectedType === type.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 生成表单 */}
      {selectedType && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-100">
            {selectedType === 'xiaohongshu' && '小红书种草文案设置'}
            {selectedType === 'video' && '短视频脚本设置'}
            {selectedType === 'review' && '评价回复模板设置'}
          </h3>

          {selectedType === 'xiaohongshu' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  门店特色 / 卖点
                </label>
                <textarea
                  value={xiaohongshuInput}
                  onChange={(e) => setXiaohongshuInput(e.target.value)}
                  placeholder="请输入门店特色，如：手工现做、秘制汤底、老字号传承..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  字数选择
                </label>
                <div className="flex gap-3">
                  {[
                    { value: '300', label: '短文 300字' },
                    { value: '800', label: '长文 800字' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setXiaohongshuLength(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        xiaohongshuLength === opt.value
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedType === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  视频主题
                </label>
                <input
                  type="text"
                  value={videoTopic}
                  onChange={(e) => setVideoTopic(e.target.value)}
                  placeholder="请输入视频主题，如：探店打卡、美食制作过程..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  时长选择
                </label>
                <div className="flex gap-3">
                  {[
                    { value: '15', label: '15秒' },
                    { value: '30', label: '30秒' },
                    { value: '60', label: '60秒' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setVideoDuration(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        videoDuration === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedType === 'review' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                选择场景
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'good', label: '好评感谢', icon: '😊' },
                  { value: 'bad', label: '差评安抚', icon: '😔' },
                  { value: 'neutral', label: '中性评价', icon: '😐' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReviewScene(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reviewScene === opt.value
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  生成中...
                </span>
              ) : (
                '生成内容'
              )}
            </button>
          </div>
        </div>
      )}

      {/* 生成结果区域 */}
      {isGenerating && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">AI 正在生成内容，请稍候...</p>
          </div>
        </div>
      )}

      {generatedResult && !isGenerating && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-100">生成结果</h3>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              {selectedType === 'xiaohongshu' && '小红书文案'}
              {selectedType === 'video' && '视频脚本'}
              {selectedType === 'review' && '评价回复'}
            </span>
          </div>
          <div className="bg-gray-800 rounded-lg p-5">
            <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-sans">
              {generatedResult}
            </pre>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              复制
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors border border-emerald-600/30"
            >
              <svg
                className="w-4 h-4"
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
              重新生成
            </button>
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {history.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-100">
            已生成内容
            <span className="ml-2 text-xs text-gray-500 font-normal">
              共 {history.length} 条
            </span>
          </h3>
          <div className="divide-y divide-gray-800">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryItemClick(item)}
                className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      item.typeId === 'xiaohongshu'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.typeId === 'video'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {item.typeId === 'xiaohongshu' && '📱'}
                    {item.typeId === 'video' && '🎥'}
                    {item.typeId === 'review' && '📰'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-200">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">{item.type}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{item.time}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentPage
