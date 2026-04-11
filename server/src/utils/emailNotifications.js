import logger from "./logger.js";

/**
 * Email notification templates and sender
 * Replace with actual email service (SendGrid, AWS SES, etc.) in production
 */

export const emailTemplates = {
  registration: (email, otp) => ({
    subject: "Welcome to Carbonix - Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D32;">Welcome to Carbonix!</h2>
        <p>Thank you for registering. Please verify your email address to get started.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">${otp}</p>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Carbonix — P2P energy marketplace</p>
      </div>
    `,
  }),

  purchaseConfirmation: (buyerEmail, transaction) => ({
    subject: "Purchase Confirmation - Carbon Credits",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D32;">Purchase Confirmed!</h2>
        <p>Your carbon credit purchase has been successfully completed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Transaction Details</h3>
          <p><strong>Transaction ID:</strong> ${transaction.transactionHash}</p>
          <p><strong>Credits Purchased:</strong> ${transaction.quantity}</p>
          <p><strong>Total Amount:</strong> ₹${transaction.totalAmount.toLocaleString()}</p>
          <p><strong>Date:</strong> ${new Date(transaction.completedAt).toLocaleDateString()}</p>
        </div>
        <p>You can view your transaction history in your dashboard.</p>
        <p>Thank you for contributing to a sustainable future!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Carbonix — P2P energy marketplace</p>
      </div>
    `,
  }),

  listingSold: (sellerEmail, transaction) => ({
    subject: "Your Carbon Credits Have Been Sold!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D32;">Credits Sold Successfully!</h2>
        <p>Great news! Your carbon credits have been purchased.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Sale Details</h3>
          <p><strong>Transaction ID:</strong> ${transaction.transactionHash}</p>
          <p><strong>Credits Sold:</strong> ${transaction.quantity}</p>
          <p><strong>Total Amount:</strong> ₹${transaction.totalAmount.toLocaleString()}</p>
          <p><strong>Date:</strong> ${new Date(transaction.completedAt).toLocaleDateString()}</p>
        </div>
        <p>You can view this transaction in your seller dashboard.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Carbonix — P2P energy marketplace</p>
      </div>
    `,
  }),

  listingApproved: (sellerEmail, listing) => ({
    subject: "Your Listing Has Been Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D32;">Listing Approved!</h2>
        <p>Your carbon credit listing has been approved and is now live on the marketplace.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>${listing.title}</h3>
          <p><strong>Project Type:</strong> ${listing.projectType}</p>
          <p><strong>Credits Available:</strong> ${listing.quantity}</p>
          <p><strong>Price per Credit:</strong> ₹${listing.pricePerCredit}</p>
        </div>
        <p>Buyers can now purchase your credits!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Carbonix — P2P energy marketplace</p>
      </div>
    `,
  }),
};

export const sendNotificationEmail = async (to, template, data) => {
  try {
    const emailContent = template(to, data);
    
    // In development, just log
    logger.info("📧 Email would be sent:", {
      to,
      subject: emailContent.subject,
    });

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // await sgMail.send({
    //   to,
    //   from: 'noreply@example.com',
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    // });

    return { success: true };
  } catch (error) {
    logger.error("Failed to send email:", error);
    return { success: false, error };
  }
};
