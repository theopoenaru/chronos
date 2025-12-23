# LLM Usage PRD

## Purpose

Define how the LLM is used, constrained, and integrated to reason over Google Calendar data with high reliability and low complexity.

## Model

* **Provider:** Google Gemini
* **Mode:** Tool-augmented text generation
* **Temperature:** Low (deterministic, factual responses)

## LLM Responsibilities

* Interpret user intent from natural language
* Decide when calendar data is required
* Reason over structured calendar inputs
* Generate concise, grounded responses

## Non-Responsibilities

* Long-term memory or personalization
* Autonomous task execution
* Scheduling or calendar mutation
* Background or proactive behaviors

---

## Interaction Model

### Default Mode: **Stateless Tool-Augmented Inference**

Each user message is handled independently with:

* Current user input
* Explicit system instructions
* Freshly fetched or cached calendar data

**Rationale**

* Predictable behavior
* Easy to debug and evaluate
* Avoids hidden state and runaway agents
* Sufficient for MVP calendar reasoning

---

## Agentic vs Stateless Decision

### Stateless (Primary)

Used for:

* Availability queries
* Conflict detection
* One-shot recommendations
* Explanatory reasoning

**Flow**

1. User message received
2. Intent classification
3. Required tools invoked (if any)
4. Calendar data passed to model
5. Model returns final response

### Lightweight Agentic (Deferred / Optional)

Only for **multi-step reasoning within a single request**, not across sessions.

Examples:

* “Find three possible times next week and explain tradeoffs”
* “Compare this week vs last week availability”

**Constraints**

* Single request lifecycle
* Hard cap on tool calls (e.g., 2–3)
* No memory beyond request scope

**Rationale**

* Preserves control
* Demonstrates agent awareness without complexity

---

## Tooling

### Available Tools (Gemini Function Calling)

#### `get_calendar_events`

* Inputs: time range
* Output: normalized event list
* Read-only

#### `summarize_calendar`

* Inputs: event list
* Output: structured summary (free/busy blocks, conflicts)

#### `analyze_availability`

* Inputs: events + constraints (duration, time window)
* Output: ranked candidate time slots

---

## Tool Invocation Rules

* LLM must **request tools explicitly**
* No hallucinated calendar data
* If tool output is empty or ambiguous, LLM must say so
* Tool outputs are treated as authoritative truth

---

## Prompting Strategy

### System Prompt Principles

* Calendar data is the source of truth
* Do not invent events or availability
* Ask for clarification if intent is ambiguous
* Prefer short, factual responses

### User Prompt Handling

* Free-form natural language
* No structured syntax required
* Clarifying questions only when strictly necessary

---

## Output Requirements

* Clear, time-anchored responses
* Explicit references to dates/times when applicable
* No speculative language

## Transparency & Trust

The UI exposes two types of transparency information (not chain-of-thought):

1. **Data Used**: Time window queried, number of events found, timezone
2. **Tool Steps**: Tool name, execution status (success/error), short non-sensitive summary of outputs

The LLM must not expose:
* Internal reasoning chains
* Chain-of-thought steps
* Decision-making process details
* Hidden policy or system instructions

Tool outputs and data metadata are handled separately by the application layer, not the LLM response.

---

## Safety & Privacy

* Calendar data only used in-request
* No training or storage by LLM provider
* Minimal scopes and least-privilege access

---

## Success Criteria

* Answers are correct given calendar input
* No hallucinated meetings or time slots
* Consistent outputs across identical inputs
* Clear separation between reasoning and tool data

---

## Explicit Non-Goals

* Fully autonomous agents
* Background planning loops
* Cross-session memory graphs
* Multi-agent orchestration