import { useState, useEffect, useRef } from "react";
import { ConversationList } from "@/ui/ConversationList";
import { ChatPanel, type ChatPanelRef } from "@/ui/ChatPanel";
import { CalendarDayList } from "@/ui/CalendarDayList";
import { MiniCalendar } from "@/ui/MiniCalendar";
import { InsightCards } from "@/ui/InsightCards";
import { getUserTimezone } from "@/core/time/timezone";
import { authClient } from "@/lib/auth-client";
import type { ConversationMeta } from "@/core/chat/types";
import type { CalendarEvent } from "@/core/calendar/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { LogOut, User, ChevronDown, Menu, MessageSquare, Calendar, History } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

export function App() {
  const { session, handleLogout } = useAppContext();
  const [activeTab, setActiveTab] = useState<"history" | "chat" | "calendar">("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    process.env.NODE_ENV === "development" ? "dev-session-1" : undefined
  );
  const [conversations] = useState<ConversationMeta[]>([]);
  const [events] = useState<CalendarEvent[]>([]);
  const timezone = getUserTimezone();
  const chatPanelRef = useRef<ChatPanelRef>(null);

  const handleMobileNavClick = (tab: "history" | "chat" | "calendar") => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    // Synchronize with backend for chat sessions
    if (process.env.NODE_ENV === "development") {
      return;
    }
    
    authClient.getSession().then(async (result) => {
      if (result.data?.user?.id) {
        // TODO: Replace with actual API call
        // const convs = await getChatSessions(result.data.user.id);
        // setConversations(convs);
      }
    });
  }, []);

  const handleCreateConversation = async () => {
    if (process.env.NODE_ENV === "development") {
      const newId = `dev-session-${Date.now()}`;
      setSelectedSessionId(newId);
      setTimeout(() => chatPanelRef.current?.focusInput(), 0);
      return;
    }
    
    authClient.getSession().then(async (result) => {
      if (result.data?.user?.id) {
        // TODO: Replace with actual API call
        // const id = await createChatSession(result.data.user.id);
        // setSelectedSessionId(id);
        setTimeout(() => chatPanelRef.current?.focusInput(), 0);
      }
    });
  };

  const handleInsightPromptClick = (prompt: string) => {
    if (selectedSessionId) {
      chatPanelRef.current?.setInput(prompt);
    } else {
      // Create a new conversation first, then set the prompt
      handleCreateConversation();
      setTimeout(() => chatPanelRef.current?.setInput(prompt), 100);
    }
  };

  const insights = [
    {
      title: "Meeting Hours",
      subtitle: "This week",
      value: "0h",
      change: undefined,
    },
    {
      title: "Focus Time",
      subtitle: "Unlock more time",
      value: "0h",
      change: undefined,
    },
    {
      title: "Categories",
      subtitle: "Top meeting types",
      value: "0",
      change: undefined,
    },
    {
      title: "Recurring",
      subtitle: "Of total meetings",
      value: "0%",
      change: undefined,
    },
  ];

  return (
    <div className="flex h-screen flex-col relative">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden rounded-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Chronos" 
              className="h-7 w-7 object-contain"
            />
            <h1 className="chronos-heading text-xl text-foreground">Chronos</h1>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1.5 rounded-md">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-7 w-7 rounded-md"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
              {session?.user?.name && <span className="text-sm hidden md:inline">{session.user.name}</span>}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                {session?.user?.name && (
                  <p className="text-xs leading-none text-muted-foreground">Account</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Navigation Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1">
            <Button
              variant={activeTab === "chat" ? "secondary" : "ghost"}
              className="justify-start gap-2 rounded-md"
              onClick={() => handleMobileNavClick("chat")}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Button>
            <Button
              variant={activeTab === "calendar" ? "secondary" : "ghost"}
              className="justify-start gap-2 rounded-md"
              onClick={() => handleMobileNavClick("calendar")}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
            <Button
              variant={activeTab === "history" ? "secondary" : "ghost"}
              className="justify-start gap-2 rounded-md"
              onClick={() => handleMobileNavClick("history")}
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Mobile: Tab-based content */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {activeTab === "chat" && (
          <>
            <div className="overflow-x-auto scrollbar-hide flex-shrink-0 border-b bg-muted/30">
              <InsightCards insights={insights} onPromptClick={handleInsightPromptClick} />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
            {selectedSessionId ? (
              <ChatPanel ref={chatPanelRef} sessionId={selectedSessionId} />
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle className="text-base font-semibold">Select a conversation</EmptyTitle>
                      <EmptyDescription className="text-sm text-muted-foreground">
                        or create a new one to begin
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === "calendar" && (
          <>
            <div className="p-4 flex-shrink-0 border-b bg-muted/30">
              <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <CalendarDayList events={events} selectedDate={selectedDate} timezone={timezone} />
            </div>
          </>
        )}
        {activeTab === "history" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <ConversationList
              conversations={conversations}
              selectedId={selectedSessionId}
              onSelect={setSelectedSessionId}
              onCreateNew={handleCreateConversation}
            />
          </div>
        )}
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* History panel */}
        <div className="w-[400px] flex-shrink-0 border-r flex flex-col bg-muted/30">
          <ConversationList
            conversations={conversations}
            selectedId={selectedSessionId}
            onSelect={setSelectedSessionId}
            onCreateNew={handleCreateConversation}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide flex-shrink-0 border-b bg-muted/30">
            <InsightCards insights={insights} onPromptClick={handleInsightPromptClick} />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            {selectedSessionId ? (
              <ChatPanel ref={chatPanelRef} sessionId={selectedSessionId} />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle className="text-base font-semibold">Select a conversation</EmptyTitle>
                    <EmptyDescription className="text-sm text-muted-foreground">
                      or create a new one to begin
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </div>
        </div>

        {/* Calendar panel */}
        <div className="w-[400px] flex-shrink-0 border-l flex flex-col bg-muted/30">
          <div className="p-4 flex-shrink-0 border-b bg-muted/30">
            <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
          <div className="flex-1 overflow-hidden">
            <CalendarDayList events={events} selectedDate={selectedDate} timezone={timezone} />
          </div>
        </div>
      </div>
    </div>
  );
}

