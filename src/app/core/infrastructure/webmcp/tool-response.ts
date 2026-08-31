export function toolText(text: string): { content: { type: 'text'; text: string }[] } {
  return { content: [{ type: 'text', text }] };
}

export function toolJson(data: unknown): { content: { type: 'text'; text: string }[] } {
  return toolText(JSON.stringify(data, null, 2));
}

export type WebMcpErrorCode =
  | 'INVALID_ARGUMENTS'
  | 'NOT_FOUND'
  | 'JOB_NOT_IN_RESULTS'
  | 'UNAUTHENTICATED'
  | 'EXECUTION_FAILED';

export interface WebMcpValidationIssue {
  path: string;
  message: string;
}

export function toolSuccess<T extends object>(data: T): { success: true } & T {
  return { success: true, ...data };
}

export function toolFailure(
  code: WebMcpErrorCode,
  message: string,
  issues?: WebMcpValidationIssue[],
) {
  return {
    success: false as const,
    error: {
      code,
      message,
      ...(issues?.length ? { issues } : {}),
    },
  };
}
