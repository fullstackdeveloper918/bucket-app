import { Layout, Text, BlockStack, InlineStack } from "@shopify/polaris";
import {
  isRouteErrorResponse,
  useActionData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Form } from "@remix-run/react";
import { promiseHash } from "remix-utils/promise";
import Search from "../components/Search/Search";
import searchImg from "../routes/assets/searchImg@.svg";
import edit_icon from "../routes/assets/edit_icon.svg";
import ImportIcon from "../routes/assets/import.svg";
import stars from "../routes/assets/star_svg.svg";
import pllaceholderImg from "../routes/assets/images_place.svg";
import preview_mockup from "../routes/assets/preview_mockup.svg";
import AddGradient from "../routes/assets/AddGradient.png";
import infoImage from "../routes/assets/infoImage.png";
import check_svg from "../routes/assets/circle-check-solid.svg";
import DorpDownIcon from "../routes/assets/dropDown.svg";

import CardSkeleton from "../components/skeletons/CardSkeleton/CardSkeleton";
import { Toaster, toast as notify } from "sonner";

import styles from "../styles/main.module.css";

import {
  getProductInfo,
  getSingleReviews,
  getTotalReviewCount,
} from "../api/product-reviews.server";
import db from "../db.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";
import Loader from "../components/Loader/Loader";

const ReviewsCard = lazy(() => import("../components/ReviewsCard/ReviewsCard"));

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
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (request.method === "POST") {
    if (intent === "widgetStep") {
      const position = formData.get("position");
      const section = formData.get("section");
      const text = formData.get("text");
      const textSize = formData.get("textSize");
      const textColor = formData.get("textColor");
      const starsColor = formData.get("starsColor");
      const barsRatingColor = formData.get("barsRatingColor");
      const addReviewBtnText = formData.get("addReviewBtnText");
      const buttonColor = formData.get("buttonColor");
      const verifiedPurchase = formData.get("verifiedPurchase");
      const backgroundColor = formData.get("backgroundColor");
      const backgroundShadow = formData.get("backgroundShadow");

      try {
        const savedWidget = await db.review.create({
          data: {
            position,
            section,
            text,
            textSize,
            textColor,
            starsColor,
            barsRatingColor,
            addReviewBtnText,
            buttonColor,
            verifiedPurchase,
            backgroundColor,
            backgroundShadow,
            shopDomain: shop,
          },
        });

        return json({
          message: "Data saved successfully",
          data: savedWidget,
          status: 200,
          step: 3,
        });
      } catch (error) {
        console.error("Error processing the request:", error);
        return json(
          {
            message: "Failed to process the request",
            error: error.message,
            status: 500,
            step: 3,
          },
          {},
        );
      }
    }
  } else if (request.method === "DELETE") {
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
  } else {
    return null;
  }
}

