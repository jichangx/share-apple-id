/**
 * 每日生成 README.md
 * - 数据源 accounts.json 含明文账号,已被 .gitignore,不进公开仓库。
 * - README 只做「打码展示 + 引导回主站」,不公开完整账号密码(保护主站 2 分钟门槛)。
 * - CI 里通过环境变量 ACCOUNTS_JSON(私密注入的 JSON 字符串)提供数据;本地回退读 accounts.json。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.jichangcha.com';
const SHARE_PAGE = `${SITE}/share-id/`;

// 读取数据:优先环境变量(CI 私密注入),否则本地 accounts.json,再否则内置占位
function loadData() {
  if (process.env.ACCOUNTS_JSON) {
    try {
      return JSON.parse(process.env.ACCOUNTS_JSON);
    } catch {
      console.warn('ACCOUNTS_JSON 解析失败,回退本地文件');
    }
  }
  const f = join(ROOT, 'accounts.json');
  if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8'));
  return {
    startDate: '2025-03-08',
    today: { region: '美国区 🇺🇸', account: 'example@icloud.com', password: '••••••', status: '待更新' },
    pool: [],
  };
}

// 打码:账号保留前 3 位 + 邮箱后缀;密码全部隐藏
const maskAccount = (s) => s.replace(/^(.{3}).*(@.+)$/, (_m, a, b) => `${a}••••••••${b}`);
const MASK_PW = '••••••••';

const data = loadData();
const now = new Date();
const days = Math.max(1, Math.floor((now - new Date(data.startDate)) / 86400000));
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const total = 1 + (data.pool?.length ?? 0);

const enc = (s) => encodeURIComponent(s);

const poolRows = (data.pool ?? [])
  .map((s) => `| ${s.region} | \`${maskAccount(s.account)}\` | \`${MASK_PW}\` | ${s.status} |`)
  .join('\n');

const readme = `# 每日共享 Apple ID · Shared Apple ID(每天 0:00 自动更新)

![更新日期](https://img.shields.io/badge/更新-${dateStr}-fbbf24) ![账号数](https://img.shields.io/badge/今日共享账号-${enc(`${total} 个`)}-f59e0b) ![稳定运行](https://img.shields.io/badge/${enc('已稳定运行')}-${days}%20${enc('天')}-fbbf24) [![主站](https://img.shields.io/badge/${enc('完整账号')}-jichangcha.com-00e676)](${SHARE_PAGE}) [![Telegram](https://img.shields.io/badge/Telegram-%40jichangcha-26A5E4?logo=telegram&logoColor=white)](https://t.me/jichangcha)

> 🍎 **${dateStr} 已更新 · 今日 ${total} 个共享账号 · 已稳定运行 ${days} 天**
> 用于在被锁区(如中国区)App Store **免费下载小火箭 Shadowrocket、Quantumult X** 等被下架应用。
> 📣 账号池更新提醒,TG 频道每早 8 点自动推送:**[@jichangcha](https://t.me/jichangcha)**

---

## ⚠️ 使用前必读(重要)

- 共享账号是**多人公用**,随时可能被改密或锁定,**仅用于下载 App,别做其它用途**
- **防锁机**:只在「App Store」里登录下载,**切勿在「设置 → 顶部 Apple ID」整机登录**(整机登录才可能被远程锁定/抹除)
- **用完退出**:下载完立即在 App Store 退回自己的 ID;已装好的 App 照常使用,不受影响

## 🍎 今日推荐账号

| 地区 | 账号 | 密码 | 状态 |
| ---- | ---- | ---- | ---- |
| ${data.today.region} | \`${maskAccount(data.today.account)}\` | \`${MASK_PW}\` | ${data.today.status} |

> 🔑 **完整账号密码在主站获取**(本仓库仅作防丢备用入口,不公开明文账号,避免被爬虫滥用、加速封号):
> 👉 **[${SHARE_PAGE}](${SHARE_PAGE})** —— 打开页面即可复制当日可用账号密码。

## 🚀 三步使用

1. **登录苹果商店**:打开「App Store」→ 点右上角头像 → 退出当前 ID → 填入共享账号密码登录。⚠️ 只在 App Store 登录,不要在「设置」里登
2. **下载软件**:搜索并下载小火箭 Shadowrocket / Quantumult X 等客户端,提示要验证码就换个账号
3. **退出账号**:下载完立即退回自己的 Apple ID,已装好的 App 照常打开使用

图文教程:[小火箭配置](${SITE}/blog/shadowrocket-jichang-tuijian/) · [每日免费节点](${SITE}/free-node/)

## 📦 备用账号池

今日推荐账号登不上、被占用或提示验证时,从备用账号里挑一个(完整密码同样在主站获取):

| 地区 | 账号 | 密码 | 状态 |
| ---- | ---- | ---- | ---- |
${poolRows || '| —— | 更多账号见主站 | —— | —— |'}

## 💡 下载好客户端,还差一个稳定机场

小火箭只是客户端「空壳」,还需要节点/机场才能上网。

| 对比项 | 免费节点 | 星岛梦机场 |
| ---- | ---- | ---- |
| 晚高峰速度 | 慢 · 时常卡顿 | 企业级专线满速不掉档 |
| 稳定性 | 几小时~几天就失效 | 六年老牌,故障有客服 |
| 流媒体/AI | 基本不解锁 | Netflix / ChatGPT 全解锁 |
| 价格 | 免费 | 8 元/月起(码 nmw888) |

👉 **[前往星岛梦官网(优惠码 nmw888)](${SITE}/go/xingdaomeng/)** | [看完整测评](${SITE}/brands/xingdaomeng/)

## 🔗 更多内容

- 🏠 [机场查主站](${SITE}/) —— 16 家机场横向对比 · 189 题长尾问题库 · 图文教程
- 📱 [每日共享 Apple ID(完整账号)](${SHARE_PAGE})
- 🆓 [每日免费节点](${SITE}/free-node/) —— 每天自动更新的免费订阅
- 🏆 [2026 机场推荐排行榜](https://github.com/jichangx/2026-jichangcha-tuijian) —— 全部机场总榜
- 💬 Telegram:[@wanzuanjiedian](https://t.me/wanzuanjiedian)

## 📌 声明

- 共享账号来自公开网络聚合,本仓库仅做聚合展示与备用入口,**不对账号可用性与安全性负责**
- 请勿用于任何支付、iCloud 整机登录或其它用途;内容仅供学习交流,请遵守当地法律法规
- 本仓库含推广链接,可能带来收益,不影响内容

⭐ 觉得有用请点个 Star,每天 0:00 自动更新,你会在动态里看到。
`;

writeFileSync(join(ROOT, 'README.md'), readme);
console.log(`README 已生成:${dateStr} · ${total} 个账号 · ${days} 天`);
