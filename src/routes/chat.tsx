import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "../components/Chat";

export const Route = createFileRoute("/chat")({
  ssr: false,
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <Chat />
    </div>
  );
}

