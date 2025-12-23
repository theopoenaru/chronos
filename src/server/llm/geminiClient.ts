// Only module allowed to talk to Gemini LLM

export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  tools?: unknown[],
) {
  // TODO: implement Gemini API client
  // - Use @tanstack/ai-gemini
  // - Configure tool calling
  // - Handle streaming responses
  throw new Error("Not implemented");
}

