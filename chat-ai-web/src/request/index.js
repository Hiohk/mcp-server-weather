import axios from 'axios'

const baseURL = import.meta.env.BACKEND_BASE_URL || 'http://localhost:3000/api'
// 创建 Axios 实例
const instance = axios.create({
  baseURL,
  timeout: 60000,
})

/**
 * 发送聊天消息 (POST)
 * @param {string} message 用户消息内容
 * @param {string} [sessionId] 可选会话ID（支持多轮对话）
 * @returns {Promise<{id: string, content: string, timestamp: number, status: string}>}
 */
export async function sendMessage({ message }) {
  try {
    const response = await instance.post('/chat', {
      message,
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 处理Axios错误
      const serverError = error.response?.data
      throw new Error(serverError?.message || error.message)
    }
    throw error
  }
}

// 请求拦截器
instance.interceptors.request.use((config) => {
  return config
})

// 响应拦截器
instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

// 导出实例以便其他模块使用
export default instance
