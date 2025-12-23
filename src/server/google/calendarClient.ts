// Only module allowed to talk to Google Calendar API

export async function fetchCalendarEvents(
  userId: string,
  timeMin: Date,
  timeMax: Date,
) {
  // TODO: implement Google Calendar API
  // - Get OAuth token from Better Auth account table
  // - Call Google Calendar API v3
  // - Handle token refresh
  return [];
}

export async function refreshAccessToken(userId: string) {
  // TODO: implement token refresh
  return null;
}

