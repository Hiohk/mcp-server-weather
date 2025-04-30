import dotenv from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { getCityLocation, getCityWeather } from './weather.js';

dotenv.config();


function createWeatherServer() {
  const server = new Server(
    {
      name: "weather-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {
          weather: {
            mimeTypes: ["application/json"],
            uris: ["weather:///*"]
          }
        },
        tools: {} // 工具声明改为动态注册
      },
    }
  );

  server.onerror = (error) => {
    console.error("[MCP Error]", error);
  };

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  // 工具列表声明
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [{
      name: "get_forecast",
      description: "获取城市天气预报信息",
      inputSchema: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "城市名称（中文）"
          }
        },
        required: ["city"]
      }
    }]
  }));

  // 工具调用处理器
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = String(request.params.name);
    const parameters = request.params.parameters;

    if (name !== "get_forecast") {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `未知工具: ${name}`
      );
    }

    // 参数验证
    const city = parameters?.city || "北京";

    if (!city || typeof city !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        "必须提供有效的城市名称"
      );
    }

    try {
      // 获取城市位置
      const cityResult = await getCityLocation({
        location: city,
        lang: 'zh',
        number: 1
      });

      if (!cityResult.location[0]?.id) {
        throw new McpError(ErrorCode.NotFound, "城市不存在");
      }

      // 获取天气预报
      const weatherData = await getCityWeather({
        location: cityResult.location[0].id,
        lang: 'zh',
      });

      // 构建实时天气数据
      const currentWeather = {
        observationTime: weatherData.now.obsTime,
        temperature: `${weatherData.now.temp}℃`,
        feelsLike: `${weatherData.now.feelsLike}℃`,
        condition: {
          icon: weatherData.now.icon,
          text: weatherData.now.text
        },
        wind: {
          direction: {
            degree: weatherData.now.wind360,
            text: weatherData.now.windDir
          },
          scale: weatherData.now.windScale,
          speed: `${weatherData.now.windSpeed} km/h`
        },
        humidity: `${weatherData.now.humidity}%`,
        precipitation: `${weatherData.now.precip} mm`,
        pressure: `${weatherData.now.pressure} hPa`,
        visibility: `${weatherData.now.vis} km`,
        cloudCover: weatherData.now.cloud ? `${weatherData.now.cloud}%` : 'N/A',
        dewPoint: weatherData.now.dew ? `${weatherData.now.dew}℃` : 'N/A'
      };

      return {
        content: [{
          type: "text",
          text: `${city}实时天气报告（观测时间：${currentWeather.observationTime}）：
            🌡️ 温度：${currentWeather.temperature}（体感 ${currentWeather.feelsLike}）
            🌤️ 天气：${currentWeather.condition.text}
            🌬️ 风速：${currentWeather.wind.speed}（${currentWeather.wind.direction.text}）
            💧 湿度：${currentWeather.humidity}
            🌧️ 降水量：${currentWeather.precipitation}
            📊 气压：${currentWeather.pressure}
            👁️ 能见度：${currentWeather.visibility}
            ☁️ 云量：${currentWeather.cloudCover}
            💦 露点温度：${currentWeather.dewPoint}`
        }]
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      console.error("天气预报请求失败:", error);
      throw new McpError(ErrorCode.Internal, "获取预报数据失败");
    }
  });

  return {
    run: async () => {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("天气服务已启动（标准输入输出模式）");
    }
  };
}

const server = createWeatherServer();
server.run().catch(console.error);