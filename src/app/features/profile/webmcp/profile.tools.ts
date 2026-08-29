import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson, toolText } from '@shared/webmcp/tool-response';
import { ProfileStore } from '../state/profile.store';

export function provideProfileRouteWebMcpTools() {
  return provideExperimentalWebMcpTools([
    {
      name: 'get_profile',
      description: 'Read the authenticated candidate profile.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => {
        const profile = await inject(ProfileStore).loadProfile();
        if (!profile) {
          return toolText('Authentication required to read profile.');
        }
        return toolJson(profile);
      },
    },
  ]);
}
