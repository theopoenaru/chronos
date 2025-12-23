import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to app if already authenticated
    if (process.env.NODE_ENV === "development") {
      return;
    }
    
    authClient.getSession().then((session) => {
      if (session.data?.user) {
        navigate({ to: "/app" });
      }
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    if (process.env.NODE_ENV === "development") {
      navigate({ to: "/app" });
      return;
    }
    
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Chronos" 
              className="h-14 w-14 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="chronos-heading text-3xl text-foreground">
              Meet Chronos
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your AI calendar assistant that helps you take control of your time
            </p>
          </div>
        </div>

        <div className="chronos-card p-6 space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-11 rounded-md text-sm font-medium"
            size="lg"
            variant="outline"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Chronos securely connects to your Google Calendar.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Read-only access to your calendar</span>
        </div>
      </div>
    </div>
  );
}

