import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server as mcpServer } from "./mcp-server.js";

dotenv.config();

const app = express();

// 允许所有来源的请求
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 存储活跃连接
const connections = new Map();

// 健康检查端点
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connections: connections.size,
  });
});


// SSE 连接建立端点
app.get("/sse", async (req, res) => {
  // 实例化SSE传输对象
  const transport = new SSEServerTransport("/messages", res);
  // 获取sessionId
  const sessionId = transport.sessionId;

  console.log(`[${new Date().toISOString()}] 新的SSE连接建立: ${sessionId}`);

  // 注册连接
  connections.set(sessionId, transport);

  // 连接中断处理
  req.on("close", () => {
    console.log(`[${new Date().toISOString()}] SSE连接关闭: ${sessionId}`);
    connections.delete(sessionId);
  });

  // 将传输对象与MCP服务器连接
  await mcpServer.connect(transport);
  console.log(`[${new Date().toISOString()}] MCP服务器连接成功: ${sessionId}`);

  // 发送心跳包以保持连接
  const heartbeatInterval = setInterval(() => {
    res.write('event: heartbeat\ndata: ' + Date.now() + '\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeatInterval);
  });
});


// 接收客户端消息的端点
app.post("/messages", async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] 收到客户端消息:`, req.query);
    const sessionId = req.query.sessionId;

    // 查找对应的SSE连接并处理消息
    if (connections.size > 0) {
      const transport = connections.get(
        sessionId
      );
      // 使用transport处理消息
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        throw new Error("没有活跃的SSE连接");
      }
    } else {
      throw new Error("没有活跃的SSE连接");
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 处理客户端消息失败:`, error);
    res.status(500).json({ error: "处理消息失败", message: error.message });
  }
});


// 优雅关闭所有连接
async function closeAllConnections() {
  console.log(
    `[${new Date().toISOString()}] 关闭所有连接 (${connections.size}个)`
  );
  for (const [id, transport] of connections.entries()) {
    try {
      // 发送关闭事件
      transport.res.write(
        'event: server_shutdown\ndata: {"reason": "Server is shutting down"}\n\n'
      );
      transport.res.end();
      console.log(`[${new Date().toISOString()}] 已关闭连接: ${id}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] 关闭连接失败: ${id}`, error);
    }
  }
  connections.clear();
}

// 错误处理
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] 未处理的异常:`, err);
  res.status(500).json({ error: "服务器内部错误" });
});


// 优雅关闭
process.on("SIGTERM", async () => {
  console.log(`[${new Date().toISOString()}] 接收到SIGTERM信号，准备关闭`);
  await closeAllConnections();
  server.close(() => {
    console.log(`[${new Date().toISOString()}] 服务器已关闭`);
    process.exit(0);
  });
});


process.on("SIGINT", async () => {
  console.log(`[${new Date().toISOString()}] 接收到SIGINT信号，准备关闭`);
  await closeAllConnections();
  process.exit(0);
});


const PORT = process.env.PORT || 9090;

app
  .listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`);
  })
  .on('error', (err) => {
    console.error(`Server error`, err);
  });