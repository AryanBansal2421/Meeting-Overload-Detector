import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../googleClient";
import { analyzeCalendar } from "../services/intervalScheduler";

export const calendarRouter = Router();

calendarRouter.use((req, res, next) => {
  const accessToken = req.headers["x-access-token"] as string;
  const refreshToken = req.headers["x-refresh-token"] as string;
  if (!accessToken) return res.status(401).json({ error: "No access token provided" });
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  next();
});

calendarRouter.get("/analyze", async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const threshold = parseFloat(req.query.threshold as string) || parseFloat(process.env.MEETING_RATIO_THRESHOLD || "0.4");

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(timeMin);
    timeMax.setDate(timeMax.getDate() + days);

    const eventsRes = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    const events = eventsRes.data.items || [];
    const analysis = analyzeCalendar(events, threshold, timeMin, timeMax);
    res.json(analysis);
  } catch (err: any) {
    console.error("Calendar fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});
