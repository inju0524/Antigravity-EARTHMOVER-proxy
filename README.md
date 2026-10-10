# Antigravity EARTHMOVER Proxy 🚀

> 一个 **100% 无服务器** 的 Cloudflare Worker 反代，将 Google Antigravity 内部 Cloud Code 端点包装成 OpenAI 兼容 API。

与其他需要你在后台挂着 Antigravity 桌面客户端、从 SQLite 里抠 token 的社区方案不同，本项目**完全自治**：OAuth token 刷新、动态模型发现、请求载荷伪装全部在云端完成。

## ✨ 特性

- ☁️ **100% 无服务器**：部署到 Cloudflare Workers 后关掉终端即可，无需任何常驻进程
- 🎭 **完美伪装**：完整复刻官方 Go 守护进程的 HTTP 载荷（`thinkingConfig`、`model_enum` 占位符、遥测标签），规避 Google 的 500/403 错误
- 🔄 **自治鉴权**：使用官方 Antigravity Client ID & Secret 自动交换、刷新 token
- 🛡️ **反追踪**：剥离 Clearcut 遥测，同时保持请求结构合法
- 📡 **动态路由**：自动从 Google `fetchAvailableModels` 内部字典发现并路由模型
- 🧠 **思考强度控制**：支持 `reasoning_effort` 参数与 `gemini-3.8-flash-low/medium/high` 等显式变体（详见下文）
- 🔌 **IDE 即插即用**：Zed、Cursor、SillyTavern 或任何 OpenAI 兼容前端的直接替代品
- 👁️ **完整多模态**：图片、音频、视频、PDF 无缝发送，通过智能工具调用伪装绕过内部限制
- 🎨 **图像生成（Nanobanano)**：内置标准 SD WebUI API(`/sdapi/v1/txt2img`),SillyTavern 开箱即用
- 🔁 **多账号轮询池**：基于 Cloudflare KV 的热切换账号池，单账号配额耗尽后自动换号重试

---

## ⚡ 快速上手（新手向）

即使从未用过终端，按步骤操作即可。

### 第 0 步：准备工作

1. 下载安装 [Node.js](https://nodejs.org/)(LTS 版本）
2. 注册免费的 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号
3. 下载本仓库（点击绿色 `Code` 按钮 → `Download ZIP`）并解压
4. 打开终端（Windows 用 PowerShell / 命令提示符，Mac 用 Terminal)，进入解压目录：
   ```bash
   cd 解压目录路径
   ```

### 第 1 步：安装依赖并登录

```bash
npm install
npx wrangler login
```
*（浏览器会弹出 Cloudflare 授权页面，点击 "Allow"。)*

### 第 2 步：获取 Google Token

无需安装官方 Antigravity 客户端，内置脚本会自动模拟 OAuth 流程：

```bash
node scripts/login.js
```

按终端提示操作，脚本最后会输出一大段 JSON,**完整复制**这段 JSON。

### 第 3 步：部署反代

```bash
npx wrangler deploy
```

### 第 4 步：注入密钥

把你的 Google OAuth token 安全地绑定到 Worker:

```bash
npx wrangler secret put GCP_SERVICE_ACCOUNT
```
*出现提示时粘贴第 2 步复制的 JSON，回车。*

*（可选）* 如果你有自己的 Google Cloud 项目且已开通 Cloud AI Companion API 并愿意付费，可以覆盖默认的免费影子项目：

```bash
npx wrangler secret put GEMINI_PROJECT_ID
```

---

## 🛠️ 在任意前端中使用

在 IDE（如 Zed、Cursor）或聊天 UI 中配置：

- **Base URL:** `https://antigravity-earthmover-worker.<你的子域>.workers.dev/v1`
  *（具体 URL 见 `npx wrangler deploy` 的终端输出）*
- **API Key:** `dummy-key` *（随便填，真正的鉴权由 Worker 处理）*

`/v1/models` 会动态返回模型列表，同时包含美化显示名（如 `Gemini 3.8 Flash (High)`）和 kebab-case ID（如 `gemini-3.8-flash-high`)，两种写法都可以用于请求。

---

## 🧠 思考强度（Thinking Level）控制

本项目支持三种方式控制 Gemini 3.x 模型的思考强度：

**方式一：选择显式变体模型（推荐）**

上游 Antigravity 对 3.8 系列目前只投放了自动分层的 `gemini-3.8-flash-tiered`,本代理在本地合成了显式变体，直接选择即可：

| 模型 ID | 思考强度 |
|---|---|
| `gemini-3.8-flash-low` | low |
| `gemini-3.8-flash-medium` | high |
| `gemini-3.8-flash-high` | high |
| `gemini-3.8-flash-tiered` | 上游自动分层 |

3.6/3.7 家族上游已有真实变体，会直接使用官方条目。

**方式二:`reasoning_effort` 参数**

```json
{
  "model": "gemini-3.8-flash-tiered",
  "messages": [...],
  "reasoning_effort": "low"
}
```

可选值：`none` / `low` / `medium` / `high`。

**方式三：系统提示词指令（适用于不暴露参数设置的 UI)**

在系统提示中加入：
```
reasoning_effort=high
show_reasoning=true
clean_context=true
```

---

## 🎨 图像生成（SD WebUI API)

内置基于 Gemini 3.1 Flash Image 模型的图像生成，走标准 SD WebUI 兼容端点。

在 **SillyTavern** 中配置：

1. 打开 Image Generation 扩展设置
2. 提供商选择 **Stable Diffusion WebUI**
3. API URL 填：`https://antigravity-earthmover-worker.<你的子域>.workers.dev`(**不要**加 `/v1` 后缀）
4. 正常用提示词生图即可（底层通过 nanobanano 方案透明路由到 Gemini)

---

## 🔁 多账号轮询池（绕过配额）

Google 对 Claude Opus 和 Gemini Pro 的免费额度限制很激进（动辄 150+ 小时配额封禁）。EARTHMOVER 支持基于 Cloudflare KV 的**多账号热切换池**：某账号配额耗尽时，代理立即将其标记为耗尽，并用下一个可用账号静默重试同一请求。

1. **创建 KV 数据库：**
   ```bash
   npx wrangler kv:namespace create ACCOUNTS_KV
   ```
2. **在 `wrangler.toml` 中绑定：**
   用文本编辑器打开 `wrangler.toml`，把文件底部的 `YOUR_ACCOUNTS_KV_ID_HERE` 替换为第 1 步得到的 `id`。
3. **向池中添加账号：**
   内置脚本会自动完成 OAuth 并把凭据直接写入 KV。对每个小号运行一次：
   ```bash
   node scripts/add-account.js
   ```
4. **重新部署：**
   ```bash
   npx wrangler deploy
   ```

此后代理会在所有已加载账号间智能均衡请求。

---

## 🔧 调试端点

| 端点 | 说明 |
|---|---|
| `GET /health` | 健康检查 |
| `POST /debug/token-test` | 测试 OAuth token 是否有效 |
| `POST /debug/test` | 测试鉴权 + 项目发现 |
| `GET /debug/raw-models` | **原样**返回上游官方 `fetchAvailableModels` 的完整响应（未经任何过滤），用于确认 Google 实际投放了哪些模型 |

---

## 📦 更新部署

代码更新后，重新部署覆盖同一实例即可（密钥和 KV 绑定保存在 Cloudflare 服务端，不会丢失）:

```bash
git pull
npx wrangler deploy
```

---

*免责声明：本项目为教学与研究用途的非官方工具，使用风险自负。它依赖未公开 API,Google 可能随时更改客户端密钥或 API 结构。建议使用小号。*
