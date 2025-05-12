import { json, ActionFunction } from "@remix-run/node";
import db from "../db.server"; // Ensure db.server.ts exports the Prisma client



export let action = async ({ request }) => {
    console.log(request, "body recived12345")
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
        { success: false, message: "Missing 'domain' in request body" },
        { status: 400 }
      );
    }

    // Save into visitoraction table
    const visitorAction = await db.visitorAction.create({
      data: {
        domain,
        country: country || null,
        ipAddress: ipAddress || null,
        videoURL: videoURL || null,
        message: message || null,
        userName: userName || null,
        actionNumber: actionNumber ?? null, // For numbers
      },
    });

    return json(
      { success: true, data: visitorAction },
      { status: 200 }
    );

} catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error);
      return json(
        { message: "Failed to save visitor action", error: error.message },
        { status: 500 },
      );
    } else {
      console.error("Unknown error", error);
      return json(
        { message: "Failed to save visitor action", error: "Unknown error" },
        { status: 500 },
      );
    }
  }
  
};
