import { SYSTEM_PROMPT } from "./systemPrompt";

export async function handleChatMessage(
  userId: string,
  sessionId: string,
  message: string,
) {
  // TODO: implement Gemini tool calling orchestrator
  // - Load conversation history
  // - Call Gemini with tools
  // - Execute tool calls
  // - Return response with tool steps
  return {
    role: "assistant" as const,
    content: "Not implemented yet",
    toolSteps: [],
  };
}

export const MAX_TOOL_CALLS = 3;

