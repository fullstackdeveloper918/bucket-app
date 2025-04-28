
import { json, type LoaderFunction } from "@remix-run/node";
import db from "../db.server"; // Database connection
import { authenticate } from "../shopify.server";
export const loader: LoaderFunction = async ({ request }) => {
    try {
        // Extract shop domain from request origin
        const origin = request.headers.get("origin") || request.headers.get("referer");

        if (!origin) {
            return json({ message: "Request origin not found" }, { status: 400 });
        }
        const formattedShopDomain = origin.replace(/^https?:\/\//, ""); // Match DB format
        // const formattedShopDomain ="testingappsstore-d.myshopify.com"
        console.log("Formatted shop domain  v is :", formattedShopDomain); // Debugging log
        const shopDetails = await db.session.findFirst({
            where: {
                shop: formattedShopDomain, // Match shop domain (without https://)
               // Assuming isActi ve is an integer, use true if it's a boolean
            },
        });
        console.log("Shop details:", shopDetails); // Debugging log
        if (!shopDetails) {
            return json({ message: "No active details found for this shop" }, { status: 404 });
        }

        return json({
            status: 200,
            message: "Shop details retrieved successfully",
            shopDetails,
        });
    } catch (error) {
        console.error("Error fetching shop details:", error);
        return json({ message: "Failed to fetch shop details" }, { status: 500 });
    }
};

