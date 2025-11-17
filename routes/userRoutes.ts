import { Router } from "express";
import passport from "passport";
import {
  Login,
  registerUser,
  sendOtp,
  verifyOtp,
  resendOtp,
} from "../controllers/user/userController.ts";
import authController from "../controllers/auth/authController.ts";

// import middlewares
import { protect } from "../middlewares/protect.ts";

const router = Router();

// PROTECTED
router.get("/me", protect, authController.getCurrentUser);

// PUBLIC
router.post("/login", Login);
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/auth/google/failure", authController.googleFailureRedirect); // handle google auth error

//google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  authController.googleCallback
);

export default router;
