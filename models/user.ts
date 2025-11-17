import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    phone: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: false, unique: true, sparse: true },
    googleId: { type: String, required: false, unique: true, sparse: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
