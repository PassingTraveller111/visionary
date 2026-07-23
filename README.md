# Visionary

Visionary 是一个基于 Next.js App Router 的创作与阅读平台，站点标题为“创见”。项目同时包含前台阅读、用户中心、创作者后台、Markdown 草稿编辑器、流程/脑图编辑器、AI 写作助手、文章审核发布链路，以及面向脚本和 Agent 的本地 CLI。

## 功能概览

- 用户系统：邮箱注册验证码、登录、登出、JWT Cookie 鉴权、用户资料与头像更新。
- 内容阅读：首页文章流、文章详情、搜索、阅读记录、点赞、收藏、评论、随机格言。
- 创作者后台：文章、草稿、专栏、图表的列表管理与数据统计。
- Markdown 编辑：自定义工具栏、代码高亮、KaTeX 公式、表格、图片上传、图表引用和预览渲染。
- 图表编辑：基于 React Flow 的流程图/脑图编辑器，支持节点、连线、样式工具栏、封面生成与保存。
- AI 助手：通过 DeepSeek 兼容 OpenAI SDK 的接口发送消息，并保存草稿关联的聊天记录。
- 文件上传：文章图片、封面、头像、专栏封面、图表封面上传到腾讯云 COS。
- 行为埋点：前端 TrackProvider 写入单条或批量埋点 API。
- 本地 CLI：支持登录、创建草稿、读取草稿、更新草稿、发布草稿，便于自动化脚本操作现有站点 API。

## 技术栈

- 框架：Next.js 15、React 18、TypeScript、App Router。
- UI：Ant Design、Sass Modules、Tailwind CSS 配置。
- 状态管理：Redux Toolkit、React Redux。
- 编辑与渲染：react-markdown-editor-lite、react-markdown、remark-gfm、remark-math、rehype-katex、rehype-highlight、KaTeX、highlight.js。
- 图表：@xyflow/react、html-to-image。
- 服务端能力：Next Route Handlers、mysql2、ioredis、jsonwebtoken、nodemailer、cos-nodejs-sdk-v5、openai。
- 图表统计：recharts。

## 项目结构

```text
.
├── public/                         # 静态资源，包含站点 logo、favicon、编辑器插件图标
├── scripts/                         # 项目辅助脚本
├── src/
│   ├── app/                        # Next.js App Router 页面、布局和 REST API Route Handlers
│   │   ├── api/                    # 资源式 REST 接口：articles、drafts、users、columns、diagrams 等
│   │   ├── creator/                # 创作者后台：主页、文章、草稿、专栏、图表管理
│   │   ├── editor/                 # 草稿编辑器和图表编辑器页面
│   │   ├── reader/                 # 文章阅读页和审核稿阅读页
│   │   ├── search/                 # 文章搜索页
│   │   ├── userCenter/             # 用户主页、收藏、专栏、阅读历史、数据统计
│   │   ├── layout.tsx              # 全局 Redux、Antd、埋点和客户端初始化入口
│   │   └── page.tsx                # 登录后首页文章流
│   ├── clientApi/                  # 前端 API fetch 包装
│   ├── components/                 # 通用组件、Markdown 编辑/渲染器、图表编辑器、导航、登录表单等
│   ├── hooks/                      # 按业务域封装的请求 Hook
│   ├── lib/                        # MySQL、Redis、邮件、DeepSeek/OpenAI 客户端
│   ├── server/                     # 服务端业务层、数据库访问、鉴权、COS、Redis helper 与响应封装
│   │   ├── api/                    # API 响应与错误封装
│   │   ├── auth/                   # 当前用户解析
│   │   ├── db/                     # MySQL query helper
│   │   ├── redis/                  # Redis key 与缓存 helper
│   │   ├── sql/                    # MySQL 表访问封装与实体类型
│   │   └── */                      # 按业务域划分的 server service
│   ├── shared/api/                 # 前后端共享的 REST 请求/响应 DTO 类型
│   ├── store/                      # Redux store、provider 和业务 slices
│   ├── styles/                     # Sass 变量
│   ├── utils/                      # JWT 鉴权、本地存储工具
│   └── middleware.ts               # 页面/API 鉴权与草稿编辑权限校验
├── next.config.ts                  # Next 配置，包含 COS 图片域名和构建检查策略
├── package.json                    # npm scripts 与依赖声明
└── tsconfig.json                   # TypeScript 与 @/* 路径别名配置
```

