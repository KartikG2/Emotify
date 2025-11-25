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

    // 5. HTML Email Template
    const emailTemplate = `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow:auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #00466a; text-decoration:none; font-weight:600">Emotify</a>
          </div>
          <p style="font-size:1.1em">Hi, <b>${username}</b></p>
          <p>Thank you for choosing Emotify. Use the following OTP to complete your Sign Up procedures. This OTP is valid for 5 minutes.</p>
          
          <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
          
          <p style="font-size:0.9em;">Regards,<br />Emotify Team</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Emotify Inc</p>
          </div>
        </div>
      </div>
    `;

    // 6. Send Email via Resend API
    // NOTE: On Free Tier, you can ONLY send to your own email address until you verify a domain.
    await resend.emails.send({
      from: 'onboarding@resend.dev', // REQUIRED: Use this exact email for Free Tier
      to: email,                     
      subject: 'Verify Your Account - Emotify',
      html: emailTemplate
    });

    return res.status(200).json({ msg: "OTP sent to your email." });
  } catch (error) {
    console.error("❌ Error in registerController:", error);
    return res.status(500).send("Error sending email.");
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
    await OTP.deleteMany({ email });

    return res.status(201).json({ msg: "Account created successfully!" });
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
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow:auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #00466a; text-decoration:none; font-weight:600">Emotify</a>
          </div>
          <p style="font-size:1.1em">Hi, <b>${tempUser.username}</b></p>
          <p>Here is your new verification code. It is valid for 5 minutes.</p>
          <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
          <p style="font-size:0.9em;">Regards,<br />Emotify Team</p>
        </div>
      </div>
    `;

    // Send via Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'New Verification Code - Emotify',
      html: emailTemplate,
    });

    return res.status(200).json({ msg: "New code sent successfully." });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ msg: "Failed to resend code." });
  }
};