import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import Admin from '../../models/admin.ts'

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Login success (NO JWT)
    return res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
      },
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};