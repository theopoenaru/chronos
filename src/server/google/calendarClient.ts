// Only module allowed to talk to Google Calendar API

import { db } from "../db";
import { account } from "../../../auth-schema";
import { eq, and } from "drizzle-orm";

export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  description?: string;
  colorId?: string;
  organizer?: {
    email: string;
  };
};

type GoogleFreeBusyResponse = {
  calendars: {
    [calendarId: string]: {
      busy: Array<{
        start: string;
        end: string;
      }>;
    };
  };
};

async function getValidAccessToken(userId: string): Promise<string> {
  const accounts = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
    .limit(1);

  if (accounts.length === 0 || !accounts[0].accessToken) {
    throw new Error("Google OAuth token not found");
  }

  let accessToken = accounts[0].accessToken;
  const expiresAt = accounts[0].accessTokenExpiresAt;
  const refreshToken = accounts[0].refreshToken;

  const needsRefresh =
    !expiresAt ||
    expiresAt < new Date(Date.now() + 5 * 60 * 1000);

  if (needsRefresh && refreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Google OAuth token");
    }

    const data = await response.json();
    accessToken = data.access_token;
    const newExpiresAt = new Date(
      Date.now() + (data.expires_in || 3600) * 1000
    );

    await db
      .update(account)
      .set({
        accessToken: data.access_token,
        accessTokenExpiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(account.id, accounts[0].id));
  }

  return accessToken;
}

export async function fetchCalendarEvents(
  userId: string,
  timeMin: Date,
  timeMax: Date,
  options?: { calendarId?: string; query?: string; maxResults?: number }
): Promise<GoogleCalendarEvent[]> {
  const accessToken = await getValidAccessToken(userId);

  const timeMinISO = timeMin.toISOString();
  const timeMaxISO = timeMax.toISOString();

  const calendarId = options?.calendarId || "primary";
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
  );
  url.searchParams.set("timeMin", timeMinISO);
  url.searchParams.set("timeMax", timeMaxISO);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", (options?.maxResults ?? 250).toString());
  url.searchParams.set("fields", "items(id,summary,start,end,status,attendees,location,description,colorId,organizer)");
  
  if (options?.query) {
    url.searchParams.set("q", options.query);
  }

  const apiResponse = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!apiResponse.ok) {
    if (apiResponse.status === 401) {
      const error = new Error("Google OAuth token invalid");
      (error as any).code = "OAUTH_TOKEN_INVALID";
      throw error;
    }
    throw new Error(
      `Google Calendar API error: ${apiResponse.status} ${apiResponse.statusText}`
    );
  }

  const data = await apiResponse.json();
  return data.items || [];
}

export async function fetchFreeBusy(
  userId: string,
  calendarIds: string[],
  timeMin: Date,
  timeMax: Date,
): Promise<GoogleFreeBusyResponse> {
  const accessToken = await getValidAccessToken(userId);

  const timeMinISO = timeMin.toISOString();
  const timeMaxISO = timeMax.toISOString();

  const apiResponse = await fetch(
    "https://www.googleapis.com/calendar/v3/freeBusy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
        items: calendarIds.map((id) => ({ id })),
      }),
    }
  );

  if (!apiResponse.ok) {
    if (apiResponse.status === 401) {
      const error = new Error("Google OAuth token invalid");
      (error as any).code = "OAUTH_TOKEN_INVALID";
      throw error;
    }
    throw new Error(
      `Google Calendar API error: ${apiResponse.status} ${apiResponse.statusText}`
    );
  }

  const data = await apiResponse.json();
  return data;
}

