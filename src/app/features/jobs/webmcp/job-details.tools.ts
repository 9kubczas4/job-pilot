import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideApplyJobWebMcpTool } from './tools/apply-job/apply-job.tool';
import { provideGetJobWebMcpTool } from './tools/get-job/get-job.tool';
import { provideSaveJobWebMcpTool } from './tools/save-job/save-job.tool';

export function provideJobDetailsWebMcpTools(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideGetJobWebMcpTool(),
    provideSaveJobWebMcpTool(),
    provideApplyJobWebMcpTool(),
  ]);
}
