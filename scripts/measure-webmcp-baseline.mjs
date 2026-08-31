import { readFileSync } from 'node:fs';

const tools = readJson('webmcp-evals/tools.json').tools;
const journeys = readJson('webmcp-evals/public-journeys.evals.json');
const jobs = readJson('src/assets/seed/jobs.json');

const jobPayloadBytes = jobs.map((job) => byteLength(job)).sort((a, b) => a - b);
const journeyCalls = journeys.map((journey) => ({
  name: journey.name,
  expectedToolCalls: countExpectedCalls(journey.expectedCall),
}));

const report = {
  toolCatalog: {
    toolCount: tools.length,
    catalogBytes: byteLength({ tools }),
    descriptionBytes: tools.reduce((total, tool) => total + byteLength(tool.description), 0),
    inputSchemaBytes: tools.reduce((total, tool) => total + byteLength(tool.inputSchema), 0),
    tools: tools.map((tool) => ({
      name: tool.name,
      descriptionBytes: byteLength(tool.description),
      inputSchemaBytes: byteLength(tool.inputSchema),
    })),
  },
  jobPayloads: {
    jobCount: jobs.length,
    totalBytes: byteLength(jobs),
    averageJobBytes: Math.round(average(jobPayloadBytes)),
    medianJobBytes: percentile(jobPayloadBytes, 0.5),
    maximumJobBytes: jobPayloadBytes.at(-1) ?? 0,
    estimatedFiveJobBatchBytes: Math.round(average(jobPayloadBytes) * 5),
    estimatedMaximumBatchBytes: Math.round(average(jobPayloadBytes) * 20),
  },
  publicJourneys: {
    journeyCount: journeys.length,
    totalExpectedToolCalls: journeyCalls.reduce(
      (total, journey) => total + journey.expectedToolCalls,
      0,
    ),
    journeys: journeyCalls,
  },
};

console.log(JSON.stringify(report, null, 2));

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function byteLength(value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.byteLength(serialized, 'utf8');
}

function average(values) {
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;
}

function percentile(sortedValues, fraction) {
  if (!sortedValues.length) {
    return 0;
  }

  return sortedValues[Math.floor((sortedValues.length - 1) * fraction)];
}

function countExpectedCalls(value) {
  if (Array.isArray(value)) {
    return value.reduce((total, entry) => total + countExpectedCalls(entry), 0);
  }
  if (!value || typeof value !== 'object') {
    return 0;
  }
  if ('functionName' in value) {
    return value.optional ? 0 : 1;
  }
  if ('ordered' in value) {
    return countExpectedCalls(value.ordered);
  }
  if ('unordered' in value) {
    return countExpectedCalls(value.unordered);
  }
  return 0;
}
