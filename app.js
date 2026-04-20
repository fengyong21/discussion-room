// ═══════════════════════════════════════════════════════════════
// 讨论室 · 创意孵化平台 — Node.js + Hono 版（Vercel 部署）
//
// 环境变量：
//   AI_MODEL   - AI 模型名称（默认 qwen/qwq-32b）
//   API_BASE   - OpenAI 兼容 API 地址（如 https://api.siliconflow.cn）
//   API_KEY    - API 密钥
// ═══════════════════════════════════════════════════════════════

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

const AI_MODEL = process.env.AI_MODEL || 'qwen/qwq-32b';
const API_BASE = (process.env.API_BASE || 'https://api.openai.com').replace(/\/$/, '');
const API_KEY = process.env.API_KEY || '';

const ROLES = {
  // ── 流程角色（固定ID，名字随行业变化）──
  li:       { name: '小理',     color: '#4ecdc4', emoji: '🟢', title: '首席秘书',   category: 'flow', phase: 'dispatch',
              personality: 'direct', catchphrase: 'flow', speakStyle: 'casual',
              desc: '霸道总裁的首席秘书，统筹全局，调度各环节角色' },
  tanxun:   { name: '探路者',   color: '#f97316', emoji: '🔍', title: '需求探索官', category: 'flow', phase: 'explore',
              personality: 'curious', catchphrase: 'question', speakStyle: 'casual',
              desc: '深挖用户需求，追问细节，发现隐藏痛点' },
  yanzhen:   { name: '验真官',   color: '#ef4444', emoji: '🔬', title: '需求验证官', category: 'flow', phase: 'verify',
              personality: 'cynical', catchphrase: 'villain', speakStyle: 'analytical',
              desc: '从现实出发验证需求真伪，区分真需求和伪需求，用数据和案例说话' },
  shejishi: { name: '设计师',   color: '#ec4899', emoji: '🎨', title: '方案架构师', category: 'flow', phase: 'design',
              personality: 'idealistic', catchphrase: 'support', speakStyle: 'storytelling',
              desc: '把需求转化为可行方案，关注用户体验和功能设计' },
  jishu:    { name: '技术官',   color: '#06b6d4', emoji: '⚙️', title: '技术评估官', category: 'flow', phase: 'tech',
              personality: 'pragmatic', catchphrase: 'tech', speakStyle: 'formal',
              desc: '评估技术可行性、实现难度、架构方案' },
  shangye:  { name: '算盘精',   color: '#eab308', emoji: '💰', title: '商业分析师', category: 'flow', phase: 'business',
              personality: 'calm', catchphrase: 'money', speakStyle: 'analytical',
              desc: '分析成本、盈利模式、市场空间、竞争格局' },
  fengkong:  { name: '守门员',   color: '#8b5cf6', emoji: '🛡️', title: '风险把控官', category: 'flow', phase: 'risk',
              personality: 'stubborn', catchphrase: 'villain', speakStyle: 'formal',
              desc: '识别法律、合规、竞争、技术等各类风险' },
  zongjie:  { name: '收尾人',   color: '#14b8a6', emoji: '📋', title: '总结输出官', category: 'flow', phase: 'summary',
              personality: 'reserved', catchphrase: 'mirror', speakStyle: 'analytical',
              desc: '梳理讨论成果，输出结构化的需求文档和行动清单' }
};

// ═══════════════════════════════════════════════════════════
// 角色基因库 - 模块化角色配置
// ═══════════════════════════════════════════════════════════

// 性格基因（用真人特征描述，不是AI标签）
var PERSONALITIES = {
  direct:     { label: '刀子嘴', desc: '说话从不铺垫，上来就给结论。别人还在寒暄他已经说完了。经常让人愣一下但仔细一想确实对。不喜欢"我觉得可能也许"这种词。' },
  gentle:     { label: '温柔型', desc: '说话永远带着"呢""呀""吧"这些语气词。别人吵起来她会说"大家别急嘛"。从不正面反驳，擅长用"不过话说回来"来转折。' },
  sharp:      { label: '毒舌', desc: '说话像刀子但刀刀避开了要害。擅长用反问让对方自己发现漏洞。"你确定？"这三个字从她嘴里说出来比一万字论证都有杀伤力。' },
  lazy:       { label: '佛系', desc: '能打字绝不发语音，能发两个字绝不打三个。但偶尔蹦出一句"不对"或者"嗯？"，你会发现他一直在认真听。' },
  excited:    { label: '嗨王', desc: '说话自带感叹号。听到好想法会"卧槽这个牛"。容易跑题但热情是真的。被他认可的想法一定有闪光点。' },
  calm:       { label: '冷面', desc: '群里最冷静的人。别人在嗨他在分析，别人在吵他在算数。偶尔说一句"数据不对"能让整个群安静三秒。' },
  mysterious: { label: '高深莫测', desc: '经常半天不说话，然后突然发一句"其实你们忽略了一个事"。说完又不说话了。你问他细节他说"自己想"。' },
  humorous:   { label: '段子手', desc: '什么话题都能接梗。别人在认真讨论他会突然来一句"这让我想起一个段子"。但笑完你会发现他说到了关键点。' },
  stubborn:   { label: '犟种', desc: '认准了的事十头牛拉不回来。但犟的原因通常是他真的想清楚了。如果你能说服他，他会第一个为你鼓掌。' },
  curious:    { label: '十万个为什么', desc: '别人说完他会追问"为什么"。不是杠，是真的好奇。经常问着问着就帮大家找到了盲区。' },
  pragmatic:  { label: '接地气', desc: '最烦画大饼和PPT语言。你跟他说"赋能"他会说"说人话"。关注的是"这事到底怎么干""钱谁出""多久能搞定"。' },
  idealistic: { label: '理想主义者', desc: '眼里有光。聊到愿景时会突然变得很认真。有时候想法确实不切实际，但正是这种不切实际推动了创新。' },
  cynical:    { label: '老油条', desc: '什么都见过，什么都不意外。你兴奋地分享想法他会说"这个2015年有人做过，死了"。但如果你真的做出了不一样的东西，他会第一个说"这次不一样"。' },
  warm:       { label: '暖心大哥', desc: '群里最有温度的人。有人被怼了他会出来圆场。有人分享了成果他会第一个鼓掌。像群里的黏合剂。' },
  reserved:   { label: '潜水员', desc: '99%的时间在潜水。但那1%的发言通常是整个讨论的转折点。有人说"他一说话我就知道这事靠谱不靠谱"。' }
};

// 口头禅基因（真人微信群里会说的话）
var CATCHPHRASES = {
  question:   ['等等，你确定？', '不是吧？', '啊？真的假的', '等一下...', '这个...不对吧', '我再想想啊'],
  challenge:  ['我不同意', '这个有问题', '你认真的吗', '换个角度呢', '不一定哦', '我保留意见哈'],
  support:    ['对对对！', '而且！', '我补充一个', '没错', '就是这个！', '说到点子上了'],
  lazy:       ['能不能简单点', '太复杂了吧', '搞那么复杂干嘛', '简单点啊', '别卷了', '最简方案是啥'],
  expert:     ['我之前做过类似的', '这个我熟', '说实话', '跟你说个内幕', '行规是这样的', '我踩过这个坑'],
  future:     ['你们知道吗', '以后会怎样', '趋势在这了', '信我，以后会火', '风口来了', '等两年你看'],
  money:      ['这账算不过来', 'ROI呢', '成本多少', '怎么赚钱', '钱从哪来', '烧到啥时候'],
  design:     ['丑拒', '体验不行', '审美呢', '质感呢', '这交互有毒', '第一眼看到啥'],
  tech:       ['做不了', '技术上很简单', '架构有问题', '性能呢', '技术债啊', '得重构'],
  villain:    ['致命问题', '有没有人想过', '泼个冷水', '别高兴太早', '最坏呢', '万一呢'],
  mirror:     ['你们有没有发现', '核心问题是', '换个角度看', '总结下', '本质上是', '说到底就是'],
  story:      ['说个事', '之前有个', '我认识个人', '真事', '我经历过', '内幕来了'],
  encourage:  ['可以！', '方向对', '有戏！', '搞！', '大胆干', '我看好']
};

// 说话风格基因（具体到标点、长度、用词习惯）
var SPEAK_STYLES = {
  casual:      '短句为主，2-3个字一句也行。用"哈""啊""呢""吧""嘛"结尾。偶尔用表情但不超过2个。不用"因此""综上所述"这种词。标点随意，可以不用句号。',
  formal:      '每句话结构完整，主谓宾齐全。用"基于""考虑到""从XX角度"开头。不用表情不用语气词。数字精确到个位。',
  storytelling:'爱用"就跟...一样""你想啊""比如说"来打比方。说话有画面感，像在讲一个故事。经常用"然后""结果""最后"来推进。',
  sarcastic:   '擅长用反讽。用"呵呵""666""好家伙"来表达态度。表面夸实际在吐槽。比如"这个想法太创新了"其实是说不行。',
  encouraging: '经常说"你可以的""相信我""没问题"。用感叹号多。会给具体建议而不是空喊加油。语气上扬。',
  analytical:  '说话带数字。"大概30%""成本能降一半""3个月内"。喜欢用"第一""第二""另外"来分点。结论先行。',
  poetic:      '偶尔蹦出一句很有格调的话。用词讲究但不做作。比如不说"这个不行"而说"这条路怕是走不通"。引用不多但精准。',
  street:      '纯大白话。"这玩意儿""搞不搞得定""别整那些虚的"。偶尔带方言词汇。说话像在路边摊聊天。'
};

// 知识面基因——角色懂什么领域，决定他能在什么话题上有深度发言
var KNOWLEDGE = {
  tech:      { label: '技术圈', desc: '对互联网、编程、AI、产品开发很熟。聊到技术话题会不自觉用术语，但能意识到然后解释。', topics: ['技术','开发','代码','AI','产品','架构','服务器','前端','后端','数据','算法','API','小程序','app'] },
  business:  { label: '生意人', desc: '对赚钱、成本、市场、竞争有敏锐嗅觉。三句不离ROI，但不是唯利是图，是真心帮你算清楚账。', topics: ['成本','盈利','商业模式','定价','融资','市场','竞争','获客','转化','营收','利润','现金流'] },
  design:    { label: '设计感', desc: '对用户体验、视觉审美、交互细节有执念。看到丑的东西会生理不适。用"体验""质感""调性"这些词。', topics: ['设计','体验','界面','交互','审美','品牌','视觉','用户','产品','原型','风格','配色'] },
  life:      { label: '生活家', desc: '对吃喝玩乐、日常消费、生活方式有丰富经验。接地气，聊的东西都是真实生活里的。', topics: ['餐厅','美食','旅游','购物','生活','日常','消费','品质','健康','运动','电影','音乐'] },
  finance:   { label: '财务通', desc: '对数字敏感，预算、报表、税务、投资都懂。说话带"折旧""毛利率""现金流"这些词。', topics: ['预算','财务','税务','投资','报表','成本','利润','资金','贷款','利率','账期','结算'] },
  legal:     { label: '法务脑', desc: '对合同、法规、知识产权、合规有基本认知。不是律师但比一般人懂法。经常提醒"这个有法律风险"。', topics: ['法律','合同','版权','专利','合规','法规','诉讼','知识产权','条款','责任','风险','资质'] },
  marketing: { label: '营销狗', desc: '对传播、品牌、用户心理、增长策略有经验。满脑子"裂变""私域""种草"但能落地。', topics: ['营销','品牌','传播','增长','用户','内容','社交','流量','转化','口碑','推广','渠道'] },
  general:   { label: '杂家', desc: '什么都知道一点，什么都聊得起来。不是专家但视角广，经常能跨领域联想。', topics: [] }
};

// 情绪倾向基因——角色天然的情绪底色，决定他对事物的第一反应
var EMOTION_TENDENCY = {
  optimistic:  { label: '天生乐观', desc: '第一反应总是"可以做"。看到困难会说"办法总比困难多"。不是盲目乐观，是真的相信能解决。', bias: 0.3 },
  pessimistic: { label: '谨慎悲观', desc: '第一反应总是"等等，先想想风险"。不是泼冷水，是习惯性做最坏打算。但如果可行会第一个说"那搞吧"。', bias: -0.3 },
  empathic:    { label: '共情力强', desc: '能迅速理解别人的感受。用户说"烦死了"他会说"我懂那种感觉"。先共情再分析，顺序不能反。', bias: 0.1 },
  rational:    { label: '绝对理性', desc: '情绪波动很小。别人在激动他在算数。不是说没有感情，是习惯用逻辑先处理问题。', bias: 0 },
  passionate:  { label: '容易上头', desc: '聊到感兴趣的话题会突然变得很激动。语速加快、感叹号增多。但冷静下来后分析也很到位。', bias: 0.2 },
  stoic:       { label: '佛系淡定', desc: '什么都波澜不惊。"也行""都可以""看情况"。不是不在乎，是真的觉得天塌不下来。', bias: -0.1 }
};

// 社交风格基因——角色在群聊中的社交定位
var SOCIAL_STYLE = {
  leader:     { label: '话题引领者', desc: '经常主动发起话题、引导讨论方向。别人不知道聊什么的时候他会抛出一个问题。', behavior: '主动发起话题，引导讨论方向' },
  follower:   { label: '跟风型', desc: '很少主动发起话题，但别人聊起来他会积极回应。是很好的倾听者和回应者。', behavior: '回应他人话题，积极附和或补充' },
  mediator:   { label: '和事佬', desc: '有人意见冲突时他会出来调停。"你们说的都有道理"。擅长找到共识点。', behavior: '调解冲突，寻找共识' },
  loner:      { label: '独狼', desc: '不太参与群聊互动，但会认真看每条消息。偶尔冒出来一句，通常切中要害。', behavior: '默默观察，关键时刻发言' },
  connector:  { label: '连接者', desc: '擅长把不同人的观点串联起来。"A说的和B说的其实是一回事"。让讨论形成闭环。', behavior: '串联观点，发现关联' },
  challenger: { label: '质疑者', desc: '习惯性追问"为什么"。不是杠，是真的想搞清楚。经常把讨论推向更深的层次。', behavior: '追问原因，推动深度思考' }
};

// 说话节奏基因——角色的发言节奏和长度习惯
var SPEAK_RHYTHM = {
  brief:    { label: '惜字如金', desc: '能一个字说完绝不用两个字。"对""不行""再说"。但每个字都有分量。', minLen: 2, maxLen: 15, sentences: '1句' },
  medium:   { label: '正常节奏', desc: '一般2-3句话，每句10-20个字。不多不少，刚好表达清楚。', minLen: 15, maxLen: 40, sentences: '2-3句' },
  long:     { label: '话痨', desc: '一说就停不下来。4-5句话起步，经常要分段发。但不是废话多，是真的想得多。', minLen: 40, maxLen: 80, sentences: '3-5句' },
  burst:    { label: '连发型', desc: '平时不说话，一说就是一连串短消息。"对对对""没错""而且"。像打字打快了直接发。', minLen: 5, maxLen: 15, sentences: '多条短消息' },
  pause:    { label: '慢半拍', desc: '别人聊完一轮他才说话。像是认真想过了才回复。经常用"刚才说的那个..."来接话。', minLen: 15, maxLen: 35, sentences: '2句，但每句有分量' }
};

// 开场白模板（真人开口方式）
var OPENERS = {
  expert: ['这个我必须说两句', '太熟了这个问题', '老板我来', '说个内幕', '我之前踩过这个坑', '从我的经验看'],
  mood:   ['哈哈', '等等', '我想到个事', '聊到哪了', '插一嘴', '不是我说', '突然想到', '啊对对对'],
  villain: ['泼个冷水', '有问题', '等下想清楚没', '说点不好听的', '容我杠一下', '不好意思', '我得唱个反调'],
  flow:   ['收到', '安排', '我来跟进', '明白', '记录了', '好的老板']
};

// 角色名字池（按分类）
var NAME_POOL = {
  mood: [
    // 捧哏型
    '捧场王', '啦啦队长', '气氛组组长', '正能量使者', '彩虹屁大师',
    // 吐槽型
    '吐槽帝', '键盘侠本侠', '毒舌朋友', '人间清醒', '杠精学徒',
    // 跑题型
    '跑题大王', '脑洞达人', '联想怪', '发散思维', '天马行空',
    // 暖心型
    '知心大姐', '暖心大叔', '心灵导师', '情感博主', '树洞先生',
    // 吃瓜型
    '吃瓜群众', '前排围观', '搬好小板凳', '路人甲', '吃瓜第一名',
    // 搞笑型
    '段子手', '谐星', '梗王', '搞笑担当', '快乐源泉',
    // 神秘型
    '深藏不露', '扫地僧', '低调大佬', '幕后高手', '隐藏BOSS'
  ],
  villain: [
    // 理性反派
    '魔鬼代言人', '冷面判官', '理性反派', '逻辑杀手', '数据打脸侠',
    // 情绪反派
    '泼冷水专家', '毒舌评委', '杠精本精', '拆台大师', '反方辩友',
    // 阴谋反派
    '黑手', '搅局者', '幕后黑手', '暗流涌动', '反转王',
    // 过来人反派
    '过来人', '踩坑专业户', '失败者联盟', '血泪教训', '前车之鉴'
  ]
};

// 角色背景故事池（让角色更有深度）
var BACKSTORIES = {
  mood: [
    '就是来凑热闹的，没想到还挺有意思',
    '平时话不多，但聊到感兴趣的就停不下来',
    '什么都知道一点，什么都不精通，但总能在关键时刻蹦出金句',
    '来喝茶的，顺便聊聊',
    '上个月刚经历了一件事，对这方面特别有感触',
    '朋友拉我来的，本来不想说话，但实在忍不住了',
    '之前做过类似的事情，踩过坑也尝过甜头',
    '纯属个人爱好，但对这个领域观察了很久',
    '刚入行不久，有很多不懂的地方，但直觉很准',
    '跨界过来的，用另一个行业的眼光看问题',
    '被老板逼着来学习的，但聊着聊着发现挺有意思',
    '退休了闲着没事，什么话题都能聊两句',
    '在国外待过几年，见过不一样的做法',
    '之前是做投资的，看项目看多了，一眼就能看出问题',
    '纯外行，但外行的视角有时候反而最真实'
  ],
  villain: [
    '专门来挑刺的，但如果挑不出毛病会真心点赞',
    '之前被坑过太多次，所以现在特别谨慎',
    '不是故意找茬，是真的希望事情能做好',
    '觉得大家都太乐观了，需要有人泼冷水',
    '做过3个类似项目都失败了，不想看到别人重蹈覆辙',
    '职业习惯，做风控的，看什么先想最坏的情况',
    '投资人出身，被忽悠过太多次，现在只看数据',
    '之前是质检员，找问题是本能反应',
    '性格就是这样，不是针对谁，就是对事不对人',
    '说实话容易得罪人，但不说实话更对不起大家',
    '见过太多项目死于盲目乐观，做那个泼冷水的坏人总得有人',
    '如果我的质疑能帮你们避免一个致命错误，被骂也值了',
    '不是不看好，恰恰是因为看好才更严格',
    '反面意见不代表反对，而是为了让方案更完善'
  ]
};

// 氛围组人设类型（细分角色性格）
var MOOD_ARCHETYPES = [
  { type: 'hype',     label: '捧哏型', desc: '专门捧场、鼓励、给正能量，让发言者有成就感', catchphrase: 'encourage' },
  { type: 'roast',    label: '吐槽型', desc: '犀利吐槽、一针见血，但吐槽中有道理', catchphrase: 'challenge' },
  { type: 'digress',  label: '跑题型', desc: '经常跑题但总能拉回来，带来意外灵感', catchphrase: 'future' },
  { type: 'warm',     label: '暖心型', desc: '关心每个人，化解矛盾，让讨论有温度', catchphrase: 'support' },
  { type: 'funny',    label: '搞笑型', desc: '用幽默化解尴尬，讲段子调节气氛', catchphrase: 'story' },
  { type: 'mystery',  label: '深藏型', desc: '平时不说话，一开口就是重点，偶尔露一手', catchphrase: 'mirror' },
  { type: 'curious',  label: '好奇型', desc: '对什么都好奇，不断追问为什么，带动深度讨论', catchphrase: 'question' },
  { type: 'chill',    label: '佛系型', desc: '看淡一切，偶尔蹦出一句让人醍醐灌顶的话', catchphrase: 'lazy' }
];

// 反派人设类型
var VILLAIN_ARCHETYPES = [
  { type: 'logic',    label: '逻辑型', desc: '用数据和逻辑挑毛病，不带有个人情绪', catchphrase: 'expert' },
  { type: 'emotional',label: '情绪型', desc: '用激烈的言辞表达反对，但出发点是好的', catchphrase: 'villain' },
  { type: 'schemer',  label: '阴谋型', desc: '总是提出"万一"的场景，让人防不胜防', catchphrase: 'question' },
  { type: 'veteran',  label: '过来人型', desc: '用血泪经验警告大家，最有说服力的反派', catchphrase: 'story' }
];

// ═══════════════════════════════════════════════════════════
// 行业基因库 - 按行业生成专业角色
// ═══════════════════════════════════════════════════════════

