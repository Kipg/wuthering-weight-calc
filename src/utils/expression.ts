/**
 * 安全计算数学表达式。
 * 仅允许数字、运算符、小数点、括号和空格。
 * 返回计算结果，如果表达式不合法则返回 null。
 */
export function evaluateExpr(expr: string): number | null {
  // 自动过滤百分号
  const sanitized = expr.replace(/%/g, '').trim();
  if (!sanitized) return null;

  // 安全检查：仅允许合法字符
  if (!/^[\d.+\-*/()\s]+$/.test(sanitized)) return null;

  // 禁止空括号、连续运算符等明显非法模式
  if (/[+\-*/.]{2,}/.test(sanitized)) return null;
  if (/\(\)/.test(sanitized)) return null;

  try {
    // 使用 Function 构造器替代直接 eval，作用域更安全
    const result = new Function(`return (${sanitized})`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return Math.round(result * 10000) / 10000; // 保留4位小数精度
  } catch {
    return null;
  }
}
