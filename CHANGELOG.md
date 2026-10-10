# 更新日志 (CHANGELOG)

本项目遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/) 规范。

---

## [v1.1.0] - 2026-10-10

### 🚀 新增功能 (Features)
- **支持 Gemini 3.8 / 3.6 / 3.7 全新模型家族**：
  - 接入上游新模型架构，支持 64K 超长输出上下文。
  - 适配 Gemini 3.x 全新 `thinkingLevel` 思考架构（替代早期 2.5 的 `thinkingBudget`）。
- **多维度思考强度控制 (Thinking Level Control)**：
  - 针对上游仅投放自动分层 `tiered` 变体的情况，在代理层无缝合成 `-low`、`-medium`、`-high` 虚拟变体。
  - 支持直接在模型名中使用（如 `gemini-3.8-flash-high`）。
  - 支持通过请求体参数 `reasoning_effort` (`low` / `medium` / `high` / `none`) 或系统提示词指令动态覆盖。
- **思考内容流式传输规范化**：
  - 流式响应采用标准 OpenAI `reasoning` 与 DeepSeek 规范的 `reasoning_content` 双字段输出。
  - 默认将 `STREAM_THINKING_AS_CONTENT` 设为 `false`，彻底避免普通正文出现 `<think>` 标签或被富文本编辑器误识别为代码块。
- **全新调试与排查端点**：
  - 增加 `GET /debug/raw-models`，可直观查看 Google 内部返回的未经加工模型清单与配额详情。
- **模型解析自动化测试套件**：
  - 新增 `scripts/test-model-resolution.ts`，涵盖 49 项高覆盖断言（支持名称归一化、版本点恢复、上游优先级与别名降级测试）。

### 🛠️ 优化与修复 (Optimizations & Fixes)
- **模型列表重构与精简化**：
  - 过滤上游重复的物理模型（如内部 alias、displayName 重复项），只暴露标准 kebab-case ID。
  - 仅对 3.6+ 新模型开启 `-low` / `-medium` / `-high` 变体列表，旧模型默认自动锁定最高思考能力，模型列表更加清晰。
- **请求配置参数保留**：
  - 修复流式转发中 `temperature`、`top_p`、`stop`、`seed`、`response_format` 被覆盖丢失的问题。
- **速率限制自动降级链升级**：
  - 扩充 `AUTO_SWITCH_MODEL_MAP`，遇到 429/503 时在对应家族内部平滑降级（如 3.8-high -> 3.8-medium -> 3.8-low -> tiered）。

---

## [v1.0.0] - 初始版本
- 基础 Cloudflare Worker 搭建与 Google Code Assist 内部端点接入。
- 模拟 Antigravity OAuth 登录与 Token 自治刷新机制。
- 支持基于 Cloudflare KV 的多账号轮询池与热切换。
- 支持文本、图片、音视频、PDF 多模态接入。
- 支持 SD WebUI 格式绘图接口。
