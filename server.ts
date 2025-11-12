import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { styleText } from "node:util";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Use morgan middleware to log HTTP requests in the 'dev' format
app.use(cors());

await connectDB();

app.use("/", userRoutes);

const port = process.env.PORT;

app.listen(port, () =>
  console.log(
    `Server running on ${styleText(
      ["underline", "blue", "bold"],
      `🚀 http://localhost:${port}`
    )}`
  )
);
