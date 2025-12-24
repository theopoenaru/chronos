import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Plus, MessageSquare } from "lucide-react";
import type { ConversationMeta } from "@/core/chat/types";

type ConversationListProps = {
  conversations: ConversationMeta[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
}: ConversationListProps) {
  return (
    <>
      <div className="border-b p-3 bg-muted/30">
        <Button 
          onClick={onCreateNew} 
          className="w-full rounded-md font-medium" 
          size="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="text-base font-semibold">No conversations yet</EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground">
                Start a new conversation to begin chatting with your AI assistant.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(conv.updatedAt);

              return (
                <Button
                  key={conv.id}
                  variant={selectedId === conv.id ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-md text-sm h-auto py-2"
                  onClick={() => onSelect(conv.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 self-start mt-0.5" />
                  <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                    <span className="truncate w-full text-left font-medium">
                      {conv.title || "Untitled conversation"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formattedDate}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

