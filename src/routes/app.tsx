import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { AppContextProvider } from "@/lib/app-context";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    if (process.env.NODE_ENV === "development") {
      return;
    }
    
    const session = await authClient.getSession();
    if (!session.data?.user) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<{ user: { name?: string; image?: string } } | null>(
    process.env.NODE_ENV === "development" 
      ? { user: { name: "Dev User", image: undefined } }
      : null
  );

  useEffect(() => {
    // Load session from auth client on mount
    if (process.env.NODE_ENV === "development") {
      return;
    }
    authClient.getSession().then((result) => {
      if (result.data) {
        setSession({ user: { name: result.data.user.name, image: result.data.user.image || undefined } });
      }
    });
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: "/login" });
  };

  return (
    <AppContextProvider value={{ session, handleLogout }}>
      <Outlet />
    </AppContextProvider>
  );
}

