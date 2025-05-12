import { json, LoaderFunction } from "@remix-run/node";
import db from "../db.server"; // Assuming you have a db.server.ts file to export the db client
// PATCH request to mark a review as private (set isPublic to false)

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const reviewId = url.searchParams.get("reviewId");
  console.log(request,"Cehckbdjdhd")
    if (!reviewId) {
      return json({ message: "Review ID is required" }, { status: 400 });
    }
  
    try {
      const updatedReview = await db.review.update({
        where: { id: reviewId }, // Use as string
        data: { isPublic: false },
      });
  
      return json({
        message: "Review marked as private",
        updatedReview,
      });
    } catch (error) {
      console.error("Error updating review:", error);
      return json({ message: "Failed to mark review as private" }, { status: 500 });
    }
  };
  