export function safeJsonParse<T>(input: string): T {
  const trimmed = input.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(trimmed) as T;
}
