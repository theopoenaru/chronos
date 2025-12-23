# Product Requirements Document (PRD)

## Product Name

**MeetChronos** (working title)

## Problem Statement

Knowledge workers spend excessive time managing calendars and coordinating meetings. Existing tools surface data but do not reason over schedules or proactively assist decision-making.

## Objective

Build a lightweight AI calendar assistant that:

1. Authenticates a Google Workspace user
2. Ingests Google Calendar data
3. Allows natural-language interaction to reason over availability, conflicts, and scheduling decisions

## Target User

* Individual professionals using Google Calendar
* Primary use case: personal scheduling intelligence (not team scheduling)

## Core User Flows

1. **Sign in**

   * User authenticates via Google OAuth
2. **Calendar ingestion**

   * Read-only access to Google Calendar events
3. **Calendar visualization**

   * Clean, minimal view of upcoming events (day/week)
4. **Chat interaction**

   * User asks questions about their calendar
   * AI responds using calendar context

## MVP Feature Set (Must-Have)

### Authentication

* Google OAuth (single account)
* Secure session management

### Calendar Integration

* Read events from Google Calendar
* Time-bounded fetch (e.g., ±30 days)

### Chat Interface

* Free-form natural language input
* Context-aware responses grounded in calendar data
* Transparency features:
  * **Show data used**: Display time window queried, number of events found, timezone
  * **Show tool steps**: Display tool name, status (success/error), and short non-sensitive summary of outputs
  * **Do not expose**: Chain-of-thought reasoning or internal LLM reasoning steps

### AI Capabilities (Initial)

* Availability queries (“When am I free tomorrow?”)
* Conflict detection (“Do I have overlaps this week?”)
* Simple recommendations (“Best time for a 30-min meeting on Friday”)

## Non-Goals (Explicitly Out of Scope)

* Writing/modifying calendar events
* Multi-user or shared calendars
* Notifications, reminders, or automations
* Long-term memory beyond session or DB persistence

## Functional Requirements

* AI responses must be explainable and deterministic given the same calendar state
* Calendar data must never be sent to third parties other than the LLM provider
* Chat responses must reference actual events/times (no hallucinated meetings)

## Technical Requirements

* Web app (React)
* Google Calendar API (read-only)
* LLM integration (Gemini)
* Persistent store (Postgres)
* Deployed to a simple PaaS (e.g., Render)

## Data Model (Minimal)

* User
* OAuth tokens
* Cached calendar events
* Chat sessions/messages

## Success Criteria

* User can authenticate and see their calendar within 30 seconds
* Chat answers are accurate against calendar data
* Core flows usable without instructions

## Risks & Mitigations

* **LLM hallucinations** → Strict tool-based calendar grounding
* **OAuth complexity** → Limit scopes and supported accounts
* **Scope creep** → Hard MVP boundary enforced

## Future Extensions (Not Implemented)

* Write actions (schedule/reschedule)
* Multi-calendar reasoning
* Proactive suggestions
* Email/calendar cross-reasoning