## 页面路由

- `/`：文章流首页，展示最新/热门 Tab、当前用户信息、文章/阅读/获赞统计和随机格言。
- `/login`：登录入口。
- `/search`：文章关键词搜索。
- `/reader/[articleId]`：已发布文章阅读页。
- `/reader/review/[reviewId]`：审核稿阅读页。
- `/creator/home`：创作者后台首页。
- `/creator/content/article`：文章管理。
- `/creator/content/draft`：草稿管理。
- `/creator/content/columns`：专栏管理。
- `/creator/content/columns/manage/[column_id]`：专栏文章管理。
- `/creator/content/diagram`：图表管理。
- `/editor/draft/[draftId]`：Markdown 草稿编辑器，`new` 表示新建草稿。
- `/editor/diagram/[diagramId]`：图表编辑器。
- `/userCenter/[userId]/article`：用户文章主页。
- `/userCenter/[userId]/column`：用户专栏。
- `/userCenter/[userId]/collect`：用户收藏。
- `/userCenter/Columns/[column_id]`：专栏详情。
- `/userCenter/readHistory`：阅读历史。
- `/userCenter/myData`：个人数据统计。
- `/userAgreement`：用户协议，当前在中间件中免登录放行。

## API 分组

项目 API 已迁移为资源式 REST Route Handlers，旧 `api/public/*`、`api/protected/*`、`api/user/*` RPC 风格接口已移除。

- `api/auth/*`：登录、登出、注册验证码发送与校验。
- `api/users/me/*`：当前登录用户资料、头像、统计和统计图表。
- `api/users/[userId]/*`：作者资料、文章/草稿/专栏/图表列表、收藏、阅读记录、获赞数、阅读数和文章数。
- `api/articles/*`：文章列表、搜索、详情、删除、封面/正文图片上传、专栏候选文章、点赞、收藏、评论和阅读记录。
- `api/drafts/*`：草稿创建、读取、保存、发布、删除、编辑权限校验和草稿关联 AI 聊天。
- `api/columns/*`：专栏创建/更新、删除、读取、文章列表维护和封面上传。
- `api/diagrams/*`：图表保存、读取、列表、删除、重命名、封面上传与封面读取。
- `api/reviews/[reviewId]`：审核稿读取。
- `api/assistant/chats/[chatId]/messages`：AI 消息发送和聊天记录读写。
- `api/quotes/random`：随机格言。
- `api/track/*`：埋点上报。

受保护接口依赖 `middleware.ts` 检查 `token` Cookie。除 `/userAgreement` 外，页面路由也会被鉴权保护；登录用户访问 `/login` 会被重定向到首页。API 响应由 `src/server/api/response.ts` 统一封装，共享 DTO 位于 `src/shared/api/*`。

## 数据模型

主要 MySQL 表在 `src/server/sql/type.ts` 中声明了 TypeScript 类型，数据库访问 helper 位于 `src/server/sql/*`：

- `users`：用户账号、邮箱、角色、头像、昵称等。
- `articles`：已发布文章内容、标题、摘要、标签、审核状态、发布状态、作者、封面等。
- `drafts`：草稿内容、标题、摘要、标签、作者、关联文章/审核稿、封面等。
- `reviews`：发布审核稿与审核状态。
- `article_likes`：文章点赞记录。
- `article_collections`：文章收藏记录。
- `article_reading_records`：阅读记录。
- `article_comments`：文章评论，支持父评论和软删除。
- `assistant_chat_record`：草稿关联的 AI 聊天记录。
- `email_verification`：注册邮箱验证码。
- `quotes`：首页随机格言。
- `columns` / `article_columns`：专栏与文章专栏关系。
- `diagrams`：流程图/脑图数据、标题、简介、标签、作者、封面和类型。

