import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Stores HASHED password
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 mins (300s)
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;