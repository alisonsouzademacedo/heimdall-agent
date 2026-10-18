<!-- source: https://hermes-agent.nousresearch.com/docs/zh-Hans -->
[跳到主要内容](https://hermes-agent.nousresearch.com/docs/zh-Hans#__docusaurus_skipToContent_fallback)

由 [Nous Research](https://nousresearch.com/) 构建的自我改进 AI 智能体。唯一内置学习循环的智能体——它从经验中创建技能，在使用过程中持续改进，主动提示自身持久化知识，并在会话间不断深化对你的建模。

[快速开始 →](https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/installation) [在 GitHub 上查看](https://github.com/NousResearch/hermes-agent)

## 安装 [​](https://hermes-agent.nousresearch.com/docs/zh-Hans\#%E5%AE%89%E8%A3%85 "安装的直接链接")

**Linux / macOS / WSL2**

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

**Windows（原生，PowerShell）** — _早期测试版， [详情 →](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/windows-native)_

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

请参阅完整的 **[安装指南](https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/installation)**，了解安装程序的具体操作、按用户与 root 的目录布局以及 Windows 相关说明。

## Hermes Agent 是什么？ [​](https://hermes-agent.nousresearch.com/docs/zh-Hans\#hermes-agent-%E6%98%AF%E4%BB%80%E4%B9%88 "Hermes Agent 是什么？的直接链接")

它不是绑定在 IDE 上的编程副驾驶，也不是对单一 API 的聊天机器人封装。它是一个 **自主智能体**，运行时间越长，能力越强。它可以部署在任何地方——5 美元的 VPS、GPU 集群，或者闲置时几乎零成本的 serverless 基础设施（Daytona、Modal）。在 Telegram 上与它对话，同时让它在你从未亲自 SSH 登录的云端虚拟机上工作。它不依赖你的本地电脑。

## 快速链接 [​](https://hermes-agent.nousresearch.com/docs/zh-Hans\#%E5%BF%AB%E9%80%9F%E9%93%BE%E6%8E%A5 "快速链接的直接链接")

|  |  |
| --- | --- |
| 🚀 **[安装](https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/installation)** | 在 Linux、macOS、WSL2 或原生 Windows（早期测试版）上 60 秒完成安装 |
| 📖 **[快速入门教程](https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/quickstart)** | 第一次对话及值得尝试的核心功能 |
| 🗺️ **[学习路径](https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/learning-path)** | 根据你的经验水平找到合适的文档 |
| ⚙️ **[配置](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/configuration)** | 配置文件、提供商、模型及选项 |
| 💬 **[消息网关](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/messaging/)** | 配置 Telegram、Discord、Slack、WhatsApp、Teams 等平台 |
| 🔧 **[工具与工具集](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/tools)** | 70+ 内置工具及其配置方式 |
| 🧠 **[记忆系统](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/memory)** | 跨会话持续增长的持久记忆 |
| 📚 **[技能系统](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/skills)** | 智能体创建并复用的程序性记忆 |
| 🔌 **[MCP 集成](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/mcp)** | 连接 MCP 服务器、过滤其工具，并安全扩展 Hermes |
| 🧭 **[在 Hermes 中使用 MCP](https://hermes-agent.nousresearch.com/docs/zh-Hans/guides/use-mcp-with-hermes)** | 实用的 MCP 配置模式、示例与教程 |
| 🎙️ **[语音模式](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/voice-mode)** | 在 CLI、Telegram、Discord 及 Discord 语音频道中进行实时语音交互 |
| 🗣️ **[在 Hermes 中使用语音模式](https://hermes-agent.nousresearch.com/docs/zh-Hans/guides/use-voice-mode-with-hermes)** | Hermes 语音工作流的实操配置与使用模式 |
| 🎭 **[个性与 SOUL.md](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/personality)** | 通过全局 SOUL.md 定义 Hermes 的默认风格 |
| 📄 **[上下文文件](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/context-files)** | 影响每次对话的项目上下文文件 |
| 🔒 **[安全](https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/security)** | 命令审批、授权与容器隔离 |
| 💡 **[技巧与最佳实践](https://hermes-agent.nousresearch.com/docs/zh-Hans/guides/tips)** | 快速上手，充分发挥 Hermes 的潜力 |
| 🏗️ **[架构](https://hermes-agent.nousresearch.com/docs/zh-Hans/developer-guide/architecture)** | 底层工作原理 |
| ❓ **[常见问题与故障排查](https://hermes-agent.nousresearch.com/docs/zh-Hans/reference/faq)** | 常见问题及解决方案 |

## 核心功能 [​](https://hermes-agent.nousresearch.com/docs/zh-Hans\#%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD "核心功能的直接链接")

- **闭环学习循环** — 智能体管理的记忆，配合定期提示、自主技能创建、使用中的技能自我改进、基于 FTS5 的跨会话召回与 LLM 摘要，以及 [Honcho](https://github.com/plastic-labs/honcho) 辩证式用户建模
- **随处运行，不限于本地** — 6 种终端后端：本地、Docker、SSH、Daytona、Singularity、Modal。Daytona 和 Modal 提供 serverless 持久化——环境闲置时休眠，几乎零成本
- **在你所在的地方** — CLI、Telegram、Discord、Slack、WhatsApp、Signal、Matrix、Mattermost、Email、SMS、DingTalk、Feishu、WeCom、Weixin、QQ Bot、Yuanbao、BlueBubbles、Home Assistant、Microsoft Teams、Google Chat 等——通过一个网关支持 20+ 平台
- **由模型训练者构建** — 由 [Nous Research](https://nousresearch.com/) 创建，该实验室是 Hermes、Nomos 和 Psyche 背后的团队。支持 [Nous Portal](https://portal.nousresearch.com/)、 [OpenRouter](https://openrouter.ai/)、OpenAI 或任意端点
- **定时自动化** — 内置 cron，可向任意平台投递
- **委托与并行** — 派生隔离的子智能体以并行处理多个工作流。通过 `execute_code` 实现程序化工具调用，将多步骤流水线压缩为单次推理调用
- **开放标准技能** — 兼容 [agentskills.io](https://agentskills.io/)。技能可移植、可共享，并通过 Skills Hub 接受社区贡献
- **完整的 Web 控制** — 搜索、提取、浏览、视觉、图像生成、TTS
- **MCP 支持** — 连接任意 MCP 服务器以扩展工具能力
- **研究就绪** — 批处理、轨迹导出、基于 Atropos 的 RL 训练。由 [Nous Research](https://nousresearch.com/) 构建——该实验室是 Hermes、Nomos 和 Psyche 模型背后的团队

## 面向 LLM 和编程智能体 [​](https://hermes-agent.nousresearch.com/docs/zh-Hans\#%E9%9D%A2%E5%90%91-llm-%E5%92%8C%E7%BC%96%E7%A8%8B%E6%99%BA%E8%83%BD%E4%BD%93 "面向 LLM 和编程智能体的直接链接")

本文档的机器可读入口：

- **[`/llms.txt`](https://hermes-agent.nousresearch.com/docs/zh-Hans/assets/files/llms-b4c4b58a7933861a0a38fec16a3afa92.txt)** — 每个文档页面的精选索引，附简短描述。约 17 KB，可安全加载到 LLM 上下文中。
- **[`/llms-full.txt`](https://hermes-agent.nousresearch.com/docs/zh-Hans/assets/files/llms-full-ef2976881541b952d1596625505288ff.txt)** — 所有文档页面拼接为单一 markdown 文件，支持一次性摄取。约 1.8 MB。

两个文件同样可通过 `/docs/llms.txt` 和 `/docs/llms-full.txt` 访问。每次部署时全新生成。
