import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from 'dotenv';
import express from 'express';
import { parseToolCallFromMessage } from "../server/common/tool.js"

dotenv.config();

const app = express();
app.use(express.json());

// 环境配置
const ENV_CONFIG = {
  PORT: process.env.PORT || 3000,
  AI_MODEL: process.env.AI_MODEL_NAME,
  MAX_RETRIES: 3
};

// 客户端状态管理
let serviceClient = null;

// 对话上下文缓存
const conversationContext = new Map();

async function initializeServices() {
  serviceClient = new Client({
    name: 'weather-service',
    version: '1.0.0'
  });

  const transport = new StdioClientTransport({
    command: "node",
    args: ["./server/weather/weatherServer.js"]
  });

  await serviceClient.connect(transport);
}

// 增强版工具调用处理器
async function handleToolCall(toolName, parameters, attempt = 1) {
  try {
    const result = await serviceClient.callTool({
      name: toolName,
      parameters: parameters
    });

    // 统一处理不同格式的返回结果
    return {
      success: true,
      data: result.content.reduce((acc, item) => {
        if (item.type === 'text') acc.text = item.text;
        return acc;
      }, {})
    };
  } catch (error) {
    if (attempt < ENV_CONFIG.MAX_RETRIES) {
      console.log(`Retrying tool call ${toolName} (attempt ${attempt})`);
      return handleToolCall(toolName, parameters, attempt + 1);
    }
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
}

// 大模型请求处理器
async function processWithAI(messages, tools) {
  try {
    const response = await fetch(`${process.env.DEEPSEEK_API_BASE_URL}${process.env.DEEPSEEK_API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ENV_CONFIG.AI_MODEL,
        messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1000,
        tools: tools.map(tool => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
            strict: true
          }
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI Processing Error:', error);
    throw new Error('AI service unavailable');
  }
}

// 对话管道处理器
async function processChatPipeline(userMessage, sessionId) {
  const context = conversationContext.get(sessionId) || [];
  context.push({ role: "user", content: userMessage });

  const { tools } = await serviceClient.listTools();

  // 第一步：获取AI初始响应
  let aiResponse = await processWithAI(context, tools);
  const assistantMessage = aiResponse.choices[0].message;
  context.push(assistantMessage);

  // console.log('AI Response:', assistantMessage);

  // 第二步：解析工具调用
  let toolCalls = [];
  if (assistantMessage.content) {
    // 从content字段解析
    const parsedCall = parseToolCallFromMessage(assistantMessage.content);
    if (parsedCall) toolCalls = parsedCall;
  }

  // 第三步：执行工具调用
  const toolResults = [];
  for (const call of toolCalls) {
    const toolResult = await handleToolCall(call.name, call.parameters);

    // console.log("----->", toolResult);
    toolResults.push({
      toolName: call.name,
      result: toolResult.success ?
        JSON.stringify(toolResult.data) :
        `调用失败: ${toolResult.error}`
    });
  }

  // 第四步：生成最终响应
  if (toolResults.length > 0) {
    context.push({
      role: "user",
      content: `工具调用结果：\n${toolResults.map(t =>
        `${t.toolName}: ${t.result}`
      ).join('\n')}`
    });

    aiResponse = await processWithAI(context, tools);
    context.push(aiResponse.choices[0].message);

    console.log('Final Response:', aiResponse.choices[0].message);
  }

  // 更新上下文（保留最近5条消息）
  conversationContext.set(sessionId, context.slice(-5));

  // 返回最终响应内容
  return {
    text: aiResponse.choices[0].message.content,
    reasoning: aiResponse.choices[0].message.reasoning_content,
    toolResults: toolResults.length > 0 ? toolResults : undefined
  };
}

// 聊天接口路由
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    // 参数校验
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request format',
        details: 'Message field is required and must be a string'
      });
    }

    const promptMessage = `请根据输入的文本内容：${message}来给出需要调用的工具和参数。，输出格式为
    [{name: "工具的英文名称",parameters: {参数1: "参数1的值", 参数2: "参数2的值", ...}}]`;

    // 处理对话流程
    const finalResponse = await processChatPipeline(promptMessage, sessionId);

    res.json({
      status: 'success',
      response: finalResponse,
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      details: error.stack
    });
  }
});

// 服务启动
initializeServices()
  .then(() => {
    app.listen(ENV_CONFIG.PORT, () => {
      console.log(`Server running on http://localhost:${ENV_CONFIG.PORT}`);
    });
  })
  .catch(error => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });