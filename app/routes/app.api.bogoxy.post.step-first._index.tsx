import { json, ActionFunction } from "@remix-run/node";
import db from "../db.server"; // Ensure db.server.ts exports the Prisma client

export let action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      bundle_name,
      buysx,
      gety,
      where_to_display,
      discount_method,
      amount,
      domainName,
    } = body;
    const addBogo = await db.bogoxy.create({
      data: {
        bundle_name,
        buysx,
        gety,
        where_to_display,
        discount_method,
        amount,
        domainName,
      },
    });
    return json({ success: true, addBogoId: addBogo.id }); // Return the created bundle's ID
  } catch (error) {
    return json(
      { message: "Failed to save bundle information" },
      { status: 500 },
    );
  }
};