## 环境变量

本地开发建议创建 `.env.local`，至少按实际使用的能力配置以下变量。不要提交真实密钥。

```bash
# JWT
SECRET_KEY=

# MySQL
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=visionary

# Redis，端口当前固定为 6379
REDIS_HOST=localhost
REDIS_PASSWORD=

# 邮件验证码，当前邮件客户端固定使用 smtp.163.com:465 SSL
EMAIL_SERVICE=163
EMAIL_USER=
EMAIL_AUTHORIZATION_CODE=

# 腾讯云 COS 上传
UPLOAD_COS_SECRETID=
UPLOAD_COS_SECRETKEY=
UPLOAD_COS_BUCKET=
UPLOAD_COS_REGION=ap-beijing

# AI 助手，OpenAI SDK baseURL 指向 https://api.deepseek.com
DEEPSEEK_API_KEY=
```

`next.config.ts` 已配置远程图片域名 `visionary-1305469650.cos.ap-beijing.myqcloud.com`，如果更换 COS Bucket 域名，需要同步更新 `images.remotePatterns`。

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

常用脚本：

```bash
npm run dev       # 启动 Next.js 开发服务
npm run build     # 构建生产包
npm run start     # 启动生产服务
npm run lint      # 运行 lint 脚本
```

注意：当前 `next.config.ts` 中配置了 `eslint.ignoreDuringBuilds` 和 `typescript.ignoreBuildErrors`，生产构建不会因为 ESLint 或 TypeScript 错误失败。提交前仍建议单独检查类型和质量问题。

## Visionary CLI

Visionary CLI 已抽出为 npm 包，用于通过现有网站 API 操作草稿。输出始终为 JSON，适合自动化脚本和 Agent 使用。

安装 CLI：

```bash
npm install -g visionary-cli
```

登录并保存 token：

```bash
visionary-cli auth login --base-url https://visionaryblog.cn --username <username> --password <password> --remember --json
```

token 会保存到：

```text
~/.visionary-cli/config.json
```

也可以通过环境变量覆盖：

```bash
export VISIONARY_BASE_URL=https://visionaryblog.cn
export VISIONARY_TOKEN=<token-cookie-value>
# 或
export VISIONARY_COOKIE='token=<token-cookie-value>'
```

创建草稿：

```bash
visionary-cli draft create --title "Article title" --content-file ./draft.md --summary "Short summary" --tags "Next.js,React" --json
visionary-cli draft create --title "Article title" --content $'## Intro\n\nMarkdown content' --summary "Short summary" --tags "Next.js,React" --json
```

读取草稿：

```bash
visionary-cli draft get --id 1 --json
```

更新草稿：

```bash
visionary-cli draft update --id 1 --content-file ./draft.md --title "Updated title" --json
visionary-cli draft update --id 1 --content $'## Updated\n\nMarkdown content' --title "Updated title" --json
```

发布草稿：

```bash
visionary-cli draft publish --id 1 --confirm --json
```

发布命令必须显式传入 `--confirm`，避免脚本误发布。

## 开发约定

- 前端请求入口优先使用 `src/clientApi/index.ts` 中的 `apiClient`，endpoint 使用资源式 REST 路径。
- 新增接口时放在 `src/app/api/<resource>` 下，Route Handler 只负责参数解析、鉴权入口和响应封装。
- 服务端业务逻辑放在 `src/server/<domain>`，数据库访问放在 `src/server/sql`，共享请求/响应类型放在 `src/shared/api`。
- 前端业务请求 Hook 按领域放在 `src/hooks/<domain>`，页面尽量通过 Hook 调用 API。
- 全局状态放在 `src/store/features` 中，并在 `rootReducer.ts` 注册。
- 编辑器插件放在 `src/components/MdEditor/plugins`，图表编辑器能力放在 `src/components/Diagram`。
