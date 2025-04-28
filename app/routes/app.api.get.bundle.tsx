// import { json, type LoaderFunction } from "@remix-run/node";
// import db from "../db.server"; // Database connection
// import { authenticate } from "../shopify.server";

// export const loader: LoaderFunction = async ({ request }) => {
//     try {
//         // Authenticate and get shop details
//         const { admin, session } = await authenticate.admin(request);
//         const shop = session.shop; // Extract shop from session

//         // Fetch all active details where shop matches the domain
//         const shopDetails = await db.bundle.findFirst({
//             where: {
//                 domainName: shop, // Match shop domain
//                 isActive: 1, // Use boolean for active field if applicable
//             },
//         });

//         if (!shopDetails) {
//             return json({ message: "No active details found for this shop" }, { status: 404 });
//         }

//         return json({
//             status: 200,
//             message: "Shop details retrieved successfully",
//             shopDetails,
//         });
//     } catch (error) {
//         console.error("Error fetching shop details:", error);
//         return json({ message: "Failed to fetch shop details" }, { status: 500 });
//     }
// };





/* 
import { json, type LoaderFunction } from "@remix-run/node";
import db from "../db.server"; // Database connection
import { authenticate } from "../shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        // Extract shop domain from request origin
        const url = new URL(request.url);
        const shop = url.hostname; // Extract domain from the request URL
        console.log("Shop domain:", shop); // Debugging log

        // Authenticate and get shop details
        const { admin, session } = await authenticate.admin(request);

        // Fetch all active details where shop matches the domain
        const shopDetails = await db.bundle.findFirst({
            where: {
                domainName: shop, // Match shop domain
                isActive: 1, // Assuming isActive is an integer, use true if it's a boolean
            },
        });

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
 */


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
        const shopDetails = await db.bundle.findMany({
            where: {
                domainName:formattedShopDomain, // Match shop domain (without https://)
                isActive: 1, // Assuming isActi ve is an integer, use true if it's a boolean
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

