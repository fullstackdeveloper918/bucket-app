import { json, ActionFunction ,LoaderFunction} from "@remix-run/node";
import db from "../db.server"; // Assuming you have a db.server.ts file to export the db client
 // Assuming you have a db.server.ts file to export the db client
 export let loader: LoaderFunction = async () => {
  const appUrl = process.env.APP_URL || 'https://your-app-url.com';
  return json({ appUrl });
};

export let action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log("Received FormData:", formData);

  // Extract fields from the form data
  const shopDomain =formData.get("shopDomain")?.toString()|| ''; 
  const productName = formData.get("productName")?.toString()||'';
  
  const productId = formData.get("productId")?.toString();
  const userName = formData.get("userName")?.toString()|| ''; 
  
  const userEmail = formData.get("userEmail")?.toString();
  const rating = parseFloat(formData.get("rating")?.toString() || "0");
  const comment = formData.get("comment")?.toString();
  const isPublic = formData.get("isPublic") === "true"; 

  // Validate required fields
  if (!productId || isNaN(rating)) {
    return json({ message: "Product ID and rating are required!" }, { status: 400 });
  }

  try {
    // Use db to create a new review in the database
    const newReview = await db.review.create({
      data: {
        shopDomain,
        productId,
        userName,
        userEmail: userEmail || null,
        rating,
        comment: comment || null,
        isPublic,
        productName:productName
      },
    });

    // Return success message with the new review data
    return json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return json({ message: "Failed to add review" }, { status: 500 });
  }
};

