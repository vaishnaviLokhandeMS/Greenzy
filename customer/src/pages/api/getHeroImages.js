import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const heroFolder = path.join(process.cwd(), "public/hero"); // ✅ Fix path

  try {
    const files = fs.readdirSync(heroFolder);
    const imagePaths = files.map((file) => `/hero/${file}`); // ✅ Correct public URL

    res.status(200).json({ images: imagePaths });
  } catch (error) {
    console.error("❌ Error loading images:", error);
    res.status(500).json({ error: "Failed to load hero images" });
  }
}
