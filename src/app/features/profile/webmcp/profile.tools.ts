import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson, toolText } from '@shared/webmcp/tool-response';
import { ProfileStore } from '../state/profile.store';
import { getProfileSchemaPayload } from './profile-schema';

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
    {
      name: 'get_profile_schema',
      description:
        'Return the candidate profile schema so agents know which fields can be filled in.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: () => toolJson(getProfileSchemaPayload()),
    },
    {
      name: 'update_profile',
      description:
        'Update selected candidate profile fields for the authenticated user. Partial updates are supported.',
      inputSchema: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          headline: { type: 'string' },
          yearsOfExperience: { type: 'number' },
          skills: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                years: { type: 'number' },
              },
              required: ['name'],
            },
          },
          preferredRoles: { type: 'array', items: { type: 'string' } },
          preferredSeniorities: {
            type: 'array',
            items: { type: 'string', enum: ['junior', 'mid', 'senior', 'lead', 'staff'] },
          },
          preferredLocations: { type: 'array', items: { type: 'string' } },
          workplacePreferences: {
            type: 'array',
            items: { type: 'string', enum: ['remote', 'hybrid', 'onsite'] },
          },
          contractPreferences: {
            type: 'array',
            items: { type: 'string', enum: ['b2b', 'uop', 'uz', 'internship'] },
          },
          salaryExpectation: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              currency: { type: 'string', enum: ['PLN', 'EUR', 'USD'] },
            },
          },
          preferences: { type: 'string' },
        },
        additionalProperties: false,
      },
      execute: async (input) => {
        try {
          const profile = await inject(ProfileStore).updateProfile(input);
          return toolJson(profile);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Profile update failed.';
          return toolText(message);
        }
      },
    },
  ]);
}
