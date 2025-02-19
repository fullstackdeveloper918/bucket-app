import { Layout, Text, BlockStack, InlineStack } from "@shopify/polaris";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import React, { lazy, Suspense, useState } from "react";
import { promiseHash } from "remix-utils/promise";
import Reviews from "../components/Reviews/Reviews";
import CardSkeleton from "../components/skeletons/CardSkeleton/CardSkeleton";
import RequestSkelton from "../components/skeletons/RequestSkeleton/RequestSkelton";
import styles from "../components/Reviews/Reviews.module.css";
import { Toaster, toast as notify } from "sonner";
import Widget from "../components/Widget/Widget";

import {
  getProductInfo,
  getSingleReviews,
  getTotalReviewCount,
  launchBundle,
} from "../api/product-reviews.server";
import db from "../db.server";
import arrowIcon from "../../app/routes/assets/backarrow.png";
import arrowActive from "../../app/routes/assets/arrowActive.png";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";

const ReviewsCard = lazy(() => import("../components/ReviewsCard/ReviewsCard"));
const RequestReview = lazy(
  () => import("../components/RequestReview/RequestReview"),
);

export async function loader(request) {
  const checkTotal = await db.review.findMany();
  console.log(checkTotal, "checkTotal");
  return json(
    await promiseHash({
      productReviews: getProductInfo(),
      totalCount: getTotalReviewCount(request),
      singleReviews: getSingleReviews(request),
    }),
  );
}

export async function action({ request }) {
  if (request.method === "POST") {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const formData = await request.formData();
    const values = Object.fromEntries(formData.entries());
    await launchBundle(values);
  }

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const reviewId = formData.get("reviewId");

    try {
      if (!reviewId || typeof reviewId !== "string") {
        return json(
          { message: "Valid Review ID is required" },
          { status: 400 },
        );
      }
      const deletedReview = await db.review.delete({
        where: { id: reviewId },
      });

      notify.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      return json({ message: "Failed to delete review" }, { status: 500 });
    }
  }
  return null;
}

export default function AppsPage() {
  const { productReviews, totalCount, singleReviews } = useLoaderData();

  const [activeTab, setActiveTab] = useState("Reviews");
  const [activeApp, setActiveApp] = useState("Active");
  const [active, setActive] = useState(false);

  const handleActive = (item) => {
    setActiveApp(item);
    setActive(false);
  };

  return (
    <div className={styles.containerDiv}>
      <TitleBar title="Product Reviews"></TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <div className={styles.flexWrapper}>
              <div className={styles.headingFlex}>
                <button className={styles.btn_Back}>
                  {/* <img src={arrowIcon} width={20} height={16} />{" "} */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.78033 0.21967C9.07322 0.512563 9.07322 0.987437 8.78033 1.28033L2.56066 7.5H18.75C19.1642 7.5 19.5 7.83579 19.5 8.25C19.5 8.66421 19.1642 9 18.75 9H2.56066L8.78033 15.2197C9.07322 15.5126 9.07322 15.9874 8.78033 16.2803C8.48744 16.5732 8.01256 16.5732 7.71967 16.2803L0.21967 8.78033C-0.0732233 8.48744 -0.0732233 8.01256 0.21967 7.71967L7.71967 0.21967C8.01256 -0.0732233 8.48744 -0.0732233 8.78033 0.21967Z"
                      fill="#0F172A"
                    />
                  </svg>
                </button>
                <h2>Product Reviews</h2>
              </div>
              {/* <button className={styles.activeButton}>
                Active <img src={arrowActive} width={15} height={8} />{" "}
              </button> */}
              <div
                className={` ${styles.activeButton} ${activeApp === "Inactive" ? styles.InactiveButton : ""} `}
                id="second"
                onClick={() => setActive(!active)}
              >
                <div className={styles.butttonsTab} >
                  <span className={styles.selected} >{activeApp}</span>
                  <div className={styles.arrowActive}>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                        fill="#0F172A"
                      />
                    </svg>
                  </div>
                </div>
                {active && (
                  <ul className={styles.selectDropdown}>
                    <li
                      data-value="option1"
                      onClick={() => handleActive("Active")}
                    >
                      Active
                    </li>
                    <li
                      data-value="option2"
                      onClick={() => handleActive("Inactive")}
                    >
                      Inactive
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.inline_stack}>
              <div className={styles.inline_stackwraper}>
                {Object.entries(totalCount).map(([item, value], index) => (
                  <Suspense fallback={<CardSkeleton />}>
                    <React.Fragment key={index}>
                      <ReviewsCard item={item} totalCount={totalCount} index={index} />
                    </React.Fragment>
                  </Suspense>
                ))}
              </div>
            </div>
          </Layout.Section>

          <Layout.Section>
            <div className={styles.checked_btn}>
              <div className={styles.checkbtnwrapper}>
                <button
                  onClick={() => setActiveTab("Reviews")}
                  className={`${activeTab === "Reviews" ? styles.active : ""} ${styles.btn_one}`}
                >
                  ⭐️ Reviews
                </button>
                <button
                  onClick={() => setActiveTab("Request Reviews")}
                  className={`${activeTab === "Request Reviews" ? styles.active : ""} ${styles.btn_one}`}
                >
                  📩 Request Reviews
                </button>
                <button
                  onClick={() => setActiveTab("Widget")}
                  className={`${activeTab === "Widget" ? styles.active : ""} ${styles.btn_one}`}
                >
                  🎨️ Widget
                </button>
              </div>
            </div>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {activeTab === "Reviews" && (
        <Suspense fallback={<RequestSkelton />}>
          <Reviews productReviews={productReviews} />
        </Suspense>
      )}

      {activeTab === "Request Reviews" && (
        <Suspense fallback={<RequestSkelton />}>
          <RequestReview />
        </Suspense>
      )}

      {activeTab === "Widget" && (
        <Suspense fallback={<RequestSkelton />}>
          <Widget />
        </Suspense>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
