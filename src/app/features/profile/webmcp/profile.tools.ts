import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson, toolText } from '@core/infrastructure/webmcp/tool-response';
import { ProfileStore } from '../state/profile.store';

export function provideGetProfileWebMcpTool() {
  return provideExperimentalWebMcpTools([
    {
      name: 'get_profile',
      description:
        'Read the candidate profile. Returns profile data: name,headline, experience, skills, and job preferences. To update fields, use update_profile on /profile.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => {
        const profile = await inject(ProfileStore).loadProfile();
        if (!profile) {
          return toolText('Authentication required to read profile.');
        }
        return toolJson({ success: true, changed: false, profile });
      },
    },
  ]);
}
