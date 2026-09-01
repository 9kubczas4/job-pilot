import { inject } from '@angular/core';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { z } from 'zod';
import { validateProfileDraft } from '../domain/profile.utils';
import { ProfileStore } from '../state/profile.store';
import { UPDATE_PROFILE_INPUT_SCHEMA } from './profile.schemas';

export const GET_PROFILE_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'get_profile',
  description:
    'Read the signed-in candidate profile. Use this tool instead of interacting with the page UI or DOM. Returns identity, experience, skills, work history, and job preferences without changing state.',
  inputSchema: z.strictObject({}),
  execute: async () => {
    const profile = await inject(ProfileStore).loadProfile();
    return profile
      ? toolSuccess({ changed: false, profile })
      : toolFailure('UNAUTHENTICATED', 'Sign in before reading the candidate profile.');
  },
});

export function provideGetProfileWebMcpTool() {
  return provideZodWebMcpTools([GET_PROFILE_WEBMCP_TOOL]);
}

export const UPDATE_PROFILE_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'update_profile',
  description:
    'Update the signed-in candidate profile. Use this tool instead of interacting with the page UI or DOM. Omitted fields stay unchanged; arrays replace the whole field and [] clears it. Persists immediately.',
  inputSchema: UPDATE_PROFILE_INPUT_SCHEMA,
  execute: async (patch) => {
    const store = inject(ProfileStore);
    const current = await store.loadProfile();
    if (!current) {
      return toolFailure('UNAUTHENTICATED', 'Sign in before updating the candidate profile.');
    }

    const candidate = { ...current, ...patch };
    const validationErrors = validateProfileDraft(candidate);
    if (validationErrors.length) {
      return toolFailure('INVALID_ARGUMENTS', validationErrors[0]);
    }

    const changed = Object.entries(patch).some(
      ([key, value]) =>
        JSON.stringify(current[key as keyof typeof current]) !== JSON.stringify(value),
    );
    if (!changed) {
      return toolSuccess({ changed: false, profile: current });
    }

    const profile = await store.updateProfile(patch);
    return toolSuccess({ changed: true, profile });
  },
});

export function provideUpdateProfileWebMcpTool() {
  return provideZodWebMcpTools([UPDATE_PROFILE_WEBMCP_TOOL]);
}
