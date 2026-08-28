export function toolText(text: string): { content: Array<{ type: 'text'; text: string }> } {
  return { content: [{ type: 'text', text }] };
}

export function toolJson(data: unknown): { content: Array<{ type: 'text'; text: string }> } {
  return toolText(JSON.stringify(data, null, 2));
}
