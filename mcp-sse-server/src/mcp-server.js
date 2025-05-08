import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCityLocation, getCityWeather } from './services/weather.js';


export const server = new McpServer({
  name: "mcp-sse-server",
  version: "1.0.0",
  description: "A server for MCP SSE",
});


// 获取城市信息工具（带参数校验）
server.tool(
  "get_city",
  "根据名称查询城市地理位置信息",
  {
    location: z.string().min(1, "城市名称不能为空"),
    lang: z.string().default('zh'),
    number: z.number().int().positive().default(1)
  },
  async ({ location, lang, number }) => {
    try {
      // 查询城市信息
      const result = await getCityLocation({ location, lang, number });
      // 获取天气预报
      const weatherData = await getCityWeather({ location: result.location[0].id, lang: "zh" });

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
          text: `${location}实时天气报告（观测时间：${currentWeather.observationTime}）：
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
      return {
        content: [{
          type: "text",
          text: `错误: ${error instanceof Error ? error.message : '未知错误'}`
        }]
      };
    }
  }
);