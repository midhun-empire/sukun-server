import { styleText } from "node:util";
import User from "../../models/user.ts";

import type { Request, Response } from "express";

const otpStore: Record<string, string> = {};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtp = async (req: Request, res: Response) => {
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
    return res.status(500).json({ message: "Server Error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP required" });

    const storedOtp = otpStore[phone];

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