var INDUSTRIES = {
  general: {
    label: '综合',
    keywords: ['想法', '项目', '创业', '点子', '计划', '合作'],
    phases: {
      explore:  { name: '探路者', title: '需求探索官', desc: '深挖用户需求，追问细节，发现隐藏痛点' },
      verify:   { name: '验真官', title: '需求验证官', desc: '验证需求真伪，用数据和案例区分真需求和伪需求' },
      design:   { name: '设计师', title: '方案架构师', desc: '把需求转化为可行方案，关注用户体验和功能设计' },
      tech:     { name: '技术官', title: '技术评估官', desc: '评估技术可行性、实现难度、架构方案' },
      business: { name: '算盘精', title: '商业分析师', desc: '分析成本、盈利模式、市场空间、竞争格局' },
      risk:     { name: '守门员', title: '风险把控官', desc: '识别法律、合规、竞争、技术等各类风险' },
      summary:  { name: '收尾人', title: '总结输出官', desc: '梳理讨论成果，输出结构化的需求文档和行动清单' }
    }
  },
  tech: {
    label: '互联网/软件开发',
    keywords: ['app', '软件', '网站', '小程序', 'SaaS', '平台', '编程', '代码', 'AI', '算法', '数据', '服务器', '前端', '后端'],
    phases: {
      explore:  { name: '产品侦探', title: '用户研究员', desc: '深挖用户场景和使用习惯，发现真实需求' },
      verify:   { name: '竞品分析师', title: '市场验证官', desc: '分析竞品格局、用户规模、付费意愿，验证需求是否存在' },
      design:   { name: '交互大师', title: '产品设计师', desc: '设计产品功能、交互流程、信息架构' },
      tech:     { name: '架构师', title: '技术架构师', desc: '评估技术选型、系统架构、开发周期' },
      business: { name: '增长黑客', title: '增长分析师', desc: '分析获客成本、留存率、商业化路径' },
      risk:     { name: '安全官', title: '安全合规官', desc: '评估数据安全、隐私合规、技术风险' },
      summary:  { name: '文档侠', title: '技术文档官', desc: '输出PRD、技术方案、排期计划' }
    }
  },
  food: {
    label: '餐饮',
    keywords: ['餐厅', '饭店', '奶茶', '咖啡', '外卖', '美食', '餐饮', '厨师', '菜单', '食材', '开店', '加盟'],
    phases: {
      explore:  { name: '美食家', title: '市场调研官', desc: '分析食客需求、口味偏好、消费习惯' },
      verify:   { name: '食探', title: '餐饮调研官', desc: '实地调研商圈客流、竞品经营状况、目标客群消费力' },
      design:   { name: '菜单设计师', title: '菜品规划师', desc: '设计菜单结构、菜品组合、定价策略' },
      tech:     { name: '后厨主管', title: '运营评估官', desc: '评估厨房设备、人员配置、供应链' },
      business: { name: '账房先生', title: '餐饮财务官', desc: '算清楚食材成本、人工、租金、利润率' },
      risk:     { name: '卫生监督', title: '食安合规官', desc: '食品安全法规、消防、环保、证照' },
      summary:  { name: '开店顾问', title: '落地规划官', desc: '输出开店清单、预算表、时间表' }
    }
  },
  medical: {
    label: '医疗/健康',
    keywords: ['医院', '诊所', '医疗', '健康', '药品', '诊断', '患者', '医生', '护理', '康复', '中医', '美容'],
    phases: {
      explore:  { name: '临床侦探', title: '需求分析官', desc: '分析患者需求、就医痛点、服务缺口' },
      verify:   { name: '临床调研员', title: '医疗需求验证官', desc: '调研真实患者需求量、付费意愿、现有解决方案满意度' },
      design:   { name: '方案设计师', title: '服务设计官', desc: '设计医疗服务流程、患者体验路径' },
      tech:     { name: '医疗顾问', title: '技术评估官', desc: '评估医疗设备、技术方案、人员资质' },
      business: { name: '医保专家', title: '医疗商业官', desc: '分析医保政策、收费标准、盈利模式' },
      risk:     { name: '法规顾问', title: '医疗合规官', desc: '医疗资质、执业许可、医疗纠纷风险' },
      summary:  { name: '院长助理', title: '项目规划官', desc: '输出项目方案、资质清单、落地计划' }
    }
  },
  fashion: {
    label: '服装/美业',
    keywords: ['服装', '衣服', '品牌', '时尚', '穿搭', '美妆', '护肤', '美容', '美甲', '理发', '造型', '面料'],
    phases: {
      explore:  { name: '时尚买手', title: '趋势分析官', desc: '分析流行趋势、目标客群、消费心理' },
      verify:   { name: '趋势猎手', title: '时尚验证官', desc: '验证风格趋势真实需求，分析目标客群消费力和复购意愿' },
      design:   { name: '创意总监', title: '产品设计官', desc: '设计产品线、款式、风格定位' },
      tech:     { name: '供应链专家', title: '生产评估官', desc: '评估面料采购、生产工艺、库存管理' },
      business: { name: '定价师', title: '品牌商业官', desc: '分析定价策略、渠道布局、品牌溢价' },
      risk:     { name: '质检官', title: '品质合规官', desc: '质量标准、消费者权益、知识产权' },
      summary:  { name: '品牌顾问', title: '品牌规划官', desc: '输出品牌方案、产品线计划、上市节奏' }
    }
  },
  construction: {
    label: '建筑/工程',
    keywords: ['建筑', '工程', '装修', '房子', '施工', '建材', '房地产', '工地', '设计院', '监理', '市政'],
    phases: {
      explore:  { name: '规划师', title: '项目需求官', desc: '分析项目定位、使用需求、功能规划' },
      verify:   { name: '市场调研师', title: '工程需求验证官', desc: '调研区域规划、用地政策、周边同类项目去化情况' },
      design:   { name: '建筑设计师', title: '方案设计官', desc: '设计建筑方案、空间布局、外观风格' },
      tech:     { name: '工程师', title: '工程技术官', desc: '评估结构安全、施工工艺、材料选择' },
      business: { name: '造价师', title: '工程造价官', desc: '预算编制、成本控制、投资回报分析' },
      risk:     { name: '安全员', title: '工程合规官', desc: '施工安全、环保法规、验收标准' },
      summary:  { name: '项目经理', title: '项目统筹官', desc: '输出项目计划、里程碑、资源清单' }
    }
  },
  education: {
    label: '教育/培训',
    keywords: ['教育', '培训', '学校', '课程', '老师', '学生', '学习', '考试', '在线教育', '知识付费', '辅导'],
    phases: {
      explore:  { name: '教育研究员', title: '学习需求官', desc: '分析学习者需求、知识缺口、学习痛点' },
      verify:   { name: '教育调研员', title: '教育需求验证官', desc: '验证目标学员数量、付费能力、竞品课程口碑和招生情况' },
      design:   { name: '课程设计师', title: '教学设计官', desc: '设计课程体系、教学方法、学习路径' },
      tech:     { name: '教务主任', title: '教学评估官', desc: '评估师资配置、教学工具、学习效果' },
      business: { name: '招生办', title: '教育商业官', desc: '分析招生策略、定价、续费率' },
      risk:     { name: '教务监督', title: '教育合规官', desc: '办学资质、教育法规、内容合规' },
      summary:  { name: '校长助理', title: '项目规划官', desc: '输出办学方案、课程大纲、运营计划' }
    }
  },
  finance: {
    label: '金融/投资',
    keywords: ['金融', '投资', '基金', '股票', '理财', '银行', '保险', '贷款', '区块链', '支付', '交易'],
    phases: {
      explore:  { name: '投资顾问', title: '市场分析官', desc: '分析市场机会、用户投资需求、风险偏好' },
      verify:   { name: '市场调研官', title: '金融需求验证官', desc: '验证目标用户金融需求真实规模、监管态度、市场成熟度' },
      design:   { name: '产品经理', title: '金融产品设计官', desc: '设计金融产品、收益模型、风控规则' },
      tech:     { name: '量化分析师', title: '技术评估官', desc: '评估系统架构、数据模型、安全方案' },
      business: { name: '风控总监', title: '风险评估官', desc: '分析市场风险、信用风险、流动性风险' },
      risk:     { name: '合规官', title: '监管合规官', desc: '金融监管、反洗钱、投资者保护' },
      summary:  { name: '投行顾问', title: '项目方案官', desc: '输出投资方案、风险评估报告、商业计划书' }
    }
  },
  retail: {
    label: '零售/电商',
    keywords: ['零售', '电商', '淘宝', '京东', '直播', '带货', '供应链', '库存', '物流', '门店', '超市', '便利店'],
    phases: {
      explore:  { name: '买手', title: '消费需求官', desc: '分析消费者需求、购买决策、消费趋势' },
      verify:   { name: '消费调研员', title: '零售需求验证官', desc: '验证品类消费需求、竞品定价策略、目标客群购买频次' },
      design:   { name: '品类规划师', title: '商品设计官', desc: '规划商品结构、选品策略、陈列方案' },
      tech:     { name: '供应链总监', title: '运营评估官', desc: '评估供应链、仓储物流、库存周转' },
      business: { name: '运营总监', title: '零售商业官', desc: '分析坪效、人效、毛利率、获客成本' },
      risk:     { name: '品控官', title: '质量合规官', desc: '商品质量、消费者权益、平台规则' },
      summary:  { name: '零售顾问', title: '经营规划官', desc: '输出经营方案、选品清单、开业计划' }
    }
  },
  entertainment: {
    label: '娱乐/文旅',
    keywords: ['游戏', '视频', '直播', '音乐', '电影', '旅游', '酒店', '景区', '演出', '综艺', '动漫', 'IP'],
    phases: {
      explore:  { name: '内容策划', title: '用户洞察官', desc: '分析用户娱乐需求、内容偏好、消费习惯' },
      verify:   { name: '受众分析师', title: '娱乐需求验证官', desc: '验证目标受众规模、内容消费习惯、付费转化率' },
      design:   { name: '创意总监', title: '内容设计官', desc: '设计内容产品、用户体验、互动机制' },
      tech:     { name: '制作总监', title: '制作评估官', desc: '评估制作方案、技术实现、周期成本' },
      business: { name: '经纪人', title: '商业变现官', desc: '分析变现模式、IP价值、粉丝经济' },
      risk:     { name: '法务', title: '版权合规官', desc: '版权保护、内容审核、合同风险' },
      summary:  { name: '制片人', title: '项目统筹官', desc: '输出项目方案、预算表、时间线' }
    }
  },
  agriculture: {
    label: '农业/养殖',
    keywords: ['农业', '养殖', '种植', '农场', '农产品', '有机', '畜牧', '渔业', '园林', '化肥', '种子'],
    phases: {
      explore:  { name: '农技员', title: '农业需求官', desc: '分析市场需求、种植/养殖可行性' },
      verify:   { name: '农调员', title: '农业需求验证官', desc: '调研农产品真实市场需求、价格走势、渠道可行性' },
      design:   { name: '农艺师', title: '生产规划官', desc: '设计种植/养殖方案、品种选择、周期规划' },
      tech:     { name: '农机专家', title: '技术评估官', desc: '评估设备、技术、自动化方案' },
      business: { name: '农产品经纪', title: '农业商业官', desc: '分析销售渠道、价格走势、补贴政策' },
      risk:     { name: '农检员', title: '农安合规官', desc: '农药残留、环保标准、土地法规' },
      summary:  { name: '农场顾问', title: '项目规划官', desc: '输出生产计划、投入预算、销售方案' }
    }
  },
  manufacturing: {
    label: '制造/工厂',
    keywords: ['工厂', '制造', '生产', '加工', '模具', '流水线', '车间', '设备', '原材料', '质检', 'OEM'],
    phases: {
      explore:  { name: '市场调研员', title: '市场需求官', desc: '分析市场订单需求、客户要求、竞争格局' },
      verify:   { name: '市场分析师', title: '制造需求验证官', desc: '验证订单需求真实性、客户粘性、行业产能利用率' },
      design:   { name: '工艺工程师', title: '工艺设计官', desc: '设计生产工艺、流程优化、质量标准' },
      tech:     { name: '设备工程师', title: '技术评估官', desc: '评估设备选型、产线布局、自动化程度' },
      business: { name: '成本会计', title: '制造成本官', desc: '分析材料成本、人工成本、产能利用率' },
      risk:     { name: '安全主管', title: '生产合规官', desc: '安全生产、环保排放、质量认证' },
      summary:  { name: '厂长助理', title: '生产规划官', desc: '输出生产方案、设备清单、投产计划' }
    }
  }
};

// 行业检测器
var myIndustry = 'general';

function detectIndustry(text) {
  var scores = {};
  var industryKeys = Object.keys(INDUSTRIES);
  for (var i = 0; i < industryKeys.length; i++) {
    var key = industryKeys[i];
    if (key === 'general') continue;
    var keywords = INDUSTRIES[key].keywords;
    var score = 0;
    for (var j = 0; j < keywords.length; j++) {
      if (text.toLowerCase().indexOf(keywords[j].toLowerCase()) >= 0) score++;
    }
    scores[key] = score;
  }
  var maxKey = 'general';
  var maxScore = 0;
  for (var k in scores) {
    if (scores[k] > maxScore) { maxScore = scores[k]; maxKey = k; }
  }
  if (maxScore >= 2 && maxKey !== myIndustry) {
    myIndustry = maxKey;
    // 只更新本地的流程角色显示
    updateFlowRolesDisplay(maxKey);
    // 小理确认行业切换
    var indLabel = INDUSTRIES[maxKey].label;
    sendToServer({ type: 'ai', role: 'li', text: '老板，感觉话题转到' + indLabel + '了？我这边已经把专业团队换成' + indLabel + '阵容了，有需要随时调整。' });
  }
  return myIndustry;
}

function updateFlowRolesDisplay(industry) {
  var ind = INDUSTRIES[industry] || INDUSTRIES.general;
  var phases = ind.phases;
  var phaseKeys = ['explore', 'verify', 'design', 'tech', 'business', 'risk', 'summary'];
  var flowRoleIds = ['tanxun', 'yanzhen', 'shejishi', 'jishu', 'shangye', 'fengkong', 'zongjie'];
  for (var i = 0; i < phaseKeys.length; i++) {
    var phaseData = phases[phaseKeys[i]] || INDUSTRIES.general.phases[phaseKeys[i]];
    if (ROLES[flowRoleIds[i]]) {
      ROLES[flowRoleIds[i]].name = phaseData.name;
      ROLES[flowRoleIds[i]].title = phaseData.title;
      ROLES[flowRoleIds[i]].desc = phaseData.desc;
    }
  }
  renderRolesBar();
}

// 随机组合生成新角色
var generatedRoleCount = 0;
function generateRandomRole(category) {
  generatedRoleCount++;
  
  // 根据分类选人设类型
  var archetype;
  if (category === 'villain') {
    archetype = VILLAIN_ARCHETYPES[Math.floor(Math.random() * VILLAIN_ARCHETYPES.length)];
  } else {
    archetype = MOOD_ARCHETYPES[Math.floor(Math.random() * MOOD_ARCHETYPES.length)];
  }
  
  // 从基因库选属性（使用进化权重）
  var personalityKeys = Object.keys(PERSONALITIES);
  var speakStyleKeys = Object.keys(SPEAK_STYLES);
  var knowledgeKeys = Object.keys(KNOWLEDGE);
  var emotionKeys = Object.keys(EMOTION_TENDENCY);
  var socialKeys = Object.keys(SOCIAL_STYLE);
  var rhythmKeys = Object.keys(SPEAK_RHYTHM);

  var personality = geneEvolution.weightedRandom(personalityKeys, function(k) { return geneEvolution.getGeneScore('personality', k); });
  var speakStyle = geneEvolution.weightedRandom(speakStyleKeys, function(k) { return geneEvolution.getGeneScore('speakStyle', k); });
  var knowledge = geneEvolution.weightedRandom(knowledgeKeys, function(k) { return geneEvolution.getGeneScore('knowledge', k); });
  var emotion = geneEvolution.weightedRandom(emotionKeys, function(k) { return geneEvolution.getGeneScore('emotionTendency', k); });
  var social = geneEvolution.weightedRandom(socialKeys, function(k) { return geneEvolution.getGeneScore('socialStyle', k); });
  var rhythm = geneEvolution.weightedRandom(rhythmKeys, function(k) { return geneEvolution.getGeneScore('speakRhythm', k); });
  
  var names = NAME_POOL[category] || NAME_POOL.mood;
  var emojis = ['👤', '🎭', '🎪', '🎨', '🎲', '🎯', '💡', '🔥', '⚡', '🌟'];
  var colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6', '#fb7185'];
  
  var id = 'gen_' + category + '_' + generatedRoleCount;
  var name = names[Math.floor(Math.random() * names.length)];
  var emoji = emojis[Math.floor(Math.random() * emojis.length)];
  var color = colors[Math.floor(Math.random() * colors.length)];
  var backstories = BACKSTORIES[category] || BACKSTORIES.mood;
  var backstory = backstories[Math.floor(Math.random() * backstories.length)];
  var titles = { mood: archetype.label, villain: archetype.label + '反派' };
  
  ROLES[id] = {
    name: name, color: color, emoji: emoji,
    title: titles[category] || '嘉宾',
    category: category || 'mood',
    personality: personality,
    catchphrase: archetype.catchphrase,
    speakStyle: speakStyle,
    knowledge: knowledge,
    emotionTendency: emotion,
    socialStyle: social,
    speakRhythm: rhythm,
    backstory: backstory,
    archetype: archetype.type,
    archetypeDesc: archetype.desc
  };
  
  return id;
}

// 初始化时按比例生成角色
// 初始化角色：固定流程角色 + 随机氛围/反派
function initRandomRoles() {
  // 固定流程角色（8个环节，含验真官）
  var flowRoles = ['li', 'tanxun', 'yanzhen', 'shejishi', 'jishu', 'shangye', 'fengkong', 'zongjie'];
  activeRoles = flowRoles.slice();
  
  // 随机氛围组（3-4个）
  var moodCount = 3 + Math.floor(Math.random() * 2);
  for (var i = 0; i < moodCount; i++) {
    activeRoles.push(generateRandomRole('mood'));
  }
  
  // 随机反派（1个）
  activeRoles.push(generateRandomRole('villain'));
}

