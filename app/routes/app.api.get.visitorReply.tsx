import { json, LoaderFunction } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";


export let loader: LoaderFunction = async ({ request }) => {
  try {
    // Get the authenticated user (assumes user has a `domain` property)
  const { session } = await authenticate.admin(request);
  session.shop

    if (!session || !session.shop) {
      return json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const domain = session.shop;

    // Fetch all visitor actions for this domain
    const visitorActions = await db.visitorAction.findMany({
      where: {
        domain: domain,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return json({ success: true, data: visitorActions }, { status: 200 });
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
