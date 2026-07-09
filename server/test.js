// API 接口测试脚本
// 运行: npm run test:api

const BASE_URL = 'http://localhost:3000/api'

let passCount = 0
let failCount = 0

async function test(name, fn) {
  try {
    const result = await fn()
    console.log(`✅ ${name}`)
    if (result) console.log('   ', JSON.stringify(result))
    passCount++
  } catch (err) {
    console.log(`❌ ${name}`)
    console.log('   ', err.message)
    failCount++
  }
}

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function runTests() {
  console.log('🧪 开始测试 API 接口...\n')

  await test('GET /users - 获取用户列表', async () => {
    const users = await request('/users')
    if (!Array.isArray(users)) throw new Error('返回的不是数组')
    if (users.length === 0) throw new Error('用户列表为空')
    return { count: users.length }
  })

  await test('GET /users/1 - 获取单个用户', async () => {
    const user = await request('/users/1')
    if (!user.id) throw new Error('用户数据格式错误')
    return user
  })

  await test('POST /users - 创建用户', async () => {
    const user = await request('/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'TestUser', email: 'test@test.com' })
    })
    if (!user.id) throw new Error('创建失败')
    return user
  })

  await test('PUT /users/1 - 更新用户', async () => {
    const user = await request('/users/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'UpdatedAlice' })
    })
    if (user.name !== 'UpdatedAlice') throw new Error('更新未生效')
    return user
  })

  await test('GET /posts - 获取文章列表', async () => {
    const posts = await request('/posts')
    if (!Array.isArray(posts)) throw new Error('返回的不是数组')
    return { count: posts.length }
  })

  await test('POST /posts - 创建文章', async () => {
    const post = await request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title: '测试文章', author: 'Test', content: '测试内容' })
    })
    if (!post.id) throw new Error('创建失败')
    return post
  })

  await test('DELETE /users/2 - 删除用户', async () => {
    const result = await request('/users/2', { method: 'DELETE' })
    return result
  })

  console.log('\n═══════════════════════════════════════')
  console.log(`测试完成: ${passCount} 通过, ${failCount} 失败`)
  console.log('═══════════════════════════════════════')

  process.exit(failCount > 0 ? 1 : 0)
}

runTests()
