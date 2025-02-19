import { json, LoaderFunction } from "@remix-run/node";
import db from "../db.server"; // Ensure db.server.ts exports the Prisma client

export let loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop"); // Extract 'shop' query parameter
    if (!shop) {
      return json(
        { success: false, message: "Missing 'shop' query parameter" },
        { status: 400 },
      );
    }
    const bogoList = await db.bogoxy.findMany({
      // where: {
      //   domainName: shop,
      // },
      // orderBy: {
      //   createdAt: "desc", // Optional: Order reviews by the latest
      // },
      include: {
        bogoOffers: {
          where: {
            domainName: shop, // Replace with the desired domain name
          },
        },
      },
    });
    return json({
      status: 200,
      data: bogoList,
    }); // Return the created bundle's ID
  } catch (error) {
    return json(
      { message: "Failed to save bundle information" },
      { status: 500 },
    );
  }
};