import { v2 as cloudinary } from "cloudinary";

// Automatically loads the CLOUDINARY_URL from environment variables
cloudinary.config();

export default cloudinary;
