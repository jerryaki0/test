# 社区互助服务系统

基于 Coze 平台的社区互助服务系统，连接邻里，传递温暖。

## 项目简介

这是一个社区互助服务平台，让每一份善意都能找到需要的人。用户可以发布互助需求、响应他人的求助，并通过 AI 智能助手获得更好的服务体验。

## 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 19 |
| 开发语言 | TypeScript 5 |
| UI 组件 | shadcn/ui (Radix UI) |
| 样式方案 | Tailwind CSS 4 |
| 数据库 | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| AI 能力 | Coze LLM SDK |

## 功能模块

### 1. 用户系统
- 用户注册/登录
- 个人中心管理
- 技能标签设置
- 积分与信用评分

### 2. 互助需求
- 发布互助需求
- 需求列表浏览
- 分类筛选与搜索
- 需求详情查看

### 3. 响应系统
- 提交帮助响应
- 接受/拒绝响应
- 状态流转管理

### 4. 评价系统
- 互助评价
- 评分统计

### 5. AI 智能
- AI 客服对话
- 智能推荐匹配
- 需求描述优化

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 9+

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

需要配置的环境变量：
- `COZE_CUSTOMER_SERVICE_TOKEN` - Coze 智能体 Token
- `COZE_CUSTOMER_SERVICE_BOT_ID` - Coze 智能体 ID

### 启动开发服务器

```bash
coze dev
# 或
pnpm dev
```

访问 http://localhost:5000

### 构建生产版本

```bash
coze build
# 或
pnpm build
```

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API 路由
│   │   ├── auth/               # 认证接口
│   │   ├── requests/           # 需求接口
│   │   ├── responses/          # 响应接口
│   │   ├── users/              # 用户接口
│   │   ├── ai/                 # AI 接口
│   │   └── customer-service/   # 客服接口
│   ├── customer-service/       # AI 客服页面
│   ├── login/                  # 登录页面
│   ├── profile/                # 个人中心
│   ├── register/               # 注册页面
│   └── requests/               # 需求相关页面
├── components/                 # React 组件
│   ├── ui/                     # shadcn/ui 组件
│   ├── header.tsx              # 顶部导航
│   ├── footer.tsx              # 页脚
│   └── ai-assistant.tsx        # AI 助手组件
├── lib/                        # 工具库
│   ├── types.ts                # 类型定义
│   ├── constants.ts            # 常量配置
│   └── storage.ts              # 本地存储
└── storage/
    └── database/               # 数据库
        ├── supabase-client.ts  # Supabase 客户端
        └── shared/
            └── schema.ts       # 数据库模型
```

## 数据库设计

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| categories | 分类表 |
| help_requests | 互助需求表 |
| help_responses | 需求响应表 |
| reviews | 评价表 |
| messages | 站内消息表 |

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/requests` | GET/POST | 需求列表/发布 |
| `/api/requests/[id]` | GET/PUT/DELETE | 需求详情/更新/删除 |
| `/api/responses` | POST/PUT | 提交/更新响应 |
| `/api/users/me` | GET/PUT | 用户信息 |
| `/api/customer-service/chat` | GET/POST | AI 客服 |

## 部署说明

1. 配置生产环境变量
2. 执行数据库迁移
3. 构建项目：`pnpm build`
4. 启动服务：`pnpm start`

## 许可证

MIT License
