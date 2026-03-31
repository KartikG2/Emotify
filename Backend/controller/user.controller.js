import User from "../model/User.model.js";
import OTP from "../model/otp.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { Resend } from 'resend'; // Import Resend

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_KEY);

// 1. REGISTER: Hash password -> Send OTP
export const registerController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Clean old OTPs
    await OTP.deleteMany({ email });

    // 4. Store OTP and Hashed Password
    await OTP.create({
      username,
      email,
      password: hashedPassword,
      otp,
    });

    // 5. Branded Premium Email Template (Dark Mode)
    const emailTemplate = `
      <div style="background-color: #030303; color: #ffffff; font-family: 'Outfit', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="margin-bottom: 30px;">
            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #fff 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">EMOTIFY</h1>
          </div>
          <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 10px; color: #fff;">Verify your account</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hi ${username}, welcome to Emotify! Use the verification code below to complete your registration. This code will expire in 5 minutes.
          </p>
          <div style="background: rgba(168, 85, 247, 0.1); border: 1px dashed rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 30px;">
            <span style="font-family: 'Space Grotesk', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #a855f7;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <div style="margin-top: 40px; border-top: 1px solid #1a1a1a; pt-20px;">
            <p style="color: #475569; font-size: 12px;">&copy; ${new Date().getFullYear()} Emotify Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // 6. Send Email via Resend API
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,                     
      subject: 'Verify Your Account - Emotify',
      html: emailTemplate
    });

    console.log("✅ Resend success:", data); // Check this in your terminal!

    return res.status(200).json({ msg: "OTP sent to your email." });
  } catch (error) {
    console.error("❌ Resend API Error in Register:", error.response?.data || error); // Added detailed logging
    return res.status(500).json({ msg: "Failed to send email. Check backend logs." });
  }
};

// 2. VERIFY: Move from OTP -> User Collection
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) return res.status(400).json({ msg: "Email and OTP required" });

    const tempUser = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!tempUser || tempUser.otp !== otp) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Save User (password is already hashed)
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
    });

    await newUser.save();
    
    // GENERATE JWT FOR INSTANT LOGIN
    const token = newUser.generateJWT();
    const { password: pw, ...userData } = newUser._doc;

    await OTP.deleteMany({ email });

    return res.status(201).json({ 
      msg: "Account verified successfully!",
      user: userData,
      token: token 
    });
  } catch (error) {
    console.error("Verify Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// 3. LOGIN: Check Hash -> Return Token
export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ errors: "Invalid credentials" });

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) return res.status(401).json({ errors: "Invalid credentials" });

    const token = user.generateJWT();
    const { password: pw, ...userData } = user._doc;

    res.status(200).json({ user: userData, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// 4. RESEND OTP: Updates the existing temporary record with a new code
export const resendOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const tempUser = await OTP.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ msg: "Session expired. Please sign up again." });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update the document
    tempUser.otp = otp;
    await tempUser.save();

    const emailTemplate = `
      <div style="background-color: #030303; color: #ffffff; font-family: 'Outfit', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 40px;">
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #a855f7; margin-bottom: 20px;">EMOTIFY</h1>
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 10px; color: #fff;">New Verification Code</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Here is your new verification code.
          </p>
          <div style="background: rgba(168, 85, 247, 0.1); border: 1px dashed rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 20px; display: inline-block;">
            <span style="font-family: 'Space Grotesk', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #a855f7;">${otp}</span>
          </div>
        </div>
      </div>
    `;

    // Send via Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'New Verification Code - Emotify',
      html: emailTemplate,
    });

    console.log("✅ Resend logic (ResendOTP):", data);

    return res.status(200).json({ msg: "New code sent successfully." });
  } catch (error) {
    console.error("❌ Resend API Error in ResendOTP:", error.response?.data || error); // Added detailed logging
    return res.status(500).json({ msg: "Failed to resend code. Check backend logs." });
  }
};