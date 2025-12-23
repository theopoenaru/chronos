import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  usePromptInput,
} from "@/components/ui/prompt-input";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { Tool } from "@/components/ui/tool";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolPart } from "@/components/ui/tool";

type ChatPanelProps = {
  sessionId: string;
  selectedDate: Date;
  timezone: string;
};

export type ChatPanelRef = {
  focusInput: () => void;
  setInput: (value: string) => void;
};

const PROMPT_SUGGESTIONS = [
  "What meetings do I have today?",
  "When am I free this week?",
  "Find conflicts in my schedule",
  "Summarize my calendar",
  "What's my availability tomorrow?",
];

function ChatPanelInput({ ref, setInput }: { ref: React.Ref<ChatPanelRef>; setInput: (value: string) => void }) {
  const { textareaRef } = usePromptInput();

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      textareaRef.current?.focus();
    },
    setInput: (value: string) => {
      setInput(value);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
  }));

  return null;
}

export const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(
  ({ sessionId, selectedDate, timezone }, ref) => {
    const [input, setInput] = useState("");

    const selectedDateYmd = useMemo(() => {
      // Format as YYYY-MM-DD in the user's timezone (stable, unambiguous for the model).
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(selectedDate);
    }, [selectedDate, timezone]);

    const selectedDateYmdRef = useRef(selectedDateYmd);
    const timezoneRef = useRef(timezone);

    useEffect(() => {
      selectedDateYmdRef.current = selectedDateYmd;
    }, [selectedDateYmd]);

    useEffect(() => {
      timezoneRef.current = timezone;
    }, [timezone]);

    const { messages, sendMessage, isLoading } = useChat({
      connection: fetchServerSentEvents(
        `/api/chat?sessionId=${sessionId}`,
        () => ({
          body: {
            selectedDate: selectedDateYmdRef.current,
            timezone: timezoneRef.current,
          },
        }),
      ),
    });

    const handleSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage(input);
        setInput("");
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      setInput(suggestion);
    };

    return (
      <>
        <ChatContainerRoot className="flex-1 overflow-y-auto">
          <ChatContainerContent className="p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full gap-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle className="text-base font-semibold">Start a conversation</EmptyTitle>
                    <EmptyDescription className="text-sm text-muted-foreground">
                      Ask about your schedule, availability, or meeting conflicts.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
                <div className="w-full max-w-2xl space-y-2">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                      <PromptSuggestion
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="rounded-md text-xs"
                      >
                        {suggestion}
                      </PromptSuggestion>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-6 message-bubble ${
                    message.role === "assistant" ? "text-left" : "text-right"
                  }`}
                >
                  {/* Tools should appear before the assistant response */}
                  {message.role === "assistant" &&
                    message.parts
                      ?.filter((part) => part.type === "tool-call")
                      .map((part, idx) => {
                        const safeJsonParse = (value: string): unknown => {
                          try {
                            return JSON.parse(value);
                          } catch {
                            return value;
                          }
                        };

                        // Find the matching tool-result part (server tools emit tool_result chunks,
                        // which become tool-result parts; tool-call.output is only populated for client tools).
                        const toolResult = (message.parts ?? []).find(
                          (p): p is { type: "tool-result"; toolCallId: string; content: string; state: "complete" | "error"; error?: string } =>
                            p.type === "tool-result" && p.toolCallId === part.id
                        );

                        const inputObj = safeJsonParse(part.arguments);

                        const resultObj = toolResult
                          ? safeJsonParse(toolResult.content)
                          : undefined;

                        const outputObj =
                          typeof resultObj === "object" && resultObj !== null
                            ? (resultObj as Record<string, unknown>)
                            : toolResult
                              ? { output: resultObj }
                              : undefined;

                        const errorText = toolResult?.state === "error" ? toolResult.error : undefined;

                        const toolPart: ToolPart = {
                          type: part.name,
                          state: errorText
                            ? "output-error"
                            : outputObj
                              ? "output-available"
                              : part.state === "input-complete" || part.state === "approval-requested"
                                ? "input-available"
                                : "input-streaming",
                          input:
                            typeof inputObj === "object" && inputObj !== null
                              ? (inputObj as Record<string, unknown>)
                              : { arguments: inputObj },
                          output: outputObj,
                          toolCallId: part.id,
                          errorText,
                        };

                        return <Tool key={idx} toolPart={toolPart} />;
                      })}

                  {/* Message bubble (after tools for assistant) */}
                  <div
                    className={cn(
                      "inline-block max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 md:px-4 md:py-2.5",
                      message.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.parts
                        ?.filter((p) => p.type === "text")
                        .map((p) => p.content)
                        .join("") || ""}
                    </div>
                  </div>
                </div>
              ))
            )}
            <ChatContainerScrollAnchor />
          </ChatContainerContent>
        </ChatContainerRoot>

        <div className="border-t p-3 md:p-4 flex-shrink-0 bg-background">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <PromptInput
                value={input}
                onValueChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading}
              >
                <ChatPanelInput ref={ref} setInput={setInput} />
                <PromptInputTextarea 
                  placeholder="Ask about your schedule..." 
                  className="pr-12 text-sm min-h-[44px] rounded-lg resize-none text-foreground" 
                />
                <PromptInputActions className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-8 w-8 rounded-md"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </PromptInputActions>
              </PromptInput>
            </div>
          </form>
        </div>
      </>
    );
  }
);

ChatPanel.displayName = "ChatPanel";
