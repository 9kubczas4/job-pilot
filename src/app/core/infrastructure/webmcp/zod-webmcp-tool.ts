import {
  inject,
  NgZone,
  provideExperimentalWebMcpTools,
  type EnvironmentProviders,
  type WebMcpClient,
  type WebMcpToolDescriptor,
} from '@angular/core';
import { ToastService } from '@shared/ui/toast/toast.service';
import { z } from 'zod';
import { toolFailure, toolJson } from './tool-response';

interface WebMcpSchemaMetadata {
  description?: string;
  title?: string;
}

type WebMcpStringSchema = WebMcpSchemaMetadata & {
  type: 'string';
  enum?: readonly string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

type WebMcpNumberSchema = WebMcpSchemaMetadata & {
  type: 'number' | 'integer';
  enum?: readonly number[];
  minimum?: number;
  maximum?: number;
};

type WebMcpBooleanSchema = WebMcpSchemaMetadata & {
  type: 'boolean';
  enum?: readonly boolean[];
};

type WebMcpNullSchema = WebMcpSchemaMetadata & {
  type: 'null';
  enum?: readonly null[];
};

type WebMcpArraySchema = WebMcpSchemaMetadata & {
  type: 'array';
  items: WebMcpJsonSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
};

export type WebMcpObjectSchema = WebMcpSchemaMetadata & {
  type: 'object';
  properties?: Readonly<Record<string, WebMcpJsonSchema>>;
  required?: readonly string[];
  additionalProperties?: boolean | WebMcpJsonSchema;
};

type WebMcpJsonSchema =
  | WebMcpStringSchema
  | WebMcpNumberSchema
  | WebMcpBooleanSchema
  | WebMcpNullSchema
  | WebMcpArraySchema
  | WebMcpObjectSchema;
type MaybePromise<T> = T | Promise<T>;
type WebMcpPayload = { success: boolean } & Record<string, unknown>;

export interface ZodWebMcpTool<TSchema extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  inputSchema: WebMcpObjectSchema;
  run: (input: z.output<TSchema>, client: WebMcpClient) => MaybePromise<WebMcpPayload>;
  execute: (
    input: unknown,
    client: WebMcpClient,
  ) => Promise<{ content: { type: 'text'; text: string }[] }>;
}

interface ZodWebMcpToolOptions<TSchema extends z.ZodType> {
  name: string;
  description: string;
  inputSchema: TSchema;
  execute: (input: z.output<TSchema>, client: WebMcpClient) => MaybePromise<WebMcpPayload>;
}

export function defineZodWebMcpTool<TSchema extends z.ZodType>(
  options: ZodWebMcpToolOptions<TSchema>,
): ZodWebMcpTool<TSchema> {
  const run = options.execute;

  return {
    name: options.name,
    description: options.description,
    inputSchema: z.toJSONSchema(options.inputSchema) as WebMcpObjectSchema,
    run,
    execute: async (input, client) => {
      inject(ToastService).showAiToolActivated(options.name);

      const parsed = options.inputSchema.safeParse(input);
      if (!parsed.success) {
        return toolJson(
          toolFailure(
            'INVALID_ARGUMENTS',
            'Tool arguments did not match the input schema.',
            parsed.error.issues.map((issue) => ({
              path: issue.path.map(String).join('.'),
              message: issue.message,
            })),
          ),
        );
      }

      try {
        // The browser Model Context API invokes tools outside Angular's zone.
        // Re-enter it so router navigation and signal-backed UI updates are rendered.
        return toolJson(await inject(NgZone).run(() => run(parsed.data, client)));
      } catch (error) {
        return toolJson(
          toolFailure(
            'EXECUTION_FAILED',
            error instanceof Error ? error.message : 'Tool execution failed.',
          ),
        );
      }
    },
  };
}

export function provideZodWebMcpTools(tools: readonly ZodWebMcpTool[]): EnvironmentProviders {
  return provideExperimentalWebMcpTools([
    ...tools,
  ] as unknown as WebMcpToolDescriptor<WebMcpObjectSchema>[]);
}
