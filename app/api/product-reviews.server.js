import db from "../db.server";
import { authenticate } from "../shopify.server";



export const getShopAllProducts = async ({ request } = {}) => {
  try {
    if (!request || !request.url) {
      return { shopDomain: "", products: [], nextCursor: null };
    }

    const { admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop");
    const cursor = url.searchParams.get("cursor") || null; // Accept cursor as query param

    if (!shopDomain) {
      return { shopDomain: "", products: [], nextCursor: null };
    }

    const productsQuery = `
      query getProducts($cursor: String) {
        products(first: 10, after: $cursor) {
          edges {
            cursor
            node {
              id
              title
              handle
              status
              totalInventory
              createdAt
              updatedAt
              vendor
              tags
              productType
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;

    const response = await admin.graphql(productsQuery, {
      variables: { cursor },
    });

    const result = await response.json();

    if (!result?.data?.products) {
      console.error("Invalid GraphQL response:", result);
      return { shopDomain, products: [], nextCursor: null };
    }

    const { edges, pageInfo } = result.data.products;

    const products = edges.map((edge) => edge.node);
    const nextCursor = pageInfo.hasNextPage
      ? edges[edges.length - 1].cursor
      : null;

    return {
      shopDomain,
      products,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return { shopDomain: "", products: [], nextCursor: null };
  }
};


export const getShopTotalReviewCount = async ({ request } = {}) => {
  try {
    if (!request || !request.url) {
      return { shopDomain: "ssss", totalProducts: 0 };
    }

    const { admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop");
console.log(url,shopDomain,"ku meri shsj")
    if (!shopDomain) {
      return { shopDomain: "aaaass", totalProducts: 0 };
    }

    const productsQuery = `
      query getProducts($cursor: String) {
        products(first: 100, after: $cursor) {
          edges {
            cursor
            node {
              id
              title
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;

    let hasNextPage = true;
    let cursor = null;
    let totalProducts = 0;

    while (hasNextPage) {
      const response = await admin.graphql(productsQuery, {
        variables: { cursor },
      });

      const result = await response.json();

      if (!result?.data?.products) {
        console.error("Invalid GraphQL response:", result);
        break;
      }

      const products = result.data.products;

      totalProducts += products.edges.length;

      hasNextPage = products.pageInfo.hasNextPage;
      cursor = hasNextPage ? products.edges[products.edges.length - 1].cursor : null;
    }

    return {
      shopDomain,
      totalProducts,
    };
  } catch (error) {
    console.error("Error fetching shop total products:", error);
    return { shopDomain: "qqqsss", totalProducts: 0 };
  }
};

export const getTotalReviewCount = async ({ request } = {}) => {
  try {
    if (!request || !request.url) {
      return { "Total Reviews": 0, "Average Rating": 0.0 };
    }

    const url = new URL(request.url);
    const isPublicParam = url.searchParams.get("isPublic");

    const isPublicFilter =
      isPublicParam === "true"
        ? true
        : isPublicParam === "false"
        ? false
        : undefined;

    const whereCondition =
      isPublicFilter !== undefined ? { isPublic: isPublicFilter } : undefined;

    const totalReviews = await db.review.count({ where: whereCondition });

    const aggregateResult = await db.review.aggregate({
      _avg: { rating: true },
      where: whereCondition,
    });

    const rating = aggregateResult?._avg?.rating ?? 0;

    return {
      "Total Reviews": totalReviews ?? 0,
      "Average Rating": parseFloat(rating.toFixed(1)),
    };
  } catch (error) {
    console.error("Error fetching review statistics:", error);
    return {
      "Total Reviews": 0,
      "Average Rating": 0.0,
    };
  }
};

export const getProductInfo = async () => {
  try {
    const reviewsGroupedByProduct = await db.review.groupBy({
      by: ["productId", "productName"],
      _count: { id: true },
    });

    if (!reviewsGroupedByProduct || reviewsGroupedByProduct.length === 0) {
      return [];
    }

    return reviewsGroupedByProduct.map(
      ({ productId, productName, _count }) => ({
        productId: productId ?? "",
        productName: productName ?? "",
        totalReviews: _count?.id ?? 0,
      }),
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const getSingleReviews = async ({ request } = {}) => {
  try {
    if (!request || !request.url) {
      return {
        status: 400,
        message: "Request or URL missing",
        reviews: [],
        averageRating: 0,
        starCounts: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        },
      };
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return {
        status: 400,
        message: "Product ID is required",
        reviews: [],
        averageRating: 0,
        starCounts: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        },
      };
    }

    const reviews = await db.review.findMany({
      where: {
        productId: productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!reviews || reviews.length === 0) {
      return {
        status: 404,
        message: "No reviews found for this product",
        reviews: [],
        averageRating: 0,
        starCounts: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        },
      };
    }

    let totalRating = 0;
    let fiveStarCount = 0;
    let oneStarCount = 0;
    let twoStarCount = 0;
    let threeStarCount = 0;
    let fourStarCount = 0;

    reviews.forEach((review) => {
      const rating = review.rating ?? 0;
      totalRating += rating;

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

    const averageRating = totalRating / reviews.length || 0;

    return {
      status: 200,
      message: "Product Review successfully retrieved",
      reviews,
      averageRating: averageRating.toFixed(2),
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
    return {
      status: 500,
      message: "Failed to fetch reviews",
      reviews: [],
      averageRating: 0,
      starCounts: {
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
      },
    };
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




