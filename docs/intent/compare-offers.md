# Intent: compare_offers WebMCP

Confirmed on 2026-08-31.

## Outcome

The agent invokes a dedicated WebMCP tool to show its analysis and feedback on the page — a comparison of 2–5 job offers with optional badges and short notes.

## User

A job seeker using Job Pilot with an AI agent who wants recommendations visible in the app UI, not only in chat.

## Why now

Existing WebMCP tools operate on single offers or search state. There is no channel for the agent to present a comparative recommendation surface.

## Success

1. Agent calls `compare_offers` when it wants to share feedback.
2. A right-side drawer opens with the agent summary, stacked offer cards, and per-offer badges/notes.
3. The user can click an offer to open job details; the drawer closes.
4. Closing the drawer or navigating away clears the view. No history in v1.

## Constraint

- Max 5 offers, min 2.
- Any known `jobId` (not limited to current search results).
- v1 payload: free-text summary + optional title + per-offer `jobId`, optional `badge`, optional `note`.
- No rigid comparison columns or structured criteria table.

## Out of scope

- Persisting or replaying past comparisons.
- User-initiated comparison UI.
- Structured comparison dimensions (salary column, remote column, etc.).
- Broader “agent feedback” surfaces unrelated to job offers.
