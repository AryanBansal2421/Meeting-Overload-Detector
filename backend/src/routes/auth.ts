import { Router } from "express";
import { oauth2Client, SCOPES } from "../googleClient";

export const authRouter = Router();

authRouter.get("/google", (_req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  res.redirect(url);
});

authRouter.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const redirectUrl = `http://localhost:5173/dashboard?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    res.redirect(redirectUrl);
  } catch (err) {
    res.status(500).json({ error: "OAuth token exchange failed" });
  }
});
