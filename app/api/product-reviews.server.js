import db from "../db.server";

export const getTotalReviewCount = async ({ request }) => {
  try {
    const isPublic = new URL(request.url).searchParams.get("isPublic");
    const isPublicFilter =
      isPublic === "true" ? true : isPublic === "false" ? false : undefined;
    const whereCondition =
      isPublicFilter !== undefined ? { isPublic: isPublicFilter } : {};

    const totalReviews = await db.review.count({ where: whereCondition });

    const { _avg: { rating = 0 } = {} } = await db.review.aggregate({
      _avg: { rating: true },
      where: whereCondition,
    });

    console.log(totalReviews, "totalReviews");

    return {
      "Total Reviews": totalReviews,
      "Average Rating": parseFloat(rating.toFixed(1)),
    };
  } catch (error) {
    console.error("Error fetching review statistics:", error);
    return {
      message: "Failed to fetch review statistics",
      status: 500,
    };
  }
};

export const getProductInfo = async () => {
  try {
    const reviewsGroupedByProduct = await db.review.groupBy({
      by: ["productId", "productName"],
      _count: { id: true },
    });
    return reviewsGroupedByProduct.map(
      ({ productId, productName, _count }) => ({
        productId,
        productName,
        totalReviews: _count.id,
      }),
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { message: "Failed to fetch reviews", status: 500 };
  }
};

export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const reviewId = formData.get("reviewId");

    // Ensure reviewId is provided and is a string
    if (!reviewId || typeof reviewId !== "string") {
      return json({ message: "Valid Review ID is required" }, { status: 400 });
    }

    // Delete the review from the database
    const deletedReview = await db.review.delete({
      where: { id: reviewId }, // Pass reviewId as a string
    });

    return json({
      message: "Review deleted successfully",
      deletedReview,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return json({ message: "Failed to delete review" }, { status: 500 });
  }
};

export const getSingleReviews = async ({ request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  console.log(productId, "productId");

  if (!productId) {
    return { message: "Product ID is required" }, { status: 400 };
  }

  try {
    const reviews = await db.review.findMany({
      where: {
        productId: productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (reviews.length === 0) {
      return { message: "No reviews found for this product" }, { status: 404 };
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
    return {
      status: 200,
      message: "Product Review succesfully reterived",
      reviews,
      averageRating: averageRating.toFixed(2), // Limit to 2 decimal places
      starCounts: {
        fiveStars: fiveStarCount,
        fourStars: fourStarCount,
        threeStars: threeStarCount,
        twoStars: twoStarCount,
        oneStar: oneStarCount,
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { message: "Failed to fetch reviews" }, { status: 500 };
  }
};

export const deletReview = async ({ request }) => {
  try {
    if (!reviewId || typeof reviewId !== "string") {
      return { message: "Valid Review ID is required" }, { status: 400 };
    }

    // Delete the review from the database
    const deletedReview = await db.review.delete({
      where: { id: reviewId }, // Pass reviewId as a string
    });

    return {
      message: "Review deleted successfully",
      deletedReview,
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { message: "Failed to delete review" }, { status: 500 };
  }
};

export let launchBundle = async (values) => {
  console.log(values, "values");
  try {
    console.log(formData, "formData");

    const {
      email_send_at,
      subject,
      five_star,
      four_star,
      three_star,
      two_star,
      one_star,
      button_color,
      button_text,
      footer_unsubscribe_text,
      button_unsubscribe_text,
    } = body;

    const launchBundle = await db.launchBundle.create({
      data: {
        email_send_at,
        subject,
        five_star,
        four_star,
        three_star,
        two_star,
        one_star,
        button_color,
        button_text,
        footer_unsubscribe_text,
        button_unsubscribe_text,
      },
    });

    return { success: true, launchBundleId: launchBundle.id };
  } catch (error) {
    console.error("Error saving bundle information:", error);
    return { message: "Failed to save bundle information" }, { status: 500 };
  }
};
