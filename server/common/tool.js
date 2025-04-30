// 新增工具调用解析函数
export function parseToolCallFromMessage(messageContent) {
  try {
    // 尝试直接解析JSON数组
    const toolCalls = JSON.parse(messageContent.trim());

    if (!Array.isArray(toolCalls)) {
      throw new Error("工具调用格式应为数组");
    }

    return toolCalls.map(call => {
      if (!call.name || !call.parameters) {
        throw new Error("每个工具调用必须包含name和parameters字段");
      }
      return {
        name: call.name,
        parameters: call.parameters
      };
    });
  } catch (error) {
    console.error('工具调用解析失败:', error);
    return null;
  }
}