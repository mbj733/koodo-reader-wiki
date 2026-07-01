# Koodo Reader + LLM Wiki

[Koodo Reader](https://github.com/koodo-reader/koodo-reader) 的社区修改版，新增 **LLM Wiki** 功能。

## 新增功能

在阅读小说时，AI 自动生成结构化 Wiki：

- 👤 **角色档案**：姓名、性格、背景、人物关系
- 📖 **剧情摘要**：主线故事、关键事件、章节划分
- 📚 **术语词典**：专有名词、世界观设定
- 🌍 **世界观**：力量体系、关键地点、组织派系

## 支持的 AI 模型

25+ Provider，用户自选模型和 API Key：

| Provider | 类型 |
|----------|------|
| OpenAI / Anthropic / Google Gemini | 云端 API |
| DeepSeek / 智谱 / 通义千问 / 豆包 / 混元 | 国内大模型 |
| Ollama / LM Studio / vLLM | 本地部署（零成本） |
| OpenRouter / Together AI / Groq 等 | 聚合平台 |

## 使用方式

1. 设置 → AI 设置 → 添加模型 → 分配给 "AI wiki model"
2. 打开一本书 → 导航栏 → **Wiki** 标签
3. 点击 "Generate Full Wiki" 或按分类生成
4. LLM 分析全书文本，流式生成结构化 Wiki

## 快速开始

```bash
git clone https://github.com/mbj733/koodo-reader-wiki.git
cd koodo-reader-wiki
yarn install
yarn build
yarn ele        # 开发模式启动
yarn release    # 打包安装包
```

## 源码改动

| 新增文件 | 说明 |
|---------|------|
| `src/models/Wiki.ts` | WikiEntry 数据模型 |
| `src/utils/wiki/prompts.ts` | Prompt 模板 |
| `src/utils/wiki/wikiService.ts` | LLM 调用 + 文本提取 + 解析 |
| `src/containers/wiki/WikiPanel.tsx` | Wiki 面板 UI |
| `src/containers/wiki/wikiPanel.css` | 样式 |

| 修改文件 | 说明 |
|---------|------|
| `src/store/index.tsx` | stateType 新增 wikis |
| `src/store/reducers/reader.tsx` | initState + HANDLE_WIKIS |
| `src/store/actions/reader.tsx` | CRUD actions |
| `src/store/actions/manager.tsx` | plugin 注册 |
| `src/containers/settings/aiSetting/*` | Wiki 模型分配 |
| `src/containers/panels/navigationPanel/*` | Wiki 标签页 |

## License

基于 [Koodo Reader](https://github.com/koodo-reader/koodo-reader) (AGPL-3.0) 修改，本仓库同样遵循 AGPL-3.0 协议。
