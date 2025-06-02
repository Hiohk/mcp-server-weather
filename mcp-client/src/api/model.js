import dotenv from "dotenv";

dotenv.config();

// 大模型请求处理器
export async function processWithAI({ messages, tools = [] }) {
  try {
    const response = await fetch(
      `${process.env.DEEPSEEK_API_BASE_URL}${process.env.DEEPSEEK_API_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL_NAME,
          messages,
          stream: false,
          max_tokens: 4096,
          enable_thinking: false,
          thinking_budget: 4096,
          min_p: 0.05,
          stop: null,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          response_format: {
            type: "text",
          },
          ...(tools?.length > 0 && {
            tools: tools.map((tool) => ({
              type: "function",
              function: {
                name: tool.function?.name,
                description: tool.function?.description || "",
                parameters: tool.function?.input_schema || {},
                strict: false,
              },
            })),
          }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Processing Error:", error);
    throw new Error(`AI service unavailable ${error}`);
  }
}
