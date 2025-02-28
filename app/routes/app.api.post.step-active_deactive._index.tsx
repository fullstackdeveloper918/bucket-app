import { json, ActionFunction } from "@remix-run/node";
import db from "../db.server"; // Ensure db.server.ts exports the Prisma client

export let action: ActionFunction = async ({ request }) => {
  try {
    // Parse the JSON body of the POST request
    const { domainName } = await request.json();

    // If 'domainName' is missing, return an error response
    if (!domainName) {
      return json(
        { success: false, message: "Missing 'domainName' in request body" },
        { status: 400 }
      );
    }

    // Query the 'volumeDiscount' table to get all 'discount_id' based on 'domainName'
    const discountList = await db.volumeDiscount.findMany({
      where: {
        domainName, // Use the domainName from the request body
      },
      select: {
        discount_id: true, // Only select the 'discount_id' field
      },
    });

    // Return the list of discount_id's
    return json({
      status: 200,
      data: discountList.map((discount) => discount.discount_id), // Extract discount_id from the result
    });

  } catch (error) {
    console.error(error); // Log the error for debugging
    return json(
      { message: "Failed to retrieve discount IDs", error: error.message },
      { status: 500 },
    );
  }
};
