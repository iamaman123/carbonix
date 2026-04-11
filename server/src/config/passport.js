import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import config from "./index.js";
import logger from "../utils/logger.js";

const allowedSignupRoles = ["PRODUCER", "CONSUMER"];

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      passReqToCallback: true,
    },
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

export default passport;
