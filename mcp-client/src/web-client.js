import cors from "cors";
import express from "express";
import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { processWithAI } from "./api/model.js";

let mcpClient = null;
let availableTools = [];

const app = express();

// 允许所有来源的请求
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 使用中间件
app.use(express.json());

// 初始化MCP客户端
async function initMcpClient() {
  if (mcpClient) return;

  try {
    console.log("正在连接到MCP服务器...");
    mcpClient = new McpClient({
      name: "mcp-client",
      version: "1.0.0",
    });

    const transport = new SSEClientTransport(new URL(process.env.SSE_SERVER_URL));

    await mcpClient.connect(transport);
    const { tools } = await mcpClient.listTools();

    // 转换工具格式为通用格式
    availableTools = tools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      }
    }));

    console.log("MCP客户端和工具已初始化完成");
  } catch (error) {
    console.error("初始化MCP客户端失败:", error);
    throw error;
  }
}

// 创建路由器
const apiRouter = express.Router();

// 中间件：确保MCP客户端已初始化
apiRouter.use(async (req, res, next) => {
  if (!mcpClient) {
    try {
      await initMcpClient();
    } catch (error) {
      return res.status(500).json({ error: "MCP客户端初始化失败" });
    }
  }
  next();
});

// API: 获取可用工具列表
apiRouter.get("/tools", async (req, res) => {
  try {
    res.json({ tools: availableTools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: 聊天请求
apiRouter.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "消息不能为空" });
    }

    // 调用通用大模型接口
    const completion = await processWithAI({
      messages: [{ role: "user", content: message }],
      tools: availableTools
    });

    const response = completion.choices[0].message

    // 处理工具调用
    if (response.tool_calls) {
      const toolResults = [];

      for (const toolCall of response.tool_calls) {
        try {
          const toolResult = await mcpClient.callTool({
            name: toolCall.function.name,
            arguments: toolCall.function.arguments
          });

          toolResults.push({
            id: toolCall.id,
            name: toolCall.function.name,
            result: toolResult
          });
        } catch (error) {
          toolResults.push({
            id: toolCall.id,
            name: toolCall.function.name,
            error: error.message
          });
        }
      }

      // 将结果返回给AI获取最终响应
      const finalResponse = await processWithAI({
        messages: [
          { role: "user", content: message },
          {
            role: "user",
            content: JSON.stringify(toolResults)
          }
        ]
      });

      res.json({
        response: finalResponse,
        toolCalls: toolResults
      });
    } else {
      res.json({
        response: response.content,
        toolCalls: []
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: 直接调用工具
apiRouter.post("/call-tool", async (req, res) => {
  try {
    const { name, args } = req.body;

    if (!name) {
      return res.status(400).json({ error: "工具名称不能为空" });
    }

    const result = await mcpClient.callTool({
      name,
      arguments: args || {}
    });

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 注册API路由
app.use("/api", apiRouter);

// 启动服务器
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web客户端服务器已启动，地址: http://localhost:${PORT}`);
  initMcpClient().catch(console.error);
});