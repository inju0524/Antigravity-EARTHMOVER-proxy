# Antigravity EARTHMOVER Proxy 🚀

> 一个 **100% 无服务器 (Serverless)** 的 Cloudflare Worker 反代项目，将 Google 内部 Antigravity Cloud Code 端点无缝转换为标准 OpenAI 兼容 API。

本项目完全自治运行在 Cloudflare 全球边缘节点上，无需本地常驻后台客户端即可完成 OAuth Token 自动刷新、模型动态发现与请求载荷伪装。

---

## ✨ 核心特性

- ☁️ **100% Serverless**：一键部署到 Cloudflare Workers，无需本地运行任何后台程序或守护进程。
- 🎭 **协议深度适配**：模拟官方 Go 守护进程标准载荷，支持 `thinkingConfig`、`model_enum` 映射及专属标签。
- 🧠 **全新模型与思考强度支持**：
  - 完美支持 **Gemini 3.8 / 3.6 / 3.7 / 3.1 Pro / Claude 4.6 (Thinking)**。
  - 针对 Gemini 3.8 官方仅投放 `tiered` 入口的情况，自动合成 `-low`、`-medium`、`-high` 强度变体。
  - 支持 OpenAI 标准 `reasoning` / `reasoning_content` 双字段流式输出，杜绝普通正文中掺杂 `<think>` 等格式污染。
- 🔄 **自治 Token 管理**：内置 OAuth 刷新体系与多账号 KV 轮询热备，自动应对单账号配额耗尽。
- 👁️ **全能多模态支持**：支持图片、音频、视频、PDF 文件解析。
- 🎨 **双模式图像生成**：
  - **OpenAI 兼容对话生图**：支持直接在 DSH / 常见 AI 客户端中使用 `gemini-3.1-flash-image` 模型，输入提示词直接返回 Markdown 图片！
  - **标准 SD WebUI 接口**：内置 `/sdapi/v1/txt2img`，可无缝对接 SillyTavern 等 WebUI 绘画客户端。

---

## ⚡ 快速部署指引

