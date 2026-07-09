// Mock API 服务器 - 使用原生 Node.js HTTP 模块
// 无需额外依赖，支持 GET/POST/PUT/DELETE

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'db.json')
const PORT = 3000

// 读取数据库
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { users: [], posts: [] }
  }
}

// 写入数据库
function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// 初始化数据
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' }
      ],
      posts: [
        { id: 1, title: 'Vue 3 入门指南', author: 'Alice', content: 'Vue 3 是 Vue.js 的最新版本...' },
        { id: 2, title: 'JavaScript 异步编程', author: 'Bob', content: 'async/await 让异步代码更易读...' },
        { id: 3, title: 'RESTful API 设计', author: 'Charlie', content: 'REST 是一种架构风格...' }
      ]
    }
    writeDB(initialData)
  }
}

// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

// 发送响应
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

// 路由处理
const routes = {
  // GET /users - 获取所有用户
  'GET /users': async (req, res) => {
    const db = readDB()
    sendJSON(res, 200, db.users)
  },

  // GET /users/:id - 获取单个用户
  'GET /users/\\d+': async (req, res, id) => {
    const db = readDB()
    const user = db.users.find(u => u.id === parseInt(id))
    if (!user) return sendJSON(res, 404, { error: '用户不存在' })
    sendJSON(res, 200, user)
  },

  // POST /users - 创建用户
  'POST /users': async (req, res) => {
    const body = await parseBody(req)
    const db = readDB()
    const newUser = {
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      name: body.name || '未命名',
      email: body.email || ''
    }
    db.users.push(newUser)
    writeDB(db)
    sendJSON(res, 201, newUser)
  },

  // PUT /users/:id - 更新用户
  'PUT /users/\\d+': async (req, res, id) => {
    const body = await parseBody(req)
    const db = readDB()
    const index = db.users.findIndex(u => u.id === parseInt(id))
    if (index === -1) return sendJSON(res, 404, { error: '用户不存在' })
    db.users[index] = { ...db.users[index], ...body }
    writeDB(db)
    sendJSON(res, 200, db.users[index])
  },

  // DELETE /users/:id - 删除用户
  'DELETE /users/\\d+': async (req, res, id) => {
    const db = readDB()
    const index = db.users.findIndex(u => u.id === parseInt(id))
    if (index === -1) return sendJSON(res, 404, { error: '用户不存在' })
    db.users.splice(index, 1)
    writeDB(db)
    sendJSON(res, 200, { message: '删除成功' })
  },

  // GET /posts - 获取所有文章
  'GET /posts': async (req, res) => {
    const db = readDB()
    sendJSON(res, 200, db.posts)
  },

  // POST /posts - 创建文章
  'POST /posts': async (req, res) => {
    const body = await parseBody(req)
    const db = readDB()
    const newPost = {
      id: db.posts.length > 0 ? Math.max(...db.posts.map(p => p.id)) + 1 : 1,
      title: body.title || '无标题',
      author: body.author || '匿名',
      content: body.content || ''
    }
    db.posts.push(newPost)
    writeDB(db)
    sendJSON(res, 201, newPost)
  }
}

// 匹配路由
function matchRoute(method, pathname) {
  for (const [pattern, handler] of Object.entries(routes)) {
    const [pMethod, pPath] = pattern.split(' ')
    if (pMethod !== method) continue
    
    if (pPath === pathname) {
      return { handler, params: [] }
    }
    
    // 匹配动态路由如 /users/123
    const regex = new RegExp(`^${pPath}$`)
    const match = pathname.match(regex)
    if (match) {
      return { handler, params: match.slice(1) }
    }
  }
  return null
}

// 创建服务器
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname.replace(/^\/api/, '') || url.pathname

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`)

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }

  const route = matchRoute(req.method, pathname)
  
  if (route) {
    try {
      await route.handler(req, res, ...route.params)
    } catch (err) {
      console.error('处理请求出错:', err)
      sendJSON(res, 500, { error: '服务器内部错误' })
    }
  } else {
    sendJSON(res, 404, { error: '接口不存在' })
  }
})

// 启动
initDB()
server.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║          🚀 Mock API 服务器已启动!                    ║')
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log(`║  地址: http://localhost:${PORT}                      ║`)
  console.log('║                                                      ║')
  console.log('║  可用接口:                                           ║')
  console.log('║  GET    /api/users          获取所有用户             ║')
  console.log('║  GET    /api/users/:id      获取单个用户             ║')
  console.log('║  POST   /api/users          创建用户                 ║')
  console.log('║  PUT    /api/users/:id      更新用户                 ║')
  console.log('║  DELETE /api/users/:id      删除用户                 ║')
  console.log('║  GET    /api/posts          获取所有文章             ║')
  console.log('║  POST   /api/posts          创建文章                 ║')
  console.log('╚══════════════════════════════════════════════════════╝')
})
