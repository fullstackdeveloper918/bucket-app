import db from "../db.server";
import { json } from "@remix-run/node";


export const action = async ({ request }) => {
    try {
    const body = await request.json();

    const {
      domain,
      country,
      ipAddress,
      videoURL,
      message,
      userName,
      actionNumber
    } = body;

    if (!domain) {
      return json(
        { success: false, message: "Missing required field 'domain'" },
        { status: 400 }
      );
    }

    const saved = await db.visitorAction.create({
      data: {
        domain,
        country: country || null,
        ipAddress: ipAddress || null,
        videoURL: videoURL || null,
        message: message || null,
        userName: userName || null,
        actionNumber: actionNumber ?? null,
      },
    });

    return json({ success: true, data: saved }, { status: 200 });
  } catch (error) {
    console.error("Error saving visitor action:", error);
    return json(
      { success: false, message: "Failed to save visitor action", error: error.message },
      { status: 500 }
    );
  }
};
