import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import config from "./index.js";
import logger from "../utils/logger.js";

const allowedSignupRoles = ["PRODUCER", "CONSUMER"];

const googleId = config.google.clientId;
const googleSecret = config.google.clientSecret;

/** Avoid crashing on boot (e.g. Vercel) when env vars are missing — strategy registers only when both are set. */
export const isGoogleOAuthReady = Boolean(googleId && googleSecret);

if (isGoogleOAuthReady) {
  const strategyOptions = {
    clientID: googleId,
    clientSecret: googleSecret,
    callbackURL: config.google.callbackUrl,
    passReqToCallback: true,
  };
  if (process.env.VERCEL) {
    strategyOptions.proxy = true;
  }

  passport.use(
    new GoogleStrategy(
      strategyOptions,
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), null);
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (!user) {
            const rawRole = req.oauthSignupRole || "CONSUMER";
            const role = allowedSignupRoles.includes(rawRole) ? rawRole : "CONSUMER";

            user = await User.create({
              email,
              googleId: profile.id,
              name: profile.displayName || email.split("@")[0],
              avatar: profile.photos?.[0]?.value || "",
              authProvider: "google",
              role,
              isVerified: true,
              password: null,
            });
            logger.info(`Google OAuth: new user created for ${email} as ${role}`);
            return done(null, user);
          }

          if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = "google";
            user.isVerified = true;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            logger.info(`Google account linked to existing user: ${email}`);
          }

          return done(null, user);
        } catch (error) {
          logger.error("Google OAuth strategy error:", error);
          return done(error, null);
        }
      }
    )
  );
  logger.info("Google OAuth strategy registered.");
} else {
  logger.warn(
    "Google OAuth not registered: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (e.g. in Vercel → Settings → Environment Variables).",
  );
}

export default passport;
