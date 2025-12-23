// Only module allowed to talk to Google Calendar API

import { db } from "../db";
import { account } from "../../../auth-schema";
import { eq, and } from "drizzle-orm";

type GoogleCalendarEvent = {
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
};

export async function fetchCalendarEvents(
  userId: string,
  timeMin: Date,
  timeMax: Date,
): Promise<GoogleCalendarEvent[]> {
  // Get OAuth token from account table
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

  // Check if token expired or expiring soon (< 5 minutes)
  const needsRefresh =
    !expiresAt ||
    expiresAt < new Date(Date.now() + 5 * 60 * 1000);

  if (needsRefresh && refreshToken) {
    // Refresh token via Google OAuth endpoint
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

    // Update account table with new token
    await db
      .update(account)
      .set({
        accessToken: data.access_token,
        accessTokenExpiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(account.id, accounts[0].id));
  }

  // Call Google Calendar API
  const timeMinISO = timeMin.toISOString();
  const timeMaxISO = timeMax.toISOString();

  const url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  );
  url.searchParams.set("timeMin", timeMinISO);
  url.searchParams.set("timeMax", timeMaxISO);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  const apiResponse = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!apiResponse.ok) {
    if (apiResponse.status === 401) {
      throw new Error("Google OAuth token invalid");
    }
    throw new Error(
      `Google Calendar API error: ${apiResponse.status} ${apiResponse.statusText}`
    );
  }

  const data = await apiResponse.json();
  return data.items || [];
}