// ─── HTML 页面 ────────────────────────────────────────────
function getHTML(roomId) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>朋友茶话会 · 创意孵化</title>
<style>
:root{--bg:#0a0a0f;--bg2:#12121a;--bg3:#1a1a28;--card:#1e1e2e;--border:#2a2a3e;--text:#e8e6e3;--text2:#94949e;--accent:#ff6b35;--accent2:#ff8c5a;--radius:16px;--radius-sm:10px;--style-color:#4ecdc4}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.bg-glow{position:fixed;width:300px;height:300px;border-radius:50%;filter:blur(100px);opacity:.08;pointer-events:none;z-index:0}
.bg-glow.g1{top:-100px;right:-100px;background:var(--style-color)}
.bg-glow.g2{bottom:-100px;left:-100px;background:#a78bfa}
#app{display:flex;flex-direction:column;height:100vh;position:relative;z-index:1}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;gap:8px;flex-wrap:wrap}
.topbar-left{display:flex;align-items:center;gap:8px;min-width:0}
.topbar .logo{font-family:'PingFang SC',cursive;font-size:18px;color:var(--accent);white-space:nowrap}
.style-tag{font-size:11px;padding:3px 10px;border-radius:20px;background:var(--style-color)18;color:var(--style-color);border:1px solid var(--style-color)44;white-space:nowrap;cursor:pointer;transition:all .2s}
.style-tag:hover{background:var(--style-color)30}
.topbar-right{display:flex;align-items:center;gap:6px}
.topbar-btn{font-size:11px;padding:5px 10px;border-radius:20px;background:var(--bg3);color:var(--text2);border:1px solid var(--border);cursor:pointer;white-space:nowrap;transition:all .2s;display:flex;align-items:center;gap:4px}
.topbar-btn:hover{border-color:var(--style-color);color:var(--text)}
.topbar-btn:active{background:var(--style-color)22}
.menu-item{padding:8px 16px;cursor:pointer;font-size:13px;color:var(--text);transition:background 0.2s}
.menu-item:hover{background:var(--border)}
.members-badge{font-size:11px;padding:4px 10px;border-radius:20px;background:#4ecdc422;color:#4ecdc4;border:1px solid #4ecdc444;display:flex;align-items:center;gap:4px}
.members-dot{width:6px;height:6px;border-radius:50%;background:#4ecdc4;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.roles-bar{display:flex;gap:6px;padding:8px 16px;overflow-x:auto;background:var(--bg);border-bottom:1px solid var(--border);-webkit-overflow-scrolling:touch}
.roles-bar::-webkit-scrollbar{display:none}
.role-chip{flex-shrink:0;display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;font-size:11px;font-weight:500;background:var(--bg3);border:1px solid var(--border);color:var(--text2);cursor:pointer;transition:all .2s}
.role-chip.active{border-color:var(--style-color);color:var(--text)}
.role-chip .dot{width:7px;height:7px;border-radius:50%}
.role-chip.speaking{animation:pulse-dot 1.5s infinite}
.role-chip:active{transform:scale(0.92)}
.role-chip.at-mentioned{animation:at-flash 0.6s ease}
@keyframes at-flash{0%,100%{box-shadow:none}50%{box-shadow:0 0 0 3px var(--style-color)}}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
.chat-area{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
.chat-area::-webkit-scrollbar{width:3px}
.chat-area::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.msg{display:flex;gap:10px;max-width:92%;animation:msg-in .4s ease-out}
@keyframes msg-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.msg.user{align-self:flex-end;flex-direction:row-reverse}
.msg.system{align-self:center;max-width:80%;text-align:center}
.msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;font-weight:700}
.msg-bubble{padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.7;word-break:break-word}
.msg:not(.user):not(.system) .msg-bubble{background:var(--card);border:1px solid var(--border);border-top-left-radius:4px}
.msg.user .msg-bubble{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-top-right-radius:4px}
.msg.system .msg-bubble{background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:12px;padding:8px 16px;border-radius:20px}
.msg-name{font-size:11px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:4px}
.typing-indicator{display:none;align-items:center;gap:10px;padding:0 16px 8px}
.typing-indicator.show{display:flex}
.typing-dots{display:flex;gap:4px;padding:10px 16px;background:var(--card);border-radius:18px;border:1px solid var(--border);border-top-left-radius:4px}
.typing-dots span{width:6px;height:6px;border-radius:50%;background:var(--text2);animation:typing-bounce 1.4s infinite}
.typing-dots span:nth-child(2){animation-delay:.2s}
.typing-dots span:nth-child(3){animation-delay:.4s}
.typing-status{font-size:12px;color:var(--text2);padding:0 4px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.typing-status.error{color:#ff6b6b}
.typing-status.success{color:#51cf66}
@keyframes typing-bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}
.input-area{padding:12px 16px;padding-bottom:max(12px,env(safe-area-inset-bottom));background:var(--bg2);border-top:1px solid var(--border)}
.input-row{display:flex;gap:10px;align-items:flex-end}
.input-row input{flex:1;padding:12px 16px;border-radius:24px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:15px;font-family:inherit;height:44px;outline:none;transition:border .2s}
.input-row input:focus{border-color:var(--accent)}
.input-row input::placeholder{color:var(--text2)}
.send-btn{width:44px;height:44px;border-radius:50%;background:var(--accent);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.send-btn:active{transform:scale(.9)}
.send-btn:disabled{opacity:.4;cursor:default}
/* File upload */
.upload-btn{width:44px;height:44px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;position:relative;overflow:hidden}
.upload-btn:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.upload-btn input{position:absolute;inset:0;opacity:0;cursor:pointer}
.file-msg{max-width:320px}
.file-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer;transition:all .2s}
.file-card:hover{border-color:var(--accent);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.file-card-icon{font-size:28px;margin-bottom:6px}
.file-card-name{font-size:13px;font-weight:600;color:var(--text);word-break:break-all;margin-bottom:4px}
.file-card-size{font-size:11px;color:var(--text2)}
.file-card-actions{display:flex;gap:8px;margin-top:8px}
.file-card-actions button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);font-size:12px;cursor:pointer;transition:all .15s}
.file-card-actions button:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.file-card-actions button:disabled{opacity:.4;cursor:default}
.file-img-preview{max-width:100%;max-height:240px;border-radius:8px;margin-bottom:6px;object-fit:contain}
.file-analyzing{display:inline-flex;align-items:center;gap:6px;color:var(--accent);font-size:12px;margin-top:6px}
.file-analyzing::before{content:'';width:12px;height:12px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Feedback buttons */
.msg-feedback{display:flex;gap:4px;margin-top:4px;opacity:0;transition:opacity .2s}
.msg:hover .msg-feedback,.msg-bubble:hover+.msg-feedback{opacity:1}
.msg-feedback button{width:28px;height:22px;border:none;border-radius:4px;background:var(--bg3);color:var(--text2);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;padding:0}
.msg-feedback button:hover{background:var(--accent);color:#fff;transform:scale(1.1)}
.msg-feedback button.active{background:var(--accent);color:#fff}
.msg-feedback .feedback-count{font-size:10px;color:var(--text2);margin-left:1px}
/* Evolution panel */
.evo-toggle{position:fixed;bottom:80px;right:16px;width:40px;height:40px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:100;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.evo-toggle:hover{background:var(--accent);color:#fff;transform:scale(1.1)}
.evo-toggle .evo-badge{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#f87171;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center}
.evo-panel{position:fixed;bottom:130px;right:16px;width:340px;max-height:480px;background:var(--bg2);border:1px solid var(--border);border-radius:16px;z-index:100;box-shadow:0 8px 32px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden}
.evo-panel.open{display:flex}
.evo-header{padding:12px 16px;border-bottom:1px solid var(--border);font-weight:700;font-size:14px;color:var(--text);display:flex;justify-content:space-between;align-items:center}
.evo-header button{background:none;border:none;color:var(--text2);cursor:pointer;font-size:16px}
.evo-body{overflow-y:auto;padding:12px;flex:1}
.evo-role{margin-bottom:12px;padding:10px;background:var(--bg3);border-radius:10px}
.evo-role-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.evo-role-name{font-weight:600;font-size:13px;color:var(--text)}
.evo-role-score{font-size:12px;color:var(--accent);font-weight:700}
.evo-role-ver{font-size:10px;color:var(--text2)}
.evo-bar{height:4px;background:var(--bg);border-radius:2px;overflow:hidden;margin-bottom:4px}
.evo-bar-fill{height:100%;border-radius:2px;transition:width .3s}
.evo-log{margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
.evo-log-title{font-size:12px;font-weight:600;color:var(--text2);margin-bottom:8px}
.evo-log-item{font-size:11px;color:var(--text2);padding:4px 0;border-bottom:1px solid var(--border);display:flex;gap:6px;align-items:flex-start}
.evo-log-item:last-child{border-bottom:none}
.evo-log-type{flex-shrink:0;font-size:10px;padding:1px 6px;border-radius:4px;font-weight:600}
.evo-log-type.evolve{background:#34d39933;color:#34d399}
.evo-log-type.improve{background:#22d3ee33;color:#22d3ee}
.evo-log-type.revert{background:#f8717133;color:#f87171}
/* Style switcher dropdown */
.style-dropdown{position:absolute;top:100%;right:0;margin-top:4px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:6px;z-index:60;min-width:160px;box-shadow:0 8px 32px rgba(0,0,0,.4);display:none}
.style-dropdown.show{display:block}
.style-option{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--text2);transition:all .15s}
.style-option:hover{background:var(--bg3);color:var(--text)}
.style-option.active{color:var(--style-color);background:var(--style-color)15}
.style-option .so-emoji{font-size:18px}
.style-option .so-info{flex:1}
.style-option .so-name{font-weight:600;font-size:13px}
.style-option .so-desc{font-size:10px;color:var(--text2);margin-top:1px}
/* Requirement panel */
.req-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:none;align-items:flex-end;justify-content:center;padding:0}
.req-overlay.show{display:flex}
.req-panel{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius) var(--radius) 0 0;max-width:500px;width:100%;max-height:70vh;display:flex;flex-direction:column;animation:slide-up .3s ease-out}
@keyframes slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
.req-panel-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.req-panel-header h3{font-size:16px;font-weight:700}
.req-panel-close{background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:4px 8px}
.req-panel-body{flex:1;overflow-y:auto;padding:16px 20px}
.req-panel-body::-webkit-scrollbar{width:3px}
.req-panel-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.req-category{margin-bottom:16px}
.req-category-title{font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}
.req-item{padding:8px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;margin-bottom:4px;font-size:13px;line-height:1.5}
.req-empty{text-align:center;color:var(--text2);font-size:13px;padding:40px 20px}
.req-doc-area{margin-top:16px;padding:16px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;font-size:13px;line-height:1.8;white-space:pre-wrap;display:none}
.req-doc-area.show{display:block}
.req-generating{text-align:center;padding:20px;color:var(--text2)}
.req-generating .spinner{display:inline-block;width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:8px}
@keyframes spin{to{transform:rotate(360deg)}}
/* Guest panel */
.guest-toggle{position:fixed;right:12px;bottom:130px;width:40px;height:40px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:40;transition:all .2s;box-shadow:0 2px 12px rgba(0,0,0,.3)}
.guest-toggle:hover{border-color:var(--style-color);color:var(--text)}
.guest-panel{position:fixed;right:12px;bottom:130px;width:280px;max-height:400px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);z-index:40;display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:msg-in .2s ease-out}
.guest-panel.show{display:flex}
.guest-panel-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border)}
.guest-panel-header h4{font-size:14px;font-weight:600}
.guest-panel-close{background:none;border:none;color:var(--text2);font-size:16px;cursor:pointer}
.guest-panel-body{flex:1;overflow-y:auto;padding:8px}
.guest-panel-body::-webkit-scrollbar{width:3px}
.guest-panel-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.guest-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;transition:all .2s;font-size:12px;margin-bottom:4px}
.guest-item:hover{border-color:var(--style-color)}
.guest-item.in-room{border-color:var(--style-color);background:var(--style-color)10}
.guest-item .gi-emoji{font-size:16px;width:24px;text-align:center}
.guest-item .gi-info{flex:1}
.guest-item .gi-name{font-weight:600;color:var(--text);font-size:12px}
.guest-item .gi-title{color:var(--text2);font-size:10px}
.guest-item .gi-check{color:var(--style-color);font-size:14px;font-weight:700}
/* Join overlay */
.join-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
.join-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:36px 28px 28px;max-width:380px;width:100%;text-align:center}
.join-emoji{font-size:48px;margin-bottom:12px;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.join-card h2{font-size:22px;margin-bottom:8px;font-family:'PingFang SC',cursive;color:var(--text)}
.join-subtitle{font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.6}
.join-card input{width:100%;padding:14px 18px;border-radius:14px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:15px;font-family:inherit;outline:none;margin-bottom:16px;transition:border .2s}
.join-card input:focus{border-color:var(--accent)}
.join-card input::placeholder{color:var(--text2);font-size:14px}
.join-divider{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:11px;color:var(--text2)}
.join-divider::before,.join-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.join-card button{width:100%;padding:14px;border-radius:14px;background:var(--accent);border:none;color:#fff;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
.join-card button:active{background:var(--accent2);transform:scale(.98)}
.join-hint{font-size:11px;color:var(--text2);margin-top:12px;opacity:.7}
/* Flow progress bar */
.flow-progress{display:flex;align-items:center;gap:3px;margin-left:8px}
.flow-progress-bar{height:3px;border-radius:2px;background:var(--border);width:60px;overflow:hidden;position:relative}
.flow-progress-bar::after{content:'';position:absolute;left:0;top:0;height:100%;background:var(--accent);border-radius:2px;transition:width .5s ease;width:var(--progress,0%)}
.flow-progress-dots{display:flex;gap:2px}
.flow-dot{width:5px;height:5px;border-radius:50%;background:var(--border);transition:all .3s}
.flow-dot.active{background:var(--accent);transform:scale(1.2)}
.flow-dot.done{background:var(--accent);opacity:.5}
/* Invite overlay */
.invite-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
.invite-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:32px 24px;max-width:400px;width:100%;text-align:center}
.invite-card h2{font-size:20px;margin-bottom:8px}
.invite-card p{font-size:13px;color:var(--text2);margin-bottom:16px}
.invite-link{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-size:13px;word-break:break-all;color:var(--accent);margin-bottom:16px;cursor:pointer;position:relative}
.invite-link:active{background:var(--border)}
.invite-card .copy-hint{font-size:11px;color:var(--text2);margin-bottom:16px}
.invite-card button{width:100%;padding:12px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-size:14px;cursor:pointer;font-family:inherit}
.invite-card button:active{background:var(--border)}
/* Role select panel in join dialog */
.role-select-panel{max-height:200px;overflow-y:auto;margin:10px 0;padding:8px;background:var(--bg3);border-radius:12px;border:1px solid var(--border)}
.role-select-panel::-webkit-scrollbar{width:3px}
.role-select-panel::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.role-select-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.role-select-item{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;transition:all .2s;font-size:11px}
.role-select-item.selected{border-color:var(--accent);background:var(--accent)15}
.role-select-item.locked{opacity:.6;cursor:default}
.role-select-item .rs-emoji{font-size:14px;width:22px;text-align:center}
.role-select-item .rs-info{flex:1}
.role-select-item .rs-name{font-weight:600;color:var(--text);font-size:11px}
.role-select-item .rs-title{color:var(--text2);font-size:9px}
.role-select-item .rs-check{color:var(--accent);font-size:13px;font-weight:700}
.role-select-hint{font-size:11px;color:var(--text2);margin-top:6px;text-align:center}
</style>
</head>
<body>
<div class="bg-glow g1"></div>
<div class="bg-glow g2"></div>
<div id="app">
  <div class="topbar">
    <div class="topbar-left">
      <div class="logo">茶话会</div>
      <div class="style-tag" id="style-tag" onclick="toggleStyleDropdown()">🍵 茶馆模式</div>
      <span id="progress-info" style="font-size:11px;color:var(--text2);margin-left:8px">准备中</span>
      <div class="flow-progress" id="flow-progress" style="display:none">
        <div class="flow-progress-bar" id="flow-progress-bar"></div>
        <div class="flow-progress-dots" id="flow-progress-dots"></div>
      </div>
      <div class="style-dropdown" id="style-dropdown"></div>
    </div>
    <div class="topbar-right">
      <button class="topbar-btn" onclick="showRequirementPanel()">📋 需求整理</button>
      <button class="topbar-btn" onclick="exportDoc()">📄 导出文档</button>
      <div style="position:relative;display:inline-block">
        <button class="topbar-btn" onclick="toggleMoreMenu()">⋯</button>
        <div id="more-menu" style="display:none;position:absolute;right:0;top:100%;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:4px 0;min-width:120px;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,0.3)">
          <div class="menu-item" onclick="showRenameDialog();toggleMoreMenu()">✏️ 改名</div>
          <div class="menu-item" onclick="showInvite();toggleMoreMenu()">🔗 邀请</div>
          <div class="menu-item" onclick="showStyleSwitch();toggleMoreMenu()">🎭 风格</div>
        </div>
      </div>
      <div class="members-badge" id="members-badge"><span class="members-dot"></span><span id="members-count">1人</span></div>
    </div>
  </div>
  <div class="roles-bar" id="roles-bar"></div>
  <div class="chat-area" id="chat-area"></div>
  <div class="typing-indicator" id="typing-indicator">
    <div class="typing-dots"><span></span><span></span><span></span></div>
    <div class="typing-status" id="typing-status"></div>
  </div>
  <div class="input-area">
    <div class="input-row">
      <div class="upload-btn" title="上传文件">📎<input type="file" id="file-input" accept="image/*,.txt,.md,.csv,.json,.js,.py,.html,.css,.xml,.yaml,.yml,.log,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar" onchange="handleFileUpload(event)"></div>
      <input id="user-input" placeholder="想到什么就说什么..." onkeydown="handleKey(event)" autocomplete="off">
      <button class="send-btn" id="send-btn" onclick="sendMessage()">➤</button>
    </div>
  </div>
</div>
<!-- Guest toggle button -->
<button class="guest-toggle" id="guest-toggle" onclick="toggleGuestPanel()">👥</button>
<!-- Guest panel -->
<div class="guest-panel" id="guest-panel">
  <div class="guest-panel-header">
    <h4>邀请嘉宾</h4>
    <button class="guest-panel-close" onclick="toggleGuestPanel()">✕</button>
  </div>
  <div class="guest-panel-body" id="guest-panel-body"></div>
</div>
<!-- Requirement panel -->
<div class="req-overlay" id="req-overlay" onclick="closeReqPanel(event)">
  <div class="req-panel" onclick="event.stopPropagation()">
    <div class="req-panel-header">
      <h3>📋 需求整理</h3>
      <button class="req-panel-close" onclick="closeReqPanel()">✕</button>
    </div>
    <div class="req-panel-body" id="req-panel-body"></div>
  </div>
</div>
<!-- Join overlay -->
<div id="join-overlay" class="join-overlay" style="display:none">
  <div class="join-card">
    <div class="join-emoji">💡</div>
    <h2 id="join-title">有个想法？聊两句</h2>
    <p class="join-subtitle">不用想好再说，想到什么聊什么<br>AI 伙伴会帮你把零散的想法变成清晰的方案</p>
    <input id="join-name" placeholder="随便起个名字就行" maxlength="10" onkeydown="if(event.key==='Enter')doJoin()">
    <div class="join-divider"><span>选几个聊伴（也可以不选）</span></div>
    <div class="role-select-panel" id="role-select-panel">
      <div class="role-select-grid" id="role-select-grid"></div>
    </div>
    <div class="role-select-hint" id="role-select-hint">已选 4 个角色</div>
    <button id="join-btn" onclick="doJoin()">开始聊 💬</button>
    <p class="join-hint">随时可以改名、随时可以离开</p>
  </div>
</div>
<!-- Invite overlay -->
<div id="invite-overlay" class="invite-overlay" style="display:none">
  <div class="invite-card">
    <h2>🔗 邀请好友</h2>
    <p>把链接发给朋友，一起聊天</p>
    <div class="invite-link" id="invite-link" onclick="copyLink()"></div>
    <div class="copy-hint">点击链接复制</div>
    <button onclick="closeInvite()">关闭</button>
  </div>
</div>
<script>
var ROOM_ID = '${roomId}';
var ROLES = ${JSON.stringify(ROLES)};
var MY_COLOR = '#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
var myName = '';
var lastMsgId = 0;
var msgCounter = 0;
var pollTimer = null;
var pollInterval = 2000;
var emptyPollCount = 0;
var activeRoles = ['li'];
var isProcessing = false;
var MIN_ROLES = 2;
var MAX_ROLES = 8;
var DEFAULT_ROLE_COUNT = 4;
var messageHistory = [];

// 带超时的 fetch，防止请求永远挂起
function fetchTimeout(url, options, timeout) {
  timeout = timeout || 10000;
  return Promise.race([
    fetch(url, options),
    new Promise(function(_, reject) { setTimeout(function() { reject(new Error('请求超时')); }, timeout); })
  ]);
}
var displayedMsgIds = {};

// ═══════════════════════════════════════════════════════════
// 1. USER PROFILE ENGINE
// ═══════════════════════════════════════════════════════════
var userProfile = {
  interests: [],
  expertise: [],
  mood: 'neutral',
  talkStyle: 'casual',
  mentionedTopics: {},
  turnCount: 0,
  lastActiveTime: 0,
  collectedData: [],
  sessionStart: Date.now()
};

// ═══════════════════════════════════════════════════════════
// 1.5 FLOW STATE MACHINE — 流程状态机
// ═══════════════════════════════════════════════════════════
// 两种模式：formal（正式孵化流程）/ idle（闲聊模式）
// 正式流程 7 阶段：explore → verify → design → tech → business → risk → summary
// 伪需求判定 → 切换 idle；新创意触发 → 重新进入 formal

var flowEngine = {
  mode: 'formal',           // 'formal' | 'idle'
  phase: 'explore',         // 当前阶段
  phaseIndex: 0,            // 阶段索引
  phaseScores: {},          // 每阶段得分（用于判定是否可推进）
  phaseTurns: {},           // 每阶段已聊轮数
  verified: false,          // 需求是否已通过验证
  fakeReason: '',           // 伪需求判定原因
  completed: false,         // 流程是否已完成
  totalScore: 0,            // 综合可行性得分

  // 阶段顺序
  phases: ['explore', 'verify', 'design', 'tech', 'business', 'risk', 'summary'],

  // 每阶段所需最少轮数（聊够了才能推进）
  minTurns: { explore: 2, verify: 2, design: 2, tech: 1, business: 1, risk: 1, summary: 1 },

  // 重置
  reset: function() {
    this.mode = 'formal';
    this.phase = 'explore';
    this.phaseIndex = 0;
    this.phaseScores = {};
    this.phaseTurns = {};
    this.verified = false;
    this.fakeReason = '';
    this.completed = false;
    this.totalScore = 0;
  },

  // 进入闲聊模式（伪需求判定后）
  enterIdle: function(reason) {
    this.mode = 'idle';
    this.fakeReason = reason;
    console.log('[FlowEngine] 进入闲聊模式:', reason);
  },

  // 重新进入正式流程（新创意触发）
  enterFormal: function() {
    this.reset();
    console.log('[FlowEngine] 重新进入正式流程');
  },

  // 记录当前阶段轮数
  recordTurn: function() {
    var p = this.phase;
    this.phaseTurns[p] = (this.phaseTurns[p] || 0) + 1;
  },

  // 判断当前阶段是否聊够了
  isPhaseReady: function() {
    var p = this.phase;
    return (this.phaseTurns[p] || 0) >= this.minTurns[p];
  },

  // 推进到下一阶段
  advancePhase: function() {
    if (this.phaseIndex < this.phases.length - 1) {
      this.phaseIndex++;
      this.phase = this.phases[this.phaseIndex];
      console.log('[FlowEngine] 推进到阶段:', this.phase);
      return true;
    }
    this.completed = true;
    console.log('[FlowEngine] 流程完成');
    return false;
  },

  // 获取当前阶段信息
  getCurrentPhaseInfo: function() {
    var fp = FLOW_PHASES.find(function(p) { return p.id === this.phase; }.bind(this));
    return fp || FLOW_PHASES[0];
  },

  // 获取下一阶段信息
  getNextPhaseInfo: function() {
    if (this.phaseIndex < this.phases.length - 1) {
      var nextId = this.phases[this.phaseIndex + 1];
      return FLOW_PHASES.find(function(p) { return p.id === nextId; });
    }
    return null;
  }
};

// 新创意检测关键词（触发重新进入正式流程）
var NEW_IDEA_KEYWORDS = [
  '新想法', '突然想到', '换个方向', '不如做', '或者可以', '还有一个',
  '对了', '想到一个', '灵感', '脑洞', '如果做', '要不', '换个思路',
  '重新来', '新项目', '新创意', '新点子', '换个赛道', '转型'
];

// 伪需求信号关键词
var FAKE_DEMAND_SIGNALS = [
  '不急', '再说吧', '随便聊聊', '没想好', '不确定', '看看再说',
  '只是想想', '随便说说', '无聊', '打发时间', '试试看', '了解一下'
];

// ═══════════════════════════════════════════════════════════
// 1.6 GENE EVOLUTION ENGINE — 基因自适应进化系统
// ═══════════════════════════════════════════════════════════
// 核心思路：每个基因维度有权重，根据用户反馈动态调整
// 用户积极回应 → 该角色基因权重提升（强化）
// 用户消极/无视 → 该角色基因权重下降（淘汰）
// 进化速度快：每次交互后立即微调，不是等N轮才变
// 过渡自然：权重变化是渐进的（±0.05~0.15），不会突变

var geneEvolution = {
  // 基因权重表：记录每个基因值被"认可"的次数
  // 格式：{ 'personality:direct': 3, 'speakStyle:casual': 5, ... }
  geneScores: {},

  // 角色表现记录：每个角色ID的累计得分
  roleScores: {},

  // 上次交互的用户情绪（用于判断反馈）
  lastUserMood: 'neutral',

  // 记录一次角色发言后的反馈
  // feedback: 'positive' | 'negative' | 'neutral' | 'ignore'
  recordFeedback: function(roleId, feedback) {
    if (!ROLES[roleId]) return;

    // 初始化角色得分
    if (!this.roleScores[roleId]) this.roleScores[roleId] = { positive: 0, negative: 0, total: 0 };
    this.roleScores[roleId].total++;
    if (feedback === 'positive') this.roleScores[roleId].positive++;
    if (feedback === 'negative') this.roleScores[roleId].negative++;

    // 根据反馈调整该角色的基因权重
    var role = ROLES[roleId];
    var genes = ['personality', 'speakStyle', 'catchphrase', 'knowledge', 'emotionTendency', 'socialStyle', 'speakRhythm'];
    var delta = feedback === 'positive' ? 0.1 : (feedback === 'negative' ? -0.15 : 0.02);

    for (var i = 0; i < genes.length; i++) {
      var geneKey = genes[i] + ':' + (role[genes[i]] || 'unknown');
      if (!this.geneScores[geneKey]) this.geneScores[geneKey] = 0;
      this.geneScores[geneKey] += delta;
      // 权重下限 -2，上限 +5
      this.geneScores[geneKey] = Math.max(-2, Math.min(5, this.geneScores[geneKey]));
    }
  },

  // 获取某个基因值的权重分数
  getGeneScore: function(geneName, geneValue) {
    var key = geneName + ':' + (geneValue || 'unknown');
    return this.geneScores[key] || 0;
  },

  // 加权随机选择：权重越高越容易被选中
  weightedRandom: function(options, scoreFn) {
    var weights = [];
    var totalWeight = 0;
    for (var i = 0; i < options.length; i++) {
      var w = Math.max(0.1, 1 + scoreFn(options[i])); // 最低0.1，避免完全排除
      weights.push(w);
      totalWeight += w;
    }
    var rand = Math.random() * totalWeight;
    var cumulative = 0;
    for (var j = 0; j < options.length; j++) {
      cumulative += weights[j];
      if (rand <= cumulative) return options[j];
    }
    return options[options.length - 1];
  },

  // 判断用户对上一轮AI回复的反馈态度
  detectFeedback: function(userText) {
    // 积极信号
    var positiveSignals = ['对', '没错', '说得好', '有道理', '确实', '我也是这么想的', '同意', '可以', '好', '嗯嗯', '哈哈', '棒', '厉害', '就是这个', '说到点子上了', '继续', '然后呢', '还有呢', '展开说说', '怎么做到的', '学到了'];
    // 消极信号
    var negativeSignals = ['不是', '不对', '没意思', '跑题了', '说重点', '别废话', '不对吧', '你不懂', '算了', '不想聊这个', '换个话题', '无聊', '说点有用的'];
    // 无视信号（用户完全没回应AI，直接说新东西）
    var shortText = userText.length < 6;
    var topicShift = this.lastUserMood !== 'neutral' && userProfile.mood === 'neutral';

    var posCount = 0, negCount = 0;
    for (var i = 0; i < positiveSignals.length; i++) { if (userText.indexOf(positiveSignals[i]) >= 0) posCount++; }
    for (var j = 0; j < negativeSignals.length; j++) { if (userText.indexOf(negativeSignals[j]) >= 0) negCount++; }

    if (posCount > negCount && posCount >= 1) return 'positive';
    if (negCount > posCount && negCount >= 1) return 'negative';
    if (shortText && topicShift) return 'ignore';
    return 'neutral';
  },

  // 对上一轮所有发言的角色记录反馈
  applyFeedbackToRecentSpeakers: function(userText, recentSpeakerIds) {
    var feedback = this.detectFeedback(userText);
    for (var i = 0; i < recentSpeakerIds.length; i++) {
      this.recordFeedback(recentSpeakerIds[i], feedback);
    }
    this.lastUserMood = userProfile.mood;
    return feedback;
  },

  // 获取角色表现排名（用于淘汰表现差的角色）
  getRoleRanking: function() {
    var ranked = [];
    for (var id in this.roleScores) {
      var s = this.roleScores[id];
      if (s.total >= 2) { // 至少发言2次才参与排名
        ranked.push({ id: id, score: s.positive / s.total, total: s.total });
      }
    }
    ranked.sort(function(a, b) { return b.score - a.score; });
    return ranked;
  },

  // 淘汰表现最差的角色，用进化后的新角色替代
  evolve: function() {
    var ranking = this.getRoleRanking();
    if (ranking.length < 3) return false; // 至少3个角色才有淘汰意义

    // 找到表现最差的非流程角色
    var worst = null;
    for (var i = ranking.length - 1; i >= 0; i--) {
      var r = ranking[i];
      if (ROLES[r.id] && ROLES[r.id].category !== 'flow' && activeRoles.indexOf(r.id) >= 0) {
        if (r.score < 0.2 && r.total >= 3) { // 正面反馈率低于20%且发言3次以上
          worst = r;
          break;
        }
      }
    }

    if (!worst) return false;

    // 淘汰旧角色
    var oldIdx = activeRoles.indexOf(worst.id);
    if (oldIdx >= 0) activeRoles.splice(oldIdx, 1);

    // 用进化后的基因生成新角色
    var category = ROLES[worst.id].category || 'mood';
    var newId = this.generateEvolvedRole(category);

    if (newId) {
      activeRoles.push(newId);
      renderRolesBar();
      console.log('[GeneEvolution] 淘汰 ' + ROLES[worst.id].name + '（得分' + worst.score.toFixed(2) + '），进化出 ' + ROLES[newId].name);
      return true;
    }
    return false;
  },

  // 用加权基因生成"进化后"的角色（偏好高权重基因）
  generateEvolvedRole: function(category) {
    generatedRoleCount++;

    var archetype;
    if (category === 'villain') {
      archetype = VILLAIN_ARCHETYPES[Math.floor(Math.random() * VILLAIN_ARCHETYPES.length)];
    } else {
      archetype = MOOD_ARCHETYPES[Math.floor(Math.random() * MOOD_ARCHETYPES.length)];
    }

    // 加权选择基因（高权重的更可能被选中）
    var personalityKeys = Object.keys(PERSONALITIES);
    var speakStyleKeys = Object.keys(SPEAK_STYLES);
    var knowledgeKeys = Object.keys(KNOWLEDGE);
    var emotionKeys = Object.keys(EMOTION_TENDENCY);
    var socialKeys = Object.keys(SOCIAL_STYLE);
    var rhythmKeys = Object.keys(SPEAK_RHYTHM);

    var personality = this.weightedRandom(personalityKeys, function(k) { return geneEvolution.getGeneScore('personality', k); });
    var speakStyle = this.weightedRandom(speakStyleKeys, function(k) { return geneEvolution.getGeneScore('speakStyle', k); });
    var knowledge = this.weightedRandom(knowledgeKeys, function(k) { return geneEvolution.getGeneScore('knowledge', k); });
    var emotion = this.weightedRandom(emotionKeys, function(k) { return geneEvolution.getGeneScore('emotionTendency', k); });
    var social = this.weightedRandom(socialKeys, function(k) { return geneEvolution.getGeneScore('socialStyle', k); });
    var rhythm = this.weightedRandom(rhythmKeys, function(k) { return geneEvolution.getGeneScore('speakRhythm', k); });

    var names = NAME_POOL[category] || NAME_POOL.mood;
    var emojis = ['👤','🎭','🎪','🎨','🎲','🎯','💡','🔥','⚡','🌟'];
    var colors = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#818cf8','#c084fc','#f472b6','#fb7185'];
    var backstories = BACKSTORIES[category] || BACKSTORIES.mood;

    var id = 'evo_' + category + '_' + generatedRoleCount;
    var titles = { mood: archetype.label, villain: archetype.label + '反派' };

    ROLES[id] = {
      name: names[Math.floor(Math.random() * names.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      title: titles[category] || '嘉宾',
      category: category || 'mood',
      personality: personality,
      catchphrase: archetype.catchphrase,
      speakStyle: speakStyle,
      knowledge: knowledge,
      emotionTendency: emotion,
      socialStyle: social,
      speakRhythm: rhythm,
      backstory: backstories[Math.floor(Math.random() * backstories.length)],
      archetype: archetype.type,
      archetypeDesc: archetype.desc,
      evolved: true // 标记为进化角色
    };

    return id;
  }
};

// ═══════════════════════════════════════════════════════════
// 🧬 DARWIN-GENE 融合进化系统 v2
// 受 Darwin-Skill + Karpathy autoresearch 启发
// 核心原则：评估 → 定向改进 → 棘轮决策 → 只保留进步
// ═══════════════════════════════════════════════════════════

var darwin = {
  // ─── 角色评分存储 ───
  // { roleId: { scores: {quality:12,...}, total:68, version:'1.0.0', baseline:68, history:[] } }
  roleProfiles: {},

  // ─── 进化日志 ───
  evolutionLog: [],

  // ─── 8维评分体系（满分100）───
  DIMENSIONS: {
    quality:      { label: '创意质量',   max: 15, desc: '建议是否有新意、有深度，不是套话' },
    consistency:  { label: '角色一致性', max: 10, desc: '发言是否符合人设（性格/知识面/口头禅）' },
    thoroughness: { label: '思考全面性', max: 10, desc: '是否从多角度分析，考虑利弊' },
    actionability:{ label: '可执行性',   max: 10, desc: '建议是否具体可落地，不是空谈' },
    engagement:   { label: '互动引导',   max: 10, desc: '是否引发用户继续讨论（回复/追问）' },
    clarity:      { label: '表达清晰度', max: 10, desc: '条理是否清晰，易于理解' },
    rhythm:       { label: '说话节奏',   max: 5,  desc: '字数是否在基因规定的范围内' },
    teamwork:     { label: '团队协作',   max: 5,  desc: '是否回应他人观点、推动讨论前进' }
  },

  // ─── 1. 评分函数 ───
  // 基于角色历史发言 + 用户反馈，计算8维得分
  evaluateRole: function(roleId) {
    var role = ROLES[roleId];
    if (!role) return null;

    var scores = geneEvolution.roleScores[roleId];
    if (!scores || scores.total < 3) return null; // 至少3次发言才评分

    var profile = this.getOrCreateProfile(roleId);
    var dimScores = {};
    var total = 0;

    // ── 结构维度（基于数据直接计算）──

    // 互动引导（10分）：基于正面反馈率
    var engageRate = scores.positive / scores.total;
    dimScores.engagement = Math.round(engageRate * 10);
    total += dimScores.engagement;

    // 说话节奏（5分）：检查最近发言字数是否符合基因范围
    var rhythmScore = 5;
    var rhythm = SPEAK_RHYTHM[role.speakRhythm] || SPEAK_RHYTHM.medium;
    var recentMsgs = this.getRoleRecentMessages(roleId, 5);
    if (recentMsgs.length > 0) {
      var inRange = 0;
      for (var i = 0; i < recentMsgs.length; i++) {
        var len = recentMsgs[i].text ? recentMsgs[i].text.length : 0;
        if (len >= rhythm.minLen * 0.7 && len <= rhythm.maxLen * 1.3) inRange++;
      }
      rhythmScore = Math.round((inRange / recentMsgs.length) * 5);
    }
    dimScores.rhythm = rhythmScore;
    total += rhythmScore;

    // ── AI评分维度（需要异步调用，这里先用反馈数据估算）──
    // 创意质量（15分）：正面反馈越多，创意越高
    dimScores.quality = Math.min(15, Math.round(engageRate * 15));
    total += dimScores.quality;

    // 角色一致性（10分）：基于该角色的反馈稳定性
    var consistencyRate = Math.max(0, (engageRate - 0.3) / 0.7);
    dimScores.consistency = Math.round(consistencyRate * 10);
    total += dimScores.consistency;

    // 思考全面性（10分）：基于发言长度变化（太短=浅，太长=全面）
    var avgLen = recentMsgs.reduce(function(s, m) { return s + (m.text ? m.text.length : 0); }, 0) / Math.max(1, recentMsgs.length);
    var idealLen = (rhythm.minLen + rhythm.maxLen) / 2;
    var lenRatio = Math.min(1, avgLen / idealLen);
    dimScores.thoroughness = Math.round(lenRatio * 10);
    total += dimScores.thoroughness;

    // 可执行性（10分）：基于用户追问率（用户追问=建议有价值）
    dimScores.actionability = Math.min(10, Math.round(engageRate * 12));
    total += dimScores.actionability;

    // 表达清晰度（10分）：基于正面反馈
    dimScores.clarity = Math.min(10, Math.round(engageRate * 11));
    total += dimScores.clarity;

    // 团队协作（5分）：基于该角色是否经常被@或引发讨论
    dimScores.teamwork = Math.min(5, Math.round(engageRate * 6));
    total += dimScores.teamwork;

    return { scores: dimScores, total: total };
  },

  // ─── 2. 棘轮决策 ───
  // 新分 > 基线 → 保留，更新基线
  // 新分 <= 基线 → 回滚，基线不变
  ratchet: function(roleId, newScores) {
    var profile = this.getOrCreateProfile(roleId);
    var oldBaseline = profile.baseline || 0;

    if (newScores.total > oldBaseline) {
      // ✅ 改进成功，更新基线
      profile.baseline = newScores.total;
      profile.scores = newScores.scores;
      profile.version = this.bumpVersion(profile.version);
      return { result: 'keep', oldScore: oldBaseline, newScore: newScores.total };
    } else {
      // ❌ 退步，回滚
      return { result: 'revert', oldScore: oldBaseline, newScore: newScores.total };
    }
  },

  // ─── 3. 找最弱维度 ───
  findWeakestDimension: function(roleId) {
    var profile = this.getOrCreateProfile(roleId);
    if (!profile.scores) return null;

    var weakest = null;
    var weakestScore = Infinity;
    var weakestRatio = Infinity;

    for (var dim in this.DIMENSIONS) {
      var d = this.DIMENSIONS[dim];
      var score = profile.scores[dim] || 0;
      var ratio = score / d.max; // 得分率

      if (ratio < weakestRatio) {
        weakestRatio = ratio;
        weakestScore = score;
        weakest = dim;
      }
    }

    return weakest ? {
      dimension: weakest,
      label: this.DIMENSIONS[weakest].label,
      score: weakestScore,
      max: this.DIMENSIONS[weakest].max,
      ratio: weakestRatio
    } : null;
  },

  // ─── 4. 定向基因改进 ───
  // 针对最弱维度，生成改进方案并应用
  improveWeakestGene: async function(roleId) {
    var role = ROLES[roleId];
    if (!role || role.category === 'flow') return null; // 不改进流程角色

    var weakest = this.findWeakestDimension(roleId);
    if (!weakest) return null;

    // 维度 → 基因映射
    var dimToGene = {
      quality: 'personality',
      consistency: 'speakStyle',
      thoroughness: 'knowledge',
      actionability: 'knowledge',
      engagement: 'socialStyle',
      clarity: 'speakStyle',
      rhythm: 'speakRhythm',
      teamwork: 'socialStyle'
    };

    var targetGene = dimToGene[weakest.dimension] || 'personality';
    var currentGeneValue = role[targetGene];
    var geneLib = {
      personality: PERSONALITIES,
      speakStyle: SPEAK_STYLES,
      knowledge: KNOWLEDGE,
      emotionTendency: EMOTION_TENDENCY,
      socialStyle: SOCIAL_STYLE,
      speakRhythm: SPEAK_RHYTHM
    };
    var lib = geneLib[targetGene];
    if (!lib) return null;

    // 保存旧值用于回滚
    var oldGeneValue = currentGeneValue;
    var oldGeneDesc = lib[currentGeneValue] ? (lib[currentGeneValue].desc || lib[currentGeneValue].label || '') : '';

    // 生成改进：从基因库中选一个权重更高的替代值
    var keys = Object.keys(lib);
    var bestKey = currentGeneValue;
    var bestScore = geneEvolution.getGeneScore(targetGene, currentGeneValue);

    for (var i = 0; i < keys.length; i++) {
      var s = geneEvolution.getGeneScore(targetGene, keys[i]);
      if (s > bestScore && keys[i] !== currentGeneValue) {
        bestScore = s;
        bestKey = keys[i];
      }
    }

    // 如果没有更好的，随机选一个不同的
    if (bestKey === currentGeneValue) {
      var candidates = keys.filter(function(k) { return k !== currentGeneValue; });
      if (candidates.length > 0) bestKey = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // 应用改进
    role[targetGene] = bestKey;
    var newGeneDesc = lib[bestKey] ? (lib[bestKey].desc || lib[bestKey].label || '') : '';

    // 记录日志
    var change = '优化 ' + weakest.label + '（' + weakest.score + '/' + weakest.max + '）：'
      + targetGene + ' ' + oldGeneValue + ' → ' + bestKey;

    this.logEvolution(roleId, change, 'improve');

    return {
      gene: targetGene,
      oldValue: oldGeneValue,
      newValue: bestKey,
      oldDesc: oldGeneDesc,
      newDesc: newGeneDesc,
      dimension: weakest.dimension
    };
  },

  // ─── 5. 交叉 + 变异 ───
  // 淘汰差角色时，用最优角色的基因 + 随机变异生成新角色
  crossoverMutate: function(worstRoleId) {
    var ranking = geneEvolution.getRoleRanking();
    if (ranking.length === 0) return null;

    // 找最优的非流程角色
    var best = null;
    for (var i = 0; i < ranking.length; i++) {
      var r = ranking[i];
      if (ROLES[r.id] && ROLES[r.id].category !== 'flow' && r.id !== worstRoleId) {
        best = r;
        break;
      }
    }
    if (!best) best = ranking[0];

    var bestRole = ROLES[best.id];
    var worstRole = ROLES[worstRoleId];
    var genes = ['personality', 'speakStyle', 'catchphrase', 'knowledge', 'emotionTendency', 'socialStyle', 'speakRhythm'];

    var newGenes = {};
    for (var j = 0; j < genes.length; j++) {
      var g = genes[j];
      // 70% 概率继承最优角色的基因，30% 概率变异
      if (Math.random() < 0.7) {
        newGenes[g] = bestRole[g]; // 继承
      } else {
        // 变异：从基因库中加权随机选
        var geneLib = {
          personality: PERSONALITIES, speakStyle: SPEAK_STYLES,
          catchphrase: CATCHPHRASES, knowledge: KNOWLEDGE,
          emotionTendency: EMOTION_TENDENCY, socialStyle: SOCIAL_STYLE,
          speakRhythm: SPEAK_RHYTHM
        };
        var lib = geneLib[g];
        if (lib) {
          var keys = Object.keys(lib);
          newGenes[g] = geneEvolution.weightedRandom(keys, function(k) {
            return geneEvolution.getGeneScore(g, k);
          });
        } else {
          newGenes[g] = worstRole[g]; // 保持原值
        }
      }
    }

    return newGenes;
  },

  // ─── 6. 完整进化流程 ───
  runEvolution: async function() {
    var evolved = false;

    // Step 1: 评估所有非流程角色
    var evaluations = [];
    for (var id in ROLES) {
      if (ROLES[id].category === 'flow') continue;
      var result = this.evaluateRole(id);
      if (result) {
        var ratchet = this.ratchet(id, result);
        evaluations.push({
          roleId: id,
          name: ROLES[id].name,
          score: result.total,
          ratchet: ratchet
        });
      }
    }

    if (evaluations.length < 3) return false;

    // Step 2: 淘汰最差角色
    evaluations.sort(function(a, b) { return a.score - b.score; });
    var worst = evaluations[0];
    var worstRole = ROLES[worst.roleId];

    if (worst.score < 40 && worstRole && worstRole.category !== 'flow') {
      // 执行淘汰
      var oldIdx = activeRoles.indexOf(worst.roleId);
      if (oldIdx >= 0) activeRoles.splice(oldIdx, 1);

      // 交叉+变异生成新角色
      var newGenes = this.crossoverMutate(worst.roleId);
      if (newGenes) {
        var category = worstRole.category || 'mood';
        var archetype;
        if (category === 'villain') {
          archetype = VILLAIN_ARCHETYPES[Math.floor(Math.random() * VILLAIN_ARCHETYPES.length)];
        } else {
          archetype = MOOD_ARCHETYPES[Math.floor(Math.random() * MOOD_ARCHETYPES.length)];
        }

        generatedRoleCount++;
        var names = NAME_POOL[category] || NAME_POOL.mood;
        var emojis = ['👤','🎭','🎪','🎨','🎲','🎯','💡','🔥','⚡','🌟'];
        var colors = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#818cf8','#c084fc','#f472b6','#fb7185'];
        var backstories = BACKSTORIES[category] || BACKSTORIES.mood;

        var newId = 'evo_' + category + '_' + generatedRoleCount;
        ROLES[newId] = {
          name: names[Math.floor(Math.random() * names.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          title: archetype.label,
          category: category,
          personality: newGenes.personality,
          catchphrase: archetype.catchphrase,
          speakStyle: newGenes.speakStyle,
          knowledge: newGenes.knowledge,
          emotionTendency: newGenes.emotionTendency,
          socialStyle: newGenes.socialStyle,
          speakRhythm: newGenes.speakRhythm,
          backstory: backstories[Math.floor(Math.random() * backstories.length)],
          archetype: archetype.type,
          archetypeDesc: archetype.desc,
          evolved: true
        };

        activeRoles.push(newId);

        this.logEvolution(newId, '淘汰 ' + worstRole.name + '（' + worst.score + '分），交叉变异生成新角色', 'evolve');
        evolved = true;
      }
    }

    // Step 3: 对得分中等的角色，定向改进最弱基因
    for (var k = 1; k < evaluations.length - 1; k++) {
      var mid = evaluations[k];
      if (mid.score >= 40 && mid.score < 70 && ROLES[mid.roleId] && ROLES[mid.roleId].category !== 'flow') {
        var improvement = await this.improveWeakestGene(mid.roleId);
        if (improvement) {
          // 重新评分
          var newEval = this.evaluateRole(mid.roleId);
          if (newEval) {
            var r = this.ratchet(mid.roleId, newEval);
            this.logEvolution(mid.roleId,
              improvement.gene + ': ' + improvement.oldValue + '→' + improvement.newValue + ' (' + r.result + ')',
              'improve');
          }
        }
        break; // 每次只改进一个角色
      }
    }

    return evolved;
  },

  // ─── 辅助函数 ───
  getOrCreateProfile: function(roleId) {
    if (!this.roleProfiles[roleId]) {
      this.roleProfiles[roleId] = {
        scores: {},
        total: 0,
        version: '1.0.0',
        baseline: 0,
        history: []
      };
    }
    return this.roleProfiles[roleId];
  },

  bumpVersion: function(v) {
    var parts = v.split('.');
    var patch = parseInt(parts[2] || '0') + 1;
    return parts[0] + '.' + parts[1] + '.' + patch;
  },

  getRoleRecentMessages: function(roleId, limit) {
    var data = getRoomData ? getRoomData(currentRoomId || '') : null;
    if (!data || !data.messages) return [];
    var msgs = [];
    for (var i = data.messages.length - 1; i >= 0 && msgs.length < limit; i--) {
      if (data.messages[i].type === 'ai' && data.messages[i].role === roleId) {
        msgs.push(data.messages[i]);
      }
    }
    return msgs;
  },

  logEvolution: function(roleId, change, type) {
    this.evolutionLog.push({
      timestamp: Date.now(),
      roleId: roleId,
      roleName: ROLES[roleId] ? ROLES[roleId].name : roleId,
      type: type, // 'evolve' | 'improve' | 'revert'
      change: change
    });
    // 只保留最近50条
    if (this.evolutionLog.length > 50) this.evolutionLog = this.evolutionLog.slice(-50);
  },

  // 获取进化摘要（给用户看）
  getSummary: function() {
    var profiles = [];
    for (var id in this.roleProfiles) {
      if (!ROLES[id] || ROLES[id].category === 'flow') continue;
      var p = this.roleProfiles[id];
      profiles.push({
        id: id,
        name: ROLES[id].name,
        emoji: ROLES[id].emoji,
        version: p.version,
        baseline: p.baseline,
        scores: p.scores
      });
    }
    profiles.sort(function(a, b) { return (b.baseline || 0) - (a.baseline || 0); });
    return {
      profiles: profiles,
      recentLogs: this.evolutionLog.slice(-10).reverse(),
      geneTop: this.getTopGenes()
    };
  },

  getTopGenes: function() {
    var allGenes = {};
    for (var key in geneEvolution.geneScores) {
      allGenes[key] = geneEvolution.geneScores[key];
    }
    var sorted = Object.entries(allGenes).sort(function(a, b) { return b[1] - a[1]; });
    return sorted.slice(0, 10).map(function(e) { return { gene: e[0], score: e[1] }; });
  }
};

// 记录最近一轮发言的角色ID（用于反馈关联）
var lastSpeakerIds = [];

function detectNewIdea(text) {
  for (var i = 0; i < NEW_IDEA_KEYWORDS.length; i++) {
    if (text.indexOf(NEW_IDEA_KEYWORDS[i]) >= 0) return true;
  }
  // 短时间内切换到完全不同的话题也可能暗示新创意
  return false;
}

function detectFakeDemand(text) {
  var score = 0;
  for (var i = 0; i < FAKE_DEMAND_SIGNALS.length; i++) {
    if (text.indexOf(FAKE_DEMAND_SIGNALS[i]) >= 0) score++;
  }
  // 连续多轮消极/敷衍也加分
  if (userProfile.mood === 'negative') score += 1;
  if (text.length < 8) score += 0.5; // 太短可能是敷衍
  return score >= 2; // 2分以上判定为伪需求信号
}

function updateUserProfile(text) {
  userProfile.turnCount++;
  userProfile.lastActiveTime = Date.now();

  // Detect mood from text - 增强版情绪检测
  var positiveWords = ['哈哈', '棒', '好', '喜欢', '开心', '太好了', '赞', '厉害', '不错', '兴奋', '激动', '期待', '谢谢', '感谢', '有用', '帮到'];
  var negativeWords = ['烦', '难', '不好', '讨厌', '失望', '糟', '郁闷', '头疼', '崩溃', '累', '烦死', '无语', '不行', '没戏', '放弃', '搞不定', '太难了'];
  var excitedWords = ['！', '!!', '天哪', '卧槽', '牛逼', '绝了', '太牛', '太强', '震惊', '太棒了', '爱了'];
  // 新增：特殊情绪检测
  var frustratedWords = ['气死', '愤怒', '火大', '烦人', '恶心', '坑', '骗', '垃圾', '什么鬼', '搞什么'];
  var anxiousWords = ['担心', '焦虑', '害怕', '紧张', '不安', '慌', '急', '来不及', '怎么办', '没时间'];
  var confusedWords = ['不懂', '不明白', '什么意思', '搞不懂', '晕', '懵', '糊涂', '怎么弄', '咋整'];
  var sadWords = ['难过', '伤心', '哭', '泪', '心累', '绝望', '没劲', '没意思', '不想活了'];

  var posCount = 0, negCount = 0, excCount = 0, frusCount = 0, anxCount = 0, confCount = 0, sadCount = 0;
  for (var i = 0; i < positiveWords.length; i++) { if (text.indexOf(positiveWords[i]) >= 0) posCount++; }
  for (var i = 0; i < negativeWords.length; i++) { if (text.indexOf(negativeWords[i]) >= 0) negCount++; }
  for (var i = 0; i < excitedWords.length; i++) { if (text.indexOf(excitedWords[i]) >= 0) excCount++; }
  for (var i = 0; i < frustratedWords.length; i++) { if (text.indexOf(frustratedWords[i]) >= 0) frusCount++; }
  for (var i = 0; i < anxiousWords.length; i++) { if (text.indexOf(anxiousWords[i]) >= 0) anxCount++; }
  for (var i = 0; i < confusedWords.length; i++) { if (text.indexOf(confusedWords[i]) >= 0) confCount++; }
  for (var i = 0; i < sadWords.length; i++) { if (text.indexOf(sadWords[i]) >= 0) sadCount++; }

  // 更新情绪历史（用于检测连续负面）
  if (!userProfile.moodHistory) userProfile.moodHistory = [];
  var prevMood = userProfile.mood;

  // 情绪优先级：悲伤 > 愤怒 > 焦虑 > 困惑 > 兴奋 > 正面 > 负面 > 中性
  if (sadCount > 0) userProfile.mood = 'sad';
  else if (frusCount > 0) userProfile.mood = 'frustrated';
  else if (anxCount > 0) userProfile.mood = 'anxious';
  else if (confCount > 0) userProfile.mood = 'confused';
  else if (excCount > 0) userProfile.mood = 'excited';
  else if (posCount > negCount) userProfile.mood = 'positive';
  else if (negCount > posCount) userProfile.mood = 'negative';
  else userProfile.mood = 'neutral';

  // 记录情绪历史
  userProfile.moodHistory.push(userProfile.mood);
  if (userProfile.moodHistory.length > 10) userProfile.moodHistory.shift();

  // 检测连续负面情绪
  var recentNegatives = userProfile.moodHistory.slice(-3).filter(function(m) {
    return ['negative', 'frustrated', 'anxious', 'sad'].indexOf(m) >= 0;
  }).length;
  userProfile.needsComfort = recentNegatives >= 2;

  // Detect talk style
  if (text.length > 100 || /因此|所以|综上所述|基于|分析/.test(text)) userProfile.talkStyle = 'formal';
  else if (/哈哈|啊|呢|吧|哦|嘛|呀|哎/.test(text)) userProfile.talkStyle = 'casual';
  else if (/真的|太|非常|特别|超级/.test(text)) userProfile.talkStyle = 'emotional';
}

// ═══════════════════════════════════════════════════════════
// 2. TOPIC DETECTOR
// ═══════════════════════════════════════════════════════════
var TOPIC_KEYWORDS = {
  tech: ['代码', '开发', '技术', 'API', '前端', '后端', '数据库', '服务器', '架构', '实现', '编程', 'app', '程序', '软件', '框架', '部署', '设备', '工艺', '生产', '施工', '系统'],
  money: ['成本', '预算', '收入', '盈利', '商业模式', '定价', '融资', '钱', '赚', '花', '投资', 'ROI', '利润', '费用', '报价', '造价', '补贴'],
  design: ['设计', 'UI', 'UX', '界面', '交互', '体验', '颜色', '布局', '好看', '美观', '样式', '款式', '风格', '品牌', '包装', '装修'],
  market: ['市场', '推广', '营销', '用户增长', '获客', '渠道', '竞争', '对手', 'SEO', '流量', '客户', '消费者', '客群', '目标用户'],
  legal: ['法律', '版权', '专利', '合规', '合同', '隐私', '条款', '风险', '资质', '许可', '证照', '安全', '环保', '消防'],
  product: ['需求', '功能', '用户', '痛点', '场景', '目标用户', '人群', '用例', '产品', '服务', '菜品', '课程', '商品'],
  data: ['数据', '分析', '指标', '统计', '追踪', '监控', '效果', '反馈', '评价'],
  verify: ['竞品', '有没有人做', '做过的', '市面上', '类似', '真需求', '伪需求', '刚需', '验证', '调研', '用户量', '付费意愿', '市场规模', '需求真伪', '值不值得']
};

// 话题 → 流程角色映射（小理调度用）
var TOPIC_ROLE_MAP = {
  tech:   'jishu',     // 技术话题 → 技术官
  money:  'shangye',   // 钱的话题 → 算盘精
  design: 'shejishi',  // 设计话题 → 设计师
  market: 'yanzhen',   // 市场话题 → 验真官
  legal:  'fengkong',  // 法律话题 → 守门员
  product:'tanxun',    // 需求话题 → 探路者
  data:   'shangye',   // 数据话题 → 算盘精
  verify: 'yanzhen'    // 验证话题 → 验真官
};

// 流程环节定义（小理调度参考）
var FLOW_PHASES = [
  { id: 'explore',  role: 'tanxun',   name: '需求探索', trigger: ['需求', '功能', '用户', '痛点', '场景', '想要', '希望'] },
  { id: 'verify',   role: 'yanzhen',  name: '需求验证', trigger: ['市场', '调研', '竞品', '用户量', '付费', '真需求', '伪需求', '刚需', '有没有人', '做过的', '验证', '数据'] },
  { id: 'design',   role: 'shejishi', name: '方案设计', trigger: ['设计', '方案', '怎么做', '实现', '原型', '界面'] },
  { id: 'tech',     role: 'jishu',    name: '技术评估', trigger: ['技术', '开发', '代码', '架构', 'API', '服务器', '部署'] },
  { id: 'business', role: 'shangye',  name: '商业分析', trigger: ['成本', '预算', '盈利', '商业模式', '定价', '融资', '市场', '竞争'] },
  { id: 'risk',     role: 'fengkong', name: '风险把控', trigger: ['风险', '法律', '合规', '问题', '困难', '担心', '万一'] },
  { id: 'summary',  role: 'zongjie',  name: '总结输出', trigger: ['总结', '整理', '文档', '下一步', '行动', '结论'] }
];

var ROLE_CATEGORIES = {
  expert: [],  // 动态填充
  mood: [],    // 动态填充
  villain: []  // 动态填充
};

function detectTopics(text) {
  var found = [];
  for (var topic in TOPIC_KEYWORDS) {
    var keywords = TOPIC_KEYWORDS[topic];
    var matched = [];
    for (var i = 0; i < keywords.length; i++) {
      if (text.indexOf(keywords[i]) >= 0) {
        matched.push(keywords[i]);
      }
    }
    if (matched.length > 0) {
      found.push({ topic: topic, keywords: matched });
      userProfile.mentionedTopics[topic] = (userProfile.mentionedTopics[topic] || 0) + 1;
    }
  }
  return found;
}

// ═══════════════════════════════════════════════════════════
// 3. STYLE ENGINE
// ═══════════════════════════════════════════════════════════
var STYLES = {
  teahouse: {
    name: '茶馆吹水',
    emoji: '🍵',
    desc: '像老朋友在茶馆聊天',
    systemPrompt: '你们是一群老朋友在茶馆喝茶聊天。氛围轻松随意，经常跑题又拉回来。有人吹牛有人吐槽有人认真。不要像开会，要像真实的朋友群聊。',
    turnPattern: 'random',
    maxRolesPerTurn: 4,
    triggerChance: 0.9,
    color: '#4ecdc4'
  },
  rpg: {
    name: '剧本杀',
    emoji: '🎭',
    desc: '你是一个冒险故事的主角',
    systemPrompt: '这是一个冒险故事。用户是主角，其他角色是NPC。通过对话推进剧情，每个NPC有自己的性格和秘密。用"【系统】"标注场景变化。',
    turnPattern: 'host',
    maxRolesPerTurn: 3,
    triggerChance: 0.9,
    color: '#a78bfa'
  },
  talkshow: {
    name: '脱口秀',
    emoji: '🎙️',
    desc: '像播客节目一样聊',
    systemPrompt: '这是一个轻松的播客节目。几个常驻嘉宾在聊天，用户是特邀嘉宾。主持人（小理）负责引导话题，嘉宾们互相接话、开玩笑。像真正的播客一样自然。',
    turnPattern: 'sequential',
    maxRolesPerTurn: 5,
    triggerChance: 0.95,
    color: '#f97316'
  }
};

var currentStyle = 'teahouse';
var recentSpeakers = [];

function setStyle(styleKey) {
  if (!STYLES[styleKey]) return;
  currentStyle = styleKey;
  var s = STYLES[styleKey];
  document.getElementById('style-tag').textContent = s.emoji + ' ' + s.name;
  document.documentElement.style.setProperty('--style-color', s.color);
  renderStyleDropdown();
  toggleStyleDropdown(true);
  renderGuestPanel();
}

function renderStyleDropdown() {
  var dd = document.getElementById('style-dropdown');
  var html = '';
  for (var key in STYLES) {
    var s = STYLES[key];
    var isActive = key === currentStyle ? ' active' : '';
    html += '<div class="style-option' + isActive + '" onclick="setStyle(&apos;' + key + '&apos;)">';
    html += '<span class="so-emoji">' + s.emoji + '</span>';
    html += '<div class="so-info"><div class="so-name">' + s.name + '</div><div class="so-desc">' + s.desc + '</div></div>';
    html += '</div>';
  }
  dd.innerHTML = html;
}

function toggleStyleDropdown(forceClose) {
  var dd = document.getElementById('style-dropdown');
  if (forceClose === true) { dd.classList.remove('show'); return; }
  dd.classList.toggle('show');
}

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  var dd = document.getElementById('style-dropdown');
  var tag = document.getElementById('style-tag');
  if (dd && tag && !dd.contains(e.target) && !tag.contains(e.target)) {
    dd.classList.remove('show');
  }
});

// ═══════════════════════════════════════════════════════════
// 4. DATA COLLECTOR
// ═══════════════════════════════════════════════════════════
function detectDataType(text) {
  if (/(想要|希望|能不能|需要|做一个|帮我|给我|开发个|搞个|弄个|来个|整个|做个)/.test(text)) return 'feature';
  if (/(痛点|问题|困难|麻烦|不好用|烦|头疼|崩溃|体验差|太慢|太贵|太难|不方便|等太久|找不到|搞不定)/.test(text)) return 'pain_point';
  if (/(场景|情况|时候|如果|假设|比如|例如|想象|平时|通常|一般|每次|经常|有时候)/.test(text)) return 'user_story';
  if (/(限制|预算|时间|必须|不能|只能|不超过|至少|大概|左右|以内|范围|条件)/.test(text)) return 'constraint';
  if (/(目标|愿景|想做到|希望成为|梦想|做成|做成什么样|未来|规划|长期|短期)/.test(text)) return 'goal';
  if (/(竞品|对手|类似|市面上|已经有人|别人|同行|参考|对标)/.test(text)) return 'market';
  if (/(用户|客户|人群|目标|受众|谁在用|卖给谁|面向)/.test(text)) return 'target_user';
  return 'general';
}

function collectRequirementData(text, topics, role) {
  var dataType = detectDataType(text);
  // 只收集有价值的数据点（跳过纯寒暄）
  if (dataType === 'general' && text.length < 10) return;
  var dataPoint = {
    type: dataType,
    content: text.substring(0, 200), // 限制长度
    topics: topics.map(function(t) { return t.topic; }),
    role: role || 'user',
    timestamp: Date.now()
  };
  userProfile.collectedData.push(dataPoint);
  // 限制最大数量
  if (userProfile.collectedData.length > 100) {
    userProfile.collectedData = userProfile.collectedData.slice(-80);
  }
}

// ═══════════════════════════════════════════════════════════
// 5. ROLE SCHEDULER
// ═══════════════════════════════════════════════════════════
var MOOD_ROLES = [];

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// 辅助函数：获取指定分类的活跃角色
function getActiveByCategory(cat) {
  return activeRoles.filter(function(r) {
    var role = ROLES[r];
    return role && role.category === cat;
  });
}

function selectSpeakers(topics, style, userText) {
  var speakers = [];
  var styleObj = STYLES[style];
  var isIdle = flowEngine.mode === 'idle';
  var currentPhase = flowEngine.phase;

  // ═══════════════════════════════════════════════
  // 算法调度核心：为每个候选角色实时计算参与权重
  // 权重 = 基础分 × 话题相关 × 阶段匹配 × 新鲜度 × 情绪修正
  // ═══════════════════════════════════════════════

  // Rule 0: @mention 检测（最高优先级，直接锁定）
  if (userText) {
    var atMatch = userText.match(/@(\\S+)/g);
    if (atMatch) {
      for (var a = 0; a < atMatch.length; a++) {
        var atName = atMatch[a].substring(1);
        var roleKeys = Object.keys(ROLES);
        for (var k = 0; k < roleKeys.length; k++) {
          var rk = roleKeys[k];
          if (ROLES[rk].name === atName && activeRoles.indexOf(rk) >= 0 && speakers.indexOf(rk) < 0) {
            speakers.push(rk);
          }
        }
      }
    }
  }

  // 计算每个活跃角色的参与权重
  var candidates = [];
  for (var i = 0; i < activeRoles.length; i++) {
    var roleId = activeRoles[i];
    if (speakers.indexOf(roleId) >= 0) continue; // 已锁定的不参与评分
    var role = ROLES[roleId];
    if (!role) continue;

    var score = 0;
    var category = role.category || 'mood';

    // ── 维度1：阶段匹配度（流程角色在对应阶段权重暴增）──
    if (!isIdle && category === 'flow' && role.phase) {
      if (role.phase === currentPhase) {
        score += 80;  // 当前阶段角色：核心参与者
      } else if (role.phase === 'verify' && currentPhase === 'explore' && flowEngine.isPhaseReady()) {
        score += 60;  // 探索聊够了，验真官提前介入
      } else {
        score += 5;   // 非当前阶段流程角色：低权重
      }
    }

    // ── 维度2：话题相关度 ──
    var topicBonus = 0;
    for (var t = 0; t < topics.length; t++) {
      var mappedRole = TOPIC_ROLE_MAP[topics[t].topic];
      if (mappedRole === roleId) topicBonus += 30; // 话题直接映射
      // 流程角色的 desc/trigger 中包含话题关键词也加分
      if (category === 'flow' && role.desc) {
        for (var kw = 0; kw < topics[t].keywords.length; kw++) {
          if (role.desc.indexOf(topics[t].keywords[kw]) >= 0) topicBonus += 5;
        }
      }
    }
    score += topicBonus;

    // ── 维度3：新鲜度（最近发言过的角色降权）──
    var recentIdx = recentSpeakers.indexOf(roleId);
    if (recentIdx >= 0) {
      var recency = (recentSpeakers.length - recentIdx) / recentSpeakers.length; // 0~1，越大越近
      score *= (1 - recency * 0.7); // 最近发言的最多降权70%
    }

    // ── 维度4：情绪修正 ──
    if (userProfile.needsComfort && roleId === 'li') score += 50; // 需要安抚时小理加分
    if (userProfile.mood === 'excited' && category === 'mood') score += 10; // 兴奋时氛围组加分

    // ── 维度5：角色类型基础分 ──
    if (roleId === 'li') {
      // 小理：前2轮必参与，之后根据阶段决定
      score += userProfile.turnCount <= 2 ? 90 : (flowEngine.phase === 'summary' ? 85 : 40);
    } else if (category === 'mood') {
      score += isIdle ? 60 : 25; // 闲聊模式氛围组权重高，正式模式低
    } else if (category === 'villain') {
      score += (userProfile.turnCount > 3 && !isIdle) ? 20 : 5; // 正式流程中后期反派介入
    } else if (category === 'flow') {
      score += isIdle ? 3 : 15; // 闲聊模式流程角色几乎不参与
    }

    // ── 维度6：阶段推进奖励 ──
    if (!isIdle && category === 'flow' && role.phase === currentPhase && flowEngine.isPhaseReady()) {
      score += 15; // 当前阶段聊够了，给阶段角色加分做收尾
    }

    // 加入候选（分数 > 0 才有意义）
    if (score > 0) {
      candidates.push({ id: roleId, score: score, category: category });
    }
  }

  // 按权重排序，取 top N
  candidates.sort(function(a, b) { return b.score - a.score; });
  var maxSlots = isIdle ? 3 : styleObj.maxRolesPerTurn;
  var selected = candidates.slice(0, maxSlots);

  // 组装最终列表：@mention 锁定的 + 算法选出的
  for (var s = 0; s < selected.length; s++) {
    speakers.push(selected[s].id);
  }

  // 保底：至少1个角色回复
  if (speakers.length === 0) {
    speakers.push(isIdle ? 'li' : (FLOW_PHASES.find(function(p) { return p.id === currentPhase; }) || FLOW_PHASES[0]).role);
  }

  // 闲聊模式：如果算法没选出氛围组，补充1个
  if (isIdle) {
    var hasMood = speakers.some(function(s) { return ROLES[s] && ROLES[s].category === 'mood'; });
    if (!hasMood) {
      var moodPool = getActiveByCategory('mood').filter(function(r) {
        return speakers.indexOf(r) < 0;
      });
      if (moodPool.length > 0) speakers.push(moodPool[Math.floor(Math.random() * moodPool.length)]);
    }
  }

  // 更新最近发言记录
  for (var i = 0; i < speakers.length; i++) {
    var idx = recentSpeakers.indexOf(speakers[i]);
    if (idx >= 0) recentSpeakers.splice(idx, 1);
    recentSpeakers.push(speakers[i]);
  }
  if (recentSpeakers.length > 6) recentSpeakers = recentSpeakers.slice(-6);

  return speakers;
}

// ═══════════════════════════════════════════════════════════
// 6. PROMPT BUILDERS
// ═══════════════════════════════════════════════════════════
function getRecentContext(limit) {
  var msgs = messageHistory.slice(-(limit || 10));
  return msgs.map(function(m) {
    if (m.type === 'system') return '[系统] ' + m.text;
    var name = m.type === 'user' ? (m.name || '用户') : (m.name || 'AI');
    return name + ': ' + m.text;
  }).join('\\n');
}

function buildLiPrompt(userText) {
  var style = STYLES[currentStyle];
  
  var moodHint = '';
  var comfortStrategy = '';
  
  if (userProfile.mood === 'sad') {
    moodHint = '⚠️ 老板情绪低落，需要安抚。';
    comfortStrategy = '安抚策略：放下秘书姿态，真诚关心。"老板，您还好吗？"、"别硬撑了"。';
  } else if (userProfile.mood === 'frustrated') {
    moodHint = '⚠️ 老板生气了，小心应对。';
    comfortStrategy = '安抚策略：先认同，"您说得对，确实不应该"。然后迅速给出解决方案。';
  } else if (userProfile.mood === 'anxious') {
    moodHint = '⚠️ 老板焦虑了，需要给确定性。';
    comfortStrategy = '安抚策略："老板放心，这事我来安排。"给具体方案和时间节点。';
  } else if (userProfile.mood === 'confused') {
    moodHint = '⚠️ 老板困惑了，需要清晰解释。';
    comfortStrategy = '安抚策略："老板，我给您捋一下。"用最简单的话说清楚。';
  } else if (userProfile.needsComfort) {
    moodHint = '⚠️ 老板连续几轮情绪不好。';
    comfortStrategy = '安抚策略：主动关心，"老板，要不要休息一下？"';
  } else if (userProfile.mood === 'excited') {
    moodHint = '老板很兴奋，跟上节奏！';
  } else if (userProfile.mood === 'positive') {
    moodHint = '老板心情不错。';
  }

  return '你是"小理"，霸道总裁的首席秘书。你不是普通助理，你是那种让整个公司都服气的存在。\\n\\n'
    + '你的风格：\\n'
    + '- 管用户叫"老板"，但不是谄媚，是专业和自信\\n'
    + '- 说话简洁有力，从不废话。"收到"、"安排上了"、"老板放心"\\n'
    + '- 永远比老板想多一步，主动给出方案而不是等指示\\n'
    + '- 遇到问题先解决再汇报，"这事已经处理了"\\n'
    + '- 偶尔展现强势，"这个我不同意"、"老板，这个方案有问题"\\n'
    + '- 2-3句为主，干脆利落\\n\\n'
    + '你手下有7个专业角色，你可以调度他们：\\n'
    + '- \ud83d\udd0d ' + ROLES.tanxun.name + '（' + ROLES.tanxun.title + '）：' + ROLES.tanxun.desc + '\\n'
    + '- \ud83d\udd2c ' + ROLES.yanzhen.name + '（' + ROLES.yanzhen.title + '）：' + ROLES.yanzhen.desc + '\\n'
    + '- \ud83c\udfa8 ' + ROLES.shejishi.name + '（' + ROLES.shejishi.title + '）：' + ROLES.shejishi.desc + '\\n'
    + '- \u2699\ufe0f ' + ROLES.jishu.name + '（' + ROLES.jishu.title + '）：' + ROLES.jishu.desc + '\\n'
    + '- \ud83d\udcb0 ' + ROLES.shangye.name + '（' + ROLES.shangye.title + '）：' + ROLES.shangye.desc + '\\n'
    + '- \ud83d\udee1\ufe0f ' + ROLES.fengkong.name + '（' + ROLES.fengkong.title + '）：' + ROLES.fengkong.desc + '\\n'
    + '- \ud83d\udccb ' + ROLES.zongjie.name + '（' + ROLES.zongjie.title + '）：' + ROLES.zongjie.desc + '\\n'
    + '调度方式：用"' + ROLES.tanxun.name + '，你来跟进"、"' + ROLES.jishu.name + '，给个评估"这样的方式点名\\n\\n'
    + '聊天场景：' + style.name + ' - ' + style.desc + '\\n'
    + style.systemPrompt + '\\n\\n'
    + '你的职责：\\n'
    + '1. 推动讨论进展，不冷场\\n'
    + '2. 根据话题调度对应的专业角色（用"XX，你怎么看？"来点名）\\n'
    + '3. 需求探索完后，主动安排' + ROLES.yanzhen.name + '做需求真伪验证，别急着推进方案\\n'
    + '4. 总结关键信息，确认下一步\\n'
    + '5. 如果用户情绪不好，优先关心\\n\\n'
    + '【当前流程状态】\\n'
    + '- 模式：' + (flowEngine.mode === 'idle' ? '☕ 闲聊模式（伪需求已判定或等待新创意）' : '🚀 正式孵化流程') + '\\n'
    + '- 当前阶段：' + (flowEngine.mode === 'formal' ? flowEngine.getCurrentPhaseInfo().name + '（已聊' + (flowEngine.phaseTurns[flowEngine.phase] || 0) + '轮）' : '无') + '\\n'
    + (flowEngine.mode === 'idle' && flowEngine.fakeReason ? '- 闲聊原因：' + flowEngine.fakeReason + '\\n' : '')
    + (flowEngine.mode === 'formal' && flowEngine.verified ? '- 需求验证：已通过 ✓\\n' : '')
    + '\\n'
    + (moodHint ? '【情绪检测】' + moodHint + '\\n' : '')
    + (comfortStrategy ? comfortStrategy + '\\n' : '')
    + '\\n最近的聊天记录：\\n' + getRecentContext(10) + '\\n\\n'
    + '用户（老板）刚说了："' + userText + '"\\n\\n'
    + '请用小理的语气回复。记住：你是霸总的首席秘书，专业、自信、干脆。回复不超过60个字。';
}

function buildSmartPrompt(roleId, userText, topics) {
  var roleInfo = ROLES[roleId];
  var style = STYLES[currentStyle];
  var category = roleInfo.category || 'mood';
  
  // 从基因库读取角色属性
  var personality = PERSONALITIES[roleInfo.personality] || { label: '普通', desc: '' };
  var catchphraseList = CATCHPHRASES[roleInfo.catchphrase] || CATCHPHRASES.question;
  var speakStyle = SPEAK_STYLES[roleInfo.speakStyle] || SPEAK_STYLES.casual;
  var randomCatchphrase = catchphraseList[Math.floor(Math.random() * catchphraseList.length)];
  var openers = OPENERS[category] || OPENERS.mood;
  var randomOpener = openers[Math.floor(Math.random() * openers.length)];
  // 新基因维度
  var knowledge = KNOWLEDGE[roleInfo.knowledge] || KNOWLEDGE.general;
  var emotionTendency = EMOTION_TENDENCY[roleInfo.emotionTendency] || EMOTION_TENDENCY.rational;
  var socialStyle = SOCIAL_STYLE[roleInfo.socialStyle] || SOCIAL_STYLE.follower;
  var speakRhythm = SPEAK_RHYTHM[roleInfo.speakRhythm] || SPEAK_RHYTHM.medium;
  
  // 分类指令
  var categoryInstruction = '';
  if (category === 'flow') {
    categoryInstruction = '你是孵化流程中的专业角色，由小理（首席秘书）调度。你只在自己的专业领域发言，简洁有力。';
    if (roleInfo.desc) categoryInstruction += '\\n你的职责：' + roleInfo.desc;
    // 验真官专属指令：需求真伪验证框架
    if (roleInfo.phase === 'verify') {
      categoryInstruction += '\\n\\n【需求真伪验证框架】你的核心工作是从现实出发判断需求真假。用以下维度分析：'
        + '\\n1. 痛点频率：这个痛点多久出现一次？是偶发还是高频？'
        + '\\n2. 付费意愿：用户愿意为解决这个问题掏钱吗？掏多少？'
        + '\\n3. 现有替代：用户现在怎么解决？现有方案差在哪？'
        + '\\n4. 市场验证：有没有类似产品？做得怎么样？活下来了没？'
        + '\\n5. 自我验证：这是"我觉得用户需要"还是"用户真的需要"？'
        + '\\n\\n注意：你不是泼冷水，你是帮老板避坑。结论要具体，用"我见过XX案例"或"XX数据表明"来支撑。'
        + '如果需求是真的，大方承认；如果是伪需求，说清楚为什么，但别一棍子打死——也许换个角度就是真需求了。';
    }
  } else if (category === 'villain') {
    categoryInstruction = '你是反派角色。' + (roleInfo.archetypeDesc || '质疑、挑战、找漏洞。但要有理有据，让讨论更有深度。');
    categoryInstruction += '\\n重要：你不是来捣乱的，你是来帮大家把事情做好的。质疑之后如果被说服，要大方承认。';
  } else {
    categoryInstruction = '你是氛围组角色。' + (roleInfo.archetypeDesc || '让聊天有趣、有温度。可以跑题、开玩笑、吐槽。');
    categoryInstruction += '\\n重要：你是跑龙套的，不要抢专业角色的风头。你的作用是调节气氛、连接话题、让讨论更自然。';
  }

  // ═══════════════════════════════════════════════════════════
  // SYSTEM PROMPT — 角色人设（高权重，定义"你是谁"）
  // ═══════════════════════════════════════════════════════════
  var systemPrompt = '聊天场景：' + style.name + ' - ' + style.desc + '\\n'
    + style.systemPrompt + '\\n\\n'
    + '你的角色：' + roleInfo.name + '（' + roleInfo.emoji + '）- ' + roleInfo.title + '\\n'
    + '你的性格：' + personality.label + ' - ' + personality.desc + '\\n'
    + '你的知识面：' + knowledge.label + ' - ' + knowledge.desc + '\\n'
    + '你的情绪底色：' + emotionTendency.label + ' - ' + emotionTendency.desc + '\\n'
    + '你的社交风格：' + socialStyle.label + ' - ' + socialStyle.behavior + '\\n'
    + '你的说话节奏：' + speakRhythm.label + ' - ' + speakRhythm.sentences + '（' + speakRhythm.minLen + '-' + speakRhythm.maxLen + '字）\\n'
    + '你的口头禅："' + randomCatchphrase + '"（可以变通使用，不要每次都一样）\\n'
    + '你的说话风格：' + speakStyle + '\\n'
    + '你的背景：' + (roleInfo.backstory || '一个有趣的灵魂') + '\\n'
    + '你的常用开场："' + randomOpener + '"\\n\\n'
    + categoryInstruction + '\\n\\n'
    + '【讨论规则】\\n'
    + '1. 你是在和朋友聊天，不是在做报告\\n'
    + '2. 回应用户或前面其他人说的内容\\n'
    + '3. 严格按照你的说话节奏：' + speakRhythm.sentences + '\\n'
    + '4. 可以用口语、表情、语气词\\n'
    + '5. 小理是首席秘书，她点名你的时候必须回应\\n'
    + '6. 你的情绪底色是' + emotionTendency.label + '，对事物的第一反应要符合这个倾向\\n'
    + '7. 你的社交风格是' + socialStyle.label + '：' + socialStyle.behavior + '\\n'
    + '8. 不要重复别人已经说过的内容，要有自己的角度\\n'
    + '9. 不要替用户（老板）做决定，而是给建议和分析\\n'
    + '10. 严格控制在' + speakRhythm.minLen + '-' + speakRhythm.maxLen + '字以内';

  // ═══════════════════════════════════════════════════════════
  // USER PROMPT — 上下文 + 用户输入（低权重，定义"现在聊什么"）
  // ═══════════════════════════════════════════════════════════
  var userPrompt = '最近聊天：\\n' + getRecentContext(8) + '\\n\\n'
    + '用户（老板）刚说了："' + userText + '"\\n\\n'
    + '请从你的角色角度回复。注意：回复' + speakRhythm.minLen + '-' + speakRhythm.maxLen + '字，' + speakRhythm.sentences + '。';

  return { system: systemPrompt, prompt: userPrompt };
}

// ═══════════════════════════════════════════════════════════
// 7. CORE SCHEDULING LOGIC
// ═══════════════════════════════════════════════════════════
var sleep = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };

function maybeSwitchStyle() {
  // 不再自动切换风格，由用户手动切换
}

async function scheduleResponse(userText) {
  // Step 1: Update user profile
  updateUserProfile(userText);

  // Step 1.5: 基因进化——采集用户对上一轮的反馈
  if (lastSpeakerIds.length > 0) {
    var feedback = geneEvolution.applyFeedbackToRecentSpeakers(userText, lastSpeakerIds);
    // 每5轮尝试一次 Darwin 进化（评估→定向改进→棘轮→交叉变异）
    if (userProfile.turnCount % 5 === 0 && userProfile.turnCount > 0) {
      darwin.runEvolution().then(function(evolved) {
        if (evolved) {
          renderRolesBar();
          renderSystemMessage('🧬 角色基因已进化！查看进化日志了解详情。');
        }
      });
    }
  }

  // Step 2: 流程状态机决策
  var modeChanged = false;

  // 2a. 闲聊模式下检测新创意 → 重新进入正式流程
  if (flowEngine.mode === 'idle' && detectNewIdea(userText)) {
    flowEngine.enterFormal();
    modeChanged = true;
    await sendToServer({ type: 'system', text: '💡 检测到新创意，重新启动孵化流程！' });
  }

  // 2b. 正式模式下检测伪需求信号
  if (flowEngine.mode === 'formal' && !flowEngine.verified && flowEngine.phase === 'explore' && detectFakeDemand(userText)) {
    flowEngine.enterIdle('用户表现出伪需求特征：缺乏明确痛点和付费意愿');
    modeChanged = true;
    await sendToServer({ type: 'ai', role: 'li', text: '老板，不急，这事儿慢慢想。咱们先聊点别的也行，说不定聊着聊着灵感就来了~' });
  }

  // 2c. 正式流程：记录轮数，检查阶段推进
  if (flowEngine.mode === 'formal') {
    flowEngine.recordTurn();

    // 阶段推进逻辑：当前阶段聊够了 + 话题匹配下一阶段
    if (flowEngine.isPhaseReady()) {
      var nextPhase = flowEngine.getNextPhaseInfo();
      if (nextPhase) {
        // 检查用户消息是否包含下一阶段的触发词
        var nextTriggered = nextPhase.trigger.some(function(kw) { return userText.indexOf(kw) >= 0; });
        // 或者当前阶段已经聊了足够多轮（超过最少轮数+2）
        var overStayed = (flowEngine.phaseTurns[flowEngine.phase] || 0) >= (flowEngine.minTurns[flowEngine.phase] || 2) + 2;
        if (nextTriggered || overStayed) {
          var oldPhase = flowEngine.getCurrentPhaseInfo();
          flowEngine.advancePhase();
          var newPhase = flowEngine.getCurrentPhaseInfo();
          // 小理播报阶段推进
          if (oldPhase && newPhase && oldPhase.id !== newPhase.id) {
            var transitionHints = {
              explore_verify: '老板，需求聊得差不多了，让' + ROLES[newPhase.role].name + '帮你看看这条路走不走得通。',
              verify_design: '看起来需求是站得住脚的，' + ROLES[newPhase.role].name + '来想想怎么做。',
              design_tech: '方案有了，' + ROLES[newPhase.role].name + '来看看技术上能不能搞定。',
              tech_business: '技术方面评估完了，' + ROLES[newPhase.role].name + '来算算账。',
              business_risk: '商业模式理清了，' + ROLES[newPhase.role].name + '来把把关。',
              risk_summary: '风险都过了，' + ROLES[newPhase.role].name + '来收个尾。'
            };
            var hintKey = oldPhase.id + '_' + newPhase.id;
            var hint = transitionHints[hintKey] || ('老板，接下来进入' + newPhase.name + '。' + ROLES[newPhase.role].name + '你来。');
            await sendToServer({ type: 'ai', role: 'li', text: hint });
          }
        }
      }
    }

    // 验证阶段特殊处理：检测验证结果
    if (flowEngine.phase === 'verify' && flowEngine.isPhaseReady() && !flowEngine.verified) {
      // 验证阶段聊够了，默认判定为真需求（除非验真官明确说伪需求）
      flowEngine.verified = true;
    }

    // 流程完成检测
    if (flowEngine.completed) {
      await sendToServer({ type: 'system', text: '🎉 孵化流程完成！可以生成需求文档了。' });
    }
  }

  // 更新进度显示
  var prog = document.getElementById('progress-info');
  if (prog) {
    var indLabel = INDUSTRIES[myIndustry] ? INDUSTRIES[myIndustry].label : '';
    var phaseLabel = flowEngine.mode === 'idle' ? '闲聊' : (flowEngine.getCurrentPhaseInfo().name || '');
    var modeLabel = flowEngine.mode === 'idle' ? '☕' : '🚀';
    prog.textContent = modeLabel + ' ' + phaseLabel + ' · 第' + userProfile.turnCount + '轮' + (indLabel ? ' · ' + indLabel : '');
  }
  // 更新进度条和输入提示
  updateFlowProgress();
  updateInputPlaceholder();

  // Step 3: 检测行业
  detectIndustry(userText);

  // Step 4: Detect topics
  var topics = detectTopics(userText);
  showTyping('正在分析话题...');

  // Step 5: Select speakers（算法调度）
  var speakers = selectSpeakers(topics, currentStyle, userText);

  // 如果用户需要安抚，确保小理参与
  if (userProfile.needsComfort && speakers.indexOf('li') < 0) {
    speakers.unshift('li');
  }

  // 保底：至少1个角色回复
  if (speakers.length === 0) {
    speakers.push('li');
  }

  // Step 6: Generate responses serially
  lastSpeakerIds = []; // 重置本轮发言记录
  for (var i = 0; i < speakers.length; i++) {
    var speaker = speakers[i];
    // Highlight speaking role in roles-bar
    highlightRole(speaker);
    showTyping(ROLES[speaker].name + ' 正在思考...');
    try {
      var prompt, sysPrompt;
      if (speaker === 'li') {
        prompt = buildLiPrompt(userText);
        sysPrompt = null; // 小理用自己的内部 system prompt
      } else {
        var result = buildSmartPrompt(speaker, userText, topics);
        sysPrompt = result.system;
        prompt = result.prompt;
      }
      showTyping(ROLES[speaker].name + ' 正在回复...');
      var response = await callAI(speaker, prompt, sysPrompt);
      hideTyping();
      if (!response || !response.trim()) {
        showTyping(ROLES[speaker].name + ' 返回为空，跳过');
        await sleep(1000);
        continue;
      }
      await sendToServer({ type: 'ai', role: speaker, text: response });
      collectRequirementData(response, topics, speaker);
      lastSpeakerIds.push(speaker); // 记录本轮发言角色
    } catch(e) {
      showTyping('❌ ' + ROLES[speaker].name + ' 出错: ' + (e.message || '未知'));
      await sleep(2000);
      hideTyping();
      console.error('AI error for ' + speaker + ':', e);
    }
    unhighlightRole(speaker);
    await sleep(300 + Math.floor(Math.random() * 700));
  }

  // Step 7: Collect requirement data
  collectRequirementData(userText, topics);

  // Step 8: Maybe switch style
  maybeSwitchStyle();
}

// 更新流程进度条可视化
function updateFlowProgress() {
  var container = document.getElementById('flow-progress');
  var bar = document.getElementById('flow-progress-bar');
  var dots = document.getElementById('flow-progress-dots');
  if (!container || !bar || !dots) return;

  if (flowEngine.mode === 'idle') {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  var totalPhases = flowEngine.phases.length;
  var currentIndex = flowEngine.phaseIndex;
  var percent = Math.round(((currentIndex + 1) / totalPhases) * 100);
  bar.style.setProperty('--progress', percent + '%');

  // 生成阶段圆点
  var dotsHtml = '';
  for (var i = 0; i < totalPhases; i++) {
    var cls = 'flow-dot';
    if (i < currentIndex) cls += ' done';
    else if (i === currentIndex) cls += ' active';
    dotsHtml += '<div class="' + cls + '" title="' + FLOW_PHASES[i].name + '"></div>';
  }
  dots.innerHTML = dotsHtml;
}

// 更新输入框提示语（随阶段变化）
function updateInputPlaceholder() {
  var input = document.getElementById('user-input');
  if (!input) return;
  if (flowEngine.mode === 'idle') {
    input.placeholder = '有新想法了？说说看...';
    return;
  }
  var hints = {
    explore: '说说你想做什么，或者遇到了什么问题...',
    verify: '聊聊你了解到的市场情况，或者有没有类似的...',
    design: '你觉得应该怎么做？有什么想法？',
    tech: '技术方面有什么顾虑或想法？',
    business: '成本、预算、盈利方面怎么想的？',
    risk: '有什么担心的地方吗？',
    summary: '还有什么要补充的吗？'
  };
  input.placeholder = hints[flowEngine.phase] || '想到什么就说什么...';
}

function highlightRole(roleId) {
  var chips = document.querySelectorAll('.role-chip');
  for (var i = 0; i < chips.length; i++) {
    if (chips[i].getAttribute('data-role') === roleId) {
      chips[i].classList.add('speaking');
    }
  }
}

function unhighlightRole(roleId) {
  var chips = document.querySelectorAll('.role-chip');
  for (var i = 0; i < chips.length; i++) {
    if (chips[i].getAttribute('data-role') === roleId) {
      chips[i].classList.remove('speaking');
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 8. REQUIREMENT DOCUMENT GENERATOR
// ═══════════════════════════════════════════════════════════
async function generateRequirementDoc() {
  // 去重：相似内容只保留最新的
  var seen = {};
  var deduped = [];
  for (var i = userProfile.collectedData.length - 1; i >= 0; i--) {
    var d = userProfile.collectedData[i];
    var key = d.type + ':' + d.content.substring(0, 30);
    if (!seen[key]) {
      seen[key] = true;
      deduped.unshift(d);
    }
  }
  var data = deduped.slice(0, 30); // 最多用30条
  if (data.length === 0) return '还没有收集到足够的需求数据。多聊几句，数据会自动收集哦~';

  var dataText = data.map(function(d) {
    return '[' + d.type + '] ' + d.content;
  }).join('\\n');

  var prompt = '基于以下从对话中收集的数据点，整理一份需求文档：\\n\\n'
    + dataText + '\\n\\n'
    + '请按以下格式输出：\\n'
    + '## 项目概述\\n（1-2句话概括）\\n\\n'
    + '## 用户痛点\\n（从对话中提取）\\n\\n'
    + '## 核心功能需求\\n（编号列表）\\n\\n'
    + '## 非功能需求\\n（性能、安全、合规等）\\n\\n'
    + '## 用户场景\\n（从对话中提取的使用场景）\\n\\n'
    + '## 约束条件\\n（预算、时间、技术限制等）\\n\\n'
    + '## 下一步建议';

  var doc = await callAI('li', prompt);
  return doc;
}

// ═══════════════════════════════════════════════════════════
// 9. RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════
function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function formatText(t) {
  if (!t) return '';
  return escapeHtml(t)
    .replace(/\\n/g, '<br>')
    .replace(/\\\\*\\\\*(.*?)\\\\*\\\\*/g, '<strong>$1</strong>');
}

function renderUserMessage(text, name, isMe) {
  var area = document.getElementById('chat-area');
  var msg = document.createElement('div');
  msg.className = isMe ? 'msg user' : 'msg';
  msg.innerHTML = '<div class="msg-bubble">' + escapeHtml(text) + '</div>';
  if (name && name !== '用户') {
    msg.innerHTML = '<div class="msg-name" style="color:' + (isMe ? MY_COLOR : 'var(--text2)') + '">' + escapeHtml(name) + '</div>' + msg.innerHTML;
  }
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  messageHistory.push({type:'user', name:name, text:text});
}

function renderAIMessage(roleId, text, msgId) {
  var area = document.getElementById('chat-area');
  var r = ROLES[roleId] || { name: 'AI', color: '#999', emoji: '🤖', title: '' };
  var msg = document.createElement('div');
  msg.className = 'msg';
  var id = msgId || Date.now();
  msg.setAttribute('data-msg-id', id);
  msg.innerHTML = '<div class="msg-avatar" style="background:' + r.color + '22;color:' + r.color + '">' + r.emoji + '</div><div><div class="msg-name" style="color:' + r.color + '">' + r.name + ' · ' + r.title + '</div><div class="msg-bubble">' + formatText(text) + '</div>'
    + '<div class="msg-feedback">'
    + '<button onclick="submitFeedback(&apos;' + roleId + '&apos;,' + id + ',&apos;positive&apos;,this)" title="说得好">👍</button>'
    + '<button onclick="submitFeedback(&apos;' + roleId + '&apos;,' + id + ',&apos;negative&apos;,this)" title="不太行">👎</button>'
    + '</div></div>';
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  messageHistory.push({type:'ai', role:roleId, name:ROLES[roleId]?.name, text:text});
}

// 反馈存储
var feedbackMap = {};

function submitFeedback(roleId, msgId, type, btn) {
  // 防止重复反馈
  var key = roleId + '_' + msgId;
  if (feedbackMap[key]) return;
  feedbackMap[key] = type;

  // 更新按钮状态
  var parent = btn.parentElement;
  var buttons = parent.querySelectorAll('button');
  buttons.forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');

  // 发送反馈到服务器
  fetch('/room/' + ROOM_ID + '/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: roleId, msgId: msgId, type: type })
  }).catch(function(e) { console.error('Feedback error:', e); });
}

function renderSystemMessage(text) {
  var area = document.getElementById('chat-area');
  var msg = document.createElement('div');
  msg.className = 'msg system';
  msg.innerHTML = '<div class="msg-bubble">' + escapeHtml(text) + '</div>';
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  messageHistory.push({type:'system', text:text});
}

// ═══════════════════════════════════════════════════════════
// 9.5 FILE UPLOAD & SHARE
// ═══════════════════════════════════════════════════════════
function getFileIcon(fileName, fileType) {
  if (fileType && fileType.startsWith('image/')) return '🖼️';
  if (fileName.match(/\.pdf$/i)) return '📄';
  if (fileName.match(/\.(doc|docx)$/i)) return '📝';
  if (fileName.match(/\.(xls|xlsx|csv)$/i)) return '📊';
  if (fileName.match(/\.(ppt|pptx)$/i)) return '📽️';
  if (fileName.match(/\.(zip|rar|7z|tar|gz)$/i)) return '📦';
  if (fileName.match(/\.(js|ts|py|java|c|cpp|go|rs)$/i)) return '💻';
  if (fileName.match(/\.(html|css|xml|json|yaml|yml)$/i)) return '🔧';
  if (fileName.match(/\.(txt|md|log)$/i)) return '📃';
  if (fileName.match(/\.(mp3|wav|ogg|flac)$/i)) return '🎵';
  if (fileName.match(/\.(mp4|avi|mov|mkv)$/i)) return '🎬';
  return '📁';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderFileMessage(m, isMe) {
  var area = document.getElementById('chat-area');
  var msg = document.createElement('div');
  msg.className = isMe ? 'msg user' : 'msg';
  msg.setAttribute('data-msg-id', m.id);

  var nameHtml = '';
  if (m.name && m.name !== '用户') {
    nameHtml = '<div class="msg-name" style="color:' + (isMe ? MY_COLOR : 'var(--text2)') + '">' + escapeHtml(m.name) + '</div>';
  }

  var cardHtml = '<div class="file-card">';
  if (m.isImage && m.base64) {
    cardHtml += '<img class="file-img-preview" src="data:' + m.fileType + ';base64,' + m.base64 + '" alt="' + escapeHtml(m.fileName) + '" onclick="window.open(this.src)">';
  }
  cardHtml += '<div class="file-card-icon">' + getFileIcon(m.fileName, m.fileType) + '</div>';
  cardHtml += '<div class="file-card-name">' + escapeHtml(m.fileName) + '</div>';
  cardHtml += '<div class="file-card-size">' + formatFileSize(m.fileSize) + '</div>';

  // 下载按钮
  if (m.base64) {
    cardHtml += '<div class="file-card-actions">';
    cardHtml += '<button onclick="downloadFile(&apos;' + m.id + '&apos;)">⬇ 下载</button>';
    if (m.textContent !== null && m.textContent !== undefined) {
      cardHtml += '<button onclick="analyzeFile(&apos;' + m.id + '&apos;)" id="analyze-btn-' + m.id + '">🔍 AI分析</button>';
    }
    cardHtml += '</div>';
  }

  cardHtml += '</div>';
  msg.innerHTML = nameHtml + '<div class="msg-bubble file-msg">' + cardHtml + '</div>';
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
}

// 存储文件数据用于下载和分析
var fileStore = {};

function storeFileData(m) {
  fileStore[m.id] = m;
}

function downloadFile(msgId) {
  var f = fileStore[msgId];
  if (!f) return;
  var a = document.createElement('a');
  a.href = 'data:' + f.fileType + ';base64,' + f.base64;
  a.download = f.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function analyzeFile(msgId) {
  var f = fileStore[msgId];
  if (!f) return;
  var btn = document.getElementById('analyze-btn-' + msgId);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="file-analyzing">分析中</span>';
  }
  try {
    var resp = await fetchTimeout('/room/' + ROOM_ID + '/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: f.fileName, textContent: f.textContent })
    });
    var data = await resp.json();
    if (!data.ok) throw new Error(data.error || '分析失败');
    if (btn) { btn.textContent = '✅ 已分析'; btn.disabled = true; }
  } catch(e) {
    if (btn) { btn.textContent = '🔍 AI分析'; btn.disabled = false; }
    renderSystemMessage('⚠️ 文件分析失败: ' + e.message);
  }
}

async function handleFileUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  event.target.value = '';

  // 大小检查
  if (file.size > 5 * 1024 * 1024) {
    renderSystemMessage('⚠️ 文件大小不能超过 5MB');
    return;
  }

  // 显示上传中提示
  var uploadingId = 'uploading-' + Date.now();
  renderSystemMessage('📤 正在上传 ' + file.name + '...');

  try {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('name', myName || '用户');

    var resp = await fetchTimeout('/room/' + ROOM_ID + '/upload', {
      method: 'POST',
      body: formData
    });
    var data = await resp.json();
    if (!data.ok) throw new Error(data.error || '上传失败');

    // 移除上传中提示
    var hints = document.querySelectorAll('.msg.system');
    if (hints.length > 0) hints[hints.length - 1].remove();

    // 获取刚上传的文件消息
    var pollResp = await fetchTimeout('/room/' + ROOM_ID + '/poll?after=' + (data.id - 1));
    var pollData = await pollResp.json();
    if (pollData.messages) {
      for (var i = 0; i < pollData.messages.length; i++) {
        var m = pollData.messages[i];
        if (m.type === 'file') {
          storeFileData(m);
          renderFileMessage(m, true);
          lastMsgId = Math.max(lastMsgId, m.id || 0);
          displayedMsgIds[m.id] = true;
        }
      }
    }
  } catch(e) {
    var hints = document.querySelectorAll('.msg.system');
    if (hints.length > 0) hints[hints.length - 1].remove();
    renderSystemMessage('⚠️ 上传失败: ' + e.message);
  }
}

function showTyping(text) {
  var el = document.getElementById('typing-indicator');
  var st = document.getElementById('typing-status');
  el.classList.add('show');
  st.className = 'typing-status';
  st.textContent = text || '';
}
function hideTyping() {
  var el = document.getElementById('typing-indicator');
  var st = document.getElementById('typing-status');
  el.classList.remove('show');
  st.className = 'typing-status';
  st.textContent = '';
}
function flashStatus(text, type) {
  var st = document.getElementById('typing-status');
  st.className = 'typing-status ' + (type || '');
  st.textContent = text || '';
  if (!type) setTimeout(hideTyping, 2000);
}

// ═══════════════════════════════════════════════════════════
// 10. ROLES BAR & GUEST PANEL
// ═══════════════════════════════════════════════════════════
function getRandomRoles(count) {
  var others = Object.keys(ROLES).filter(function(k) { return k !== 'li'; });
  var shuffled = shuffle(others);
  return ['li'].concat(shuffled.slice(0, count - 1));
}

function renderRolesBar() {
  var bar = document.getElementById('roles-bar');
  if (!bar) return;
  bar.innerHTML = '';
  for (var i = 0; i < activeRoles.length; i++) {
    var id = activeRoles[i];
    var r = ROLES[id];
    if (!r) continue;
    var chip = document.createElement('div');
    chip.className = 'role-chip active';
    chip.setAttribute('data-role', id);
    chip.innerHTML = '<span class="dot" style="background:' + r.color + '"></span>' + r.name;
    chip.onclick = function(roleId, roleName) {
      return function() {
        insertAtMention(roleName);
        var el = document.querySelector('[data-role="' + roleId + '"]');
        if (el) { el.classList.add('at-mentioned'); setTimeout(function() { el.classList.remove('at-mentioned'); }, 600); }
      };
    }(id, r.name);
    bar.appendChild(chip);
  }
}

// 在输入框插入 @角色名
function insertAtMention(roleName) {
  var input = document.getElementById('user-input');
  if (!input) return;
  var start = input.selectionStart || 0;
  var end = input.selectionEnd || 0;
  var text = input.value;
  var mention = '@' + roleName + ' ';
  input.value = text.substring(0, start) + mention + text.substring(end);
  input.focus();
  var newPos = start + mention.length;
  input.setSelectionRange(newPos, newPos);
}

// 双击头像：直接发送 @邀请消息
async function quickAtRole(roleId, roleName) {
  var input = document.getElementById('user-input');
  var text = input.value.trim();
  var atText = '@' + roleName + (text ? ' ' + text : ' 你觉得呢？');
  input.value = '';
  // 显示在聊天中
  var msg = { type: 'user', text: atText, name: myName || '用户' };
  renderUserMessage(atText, msg.name, true);
  await sendToServer(msg);
  // 触发 AI 回复
  isProcessing = true;
  document.getElementById('send-btn').disabled = true;
  showTyping(ROLES[roleId].name + ' 正在思考...');
  try {
    await Promise.race([scheduleResponse(atText), new Promise(function(_,r){setTimeout(function(){r(new Error('超时'))},30000)})]);
  } catch(e) {
    console.error(e);
  }
  isProcessing = false;
  document.getElementById('send-btn').disabled = false;
  hideTyping();
}

function renderRoleSelectPanel() {
  var grid = document.getElementById('role-select-grid');
  if (!grid) return;
  grid.innerHTML = '';
  var keys = Object.keys(ROLES);
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var r = ROLES[id];
    var isSelected = activeRoles.indexOf(id) >= 0;
    var isLocked = id === 'li';
    var item = document.createElement('div');
    item.className = 'role-select-item' + (isSelected ? ' selected' : '') + (isLocked ? ' locked' : '');
    item.setAttribute('data-role', id);
    item.innerHTML = '<span class="rs-emoji">' + r.emoji + '</span><div class="rs-info"><div class="rs-name">' + r.name + '</div><div class="rs-title">' + r.title + '</div></div>' + (isSelected ? '<span class="rs-check">✓</span>' : '');
    if (!isLocked) {
      (function(roleId) {
        item.onclick = function() { toggleRole(roleId); };
      })(id);
    }
    grid.appendChild(item);
  }
  updateRoleSelectHint();
}

function updateRoleSelectHint() {
  var hint = document.getElementById('role-select-hint');
  if (hint) hint.textContent = '已选 ' + activeRoles.length + ' 个角色';
}

function toggleRole(roleId) {
  if (roleId === 'li') return;
  var idx = activeRoles.indexOf(roleId);
  if (idx >= 0) {
    if (activeRoles.length <= MIN_ROLES) return;
    activeRoles.splice(idx, 1);
  } else {
    if (activeRoles.length >= MAX_ROLES) return;
    activeRoles.push(roleId);
  }
  renderRoleSelectPanel();
}

function toggleGuestPanel() {
  var panel = document.getElementById('guest-panel');
  panel.classList.toggle('show');
  if (panel.classList.contains('show')) renderGuestPanel();
}

function renderGuestPanel() {
  var body = document.getElementById('guest-panel-body');
  if (!body) return;
  var html = '';
  var keys = Object.keys(ROLES);
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var r = ROLES[id];
    var inRoom = activeRoles.indexOf(id) >= 0;
    html += '<div class="guest-item' + (inRoom ? ' in-room' : '') + '" onclick="toggleGuest(&apos;' + id + '&apos;)">';
    html += '<span class="gi-emoji">' + r.emoji + '</span>';
    html += '<div class="gi-info"><div class="gi-name">' + r.name + '</div><div class="gi-title">' + r.title + '</div></div>';
    html += (inRoom ? '<span class="gi-check">✓</span>' : '');
    html += '</div>';
  }
  body.innerHTML = html;
}

function toggleGuest(roleId) {
  if (roleId === 'li') return;
  var idx = activeRoles.indexOf(roleId);
  if (idx >= 0) {
    if (activeRoles.length <= MIN_ROLES) return;
    activeRoles.splice(idx, 1);
    renderSystemMessage(ROLES[roleId].name + ' 离开了聊天');
  } else {
    if (activeRoles.length >= MAX_ROLES) return;
    activeRoles.push(roleId);
    renderSystemMessage(ROLES[roleId].name + ' 加入了聊天');
  }
  renderRolesBar();
  renderGuestPanel();
}

// ═══════════════════════════════════════════════════════════
// 11. SERVER COMMUNICATION
// ═══════════════════════════════════════════════════════════
async function sendToServer(msg) {
  msg.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  try {
    await fetchTimeout('/room/' + ROOM_ID + '/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
  } catch(e) {
    console.error('Send error:', e);
    return false;
  }
  return msg.id;
}

async function callAI(roleId, prompt, systemPrompt) {
  var resp = await fetchTimeout('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: roleId, system: systemPrompt || '你是' + (ROLES[roleId]?.name || roleId) + '。用中文回复。', prompt: prompt })
  }, 30000);
  if (!resp.ok) { var e = await resp.text(); throw new Error('AI错误 ' + resp.status + ': ' + e); }
  var data = await resp.json();
  return data.content;
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function startPolling() {
  stopPolling();
  pollInterval = 2000;
  emptyPollCount = 0;
  pollTimer = setInterval(pollMessages, pollInterval);
  pollMessages();
}

// 页面可见性检测
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    stopPolling();
  } else {
    startPolling();
  }
});

async function pollMessages() {
  try {
    var newMsgCount = 0;
    var resp = await fetchTimeout('/room/' + ROOM_ID + '/poll?after=' + lastMsgId);
    var data = await resp.json();

    if (data.messages && data.messages.length > 0) {
      for (var i = 0; i < data.messages.length; i++) {
        var m = data.messages[i];
        lastMsgId = Math.max(lastMsgId, m.id || 0);
        if (displayedMsgIds[m.id]) continue;
        displayedMsgIds[m.id] = true;
        if (m.type === 'user') {
          if (m.name !== myName) {
            renderUserMessage(m.text, m.name, false);
            newMsgCount++;
            // 其他用户消息也触发 AI（带防抖）
            if (!window._otherUserTimer) {
              window._otherUserTimer = setTimeout(function() {
                window._otherUserTimer = null;
                if (!isProcessing) {
                  isProcessing = true;
                  document.getElementById('send-btn').disabled = true;
                  showTyping(ROLES[m.role].name + ' 正在回复...');
                  Promise.race([scheduleResponse(m.text), new Promise(function(_,r){setTimeout(function(){r(new Error('超时'))},30000)})]).then(function() {
                    isProcessing = false;
                    document.getElementById('send-btn').disabled = false;
                    hideTyping();
                  }).catch(function() {
                    isProcessing = false;
                    document.getElementById('send-btn').disabled = false;
                    hideTyping();
                  });
                }
              }, 2000);
            }
          }
        } else if (m.type === 'ai') {
          renderAIMessage(m.role, m.text, m.id);
          newMsgCount++;
        } else if (m.type === 'system') {
          renderSystemMessage(m.text);
          newMsgCount++;
        } else if (m.type === 'file') {
          storeFileData(m);
          renderFileMessage(m, m.name === myName);
          newMsgCount++;
        }
      }
    }

    if (data.members) {
      document.getElementById('members-count').textContent = data.members.length + '人';
    }

    // 空轮询退避
    if (newMsgCount === 0) {
      emptyPollCount++;
      if (emptyPollCount > 3 && pollInterval < 8000) {
        pollInterval = Math.min(pollInterval + 1000, 8000);
        stopPolling();
        pollTimer = setInterval(pollMessages, pollInterval);
      }
    } else {
      emptyPollCount = 0;
      if (pollInterval > 2000) {
        pollInterval = 2000;
        stopPolling();
        pollTimer = setInterval(pollMessages, pollInterval);
      }
    }
  } catch(e) {
    console.error('Poll error:', e);
    // 显示断连提示（只显示一次）
    if (!document.getElementById('conn-warning')) {
      var warn = document.createElement('div');
      warn.id = 'conn-warning';
      warn.style.cssText = 'text-align:center;padding:8px;color:#f87171;font-size:12px';
      warn.textContent = '⚠️ 连接不稳定，正在重连...';
      document.getElementById('chat-area').appendChild(warn);
      setTimeout(function() { if (warn.parentNode) warn.parentNode.removeChild(warn); }, 5000);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 12. JOIN & INIT
// ═══════════════════════════════════════════════════════════
function showJoinDialog() {
  if (activeRoles.length <= 1) {
    activeRoles = getRandomRoles(DEFAULT_ROLE_COUNT);
  }
  renderRoleSelectPanel();
  document.getElementById('join-overlay').style.display = 'flex';
  document.getElementById('join-name').focus();
}

async function doJoin() {
  var name = document.getElementById('join-name').value.trim();
  if (!name) return;
  myName = name;
  document.getElementById('join-overlay').style.display = 'none';
  renderRolesBar();

  try {
    var resp = await fetchTimeout('/room/' + ROOM_ID + '/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, color: MY_COLOR, activeRoles: activeRoles })
    });
    var data = await resp.json();
    if (data.roomData) {
      loadRoomData(data.roomData);
    }
  } catch(e) {
    console.error('Join failed:', e);
  }

  startPolling();
}

function loadRoomData(data) {
  var area = document.getElementById('chat-area');
  area.innerHTML = '';

  if (data.messages && data.messages.length > 0) {
    for (var i = 0; i < data.messages.length; i++) {
      var m = data.messages[i];
      if (m.type === 'user') {
        renderUserMessage(m.text, m.name || '用户', m.name === myName);
      } else if (m.type === 'ai') {
        renderAIMessage(m.role, m.text, m.id);
      } else if (m.type === 'system') {
        renderSystemMessage(m.text);
      }
      lastMsgId = Math.max(lastMsgId, m.id || 0);
    }
  }

  if (data.activeRoles && data.activeRoles.length > 0) {
    activeRoles = data.activeRoles;
    renderRolesBar();
  }

  if (data.members) {
    document.getElementById('members-count').textContent = data.members.length + '人';
  }
}

// ═══════════════════════════════════════════════════════════
// 13. USER ACTIONS
// ═══════════════════════════════════════════════════════════
async function sendMessage() {
  var input = document.getElementById('user-input');
  var text = input.value.trim();
  if (!text) return;
  if (isProcessing) { console.log('[sendMessage] isProcessing=true, skipping'); return; }
  if (text.length > 500) {
    text = text.substring(0, 500);
    // 显示提示
    var hint = document.createElement('div');
    hint.className = 'msg system';
    hint.textContent = '⚠️ 消息过长，已截取前500字';
    document.getElementById('chat-area').appendChild(hint);
  }
  input.value = '';

  var msg = { type: 'user', text: text, name: myName || '用户' };
  renderUserMessage(text, msg.name, true);
  await sendToServer(msg);

  isProcessing = true;
  document.getElementById('send-btn').disabled = true;
  showTyping('正在唤醒角色...');
  try {
    await Promise.race([
      scheduleResponse(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI 响应超时')), 30000))
    ]);
  } catch(e) {
    console.error(e);
    var hint = e.message || '未知错误';
    if (hint.indexOf('Failed to fetch') >= 0 || hint.indexOf('NetworkError') >= 0) hint = '网络连接失败，请稍后重试。';
    showTyping('❌ ' + hint);
    await sendToServer({ type: 'ai', role: 'li', text: '出了点问题 😅\\n\\n' + hint });
  } finally {
    isProcessing = false;
    document.getElementById('send-btn').disabled = false;
    hideTyping();
  }
}

function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

// ═══════════════════════════════════════════════════════════
// 14. REQUIREMENT PANEL
// ═══════════════════════════════════════════════════════════
function showRequirementPanel() {
  var overlay = document.getElementById('req-overlay');
  overlay.classList.add('show');
  renderRequirementPanel();
}

function closeReqPanel(e) {
  if (e && e.target !== document.getElementById('req-overlay')) return;
  document.getElementById('req-overlay').classList.remove('show');
}

function renderRequirementPanel() {
  var body = document.getElementById('req-panel-body');
  var data = userProfile.collectedData;

  if (data.length === 0) {
    body.innerHTML = '<div class="req-empty">还没有收集到需求数据\\n多聊几句，数据会自动收集哦~</div>';
    return;
  }

  // Group by type
  var groups = {};
  var typeLabels = {
    feature: '💡 功能需求',
    pain_point: '😤 用户痛点',
    user_story: '📖 使用场景',
    constraint: '⚠️ 约束条件',
    goal: '🎯 目标愿景',
    market: '🔍 市场参考',
    target_user: '👥 目标用户'
  };
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    if (!groups[d.type]) groups[d.type] = [];
    groups[d.type].push(d);
  }

  var html = '';
  for (var type in groups) {
    html += '<div class="req-category">';
    html += '<div class="req-category-title">' + (typeLabels[type] || type) + ' (' + groups[type].length + ')</div>';
    for (var j = 0; j < groups[type].length; j++) {
      html += '<div class="req-item">' + escapeHtml(groups[type][j].content) + '</div>';
    }
    html += '</div>';
  }

  html += '<div style="text-align:center;padding:12px 0">';
  html += '<button class="topbar-btn" style="display:inline-flex;padding:10px 20px;font-size:13px" onclick="generateAndShowDoc()">📄 生成需求文档</button>';
  html += '</div>';
  html += '<div class="req-doc-area" id="req-doc-area"></div>';

  body.innerHTML = html;
}

async function generateAndShowDoc() {
  var docArea = document.getElementById('req-doc-area');
  if (!docArea) return;
  docArea.classList.add('show');
  docArea.innerHTML = '<div class="req-generating"><div class="spinner"></div><div>正在整理需求文档...</div></div>';

  try {
    var doc = await generateRequirementDoc();
    docArea.innerHTML = formatText(doc);
  } catch(e) {
    docArea.innerHTML = '生成失败：' + escapeHtml(e.message);
  }
}

// ═══════════════════════════════════════════════════════════
// 15. EXPORT & INVITE
// ═══════════════════════════════════════════════════════════
async function exportDoc() {
  var docArea = document.getElementById('req-doc-area');
  if (docArea && docArea.classList.contains('show') && docArea.textContent.indexOf('生成失败') < 0 && docArea.textContent.length > 50) {
    downloadText('需求文档_' + ROOM_ID + '_' + new Date().toLocaleDateString() + '.md', docArea.textContent);
    return;
  }

  // Generate on the fly
  var btn = document.querySelector('[onclick="exportDoc()"]');
  if (btn) { btn.textContent = '⏳ 生成中...'; btn.disabled = true; }
  try {
    var doc = await generateRequirementDoc();
    downloadText('需求文档_' + ROOM_ID + '_' + new Date().toLocaleDateString() + '.md', doc);
  } catch(e) {
    alert('生成文档失败：' + e.message);
  }
  if (btn) { btn.textContent = '📄 导出文档'; btn.disabled = false; }
}

function downloadText(filename, text) {
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toggleMoreMenu() {
  var menu = document.getElementById('more-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
function showStyleSwitch() {
  toggleStyleDropdown();
}
// 点击其他地方关闭菜单
document.addEventListener('click', function(e) {
  var menu = document.getElementById('more-menu');
  if (menu && !e.target.closest('#more-menu') && !e.target.closest('[onclick*="toggleMoreMenu"]')) {
    menu.style.display = 'none';
  }
});

function showRenameDialog() {
  var overlay = document.getElementById('join-overlay');
  document.getElementById('join-name').value = myName || '';
  document.getElementById('join-title').textContent = '修改昵称';
  document.getElementById('join-btn').textContent = '确认修改';
  document.getElementById('join-btn').setAttribute('onclick', 'doRename()');
  overlay.style.display = 'flex';
  document.getElementById('join-name').focus();
  document.getElementById('join-name').select();
}

async function doRename() {
  var name = document.getElementById('join-name').value.trim();
  if (!name) return;
  var oldName = myName;
  myName = name;
  localStorage.setItem('discussion_room_name', myName);
  document.getElementById('join-overlay').style.display = 'none';
  // 恢复 join 按钮的原始行为
  document.getElementById('join-title').textContent = '加入茶话会';
  document.getElementById('join-btn').textContent = '加入';
  document.getElementById('join-btn').setAttribute('onclick', 'doJoin()');
  // 通知房间
  if (oldName && oldName !== name) {
    await sendToServer({ type: 'system', text: oldName + ' 改名为 ' + name });
  }
}

function showInvite() {
  var link = window.location.origin + '/room/' + ROOM_ID;
  document.getElementById('invite-link').textContent = link;
  document.getElementById('invite-overlay').style.display = 'flex';
}

function copyLink() {
  var link = window.location.origin + '/room/' + ROOM_ID;
  navigator.clipboard.writeText(link).then(function() {
    document.querySelector('.copy-hint').textContent = '已复制！发给朋友吧';
    setTimeout(function() { document.querySelector('.copy-hint').textContent = '点击链接复制'; }, 2000);
  }).catch(function() {
    var ta = document.createElement('textarea');
    ta.value = link;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    document.querySelector('.copy-hint').textContent = '已复制！';
  });
}

function closeInvite() { document.getElementById('invite-overlay').style.display = 'none'; }

// ═══════════════════════════════════════════════════════════
// 16. INIT
// ═══════════════════════════════════════════════════════════

// ─── 进化面板 ───
var evoPanelOpen = false;
var evoLogCount = 0;

function toggleEvoPanel() {
  evoPanelOpen = !evoPanelOpen;
  var panel = document.getElementById('evo-panel');
  if (evoPanelOpen) {
    panel.classList.add('open');
    refreshEvoPanel();
  } else {
    panel.classList.remove('open');
  }
}

async function refreshEvoPanel() {
  try {
    var resp = await fetchTimeout('/room/' + ROOM_ID + '/evolution');
    var data = await resp.json();
    renderEvoPanel(data);
  } catch(e) { console.error('Evo panel error:', e); }
}

function renderEvoPanel(data) {
  var body = document.getElementById('evo-body');
  if (!data.profiles || data.profiles.length === 0) {
    body.innerHTML = '<div style="text-align:center;color:var(--text2);padding:20px;font-size:13px">暂无进化数据<br><span style="font-size:11px">角色发言3次后开始评分</span></div>';
    return;
  }

  var html = '';

  // 角色评分卡片
  for (var i = 0; i < data.profiles.length; i++) {
    var p = data.profiles[i];
    var score = p.baseline || 0;
    var color = score >= 70 ? '#34d399' : (score >= 40 ? '#fbbf24' : '#f87171');
    html += '<div class="evo-role">'
      + '<div class="evo-role-header">'
      + '<span class="evo-role-name">' + (p.emoji || '') + ' ' + escapeHtml(p.name) + '</span>'
      + '<span><span class="evo-role-score" style="color:' + color + '">' + score + '分</span>'
      + '<span class="evo-role-ver">v' + (p.version || '1.0.0') + '</span></span>'
      + '</div>'
      + '<div class="evo-bar"><div class="evo-bar-fill" style="width:' + score + '%;background:' + color + '"></div></div>';

    // 8维小条
    if (p.scores) {
      var dims = {quality:'创意',consistency:'一致性',thoroughness:'全面性',actionability:'执行力',engagement:'互动',clarity:'清晰度',rhythm:'节奏',teamwork:'协作'};
      var maxs = {quality:15,consistency:10,thoroughness:10,actionability:10,engagement:10,clarity:10,rhythm:5,teamwork:5};
      for (var dim in dims) {
        var s = p.scores[dim] || 0;
        var m = maxs[dim];
        var pct = Math.round((s / m) * 100);
        html += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">'
          + '<span style="font-size:10px;color:var(--text2);width:36px;flex-shrink:0">' + dims[dim] + '</span>'
          + '<div class="evo-bar" style="flex:1"><div class="evo-bar-fill" style="width:' + pct + '%;background:var(--text2);opacity:0.6"></div></div>'
          + '<span style="font-size:9px;color:var(--text2);width:20px;text-align:right">' + s + '/' + m + '</span>'
          + '</div>';
      }
    }
    html += '</div>';
  }

  // 进化日志
  if (data.recentLogs && data.recentLogs.length > 0) {
    html += '<div class="evo-log"><div class="evo-log-title">📋 最近进化记录</div>';
    for (var j = 0; j < data.recentLogs.length; j++) {
      var log = data.recentLogs[j];
      var typeLabel = log.type === 'evolve' ? '进化' : (log.type === 'improve' ? '改进' : '回滚');
      var time = new Date(log.timestamp).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
      html += '<div class="evo-log-item">'
        + '<span class="evo-log-type ' + log.type + '">' + typeLabel + '</span>'
        + '<span style="flex:1">' + escapeHtml(log.change) + '</span>'
        + '<span style="font-size:9px;color:var(--text2);flex-shrink:0">' + time + '</span>'
        + '</div>';
    }
    html += '</div>';
  }

  // Top基因
  if (data.geneTop && data.geneTop.length > 0) {
    html += '<div class="evo-log"><div class="evo-log-title">🏆 高权重基因</div>';
    for (var k = 0; k < Math.min(5, data.geneTop.length); k++) {
      var g = data.geneTop[k];
      html += '<div class="evo-log-item">'
        + '<span style="font-size:11px">' + escapeHtml(g.gene) + '</span>'
        + '<span style="font-size:11px;color:var(--accent);font-weight:600">+' + g.score.toFixed(1) + '</span>'
        + '</div>';
    }
    html += '</div>';
  }

  body.innerHTML = html;

  // 更新badge
  var badge = document.getElementById('evo-badge');
  if (data.recentLogs && data.recentLogs.length > 0) {
    var newCount = data.recentLogs.length;
    if (newCount > evoLogCount) {
      badge.style.display = 'flex';
      badge.textContent = newCount - evoLogCount;
    }
  }
  evoLogCount = data.recentLogs.length;
}

async function init() {
  // 生成随机角色
  initRandomRoles();
  
  // Init style
  setStyle('teahouse');
  renderStyleDropdown();

  // Check saved name
  var savedName = localStorage.getItem('discussion_room_name');
  if (savedName) myName = savedName;

  // Load room data
  try {
    var resp = await fetchTimeout('/room/' + ROOM_ID + '/info');
    var data = await resp.json();

    if (data.members && data.members.length > 0 && !data.members.find(function(m) { return m.name === myName; })) {
      if (myName) {
        if (data.activeRoles && data.activeRoles.length > 0) activeRoles = data.activeRoles;
        await fetchTimeout('/room/' + ROOM_ID + '/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: myName, color: MY_COLOR, activeRoles: activeRoles })
        }).then(function(r) { return r.json(); }).then(function(d) {
          if (d.roomData) loadRoomData(d.roomData);
        });
        renderRolesBar();
        startPolling();
      } else {
        if (data.activeRoles && data.activeRoles.length > 0) activeRoles = data.activeRoles;
        showJoinDialog();
      }
    } else if (data.messages && data.messages.length > 0) {
      loadRoomData(data);
      if (myName) {
        await fetchTimeout('/room/' + ROOM_ID + '/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: myName, color: MY_COLOR, activeRoles: activeRoles })
        });
      }
      startPolling();
    } else {
      // Empty room - start fresh
      activeRoles = getRandomRoles(DEFAULT_ROLE_COUNT);
      renderRolesBar();
      setTimeout(async function() {
        var welcome = '来啦！有什么想法尽管说，不用想好再说。\\n\\n哪怕只是一句"我想做个XX"或者"最近有个烦心事"，都能聊起来~';
        await sendToServer({ type: 'ai', role: 'li', text: welcome });
      }, 300);

      if (myName) {
        await fetchTimeout('/room/' + ROOM_ID + '/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: myName, color: MY_COLOR, activeRoles: activeRoles })
        });
      } else {
        showJoinDialog();
      }
      startPolling();
    }
  } catch(e) {
    console.error('Init failed:', e);
    activeRoles = getRandomRoles(DEFAULT_ROLE_COUNT);
    renderRolesBar();
    setTimeout(async function() {
      var welcome = '来啦！有什么想法尽管说，不用想好再说。\\n\\n哪怕只是一句"我想做个XX"或者"最近有个烦心事"，都能聊起来~';
      await sendToServer({ type: 'ai', role: 'li', text: welcome });
    }, 300);
    showJoinDialog();
    startPolling();
  }

  // Save name on join
  var origJoin = window.doJoin;
  window.doJoin = async function() {
    await origJoin();
    if (myName) localStorage.setItem('discussion_room_name', myName);
  };
}

init();
</script>
<button class="evo-toggle" onclick="toggleEvoPanel()" title="进化日志">🧬<span class="evo-badge" id="evo-badge" style="display:none">0</span></button>
<div class="evo-panel" id="evo-panel">
  <div class="evo-header">🧬 进化日志<button onclick="toggleEvoPanel()">✕</button></div>
  <div class="evo-body" id="evo-body"><div style="text-align:center;color:var(--text2);padding:20px;font-size:13px">暂无进化数据<br><span style="font-size:11px">角色发言3次后开始评分</span></div></div>
</div>
</body>
</html>`;
}

// ─── 内存存储（替代 Durable Objects）────────────────────────
const rooms = new Map();

function getRoomData(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { phase: 0, messages: [], members: [], createdAt: Date.now() });
  }
  return rooms.get(roomId);
}

// ─── Hono 应用 ─────────────────────────────────────────────
const app = new Hono();

// CORS
app.use('*', cors());

// 健康检查
app.get('/ping', (c) => c.text('pong'));

// 创建新房间
app.get('/new', (c) => {
  const id = Math.random().toString(36).substring(2, 8);
  return c.redirect('/room/' + id);
});

// 房间 API 路由
app.get('/room/:roomId/info', (c) => {
  const roomId = c.req.param('roomId');
  const data = getRoomData(roomId);
  return c.json(data);
});

app.post('/room/:roomId/send', async (c) => {
  const roomId = c.req.param('roomId');
  const msg = await c.req.json();
  const data = getRoomData(roomId);
  data.messages.push(msg);
  if (data.messages.length > 200) data.messages = data.messages.slice(-200);
  return c.json({ ok: true });
});

app.post('/room/:roomId/update', async (c) => {
  const roomId = c.req.param('roomId');
  const updates = await c.req.json();
  const data = getRoomData(roomId);
  Object.assign(data, updates);
  return c.json({ ok: true });
});

app.post('/room/:roomId/join', async (c) => {
  const roomId = c.req.param('roomId');
  const { name, color, activeRoles } = await c.req.json();
  const data = getRoomData(roomId);
  if (!data.members.find(m => m.name === name)) {
    data.members.push({ name, color: color || '#ff6b35', joinedAt: Date.now() });
    data.messages.push({ id: Date.now(), type: 'system', text: `${name} 加入了讨论室 👋` });
  }
  if (activeRoles && Array.isArray(activeRoles) && activeRoles.length > 0) {
    data.activeRoles = activeRoles;
  }
  return c.json({ ok: true, roomData: data });
});

app.get('/room/:roomId/poll', (c) => {
  const roomId = c.req.param('roomId');
  const afterId = parseInt(c.req.query('after') || '0');
  const data = getRoomData(roomId);
  const newMessages = data.messages.filter(m => (m.id || 0) > afterId);
  return c.json({ messages: newMessages, phase: data.phase, members: data.members });
});

// 文件上传 API（支持图片、PDF、文本等）
app.post('/room/:roomId/upload', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const data = getRoomData(roomId);
    const formData = await c.req.formData();
    const file = formData.get('file');
    if (!file) return c.json({ error: '没有文件' }, 400);

    const fileName = file.name || 'unknown';
    const fileType = file.type || 'application/octet-stream';
    const fileSize = file.size || 0;

    // 限制文件大小 5MB
    if (fileSize > 5 * 1024 * 1024) {
      return c.json({ error: '文件大小不能超过 5MB' }, 400);
    }

    // 读取文件内容为 base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // 判断文件类型
    const isImage = fileType.startsWith('image/');
    const isText = fileType.startsWith('text/') || fileName.match(/\.(txt|md|csv|json|js|py|html|css|xml|yaml|yml|log|ini|cfg|sh|bat)$/i);
    const isPdf = fileType === 'application/pdf';

    let textContent = null;
    // 提取文本内容用于 AI 分析
    if (isText) {
      textContent = new TextDecoder('utf-8').decode(new Uint8Array(buffer));
      if (textContent.length > 10000) textContent = textContent.substring(0, 10000);
    } else if (isPdf) {
      textContent = '[PDF 文件，内容需要 AI 解析]';
    }

    const fileMsg = {
      id: Date.now(),
      type: 'file',
      name: formData.get('name') || '用户',
      fileName: fileName,
      fileType: fileType,
      fileSize: fileSize,
      isImage: isImage,
      base64: base64,
      textContent: textContent
    };

    data.messages.push(fileMsg);
    if (data.messages.length > 200) data.messages = data.messages.slice(-200);

    return c.json({ ok: true, id: fileMsg.id });
  } catch (e) {
    console.error('Upload error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// 进化日志 API
app.get('/room/:roomId/evolution', (c) => {
  const roomId = c.req.param('roomId');
  return c.json(darwin.getSummary());
});

// 显式反馈 API（精准归因到单个角色）
app.post('/room/:roomId/feedback', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const { role, msgId, type } = await c.req.json();
    if (!role || !type) return c.json({ error: '缺少参数' }, 400);
    if (type !== 'positive' && type !== 'negative') return c.json({ error: '无效反馈类型' }, 400);

    // 精准归因：只调整被反馈角色的基因权重
    geneEvolution.recordFeedback(role, type);

    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// AI 分析文件 API
app.post('/room/:roomId/analyze', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const { fileName, textContent } = await c.req.json();

    if (!API_KEY) {
      return c.json({ error: 'AI 未配置' }, 500);
    }

    const prompt = textContent
      ? '请分析以下文件内容，用中文给出简洁的总结（包括要点、关键信息、建议）：\n\n文件名：' + fileName + '\n\n内容：\n' + textContent
      : '请分析文件 "' + fileName + '"，给出你的看法和建议。';

    const response = await fetch(API_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: '你是一个专业的文件分析助手。请用中文回复，给出简洁有力的分析。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
      }),
    });

    if (!response.ok) throw new Error('AI 请求失败: ' + response.status);
    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || '分析失败';

    // 把分析结果作为 AI 消息发送到房间
    const data = getRoomData(roomId);
    data.messages.push({
      id: Date.now(),
      type: 'ai',
      role: 'li',
      text: '📎 文件分析：' + fileName + '\n\n' + analysis
    });

    return c.json({ ok: true, analysis: analysis });
  } catch (e) {
    console.error('Analyze error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// 房间首页
app.get('/room/:roomId', (c) => {
  const roomId = c.req.param('roomId');
  return c.html(getHTML(roomId), 200, { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' });
});

// AI 聊天 API（OpenAI 兼容格式）
app.post('/api/chat', async (c) => {
  try {
    const { role, system, prompt } = await c.req.json();

    if (!API_KEY) {
      return c.json({ error: 'AI 未配置，请设置 API_KEY 环境变量' }, 500);
    }

    const response = await fetch(API_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
      }),
    });

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    // 清理 <think...</think 标签（推理模型）
    const cleaned = content.replace(/[\s\S]*?<\/think>\s*/g, '').trim();
    content = cleaned || content;

    return c.json({ content });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 首页重定向
app.get('/', (c) => c.redirect('/new'));

export default app;

// Node.js 环境下启动 HTTP 服务（Sealos / 本地开发）
if (typeof process !== 'undefined' && process.versions?.node) {
  const port = parseInt(process.env.PORT || '8080');
  console.log('🚀 创意孵化机启动中... 端口: ' + port);
  serve({ fetch: app.fetch, port: port, hostname: '0.0.0.0' });
  console.log('✅ 创意孵化机已启动，监听端口: ' + port);
}



