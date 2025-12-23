export type ToolStep = {
  toolName: string;
  state: "running" | "success" | "error";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorText?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolSteps?: ToolStep[];
  createdAt: Date;
};

export type ConversationMeta = {
  id: string;
  title: string | null;
  updatedAt: Date;
};