export default function AppsPage() {
  const { productReviews, totalCount, singleReviews } = useLoaderData();
  const actionResponse = useActionData();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("Reviews");
  const [activeApp, setActiveApp] = useState("Active");
  const [dropDown, setDropDown] = useState(false);
  const [activeEnable, setActiveEnable] = useState("Enable");
  const [activeSelect, setActiveSelect] = useState("Newest");
  const [active, setActive] = useState(false);
  const [sort, setSort] = useState(false);
  const [edit, setEdit] = useState(false);

  const [showImportPopup, setShowImportPopup] = useState(null);

  const [values, setValues] = useState({
    email_send_at: 10,
    subject: "Quick Question: How’s Your New [Product Name]?",
    text: `Hey [Customer’s First Name]!
We’re all about making our customers’ lives better with [Product Name], and we’d love to hear how it’s working for you! Just a quick, honest review could help so many others who are looking for the right fit, just like you were.`,
    five_star: "Absolutely love it!",
    four_star: "Really good!",
    three_star: "It’s okay",
    two_star: "Not quite what i expected",
    one_star: "Disappointed",
    button_color: "#ffffff",
    button_text: "Submit The Review",
    footer_unsubscribe_text: "If you’d like to stop receiving emails",
    button_unsubscribe_text: "unsubscribe here",
  });

  const [state, setStates] = useState({
    text: "Customer Reviews",
    textSize: 5,
    textColor: "#000000",
    starsColor: "#F7C34A",
    barsRatingColor: "#000000",
    addReviewBtnText: "Add A Review",
    buttonColor: "#000000",
    verifiedPurchase: true,
    backgroundColor: "#FFFFFF",
    backgroundShadow: true,
  });

  const [showPosition, setShowPosition] = useState(false);
  const [position, setPosition] = useState("Below Section");
  const [section, setSection] = useState("Buy Buttons");

  const handleActive = (item) => {
    setActiveApp(item);
    setActive(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStateChanges = (e) => {
    const { name, type, checked, value } = e.target;
    setStates((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    if (actionResponse?.step === 3) {
      if (actionResponse?.status === 200) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "green",
            color: "white",
          },
        });
      } else if (actionResponse?.status === 500) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "green",
            color: "white",
          },
        });
      }
    }
  }, [actionResponse]);

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

              <div
                className={` ${styles.activeButton} ${activeApp === "Inactive" ? styles.InactiveButton : ""} `}
                id="second"
                onClick={() => setActive(!active)}
              >
                <div className={styles.butttonsTab}>
                  <span className={styles.selected}>{activeApp}</span>
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
                      <ReviewsCard
                        item={item}
                        totalCount={totalCount}
                        index={index}
                      />
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
                  type="button"
                  onClick={() => setActiveTab("Reviews")}
                  className={`${activeTab === "Reviews" ? styles.active : ""} ${styles.btn_one}`}
                >
                  ⭐️ Reviews
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("Request Reviews")}
                  className={`${activeTab === "Request Reviews" ? styles.active : ""} ${styles.btn_one}`}
                >
                  📩 Request Reviews
                </button>
                <button
                  type="button"
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
        <div className={styles.table_content}>
          <div className={styles.search_select}>
            <div className={styles.search_images}>
              <Search />
              <img src={searchImg} width={20} height={20} />
            </div>

            <div
              className={` ${styles.activeButton} ${styles.sortBy} `}
              id="second"
              onClick={() => setShowProducts(true)}
            >
              <div
                className={styles.butttonsTab}
                onClick={() => setSort(!sort)}
              >
                <span className={styles.selected}>
                  Sort by : <b>{activeSelect}</b>
                </span>
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
              {sort && (
                <ul className={styles.selectDropdown}>
                  <li
                    data-value="option1"
                    onClick={() => handleSelect("Newest")}
                  >
                    Sort by : <b>Newest</b>
                  </li>
                  <li
                    data-value="option2"
                    onClick={() => handleSelect("Oldest")}
                  >
                    Sort by : <b>Oldest</b>
                  </li>
                </ul>
              )}
            </div>
          </div>
          <div className={styles.table_review} style={{ width: "100%" }}>
            <div className={styles.tableWarpper}>
              <table>
                <thead>
                  <tr>
                    <th>Images</th>
                    {edit ? (
                      <>
                        <th>Rating</th>
                        <th>Content</th>
                      </>
                    ) : (
                      <>
                        <th>Product Name</th>
                        <th>Reviews #</th>
                      </>
                    )}
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {edit
                    ? fetcher?.data?.singleReviews?.reviews.map((item) => (
                        <React.Fragment>
                          {console.log(item, "item")}
                          <tr>
                            <td>
                              <img
                                src="https://archive.org/download/placeholder-image/placeholder-image.jpg"
                                width={60}
                                height={60}
                              />
                            </td>
                            <td>{item?.rating}*</td>
                            <td>{item?.userName}</td>
                            <td>
                              <div className={styles.buttonFlexer}>
                                <label className={styles.switch}>
                                  <input type="checkbox" />
                                  <span className={styles.slider}></span>
                                </label>

                                <Form method="DELETE">
                                  <button
                                    name="reviewId"
                                    value={item?.id}
                                    className={styles.deletedBtn}
                                  >
                                    {/* <img
                                    src={deletedIcon}
                                    width={20}
                                    height={20}
                                  /> */}
                                    <svg
                                      width="16"
                                      height="18"
                                      viewBox="0 0 18 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M12.8573 2.83637V3.05236C13.7665 3.13559 14.6683 3.24505 15.5617 3.37998C15.8925 3.42994 16.2221 3.48338 16.5506 3.54028C16.9393 3.60761 17.1998 3.9773 17.1325 4.366C17.0652 4.7547 16.6955 5.01522 16.3068 4.94789C16.2405 4.93641 16.1741 4.92507 16.1078 4.91388L15.1502 17.362C15.0357 18.8506 13.7944 20 12.3015 20H4.84161C3.34865 20 2.10739 18.8506 1.99289 17.362L1.03534 4.91388C0.968948 4.92507 0.902608 4.93641 0.836318 4.94789C0.447617 5.01522 0.07793 4.7547 0.0105981 4.366C-0.0567338 3.9773 0.203787 3.60761 0.592487 3.54028C0.920962 3.48338 1.25062 3.42994 1.58141 3.37998C2.47484 3.24505 3.37657 3.13559 4.28583 3.05236V2.83637C4.28583 1.34639 5.44062 0.0744596 6.9672 0.0256258C7.49992 0.00858464 8.03474 0 8.57155 0C9.10835 0 9.64318 0.00858464 10.1759 0.0256258C11.7025 0.0744596 12.8573 1.34639 12.8573 2.83637ZM7.01287 1.45347C7.53037 1.43691 8.04997 1.42857 8.57155 1.42857C9.09312 1.42857 9.61272 1.43691 10.1302 1.45347C10.8489 1.47646 11.4287 2.07994 11.4287 2.83637V2.94364C10.4836 2.88625 9.53092 2.85714 8.57155 2.85714C7.61217 2.85714 6.65951 2.88625 5.7144 2.94364V2.83637C5.7144 2.07994 6.29419 1.47646 7.01287 1.45347ZM6.67497 7.11541C6.65981 6.72121 6.32796 6.41394 5.93376 6.4291C5.53957 6.44426 5.2323 6.77611 5.24746 7.17031L5.57713 15.7417C5.59229 16.1359 5.92414 16.4432 6.31834 16.428C6.71254 16.4129 7.01981 16.081 7.00464 15.6868L6.67497 7.11541ZM11.8948 7.17031C11.9099 6.77611 11.6026 6.44426 11.2084 6.4291C10.8143 6.41394 10.4824 6.72121 10.4672 7.11541L10.1376 15.6868C10.1224 16.081 10.4297 16.4129 10.8239 16.428C11.2181 16.4432 11.5499 16.1359 11.5651 15.7417L11.8948 7.17031Z"
                                        fill="#F24747"
                                      />
                                    </svg>
                                  </button>
                                </Form>
                              </div>
                            </td>

                            <td>
                              <div className="editbuttons">
                                <button
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleEditClick(item.productId)
                                  }
                                  className={edit ? styles.importBtn : ""}
                                >
                                  <img
                                    src={edit ? activeEdit : edit_icon}
                                    width={14}
                                    height={14}
                                  />{" "}
                                  <span
                                    className={edit ? styles.gradientText : ""}
                                  >
                                    Edit
                                  </span>
                                </button>
                              </div>
                            </td>

                            <td className={styles.ImportBtnwraper}>
                              {edit ? (
                                ""
                              ) : (
                                <button
                                  style={{ cursor: "pointer" }}
                                  className={styles.importBtn}
                                >
                                  <img
                                    src={ImportIcon}
                                    width={15}
                                    height={21}
                                  />
                                  <span className={styles.gradientText}>
                                    import
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    : productReviews.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td>
                              <img
                                src="https://img.freepik.com/premium-psd/locket-isolated-transparent-background_191095-29173.jpg?w=826"
                                width={73}
                                height={73}
                              />
                            </td>
                            <td>{item?.productName}</td>
                            <td>{item?.totalReviews}</td>
                            <td>
                              {edit && (
                                <div className={styles.buttonFlexer}>
                                  <label className={styles.switch}>
                                    <input type="checkbox" />
                                    <span className={styles.slider}></span>
                                  </label>
                                </div>
                              )}
                            </td>

                            <td>
                              <button
                                style={{ cursor: "pointer" }}
                                onClick={() => handleEditClick(item.productId)}
                                className={edit ? styles.importBtn : ""}
                              >
                                <img
                                  src={edit ? activeEdit : edit_icon}
                                  width={14}
                                  height={14}
                                />{" "}
                                <span
                                  className={edit ? styles.gradientText : ""}
                                >
                                  Edit
                                </span>
                              </button>
                            </td>

                            <td>
                              {edit ? (
                                ""
                              ) : (
                                <button
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setShowImportPopup(1)}
                                  className={styles.importBtn}
                                >
                                  <img
                                    src={ImportIcon}
                                    width={15}
                                    height={21}
                                  />
                                  <span className={styles.gradientText}>
                                    {" "}
                                    import
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                </tbody>
              </table>
              {productReviews.length > 1 && (
                <div className={styles.paginationFlex}>
                  <p>Showing 1 of 8 pages</p>

                  <div className={styles.pagination}>
                    <a
                      href="#"
                      className={`${styles.prev} ${styles.marginGiven}`}
                      aria-label="Previous"
                    >
                      «
                    </a>
                    <a
                      href="#"
                      className={`${styles.prev} ${styles.active}`}
                      aria-label="Page 1"
                    >
                      1
                    </a>
                    <a href="#" className={styles.prev} aria-label="Page 2">
                      2
                    </a>
                    <a href="#" className={styles.prev} aria-label="Page 3">
                      3
                    </a>
                    <a
                      href="#"
                      className={`${styles.prev} ${styles.dot}`}
                      aria-label="Page 3"
                    >
                      ....
                    </a>
                    <a href="#" aria-label="Page 3">
                      8
                    </a>
                    <a
                      href="#"
                      className={`${styles.next} ${styles.marginGiven}`}
                      aria-label="Next"
                    >
                      »
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Request Reviews" && (
        <Form method="POST">
          <div className={styles.table_content}>
            <div className={styles.requestReview}>
              <div>
                <div>
                  <div className={styles.heading_img}>
                    <h3>Request Reviews By Mail</h3>{" "}
                    <div
                      className={`${styles.activeButton} ${activeEnable === "Disable" ? styles.InactiveButton : ""}`}
                      id="second"
                      onClick={() => setShowProducts(true)}
                    >
                      <div
                        className={styles.butttonsTab}
                        onClick={() => setDropDown(!dropDown)}
                      >
                        <span className={styles.selected}>{activeEnable}</span>
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

                      {dropDown && (
                        <ul className={styles.selectDropdown}>
                          <li onClick={() => handleEnable("Enable")}>Enable</li>
                          <li onClick={() => handleEnable("Disable")}>
                            Disable
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  <p className={styles.paragraph_div}>
                    Automatically send review requests via email to collect
                    valuable customer feedback
                  </p>
                </div>
              </div>
              <div className={styles.timing_after}>
                <div>
                  <label htmlFor="email_send_at">Email Timing</label>
                  <div className={styles.inputTiming}>
                    <input
                      type="number"
                      id="email_send_at"
                      name="email_send_at"
                      placeholder="Enter Days..."
                      value={values.email_send_at}
                      onChange={handleChange}
                    />
                    <span className={styles.inputDays}>Days</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="">Send After</label>
                  <div className={styles.active_tabs}>
                    <button className={styles.active}>Fulfilment</button>
                    <button>Purchase</button>
                  </div>
                </div>
              </div>
              <div className={styles.customizeEmail}>
                <div className={styles.left_content}>
                  <div>
                    <h4 htmlFor="" className={styles.h4_content}>
                      Customize Your Email
                    </h4>
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="Enter Text..."
                      value={values.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Text</label>
                    <textarea
                      type="text"
                      name="text"
                      placeholder="Enter Text..."
                      style={{ resize: "none", scrollbarWidth: "none" }}
                      value={values.text}
                      onChange={handleChange}
                    >
                      {" "}
                    </textarea>
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="five_star">5 star</label>
                    <input
                      type="text"
                      name="five_star"
                      placeholder="Enter Text..."
                      value={values.five_star}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="four_star">4 star</label>
                    <input
                      type="text"
                      name="four_star"
                      placeholder="Enter Text..."
                      value={values.four_star}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="three_star">3 star</label>
                    <input
                      type="text"
                      name="three_star"
                      placeholder="Enter Text..."
                      value={values.three_star}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="two_star">2 star</label>
                    <input
                      type="text"
                      name="two_star"
                      placeholder="Enter Text..."
                      value={values.two_star}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="one_star">1 star</label>
                    <input
                      type="text"
                      name="one_star"
                      placeholder="Enter Text..."
                      value={values.one_star}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="button_color">Button Color</label>
                    <div className={styles.color_styles}>
                      <span className={styles.color_pilate}></span>
                      <input
                        type="text"
                        name="button_color"
                        placeholder="Enter Text..."
                        value={values.button_color}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="button_text">Button Text</label>
                    <input
                      type="text"
                      name="button_text"
                      placeholder="Enter Text..."
                      value={values.button_text}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="footer_unsubscribe_text">
                      Footer-Unsubscribe text
                    </label>
                    <input
                      type="text"
                      name="footer_unsubscribe_text"
                      placeholder="Enter Text..."
                      value={values.footer_unsubscribe_text}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="button_unsubscribe_text">
                      Unsubscribe Button text
                    </label>
                    <input
                      type="text"
                      name="button_unsubscribe_text"
                      placeholder="Enter Text..."
                      value={values.button_unsubscribe_text}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.right_content}>
                  <div className={styles.livePre}>
                    <button>
                      <span>Live Review</span>
                    </button>
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <p>{values.subject}</p>
                  </div>

                  <div className={styles.input_labelContent}>{values.text}</div>

                  <div className={styles.product_title}>
                    <img src={pllaceholderImg} width={100} height={100} />
                    <div>
                      <p>Product Name</p>
                      <span>[Variant]</span>
                    </div>
                  </div>

                  <div className={styles.review_tabs}>
                    <div className={styles.reviewAdd}>
                      <input type="radio" />
                      <div className={styles.starIcon}>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                      </div>

                      <span className={styles.rating_content}>
                        {values.five_star}
                      </span>
                    </div>
                    <div className={styles.reviewAdd}>
                      <input type="radio" />
                      <div className={styles.starIcon}>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                      </div>
                      <span className={styles.rating_content}>
                        {values.four_star}
                      </span>
                    </div>
                    <div className={styles.reviewAdd}>
                      <input type="radio" />
                      <div className={styles.starIcon}>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                      </div>

                      <span className={styles.rating_content}>
                        {values.three_star}
                      </span>
                    </div>
                    <div className={styles.reviewAdd}>
                      <input type="radio" />

                      <div className={styles.starIcon}>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                      </div>
                      <span className={styles.rating_content}>
                        {values.two_star}
                      </span>
                    </div>
                    <div className={styles.reviewAdd}>
                      <input type="radio" />
                      <div className={styles.starIcon}>
                        <span>
                          <img src={stars} width={25} height={25} />
                        </span>
                      </div>

                      <span className={styles.rating_content}>
                        {values.one_star}
                      </span>
                    </div>
                  </div>
                  <div className={styles.add_richtext}>
                    <textarea name="" id="" placeholder="Add text"></textarea>
                  </div>
                  <button
                    className={styles.submit_btn}
                    style={{ color: values.button_color }}
                  >
                    {values.button_text}
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <p
                      className={styles.receivedEmail}
                      style={{ color: values.button_color }}
                    >
                      {values.footer_unsubscribe_text}
                    </p>
                    <p className={styles.receivedEmail}>
                      [{values.button_unsubscribe_text}]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}

      {activeTab === "Widget" && (
        <div className={`${styles.timing_after} ${styles.table_content}`}>
          <Form method="POST">
            <div className={styles.firstAppBtn}>
              <div
                className={`${styles.requestReview} ${styles.firstAppRequest}`}
              >
                <div>
                  <div>
                    <div className={styles.heading_img}>
                      <h3>You’re Almost There!</h3>{" "}
                    </div>
                    <p className={styles.paragraph_div}>Make It Stand Out</p>
                  </div>
                </div>
                <div className={styles.timing_after}>
                  <div>
                    <label htmlFor="">Layout</label>

                    <div className={styles.flexcolumn}>
                      <div className={`${styles.layoutBox} ${styles.selected}`}>
                        <svg
                          width="53"
                          height="53"
                          viewBox="0 0 53 53"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0 8.83333C0 3.95482 3.95482 0 8.83333 0H15.4583C20.3368 0 24.2917 3.95482 24.2917 8.83333V15.4583C24.2917 20.3368 20.3368 24.2917 15.4583 24.2917H8.83333C3.95482 24.2917 0 20.3368 0 15.4583V8.83333ZM28.7083 8.83333C28.7083 3.95482 32.6632 0 37.5417 0H44.1667C49.0452 0 53 3.95482 53 8.83333V15.4583C53 20.3368 49.0452 24.2917 44.1667 24.2917H37.5417C32.6632 24.2917 28.7083 20.3368 28.7083 15.4583V8.83333ZM0 37.5417C0 32.6632 3.95482 28.7083 8.83333 28.7083H15.4583C20.3368 28.7083 24.2917 32.6632 24.2917 37.5417V44.1667C24.2917 49.0452 20.3368 53 15.4583 53H8.83333C3.95482 53 0 49.0452 0 44.1667V37.5417ZM28.7083 37.5417C28.7083 32.6632 32.6632 28.7083 37.5417 28.7083H44.1667C49.0452 28.7083 53 32.6632 53 37.5417V44.1667C53 49.0452 49.0452 53 44.1667 53H37.5417C32.6632 53 28.7083 49.0452 28.7083 44.1667V37.5417Z"
                            fill="url(#paint0_linear_2460_40141)"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_2460_40141"
                              x1="53"
                              y1="0"
                              x2="6.31809e-06"
                              y2="53"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#1C76EB" />
                              <stop offset="1" stopColor="#1CC0F7" />
                            </linearGradient>
                          </defs>
                        </svg>

                        <h6>Grid</h6>
                        <p>(Recommended)</p>
                      </div>
                      <div className={styles.layoutBox}>
                        <svg
                          width="56"
                          height="39"
                          viewBox="0 0 56 39"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0 3.42857C0 1.53502 1.53502 0 3.42857 0C5.32212 0 6.85714 1.53502 6.85714 3.42857C6.85714 5.32212 5.32212 6.85714 3.42857 6.85714C1.53502 6.85714 0 5.32212 0 3.42857ZM14.8571 3.42857C14.8571 2.16621 15.8805 1.14286 17.1429 1.14286H53.7143C54.9767 1.14286 56 2.16621 56 3.42857C56 4.69094 54.9767 5.71429 53.7143 5.71429H17.1429C15.8805 5.71429 14.8571 4.69094 14.8571 3.42857ZM0 19.4286C0 17.535 1.53502 16 3.42857 16C5.32212 16 6.85714 17.535 6.85714 19.4286C6.85714 21.3221 5.32212 22.8571 3.42857 22.8571C1.53502 22.8571 0 21.3221 0 19.4286ZM14.8571 19.4286C14.8571 18.1662 15.8805 17.1429 17.1429 17.1429H53.7143C54.9767 17.1429 56 18.1662 56 19.4286C56 20.6909 54.9767 21.7143 53.7143 21.7143H17.1429C15.8805 21.7143 14.8571 20.6909 14.8571 19.4286ZM0 35.4286C0 33.535 1.53502 32 3.42857 32C5.32212 32 6.85714 33.535 6.85714 35.4286C6.85714 37.3221 5.32212 38.8571 3.42857 38.8571C1.53502 38.8571 0 37.3221 0 35.4286ZM14.8571 35.4286C14.8571 34.1662 15.8805 33.1429 17.1429 33.1429H53.7143C54.9767 33.1429 56 34.1662 56 35.4286C56 36.6909 54.9767 37.7143 53.7143 37.7143H17.1429C15.8805 37.7143 14.8571 36.6909 14.8571 35.4286Z"
                            fill="#0F172A"
                          />
                        </svg>

                        <h6>List</h6>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.divideDiv}>
                  <div
                    className={`${styles.headingWrapper} ${styles.heading_img}`}
                  >
                    <h4>Placement</h4>
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Position</label>

                    <div
                      className={` ${styles.bundle_product} ${styles.bundleNewApp} `}
                      onClick={() => setShowPosition(!showPosition)}
                    >
                      <div
                        className={` ${styles.customSelect} ${styles.customTabsec} `}
                        id="second"
                      >
                        <div className={styles.selectBox}>
                          <span className={styles.selected}>{position}</span>
                          <div className={styles.arrow}>
                            <img src={DorpDownIcon} width={20} height={16} />
                          </div>
                        </div>
                        {showPosition && (
                          <ul
                            className={`${styles.selectDropdown} ${styles.newAppdeop} `}
                          >
                            <li onClick={() => setPosition("Below Section")}>
                              Below Section
                            </li>
                            <li onClick={() => setPosition("Above Section")}>
                              Above Section
                            </li>
                          </ul>
                        )}
                        <input type="hidden" name="position" value={position} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Section</label>
                    <div
                      className={` ${styles.bundle_product} ${styles.bundleNewApp} ${section === "Buy Buttons" ? styles.activeTab : ""} `}
                    >
                      <input
                        type="radio"
                        name="section"
                        id="Buy Buttons"
                        value="Buy Buttons"
                        checked={section === "Buy Buttons"}
                        onChange={() => setSection("Buy Buttons")}
                      />
                      <label htmlFor="Buy Buttons">Buy Buttons</label>
                    </div>

                    <div
                      className={`${styles.bundle_product} ${section === "Product Description" ? styles.activeTab : ""}`}
                    >
                      <input
                        type="radio"
                        name="section"
                        id="Product Description"
                        value="Product Description"
                        checked={section === "Product Description"}
                        onChange={() => setSection("Product Description")}
                      />
                      <label htmlFor="Product Description">
                        Product Description
                      </label>
                    </div>

                    <div
                      className={`${styles.bundle_product} ${section === "End Of Product Page" ? styles.activeTab : ""}`}
                    >
                      <input
                        type="radio"
                        name="section"
                        id="End Of Product Page"
                        value="End Of Product Page"
                        checked={section === "End Of Product Page"}
                        onChange={() => setSection("End Of Product Page")}
                      />
                      <label htmlFor="End Of Product Page">
                        End Of Product Page
                      </label>
                    </div>
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Manual Placement</label>
                    <div className={styles.manunalPlaced}>
                      <p>
                        {`  To Display the Volume Discount widget on your store go to: Theme Settings > Customize > Add Section (From the left sidebar) > Choose Bucket - Volume Discount

*This will override the automatic placement`}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={styles.left_content}>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Text</label>
                      <input
                        type="text"
                        name="text"
                        placeholder="Enter Text..."
                        value={state.text}
                        onChange={handleStateChanges}
                      />
                    </div>

                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Text Size</label>
                      <input
                        type="number"
                        name="textSize"
                        value={state.textSize}
                        onChange={handleStateChanges}
                      />
                    </div>

                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Text Color</label>
                      <div className={styles.color_styles}>
                        <span
                          className={styles.color_pilate}
                          style={{
                            backgroundColor: state.textColor,
                          }}
                        >
                          <input
                            type="color"
                            name="textColor"
                            value={state.textColor}
                            onChange={handleStateChanges}
                          />
                        </span>
                        <input
                          type="text"
                          id="textColor"
                          name="textColor"
                          value={state.textColor}
                          onChange={handleStateChanges}
                        />
                      </div>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Stars Color</label>
                      <div className={styles.color_styles}>
                        <span
                          className={styles.color_pilate}
                          style={{
                            backgroundColor: state.starsColor,
                          }}
                        >
                          <input
                            type="color"
                            name="starsColor"
                            value={state.starsColor}
                            onChange={handleStateChanges}
                          />
                        </span>
                        <input
                          type="text"
                          name="starsColor"
                          value={state.starsColor}
                          onChange={handleStateChanges}
                        />
                      </div>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Bars Rating Color</label>
                      <div className={styles.color_styles}>
                        <span
                          className={styles.color_pilate}
                          style={{
                            backgroundColor: state.barsRatingColor,
                          }}
                        >
                          <input
                            type="color"
                            name="barsRatingColor"
                            value={state.barsRatingColor}
                            onChange={handleStateChanges}
                          />
                        </span>
                        <input
                          type="text"
                          id="background_color"
                          name="barsRatingColor"
                          value={state.barsRatingColor}
                          onChange={handleStateChanges}
                        />
                      </div>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Add Review Button Text</label>
                      <input
                        type="text"
                        name="addReviewBtnText"
                        value={state.addReviewBtnText}
                        onChange={handleStateChanges}
                      />
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Button Color</label>
                      <div className={styles.color_styles}>
                        <span
                          className={styles.color_pilate}
                          style={{
                            backgroundColor: state.buttonColor,
                          }}
                        >
                          <input
                            type="color"
                            name="buttonColor"
                            value={state.buttonColor}
                            onChange={handleStateChanges}
                          />
                        </span>
                        <input
                          type="text"
                          id="buttonColor"
                          name="buttonColor"
                          value={state.buttonColor}
                          onChange={handleStateChanges}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        type="checkbox"
                        id="verified"
                        name="verifiedPurchase"
                        checked={state.verifiedPurchase}
                        onChange={handleStateChanges}
                      />
                      <label htmlFor="verified">
                        Display "Verified Purchase" Tag
                      </label>
                    </div>
                    <div className={styles.divideDiv}>
                      <div className={styles.heading_img}>
                        <h3>Background</h3>{" "}
                      </div>

                      <>
                        <div className={styles.input_labelCustomize}>
                          <label htmlFor="background_color">Color</label>
                          <div className={styles.color_styles}>
                            <span
                              className={styles.color_pilate}
                              style={{
                                backgroundColor: state.backgroundColor,
                              }}
                            >
                              <input
                                type="color"
                                name="backgroundColor"
                                value={state.backgroundColor}
                                onChange={handleStateChanges}
                              />
                            </span>
                            <input
                              type="text"
                              id="background_color"
                              name="backgroundColor"
                              value={state.backgroundColor}
                              onChange={handleStateChanges}
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <input
                            type="checkbox"
                            id="shadow"
                            name="backgroundShadow"
                            checked={state.backgroundShadow}
                            onChange={handleStateChanges}
                          />
                          <label htmlFor="shadow">Display Drop Shadow</label>
                        </div>
                      </>
                    </div>
                  </div>
                </div>
                <div className={styles.Add_btn}>
                  <button
                    className={styles.NextBtn}
                    type="submit"
                    name="intent"
                    value="widgetStep"
                    disabled={navigation.state === "submitting"}
                  >
                    {navigation.state === "submitting" ? <Loader /> : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </Form>

          <div className={styles.live_preview}>
            <img
              src={preview_mockup}
              width={404}
              height={822}
              className={styles.mockup_tab}
            />
            <div className={styles.previewFirstapp}>
              <div className={styles.Preview_bundle}>
                <div className={styles.customer_review}>Customer review</div>
                <h3 className={styles.reviewTotal}>4.3</h3>
                <div className={styles.text_center_img}>
                  <img
                    src={stars}
                    width={26}
                    height={26}
                    className={styles.star_img}
                  />
                </div>
                <h3 className={styles.allover_rating}>56 Reviews</h3>

                <div className={styles.rating_bar}>
                  <h5>40</h5>
                  <div className={styles.rating_progress}>
                    <div
                      className={styles.rating_value}
                      style={{ width: "4%" }}
                    ></div>
                  </div>
                  <span className={styles.rating_label}>5 Stars</span>
                </div>
                <div className={styles.rating_bar}>
                  <h5>40</h5>
                  <div className={styles.rating_progress}>
                    <div
                      className={styles.rating_value}
                      style={{ width: "4%" }}
                    ></div>
                  </div>
                  <span className={styles.rating_label}>5 Stars</span>
                </div>
                <div className={styles.rating_bar}>
                  <h5>40</h5>
                  <div className={styles.rating_progress}>
                    <div
                      className={styles.rating_value}
                      style={{ width: "4%" }}
                    ></div>
                  </div>
                  <span className={styles.rating_label}>5 Stars</span>
                </div>
                <div className={styles.rating_bar}>
                  <h5>40</h5>
                  <div className={styles.rating_progress}>
                    <div
                      className={styles.rating_value}
                      style={{ width: "4%" }}
                    ></div>
                  </div>
                  <span className={styles.rating_label}>5 Stars</span>
                </div>
                <div className={styles.rating_bar}>
                  <h5>40</h5>
                  <div className={styles.rating_progress}>
                    <div
                      className={styles.rating_value}
                      style={{ width: "4%" }}
                    ></div>
                  </div>
                  <span className={styles.rating_label}>5 Stars</span>
                </div>
                <button className={styles.AddBtn}>Add A Review</button>
              </div>
              <div className={styles.reviewTestimonial}>
                <div className={styles.Preview_bundle}>
                  <div className={styles.testimonialMobile}>
                    <div className={styles.testimobileText}>
                      <img src={stars} width={20} height={20} alt="star" />
                      <h6>Caroline B</h6>
                      <div className={styles.verfiyText}>
                        {" "}
                        <img
                          src={check_svg}
                          className={styles.checkSVG}
                          width={12}
                          height={12}
                          alt="img"
                        />{" "}
                        Verfied Purchase
                      </div>
                      <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Culpa, suscipit?
                      </p>
                    </div>
                  </div>
                </div>
                <div className={styles.Preview_bundle}>
                  <div className={styles.testimonialMobile}>
                    <div className={styles.testimobileText}>
                      <img src={stars} width={15} height={15} alt="star" />
                      <h6>Caroline B</h6>
                      <div className={styles.verfiyText}>
                        {" "}
                        <img
                          src={check_svg}
                          className={styles.checkSVG}
                          width={12}
                          height={12}
                          alt="img"
                        />{" "}
                        Verfied Purchase
                      </div>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Natus suscipit voluptatem, ipsam consequatur culpa
                        corrupti....{" "}
                        <span className={styles.showMore}>Show more</span>{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.btnLivePreview}>
              <button>Live Preview</button>
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />


      <div className={styles.modal_overlay} style={{display: (showImportPopup == 1) || (showImportPopup == 2) ?'flex' : 'none'}}>
        {showImportPopup == 1 && (
          <div className={styles.modal_content}>
            <h3>Import Reviews</h3>
            <div className={styles.modalHeading}>
              <img
                src="https://img.freepik.com/premium-psd/locket-isolated-transparent-background_191095-29173.jpg?w=826"
                width={60}
                height={60}
              />
              <span>Necklace 14k</span>
            </div>
            <div className={styles.gridBox}>
              <div className={styles.timing_after}>
                <div className={styles.input_labelCustomize}>
                  <label htmlFor="">Product URL</label>
                  <input type="text" placeholder="Insert URL" />
                </div>
              </div>
              <div className={styles.timing_after}>
                <div>
                  <label>Import From</label>
                  <select className={styles.select_box}>
                    <option value="1" selected>
                      Aliexpress
                    </option>
                    <option value="2">Amazon</option>
                    <option value="3">Temu</option>
                  </select>
                </div>
              </div>

              <div className={styles.timing_after}>
                <div>
                  <label>Number of imports</label>
                  <select className={styles.select_box}>
                    <option value="1" selected>
                      5
                    </option>
                    <option value="2">10</option>
                    <option value="3">20</option>
                    <option value="3">30</option>
                    <option value="3">50</option>
                    <option value="3">100</option>
                    <option value="3">200</option>
                    <option value="3">300</option>
                    <option value="3">400</option>
                    <option value="3">500</option>
                  </select>
                </div>
              </div>

              <div className={styles.timing_after}>
                <div>
                  <label>Content Types</label>
                  <select className={styles.select_box}>
                    <option value="1" selected>
                      All reviews
                    </option>
                    <option value="2">Photo Reviews only</option>
                    <option value="3">Text Reviews only</option>
                  </select>
                </div>
              </div>

              <div className={styles.timing_after}>
                <div>
                  <label>Status</label>
                  <select className={styles.select_box}>
                    <option value="1" selected>
                      Published
                    </option>
                    <option value="2">Unpublished</option>
                  </select>
                </div>
              </div>

              <div className={styles.timing_after}>
                <div>
                  <label htmlFor="">Reviewer Country</label>
                  <select className={styles.select_box}>
                    <option value="1" selected>
                      All
                    </option>
                    {/* <option value="2">Unpublished</option> */}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.timing_after}>
              <div className={styles.formGroup}>
                <input type="checkbox" id="html" />
                <label for="html">
                  {" "}
                  I confirm that I either own the imported reviews or have
                  permission to use them
                </label>
              </div>
            </div>
            <div className={`${styles.addBtn} ${styles.textEnd}`}>
              <button  className={styles.Backbtn} 
               onClick={() => setShowImportPopup(null)}>
                Cancel
              </button>
              <button
                onClick={() => setShowImportPopup(2)}
                className={styles.NextBtn}
              >
                Launch
              </button>
            </div>
          </div>
        )}

        {showImportPopup == 2 && <div className={styles.modal_content}>
          <div className={styles.left_content}>
            <div className={styles.ai_review}>
              <img src={infoImage} alt="img template" width={30} height={30} />
              <div>
                <p>
                  All review edits must follow Shopify's policy Article 7
                  <strong style={{ textDecoration: "underline" }}>
                    {" "}
                    Shopify's Policy{" "}
                  </strong>{" "}
                  . Edits should not change the review's original meaning and
                  must maintain transparency and the integrity of the source.
                  Make sure you comply with the following instructions
                </p>
                <ul>
                  <li>
                    <span>Allowed:</span> Corrections of typos or grammatical
                    mistakes
                  </li>
                  <li>
                    <span>Allowed:</span> Adjustments to improve translated
                    language
                  </li>
                  <li>
                    <span>Allowed:</span> Updates to review information as
                    requested by reviewers
                  </li>
                  <li>
                    <span>NOT Allowed:</span> Modifying star rating
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.ai_review_check}>
              <div className={styles.formGroup}>
                <input type="checkbox" id="save" checked />
                <label for="save">Pin review to the top of the page</label>
              </div>
            </div>
            <div className={`${styles.timing_after} ${styles.maxWidth}`}>
              <div className={styles.input_labelCustomize}>
                <label htmlFor="">Reviewer Name</label>
                <input
                  type="text"
                  name="customerReviews"
                  placeholder="John Doe"
                  value="John Doe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="">Reviewer Name</label>
            </div>
            <div className={styles.timing_after} style={{ margin: "0" }}>
              <div className={styles.modalTextarea}>
                <textarea
                  name=""
                  id=""
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing..."
                ></textarea>
              </div>
            </div>
            <div>
              <label htmlFor="">Reviewer Name</label>
            </div>
            <div>
              {/* <label htmlFor="photo">
              <input type="file" name="" id="" />
            </label> */}
              <div className={styles.addPhotoContainer}>
                <input type="file" id="photoInput" accept="image/*" />
                <div className={styles.addPhotoButton}>
                  <span>
                    <img src={AddGradient} alt="add" width={30} height={30} />
                  </span>
                  <p>Add Photo</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.addBtn} ${styles.textEnd}`}>
             
              <button className={styles.Backbtn}
               onClick={() => setShowImportPopup(null)}
              >Cancel</button>
            <button
              onClick={() => setShowImportPopup(null)}
              className={styles.NextBtn}
            >
              Launch
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}
