import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer (Gmail).
 * Optimized for production with connection verification and robust settings.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`📨 Attempting to send email to: ${to}`);

  // 1. Validate Environment Variables
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    const msg = "❌ Missing EMAIL or EMAIL_PASS environment variables.";
    console.error(msg);
    throw new Error(msg);
  }

  // 2. Create Transporter with Robust Production Config
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    // Production stability settings
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,
    debug: true, // Enable debug logs in terminal
    logger: true // Log to console
  });

  try {
    // 3. Verify Connection Before Sending
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP Connection Verified.");

    // 4. Send the Email
    const mailOptions = {
      from: `"Emotify" <${process.env.EMAIL}>`,
      to,
      subject,
      text: text || "Verification code from Emotify",
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("🚀 Email Sent Successfully:", info.messageId);
    return { success: true, messageId: info.messageId, provider: "nodemailer" };
  } catch (error) {
    // 5. Detailed Production Diagnostics
    console.error("❌ Nodemailer/SMTP Error Details:");
    console.error(" - Code:", error.code);
    console.error(" - Command:", error.command);
    console.error(" - Response:", error.response);
    console.error(" - Message:", error.message);
    
    // Check for common Gmail/Render issues
    if (error.code === 'EAUTH') {
        console.error("💡 ACTION REQUIRED: Invalid credentials. Check your Gmail App Password and Ensure 'EMAIL' in Render settings matches 'EMAIL_PASS'.");
    } else if (error.code === 'ETIMEDOUT') {
        console.error("💡 ACTION REQUIRED: Connection timed out. This often happens if port 465 is blocked or if your IP is throttled.");
    }

    throw error; // Re-throw to be caught by the controller
  }
};
