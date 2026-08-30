import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideGetJobWebMcpTool } from './tools/get-job/get-job.tool';

export function provideJobDetailsWebMcpTools(): EnvironmentProviders {
  return makeEnvironmentProviders([provideGetJobWebMcpTool()]);
}
