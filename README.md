# 🚀 Vue API Demo

一个基于 **Vue 3 + Vite + 原生 Fetch API** 的演示项目，自带 Mock API 服务器，无需后端即可体验完整的接口开发流程。

## ✨ 功能特性

- **Vue 3 Composition API** - 使用 `<script setup>` 语法
- **Mock API 服务器** - 零依赖的 Node.js HTTP 服务器
- **完整的 CRUD 操作** - 增删改查一应俱全
- **接口测试控制台** - 可视化测试所有 API
- **请求统计面板** - 实时显示请求成功率

## 📁 项目结构

```
vue-api-demo/
├── server/              # Mock API 服务端
│   ├── index.js         # 服务器入口 (零依赖)
│   ├── db.json          # 本地 JSON 数据库
│   └── test.js          # 接口自动化测试
├── src/
│   ├── api/
│   │   └── index.js     # API 请求封装
│   ├── App.vue          # 主组件
│   └── main.js          # 入口文件
├── package.json
├── vite.config.js
└── index.html
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 Mock API 服务器

```bash
npm run server
```

服务器将在 `http://localhost:3000` 启动，提供以下接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 获取所有用户 |
| GET | `/api/users/:id` | 获取单个用户 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| GET | `/api/posts` | 获取所有文章 |
| POST | `/api/posts` | 创建文章 |

### 3. 启动前端开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动，并自动代理 API 请求到 Mock 服务器。

### 4. 运行接口测试

```bash
npm run test:api
```

## 🧪 接口测试

项目内置自动化测试脚本 `server/test.js`，可一键验证所有接口：

```bash
# 确保服务器已运行
npm run server &

# 运行测试
npm run test:api
```

测试覆盖：
- ✅ 用户列表查询
- ✅ 单个用户查询
- ✅ 用户创建
- ✅ 用户更新
- ✅ 用户删除
- ✅ 文章列表查询
- ✅ 文章创建

## 📝 技术要点

### Vue 3 特性使用
- `<script setup>` - 组合式 API 语法糖
- `ref` / `reactive` - 响应式数据
- `computed` - 计算属性
- 事件处理与条件渲染

### API 封装模式
```javascript
// src/api/index.js
export const api = {
  getUsers() { return request('/users') },
  createUser(data) { return request('/users', { method: 'POST', body: JSON.stringify(data) }) },
  // ...
}
```

### Mock 服务器实现
- 使用原生 Node.js `http` 模块
- JSON 文件作为持久化数据库
- 支持 CORS 跨域
- 动态路由匹配 (`/users/:id`)

## 📄 License

MIT