### 1. 准备环境
- 安装 [Node.js](https://nodejs.org/) (推荐 LTS 20+)
- 注册并登录 [Cloudflare](https://dash.cloudflare.com/) 账号

### 2. 本地安装与登录
```bash
git clone https://github.com/<your-username>/Antigravity-EARTHMOVER-proxy.git
cd Antigravity-EARTHMOVER-proxy
npm install
npx wrangler login
```

### 3. 获取 Google OAuth Token
运行内置登录脚本模拟 Antigravity 客户端认证：
```bash
node scripts/login.js
```
根据控制台提示在浏览器打开授权链接，授权完成后终端会输出一段 JSON 凭据，完整复制该内容。

### 4. 部署与注入密钥
```bash
# 部署 Worker
npx wrangler deploy

# 将上一步复制的 JSON 写入环境变量 (提示时粘贴并回车)
npx wrangler secret put GCP_SERVICE_ACCOUNT
```

> **提示**：若已有独立的 Google Cloud 伴随项目且已开启计费，可通过以下命令绑定自定义项目 ID（可选）：
> ```bash
> npx wrangler secret put GEMINI_PROJECT_ID
> ```

---

## 🛠️ 客户端接入指南

在任何支持自定义 OpenAI API 的客户端（如 Cursor、Zed、NextChat、Cherry Studio、Chatbox 等）中配置：

- **API Base URL**：`https://<你的Worker域名>/v1`
- **API Key**：`sk-antigravity`（可填写任意非空字符串，鉴权由 Worker 代理处理）

---

## 🧠 思考强度 (Thinking Level) 使用详解

本代理为 Gemini 3.x 模型提供三种思考深度调节方式：

### 方式 1：直接调用变体模型名（最推荐）
| 模型名称 | 行为说明 |
| :--- | :--- |
| `gemini-3.8-flash-high` | 锁定高思考深度 (`thinkingLevel: "high"`) |
| `gemini-3.8-flash-medium` | 锁定中高思考深度 |
| `gemini-3.8-flash-low` | 锁定低思考深度 (`thinkingLevel: "low"`) |
| `gemini-3.8-flash-tiered` | 默认上游自动按任务难度分层 |
| `gemini-3.6-flash-high/low` | 调用官方 3.6 独立强度变体 |
| `gemini-3.1-pro-high/low` | 调用 3.1 Pro 对应深度变体 |

> **注**：对于早期旧模型（如 Gemini 3.1 Lite、2.5 系列），默认自动锁定最高思考深度，不再冗余展示低配变体。

### 方式 2：请求体标准参数
```json
{
  "model": "gemini-3.8-flash-tiered",
  "messages": [{"role": "user", "content": "你好"}],
  "reasoning_effort": "high"
}
```

### 方式 3：System Prompt 动态指令
在不支持额外参数的客户端，可在系统提示词中加入：
```text
reasoning_effort=high
show_reasoning=true
```

---

## 🎨 图像生成 (Image Generation)

本反代支持两种生图模式，覆盖 DSH 对话界面与 SillyTavern 等绘画客户端：

### 模式 1：DSH / 任意聊天客户端直接对话生图 (OpenAI 兼容)
在 DSH 或支持自定义模型的客户端中：
1. 模型选择 **`gemini-3.1-flash-image`**
2. 直接向 AI 发送描述词（例如：`画一只草地上的小猫`）
3. 代理会自动调用底层 Nanobanano 生图服务，并将生成的图像以标准 Markdown 图片（`![Generated Image](data:image/jpeg;base64,...)`）直接回显在聊天框中！

### 模式 2：SillyTavern 等绘画工具 (SD WebUI 协议)
内置标准 Stable Diffusion WebUI 兼容接口，配置方式如下：
1. 打开客户端的 **Image Generation (图像生成)** 设置。
2. 绘图提供商选择 **Stable Diffusion WebUI**。
3. **API URL** 填入：`https://<你的Worker域名>`（⚠️ 注意：末尾**不要**加 `/v1`）。
4. 正常发送绘图提示词即可，底层将自动路由至 Gemini 进行高保真生成。

---

## 🔁 多账号负载均衡与防封禁 (KV 轮询池)

对于高频使用 Claude Opus 或 Gemini Pro 的场景，建议配置多账号热备：

1. **创建 Cloudflare KV 命名空间**：
   ```bash
   npx wrangler kv:namespace create ACCOUNTS_KV
   ```
2. **在 `wrangler.toml` 中取消注释并填入 ID**：
   ```toml
   [[kv_namespaces]]
   binding = "ACCOUNTS_KV"
   id = "<第1步生成的ID>"
   ```
3. **添加多个账号凭证**：
   ```bash
   node scripts/add-account.js
   ```
4. **重新部署生效**：
   ```bash
   npx wrangler deploy
   ```

---

## 🧑‍💻 开发与日常维护工作流 (Workflow)

### 1. 本地代码改动与验证
在修改逻辑后，请确保执行类型检查与自动化解析测试：
```bash
# 执行类型检查
npm run tsc

# 执行模型解析核心单测
npx tsx scripts/test-model-resolution.ts
```

### 2. 部署到 Cloudflare
```bash
npx wrangler deploy
```

### 3. 排查上游可用模型状态
项目提供免鉴权/带鉴权的调试端点：
- `GET /health`：查看当前运行状况。
- `GET /debug/raw-models`：**原样查看** Google 官方当前返回的全部底层模型列表、`thinkingBudget` 及配额百分比。

---

## ⚠️ 安全与工作流规范

1. **切勿泄露真实 API 地址与凭据**：
   - 严禁将包含真实 Worker 域名（如带有私人二级域名的 `*.workers.dev`）提交或暴露在公共仓库中。
   - 严禁将包含 `refresh_token` 或 `client_secret` 的凭据文件（如 `.env`、临时输出的 JSON）提交到 Git。
   - 文档中必须统一使用占位符（如 `<你的Worker域名>`、`https://your-worker-subdomain.workers.dev/v1`）。
2. **账号保护与风险控制**：
   - 本项目通过非公开接口交互，建议使用备用 Google 账号。
   - 若遇到连续 429 配额耗尽，Worker 内置了降级逻辑，无需重复暴力发起高并发请求。

---

## 🔮 未来规划与优化方向 (Roadmap)

- [ ] **请求级缓存优化**：对于高频重复的前置 System Prompt 或知识库 Prompt，接入 KV 或 Cache API 实现请求层缓存。
- [ ] **工具调用 (Function Calling) 深度适配**：持续优化 Gemini 3 系列在代码编写与工具调用场景下的 thoughtSignature 与参数清洗机制。
- [ ] **动态配额感知与智能路由**：根据 `/debug/raw-models` 中暴露的 `remainingFraction` 剩余配额百分比，智能优先调度健康额度更高的账号。
- [ ] **自定义 System Prompt 注入管理**：支持在反代层面预配置统一的系统提示词前缀或安全过滤策略。
- [ ] **Web 简易管理仪表盘**：提供一个开箱即用的静态前端，用于可视化查看多账号健康状态、切换模型与单步测试。

---

*免责声明：本项目仅供技术学习与研究，所使用的接口可能受服务商协议制约。作者不承担任何因使用本工具导致的账号封禁或其他责任。*
