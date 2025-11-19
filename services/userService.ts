import axios from "../lib/axios.ts";
import cloudinary from "../config/cloudinary.ts";

const userService = {
  storeGoogleAvatar: async ({
    url,
    userId,
  }: {
    url: string;
    userId: string;
  }) => {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });

      const imageBuffer = Buffer.from(response.data, "binary");

      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            public_id: userId,
            overwrite: true,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url);
          }
        );

        upload.end(imageBuffer);
      });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      throw new Error("Failed to store user avatar");
    }
  },
};

export default userService;
