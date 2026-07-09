<template>
  <div class="container">
    <header>
      <h1>🚀 Vue API Demo</h1>
      <p>Vue 3 + 原生 Fetch API + Mock Server 演示</p>
    </header>

    <!-- 用户管理 -->
    <section class="card">
      <h2>👥 用户管理</h2>
      <div class="actions">
        <button @click="loadUsers" :disabled="loading">
          {{ loading ? '加载中...' : '获取用户列表' }}
        </button>
        <button @click="addRandomUser" class="btn-success">
          添加随机用户
        </button>
      </div>
      
      <div v-if="error" class="error">❌ {{ error }}</div>
      
      <table v-if="users.length > 0" class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="deleteUser(user.id)" class="btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="!loading" class="empty">暂无数据，点击按钮获取</p>
    </section>

    <!-- 接口测试 -->
    <section class="card">
      <h2>🧪 接口测试控制台</h2>
      <div class="test-actions">
        <button @click="testGet">测试 GET /users</button>
        <button @click="testPost">测试 POST /users</button>
        <button @click="testPut">测试 PUT /users/1</button>
        <button @click="testDelete">测试 DELETE /users/1</button>
        <button @click="testGetPosts">测试 GET /posts</button>
      </div>
      <div v-if="testResult" class="result">
        <h3>请求结果：</h3>
        <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
      </div>
    </section>

    <!-- 状态显示 -->
    <section class="card">
      <h2>📊 请求统计</h2>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">{{ requestCount }}</span>
          <span class="stat-label">总请求数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number success">{{ successCount }}</span>
          <span class="stat-label">成功</span>
        </div>
        <div class="stat-item">
          <span class="stat-number error">{{ failCount }}</span>
          <span class="stat-label">失败</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from './api/index.js'

const users = ref([])
const loading = ref(false)
const error = ref('')
const testResult = ref(null)

const stats = reactive({
  total: 0,
  success: 0,
  fail: 0
})

const requestCount = computed(() => stats.total)
const successCount = computed(() => stats.success)
const failCount = computed(() => stats.fail)

// 获取用户列表
async function loadUsers() {
  loading.value = true
  error.value = ''
  stats.total++
  try {
    users.value = await api.getUsers()
    stats.success++
  } catch (err) {
    error.value = err.message
    stats.fail++
  } finally {
    loading.value = false
  }
}

// 添加随机用户
async function addRandomUser() {
  stats.total++
  try {
    const names = ['张三', '李四', '王五', '赵六', '孙七']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const newUser = await api.createUser({
      name: randomName,
      email: `${randomName.toLowerCase()}@example.com`
    })
    users.value.push(newUser)
    stats.success++
    testResult.value = { message: '创建成功', data: newUser }
  } catch (err) {
    error.value = err.message
    stats.fail++
  }
}

// 删除用户
async function deleteUser(id) {
  stats.total++
  try {
    await api.deleteUser(id)
    users.value = users.value.filter(u => u.id !== id)
    stats.success++
    testResult.value = { message: `用户 ${id} 已删除` }
  } catch (err) {
    error.value = err.message
    stats.fail++
  }
}

// 测试 GET
async function testGet() {
  stats.total++
  try {
    const data = await api.getUsers()
    testResult.value = { method: 'GET', url: '/users', data }
    stats.success++
  } catch (err) {
    testResult.value = { method: 'GET', url: '/users', error: err.message }
    stats.fail++
  }
}

// 测试 POST
async function testPost() {
  stats.total++
  try {
    const data = await api.createUser({
      name: '测试用户',
      email: 'test@example.com'
    })
    testResult.value = { method: 'POST', url: '/users', data }
    stats.success++
  } catch (err) {
    testResult.value = { method: 'POST', url: '/users', error: err.message }
    stats.fail++
  }
}

// 测试 PUT
async function testPut() {
  stats.total++
  try {
    const data = await api.updateUser(1, {
      name: '更新后的用户',
      email: 'updated@example.com'
    })
    testResult.value = { method: 'PUT', url: '/users/1', data }
    stats.success++
  } catch (err) {
    testResult.value = { method: 'PUT', url: '/users/1', error: err.message }
    stats.fail++
  }
}

// 测试 DELETE
async function testDelete() {
  stats.total++
  try {
    await api.deleteUser(1)
    testResult.value = { method: 'DELETE', url: '/users/1', message: '删除成功' }
    stats.success++
  } catch (err) {
    testResult.value = { method: 'DELETE', url: '/users/1', error: err.message }
    stats.fail++
  }
}

// 测试获取文章
async function testGetPosts() {
  stats.total++
  try {
    const data = await api.getPosts()
    testResult.value = { method: 'GET', url: '/posts', data }
    stats.success++
  } catch (err) {
    testResult.value = { method: 'GET', url: '/posts', error: err.message }
    stats.fail++
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}
.container {
  max-width: 900px;
  margin: 0 auto;
}
header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}
header h1 { font-size: 2.5rem; margin-bottom: 10px; }
header p { font-size: 1.1rem; opacity: 0.9; }
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}
.card h2 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}
.actions, .test-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}
button:hover:not(:disabled) { background: #5a67d8; transform: translateY(-1px); }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-success { background: #48bb78; }
.btn-success:hover { background: #38a169; }
.btn-danger { background: #f56565; padding: 6px 14px; font-size: 12px; }
.btn-danger:hover { background: #e53e3e; }
.error {
  background: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.empty { color: #999; text-align: center; padding: 20px; }
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.table th, .table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}
.table tr:hover { background: #f7fafc; }
.result {
  background: #1a202c;
  color: #68d391;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}
.result h3 { color: #e2e8f0; margin-bottom: 10px; font-size: 14px; }
.result pre { font-family: 'Consolas', monospace; font-size: 13px; line-height: 1.5; }
.stats {
  display: flex;
  gap: 30px;
  justify-content: center;
}
.stat-item {
  text-align: center;
  padding: 20px;
}
.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
}
.stat-number.success { color: #48bb78; }
.stat-number.error { color: #f56565; }
.stat-label {
  color: #718096;
  font-size: 14px;
}
</style>