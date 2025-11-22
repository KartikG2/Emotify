import { Router } from "express";
import { body } from "express-validator";
import { 
  loginController, 
  registerController, 
  verifyOTP,
  resendOTPController
} from "../controller/user.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("username", "Username is required").not().isEmpty(),
    body("email", "Valid email required").isEmail(),
    body("password", "Min 6 characters").isLength({ min: 6 }),
  ],
  registerController
);

router.post(
  "/login",
  [
    body("email", "Valid email required").isEmail(),
    body("password", "Password required").exists(),
  ],
  loginController
);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTPController);

// Route to get current user data (Token required)
router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

export default router;