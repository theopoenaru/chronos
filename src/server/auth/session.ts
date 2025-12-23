import { auth } from "./index";

export async function getSession(request?: Request) {
  const headers = request?.headers || new Headers();
  return auth.api.getSession({
    headers,
  });
}

export async function requireSession(request?: Request) {
  const session = await getSession(request);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

