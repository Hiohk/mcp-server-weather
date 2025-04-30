// src/api/chatService.js
import axios from 'axios';
import dotenv from 'dotenv';

// dotenv.config();

// const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
// 创建 Axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000
});

/**
 * 发送聊天消息 (POST)
 * @param {string} message 用户消息内容
 * @param {string} [sessionId] 可选会话ID（支持多轮对话）
 * @returns {Promise<{id: string, content: string, timestamp: number, status: string}>}
 */
export async function sendMessage({ message, sessionId }) {
  try {
    const response = await instance.post('/api/chat', {
      message,
      sessionId
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 处理Axios错误
      const serverError = error.response?.data;
      throw new Error(serverError?.message || error.message);
    }
    throw error;
  }
}

// 请求拦截器
instance.interceptors.request.use(config => {
  console.log(`Sending request to ${config.url}`);
  return config;
});

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

// 导出实例以便其他模块使用
export default instance;