import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const circularCategoriesFolder = path.join(process.cwd(), "public/circular-categories"); 

  try {
    const files = fs.readdirSync(circularCategoriesFolder);
    const imagePaths = files.map((file) => `/circular-categories/${file}`); 

    res.status(200).json({ images: imagePaths });
  } catch (error) {
    console.error("❌ Error loading circular categories images:", error);
    res.status(500).json({ error: "Failed to load circular category images" });
  }
}
