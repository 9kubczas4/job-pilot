# WebMCP Evals

These fixtures follow the experimental `webmcp-evals` format published by
GoogleChromeLabs.

## Suites

- `tool-selection.evals.json` evaluates whether a model chooses each WebMCP tool with the
  expected arguments. It uses `tools.json`, which represents the complete tool set exposed
  on `/profile`: all global tools plus the route-scoped `update_profile` tool.
- `public-journeys.evals.json` exercises only data-safe, unauthenticated tools, including the
  transient map-only `highlight_job` interaction. It is safe to use for live browser
  evaluations and deterministic smoke tests.

The Angular contract test fails if `tools.json` drifts from the runtime descriptors or if an
eval suite loses required tool coverage.

## Commands

Start the application before running browser-based suites:

```sh
npm start
```

Run deterministic live smoke tests without an API key:

```sh
npm run eval:webmcp:smoke
```

Evaluate tool selection against the static catalog with an LLM backend:

```sh
npm run eval:webmcp:local
```

Evaluate safe journeys against the live application:

```sh
npm run eval:webmcp:browser
```

`webmcp-evals@0.0.4` does not implement browser execution in its native `gemini`
backend. For live Gemini evaluations, use the Vercel AI SDK backend with the `google:`
model prefix. Both npm scripts default to `--backend vercel --model
google:gemini-3.7-flash`.

Configure the environment variable required by the selected backend, for example
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_AI`. Reports are generated in `.evals/`,
which is intentionally ignored by Git.
