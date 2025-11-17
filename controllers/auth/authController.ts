import type { Request, Response } from "express";
import User from "../../models/user.ts";
import type { JwtPayload } from "../../shared/types/jwt.d.ts";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// get current user
const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.user.id)
      .select("-password -__v")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// for handleing google auth success
const googleCallback = (req: Request, res: Response) => {
  const { user, token } = req.user as any;
  const encodedUser = encodeURIComponent(JSON.stringify(user));

  // Redirect to your React app
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const redirectUrl = `${frontendUrl}/auth/google/success?token=${token}&user=${encodedUser}`;

  res.redirect(redirectUrl);
};

// for handling failure
const googleFailureRedirect = (req: Request, res: Response) => {
  const error = (req.query.error as string) || "unknown error";

  const errorMsg = encodeURIComponent(
    error === "access_denied"
      ? "You cancelled the login. Please try again."
      : "Google login failed. Please try again."
  );

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const failureUrl = `${frontendUrl}/auth/google/failure?error=${errorMsg}`;

  res.redirect(failureUrl);
};

// all controllers
const authController = {
  getCurrentUser,
  googleCallback,
  googleFailureRedirect,
};

export default authController;
