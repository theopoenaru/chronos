import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/server/auth";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        return auth.handler(request);
      },
      PUT: async ({ request }) => {
        return auth.handler(request);
      },
      DELETE: async ({ request }) => {
        return auth.handler(request);
      },
      PATCH: async ({ request }) => {
        return auth.handler(request);
      },
      OPTIONS: async ({ request }) => {
        return auth.handler(request);
      },
    },
  },
});
