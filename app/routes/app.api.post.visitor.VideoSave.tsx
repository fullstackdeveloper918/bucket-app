import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { json } from "@remix-run/node"; // ✅ Import json from Remix
import prisma from "../db.server"

export const action = async ({ request }) => {


  try {
    const formData = await request.formData();
    const domain = formData.get("domain");
    const country = formData.get("country");
    const message = formData.get("message");
    const videoFile = formData.get("video");

    let videoPath = null;
    let fileName = null;

    if (videoFile && videoFile.name) {
      const fileBuffer = await videoFile.arrayBuffer();
      fileName = `visitor-${Date.now()}-${videoFile.name}`;
      console.log("visitoe",fileName)
      // Ensure the "public/videos" directory exists
      const videoDir = path.join(process.cwd(), "public", "videos");
      await mkdir(videoDir, { recursive: true });

      videoPath = path.join(videoDir, fileName);
      await writeFile(videoPath, Buffer.from(fileBuffer));
      console.log("done video")
    }

    // If no video is uploaded, handle gracefully
    if (!fileName) {
      return json({ success: false, message: "No video uploaded." }, { status: 400 });
    }

    // Store relative path in DB
    const action = await prisma.visitorAction.create({
      data: { domain, country, message, videoURL: `/videos/${fileName}` },
    });

    return json({ success: true, action });

  } catch (error) {
    console.error("Error saving video:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};