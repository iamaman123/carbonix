import nodemailer from "nodemailer";
import config from "../config/index.js";
import logger from "./logger.js";

// Check if email is configured
const isEmailConfigured = config.email.user && 
                          config.email.pass && 
                          config.email.user !== "your-email@gmail.com";

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
  logger.info("Email service configured successfully");
} else {
  logger.warn("Email service not configured - OTP will be logged to console instead");
}

const sendMail = async (email, subject, text) => {
  try {
    // If email is not configured, just log the OTP for development
    if (!isEmailConfigured) {
      logger.info(`[DEV MODE] OTP for ${email}: ${text.replace(/.*<h1[^>]*>([^<]+)<\/h1>.*/s, '$1') || text}`);
      logger.info(`[DEV MODE] Email would have been sent with subject: ${subject}`);
      return; // Don't throw error in development
    }

    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject,
      html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #333;">Your OTP Code</h2>
                    <p style="font-size: 16px; color: #555;">Use the code below to verify your account:</p>
                    <h1 style="font-size: 28px; color: #1a73e8; background: #f1f3f4; padding: 10px; display: inline-block; border-radius: 5px;">
                        ${text}
                    </h1>
                    <p style="font-size: 14px; color: #777;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                </div>
            `,
    });
    logger.info(`Email sent successfully to ${email}`);
  } catch (error) {
    logger.error("Email sending failed:", error.message);
    // Don't throw error - allow registration to continue
  }
};

export default sendMail;
