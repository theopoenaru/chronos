import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Chronos" 
              className="h-14 w-14 object-contain"
            />
          </div>
          <h1 className="chronos-heading text-3xl text-center text-foreground">
            Privacy Policy
          </h1>
        </div>

        <div className="chronos-card p-6 space-y-6">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="leading-relaxed">
              Chronos is a read-only calendar assistant that connects to your Google Calendar 
              to help you understand and manage your schedule. We only access your calendar 
              data to answer questions and provide insights—we never create, modify, or delete 
              events. Your calendar data is processed securely through Google's OAuth system 
              and is not stored permanently on our servers beyond what's necessary for your 
              active chat sessions. We do not share your calendar data with third parties, 
              and all data transmission is encrypted. You can revoke access at any time 
              through your Google Account settings.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

