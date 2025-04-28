import { json, LoaderFunction } from "@remix-run/node";
import db from "../db.server"; // Ensure db.server.ts exports the Prisma client

export let loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const domainName = url.searchParams.get("domainName"); // Extract 'domainName' query parameter
    
    const productId = url.searchParams.get("product_id"); // Extract 'product_id' query parameter

    // Validate that domainName is provided
    if (!domainName) {
      return json(
        { message: "Missing 'domainName' query parameter" },
        { status: 400 }
      );
    }

    // If product_id is missing, fetch all discounts for the given domainName where product_all = 1
    if (!productId) {
      const allDiscounts = await db.bogoxy.findMany({
        where: {
          domainName,
          isActive: 1, // Ensure we only fetch records where product_all = 1
        },
      });

      return json(
        { domainName, isActive: 1, data: allDiscounts },
        { status: 200 }
      );
    }

    // Fetch specific product discounts
    const discounts = await db.bogoxy.findMany({
      where: {
        AND: [
          { product_id: parseInt(productId) }, // Ensure the product_id is parsed as an integer
          { domainName: domainName }, // Filter by both product_id and domainName
        ],
      },
    });

    if (!discounts || discounts.length === 0) {
      return json(
        { message: `No discounts found for domain: ${domainName} and product_id: ${productId}` },
        { status: 404 }
      );
    }

    return json({ data: discounts }, { status: 200 });
  } catch (error) {
    return json(
      { message: "Failed to fetch discounts", error: error.message },
      { status: 500 }
    );
  }
};
