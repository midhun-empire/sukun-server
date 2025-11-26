import dotenv from "dotenv";
dotenv.config();

import { styleText } from "node:util";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../models/user.ts";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

// import utils
import { generateOtp } from "../../utils/generateOtp.ts";
import userService from "../../services/userService.ts";

//User Registration and Login

const otpStore: Record<string, string> = {};

export const sendOtp = async (req: Request, res: Response) => {
  // console.log("body log:", req.body);

  try {
    const { phone } = req.body;

    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    const otp = generateOtp();
    otpStore[phone] = otp;

    console.log("OTP for", phone, "=", otp);

    return res.status(200).json({
      message: "OTP Sent Successfully",
      next: "/otp", // For front use , can be change later
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP required" });

    const storedOtp = otpStore[phone];
    console.log(storedOtp);

    if (!storedOtp)
      return res.status(400).json({ message: "OTP expired or not requested" });

    if (storedOtp !== otp)
      return res.status(401).json({ message: "Invalid OTP" });

    delete otpStore[phone]; // remove after verification

    return res.status(200).json({
      message: "OTP Verified Successfully",
      login: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    const isExists = await User.findOne({ phone });
    if (!isExists) {
      return res.status(404).json({ message: "User not Found" });
    }

    const otp = generateOtp();
    otpStore[phone] = otp;
    console.log("OTP for login:", phone, otp);

    return res.status(200).json({ message: "OTP Sent", next: "/otp" });
  } catch (error) {
    if (error instanceof Error) {
      console.error(styleText("red", error.message));
    }
    return res.status(500).json({ message: "Server Error" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, phone } = req.body;

    const isExists = await User.findOne({ phone });
    if (isExists) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    await User.create({ username, phone });

    const otp = generateOtp();
    otpStore[phone] = otp;
    console.log("OTP for register:", phone, otp);

    return res.status(201).json({
      message: "User Created, OTP Sent",
      next: "/otp",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const otp = generateOtp();
    otpStore[phone] = otp;

    console.log("Resend Otp", otp);

    return res.status(200).json({ message: "OTP Resent Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

const tunnelUrl = process.env.TUNNEL_URL!;
//google aAuth login
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${tunnelUrl}/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const username = profile.displayName;
        const googleId = profile.id;
        const googleAvatarUrl =
          profile?._json?.picture ?? profile.photos?.[0]?.value ?? null;

        if (!email) return done(null, false); // cannot continue without email

        // Check if a user already exists using email
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user with email + googleId
          user = await User.create({
            username,
            email,
            googleId,
            phone: null,
          });
        }

        const defaultAvatarUrl =
          "https://api.dicebear.com/7.x/initials/svg?seed=User";
        const avatarUrl = await userService.storeGoogleAvatar({
          url: googleAvatarUrl || defaultAvatarUrl,
          userId: user._id.toString(),
        });

        if (!user.avatar || user.avatar !== avatarUrl) {
          user.avatar = avatarUrl as string;
          await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET!,
          { expiresIn: "30d" }
        );

        return done(null, { user, token });
      } catch (error) {
        console.log(error);
        return done(error, undefined);
      }
    }
  )
);
