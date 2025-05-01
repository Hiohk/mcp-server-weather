import json5 from "json5";

/**
 * 从消息内容中提取并解析 JSON 对象
 * @param {string} messageContent 包含 JSON 的字符串
 * @returns {object|null} 解析后的对象，失败时返回 null
 */
export function parseToolCallFromMessage(messageContent) {
  if (typeof messageContent !== "string" || !messageContent.trim()) {
    console.error("输入必须是非空字符串");
    return null;
  }

  try {
    // 1. 更强大的正则匹配（兼容 ```json 和 ```javascript 等多种标记）
    const jsonMatch = messageContent.match(
      /```(?:json|javascript)?\n([\s\S]*?)```/i
    );
    if (!jsonMatch) {
      // 尝试直接解析整个字符串（应对无代码块包裹的情况）
      return tryParseJson(messageContent.trim());
    }

    // 2. 提取并预处理 JSON 字符串
    let jsonString = jsonMatch[1]
      .trim()
      // 移除可能的单行注释（//...）
      .replace(/\/\/.*$/gm, "")
      // 移除多余逗号（允许 JSON5 风格）
      .replace(/,(\s*[}\]])/g, "$1");

    // 3. 安全解析
    return tryParseJson(jsonString);
  } catch (error) {
    console.error("解析失败:", error.message);
    return null;
  }
}

/**
 * 安全解析 JSON 的辅助函数
 */
function tryParseJson(jsonString) {
  try {
    // 允许 JSON5 格式（非严格 JSON）
    return json5.parse(jsonString);
  } catch (e) {
    // 尝试修复常见问题后重新解析
    const sanitized = jsonString
      // 替换单引号为双引号
      .replace(/'([^']+)'/g, '"$1"')
      // 修复无引号的 key（如 {name: "value"} → {"name": "value"}）
      .replace(/([{,]\s*)([a-zA-Z_$][\w$]*)(\s*:)/g, '$1"$2"$3');

    try {
      return json5.parse(sanitized);
    } catch (finalError) {
      console.error(
        "最终解析失败:",
        finalError.message,
        "原始内容:",
        jsonString
      );
      return null;
    }
  }
}
