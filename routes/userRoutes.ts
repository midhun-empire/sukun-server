import { Router } from "express";
import passport from "passport"
import {
  googleCallback,
  Login,
  registerUser,
  sendOtp,
  verifyOtp,
  resendOtp,
} from "../controllers/user/userController.ts";

const router = Router();

router.post("/login", Login);
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);


//google login 

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
