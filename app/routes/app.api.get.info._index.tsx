import { json, LoaderFunction } from "@remix-run/node";
import db from "../db.server"; // Assuming you have a db.server.ts file to export the db client

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
        return json({ message: "Product ID is required" }, { status: 400 });
    }

    try {
        // Fetch reviews for the product from the database
        const reviews = await db.review.findMany({
            where: {
                productId: productId,
            },
            orderBy: {
                createdAt: "desc", // Optional: Order reviews by the latest
            },
        });

        if (reviews.length === 0) {
            return json({ message: "No reviews found for this product" }, { status: 404 });
        }

        // Calculate average rating and count star ratings
        let totalRating = 0;
        let fiveStarCount = 0;
        let oneStarCount = 0;
        let twoStarCount = 0;
        let threeStarCount = 0;
        let fourStarCount = 0;

        reviews.forEach((review) => {
            const rating = review.rating; // Assuming the review object has a 'rating' field
            totalRating += rating;

            // Count how many reviews have each star rating
            switch (rating) {
                case 5:
                    fiveStarCount++;
                    break;
                case 4:
                    fourStarCount++;
                    break;
                case 3:
                    threeStarCount++;
                    break;
                case 2:
                    twoStarCount++;
                    break;
                case 1:
                    oneStarCount++;
                    break;
            }
        });

        const averageRating = totalRating / reviews.length;

        // Return the reviews and additional statistics
        return json({
            status:200,
            message:"Product Review succesfully reterived",
            reviews,
            averageRating: averageRating.toFixed(2), // Limit to 2 decimal places
            starCounts: {
                fiveStars: fiveStarCount,
                fourStars: fourStarCount,
                threeStars: threeStarCount,
                twoStars: twoStarCount,
                oneStar: oneStarCount,
            }
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return json({ message: "Failed to fetch reviews" }, { status: 500 });
    }
};
