// API 接口封装
const BASE_URL = '/api'

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const api = {
  // 获取用户列表
  getUsers() {
    return request('/users')
  },
  // 获取单个用户
  getUser(id) {
    return request(`/users/${id}`)
  },
  // 创建用户
  createUser(data) {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  // 更新用户
  updateUser(id, data) {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  // 删除用户
  deleteUser(id) {
    return request(`/users/${id}`, {
      method: 'DELETE'
    })
  },
  // 获取文章列表
  getPosts() {
    return request('/posts')
  },
  // 创建文章
  createPost(data) {
    return request('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}