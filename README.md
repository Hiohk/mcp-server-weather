# MCP Service Framework

一个基于MCP（Model Context Protocol）协议的可扩展服务框架，提供标准化的工具调用接口和AI集成能力。包含基础服务架构、天气服务实现示例和智能对话处理管道。

## 核心特性

- **MCP协议实现**：完整支持MCP协议的Server/Client通信模型
- **服务热插拔**：支持动态注册和调用各类工具服务
- **智能对话管道**：
  - 上下文感知的对话管理
  - 自动工具调用与结果整合
  - 多轮对话状态保持
- **高可用设计**：
  - 请求重试机制（默认3次）
  - 错误统一处理
  - 服务健康监控

## 技术架构

```
├── MCP Client (Express Server)
│   ├── 会话管理
│   ├── AI集成（DeepSeek）
│   ├── 工具调用路由
│   └── 服务连接器
│
└── MCP Server (Weather Service Example)
    ├── 工具注册
    ├── 参数校验
    ├── 天气API集成
    └── 数据标准化
```

## 快速开始

### 环境准备

```bash
npm install @modelcontextprotocol/sdk express dotenv
```

### 配置环境变量

```env
# 服务配置
PORT=3000
AI_MODEL_NAME=xxxxxx

# DeepSeek API
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1/
DEEPSEEK_API_ENDPOINT=/chat/completions
DEEPSEEK_API_KEY=your_api_key

# 天气服务API
WEATHER_API_KEY=your_weather_api_key
```

### 启动服务

```bash
# 启动主服务
npm run start:prod
```

## 接口示例

**聊天请求**：
```http
POST /chat
Content-Type: application/json

{
  "message": "北京今天天气如何？",
  "sessionId": "user123"
}
```

**响应示例**：
```json
{
  "status": "success",
  "response": {
    "text": "北京当前温度28℃，晴，西北风3级",
    "reasoning": "",
    "toolResults": [{
      "toolName": "get_forecast",
      "result": "温度：28℃ 风速：20km/h..."
    }]
  }
}
```

## 服务扩展指南

### 创建新MCP服务

1. **服务模板**：

```javascript
// services/customService.js
import { Server } from "@modelcontextprotocol/sdk/server";

export function createCustomService() {
  const server = new Server({/* 服务元数据 */});

  // 工具注册
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [{
      name: "custom_tool",
      description: "工具描述",
      inputSchema: {/* JSON Schema */}
    }]
  }));

  // 工具实现
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // 业务逻辑实现
    return { content: [{ type: "text", text: "处理结果" }] };
  });

  return { run: async () => {/* 启动逻辑 */} };
}
```

2. **服务集成**：

```javascript
// 在client.js中扩展
async function initializeServices() {
  // 添加新服务连接
  const customTransport = new StdioClientTransport({
    command: "node",
    args: ["./services/customService.js"]
  });
  await customClient.connect(customTransport);
}
```

## 开发规范

1. **工具设计原则**：
   - 输入输出遵循JSON Schema
   - 错误代码使用标准MCP错误码
   - 包含完整的参数校验

2. **服务通信**：
   - 使用Stdio传输协议
   - 服务版本兼容性管理
   - 心跳检测机制

3. **性能要求**：
   - 单次工具调用响应时间 < 2s
   - 错误重试间隔：500ms, 1000ms, 1500ms
   - 最大上下文长度：5轮对话

## 演进路线

1. **服务发现机制**
2. **负载均衡支持**
3. **服务监控仪表盘**
4. **协议缓冲支持**