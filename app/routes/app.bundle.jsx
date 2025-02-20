import { Text } from "@shopify/polaris";
import db from "../db.server";
import { TitleBar } from "@shopify/app-bridge-react";
import React, { useEffect } from "react";
import { useState } from "react";
import preview_mockup from "../routes/assets/preview_mockup.svg";
import Productpreview from "../routes/assets/product_sample.png";
import downArrow from "../routes/assets/drop_downImg.svg";
import DorpDownIcon from "../routes/assets/dropDown.svg";
import styles from "../styles/main.module.css";
import collectedIcon from "../../app/routes/assets/collected_icon.png";
import dropdown from "../routes/assets/drop_downImg.svg";
import arrowIcon from "../../app/routes/assets/backarrow.png";
import { Form, json, useActionData, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Toaster, toast as notify } from "sonner";
import { getAllBundle } from "../api/bundle.server";
import DeletePopup from "../components/DeletePopup/Deletepopup";
import axios from "axios";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;

    // Perform Promise.all and wait for both responses
    const [graphqlResponse, totalBundleResponse] = await Promise.all([
      admin.graphql(`
        {
          products(first: 50) {
            edges {
              node {
                id
                title
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      inventoryQuantity
                      image {
                        src
                        altText
                      }
                    }
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      src
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      `),
      getAllBundle(shop),
    ]);

    const parsedGraphqlResponse = await graphqlResponse.json();
    const products = parsedGraphqlResponse?.data?.products?.edges || [];

    const totalBundle = totalBundleResponse?.data || [];
    return json({ products, totalBundle });
  } catch (error) {
    console.error(error);
    return json({
      message: "Error occurred while fetching data",
      error: error.message,
      status: 500,
    });
  }
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "stepThird") {
    const bundle_id = formData.get("bundle_id");
    const position = formData.get("position");
    const section = formData.get("section");
    const title_section = {
      text: formData.get("titleSectionText"),
      size: formData.get("titleSectionSize"),
      color: formData.get("titleSectionColor"),
    };
    const title = {
      text: formData.get("titleText"),
      size: formData.get("titleSize"),
      color: formData.get("titleColor"),
    };
    const product = {
      size: formData.get("productSize"),
      color: formData.get("productColor"),
    };

    const bundle_cost = {
      size: formData.get("bundleCostSize"),
      color: formData.get("bundleCostColor"),
      comparedPrice: formData.get("bundleCostComparedPrice"),
      save: formData.get("bundleCostSave"),
    };
    const call_to_action_button = {
      text: formData.get("ctaText"),
      size: formData.get("ctaSize"),
      color: formData.get("ctaColor"),
    };

    const text_below_cta = {
      text: formData.get("tbText"),
      size: formData.get("tbSize"),
      color: formData.get("tbColor"),
    };

    const backgroud = {
      color: formData.get("backgroundColor"),
      shadow: formData.get("backgroundShadow"),
    };

    try {
      if (!bundle_id) {
        return json({ message: "Missing required fields" }, { status: 400 });
      }

      const existingBundle = await db.bundle.findUnique({
        where: {
          id: parseInt(bundle_id),
        },
      });

      if (existingBundle) {
        const updatedDiscount = await db.bundle.update({
          where: { id: parseInt(bundle_id) },
          data: {
            position,
            section,
            title_section,
            title,
            product,
            bundle_cost,
            call_to_action_button,
            text_below_cta,
            backgroud,
            domainName: shop,
          },
        });

        return json({
          message: "Bundle Updated Successfully",
          data: updatedDiscount,
          status: 200,
          step: "third",
        });
      } else {
        const savedDiscount = await db.bundle.create({
          data: {
            id: parseInt(bundle_id),
            position,
            section,
            title_section,
            title,
            product,
            bundle_cost,
            call_to_action_button,
            text_below_cta,
            backgroud,
            domainName: shop,
          },
        });
        return json({
          message: "Bundle saved successfully",
          data: savedDiscount,
          status: 200,
          step: "third",
        });
      }
    } catch (error) {
      console.log(error, "check errior");
      return json({
        message: "Failed to process the request",
        error: error.message,
        status: 500,
      });
    }
  } else if (request.method === "DELETE") {
    try {
      const domainName = shop;
      const productId = formData.get("product_id");
      const discount_id = formData.get("discount_id");

      if (!domainName || !productId) {
        return json({
          message: "Missing 'domainName' or 'product_id'",
          status: 400,
        });
      }
      const data = JSON.stringify({
        query: `
          mutation discountAutomaticDelete($id: ID!) {
            discountAutomaticDelete(id: $id) {
              deletedAutomaticDiscountId
              userErrors {
                field
                code
                message
              }
            }
          }
        `,
        variables: {
          id: discount_id,
        },
      });
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://${shop}/admin/api/2025-01/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session?.accessToken,
        },
        data: data,
      };
      const response = await axios.request(config);
      const responseData = response.data;

      console.log(responseData, "check resresponseData");

      if (responseData.data.discountAutomaticDelete.userErrors.length > 0) {
        console.error(
          "Shopify Errors:",
          responseData.data.discountAutomaticDelete.userErrors,
        );
        return json({
          message: "Failed to delete discount on Shopify",
          errors: responseData.data.discountAutomaticDelete.userErrors,
          status: 400,
        });
      }

      const result = await db.bundle.deleteMany({
        where: {
          AND: [{ id: parseInt(productId) }, { domainName: shop }],
        },
      });

      if (result.count === 0) {
        return json({
          message: `No discounts found for domain: ${shop} and product_id: ${productId}`,
          status: 404,
        });
      }

      return json({
        message: "Bundle successfully deleted",
        status: 200,
        method: "delete",
        step: 4,
      });
    } catch (error) {
      console.error("Error in delete process:", error);
      return json({
        message: "Failed to delete discount",
        error: error.message,
        status: 500,
        method: "delete",
        step: 4,
      });
    }
  } else {
    return undefined;
  }
}

export default function PlansPage() {
  const { products, totalBundle } = useLoaderData();
  const actionResponse = useActionData();
  const [activeTab, setActiveTab] = useState("Home");
  const [position, setPosition] = useState("");
  const [showPosition, setShowPosition] = useState(false);
  const [showComponent, setShowComponent] = useState(1);
  const [productSections, setProductSections] = useState([{ id: 1 }]);
  const [showPopup, setShowPopup] = useState(false);
  const [section, setSection] = useState("Buy Buttons");
  const [id, setId] = useState(null);

  const [values, setValues] = useState({
    bundle_name: "Example Bundle 1",
    displayBundle: "Bundle Product Pages",
    amount: null,
    discount: "Percentage",
  });

  console.log(actionResponse, "actionResponse");


  const handleClick = (item) => {
    setValues(prev => ({
      ...prev,
      discount: item
    }))
  }

  const [cards, setCards] = useState([
    { id: 1, title: "Example Bundle 1", reviews: 280 },
  ]);

  const [titleSection, seTitleSection] = useState({
    titleSectionText: "",
    titleSectionSize: "",
    titleSectionColor: "",
  });

  const [title, seTitle] = useState({
    titleText: "",
    titleSize: "",
    titleColor: "",
  });

  const [productTitle, setProductTitle] = useState({
    productSize: "",
    productColor: "",
  });

  const [bundleCost, setBundleCost] = useState({
    bundleCostSize: "",
    bundleCostColor: "",
    bundleCostComparedPrice: "",
    bundleCostSave: "",
  });

  const [callAction, setCallAction] = useState({
    ctaText: "",
    ctaSize: "",
    ctaColor: "",
  });

  const [textBelow, setTextBelow] = useState({
    tbText: "",
    tbSize: "",
    tbColor: "",
  });

  const [background, setBackGround] = useState({
    backgroundColor: "",
    backgroundShadow: false,
  });

  const handleTitleSection = (e) => {
    const { name, value } = e.target;
    seTitleSection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTitle = (e) => {
    const { name, value } = e.target;
    seTitle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductTitle = (e) => {
    const { name, value } = e.target;
    setProductTitle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBundleCost = (e) => {
    const { name, value } = e.target;
    setBundleCost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCallToAction = (e) => {
    const { name, value } = e.target;
    setCallAction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextBelow = (e) => {
    const { name, value } = e.target;
    setTextBelow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBackground = (e) => {
    const { name, type, checked, value } = e.target;
    setBackGround((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const addProductSection = () => {
    setProductSections((prevSections) => [
      ...prevSections,
      { id: prevSections.length + 1 },
    ]);
  };

  const handleCopy = (id) => {
    const newCard = { ...cards.find((card) => card.id === id), id: Date.now() };
    setCards([...cards, newCard]);
  };

  const handleDesign = () => {
    setActiveTab("Products");
  };

  const handleFirst = () => {
    if (values.bundle_name === "") {
      notify.error("Bundle Name is Required", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else {
      setShowComponent(2);
    }
  };

  const handleSecond = () => {
    if (values.discount === "Percentage") {
      if (values.amount == 100) {
        console.log('Amount andar')
        notify.error("Discount can not be 100%", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else if (values.amount > 100) {
        notify.error("Discount can not be more than 100%", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else {
        setShowComponent(3);
      }
    } else {
      setShowComponent(3);
    }
  };


  useEffect(() => {
   if(totalBundle.length > 0) {
    setActiveTab('Home')
   }else {
    setActiveTab('Products')
   }
  },[])

  useEffect(() => {
    if (actionResponse?.step === 4) {
      if (actionResponse?.status === 200) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
        setShowPopup(false);
      } else if (actionResponse?.status === 500) {
        notify.error(actionResponse?.message, {
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
    <>
      <div className={styles.containerDiv}>
        <TitleBar title="Bundles App"></TitleBar>
        <div className={styles.flexWrapper}>
          <div className={styles.headingFlex}>
            <button className={styles.btn_Back}>
              <img src={arrowIcon} width={20} height={16} />
            </button>

            <h2>Product Bundles</h2>
          </div>

          <div
            className={styles.activeButton}
            id="second"
            onClick={() => setShowProducts(true)}
          >
            <div className={styles.butttonsTab}>
              <span className={styles.selected}>Active</span>
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

            <ul className={styles.selectDropdown} style={{ display: "none" }}>
              <li data-value="option1">Active</li>
              <li data-value="option2">Inactive</li>
            </ul>
          </div>
        </div>

        {activeTab === "Home" && (
          <div className={styles.inline_stackwraper}>
            {Array.from({ length: 3 }).map((item) => (
              <React.Fragment>
                <div className={styles.upper_box}>
                  <div className={styles.PolarisBox}>
                    <div className={styles.inlineStack}>
                      <div className={styles.card_img}>
                        <img src={collectedIcon} width={33} height={40} />
                      </div>

                      <div className={styles.ContentWraper}>
                        <Text variant="headingXs" as="h6">
                          Reviews Collected
                        </Text>

                        <Text as="h3" variant="heading2xl">
                          280
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {activeTab === "Home" && (
          <>
            <div className={styles.bundleHeading}>
              <h2>All Bundles</h2>
              <div
                className={` ${styles.btnFlexWrapper} ${styles.bundleBtnGap} `}
              >
                <div
                  className={` ${styles.activeButton} ${styles.InactiveButton} `}
                  id="second"
                >
                  <div className={styles.butttonsTab}>
                    <span className={styles.selected}>This Month</span>
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

                  <ul
                    className={styles.selectDropdown}
                    style={{ display: "none" }}
                  >
                    <li data-value="option1">Today</li>
                    <li data-value="option2">Yesterday</li>
                    <li data-value="option1">Last 3 Days</li>
                    <li data-value="option2">Last 7 Days</li>
                    <li data-value="option1">This Month</li>
                    <li data-value="option2">Last Month</li>
                    <li data-value="option1">Custom</li>
                  </ul>
                </div>

                <button
                  className={`${styles.btn_one} ${styles.active}`}
                  onClick={() => setActiveTab("Products")}
                >
                  Create Bundle
                </button>
              </div>
            </div>

            {totalBundle &&
              totalBundle.map((card, index) => (
                <React.Fragment key={card.id}>
                  {console.log(card, "cardcheck")}
                  <div className={styles.exampleBundle}>
                    <div className={styles.bundleHeading}>
                      <div
                        className={styles.btnFlexWrapper}
                        style={{ alignItems: "center" }}
                      >
                        <label className={styles.switch}>
                          <input type="checkbox" />
                          <span className={styles.slider}></span>
                        </label>
                        <h2 className={styles.cardHeading}>{card?.name}</h2>
                      </div>
                      <div className={styles.btnFlexWrapper}>
                        <Form method="DELETE">
                          <input
                            type="hidden"
                            name="product_id"
                            value={card?.id}
                          />

                          <input
                            type="hidden"
                            name="discount_id"
                            value={card?.discount_id}
                          />

                          <button
                            className={styles.deletedBtn}
                            type="button"
                            onClick={() => setShowPopup(true)}
                          >
                            <svg
                              width="20"
                              height="24"
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
                          {showPopup && (
                            <DeletePopup
                              setShowPopup={setShowPopup}
                              actionResponse={actionResponse}
                            />
                          )}
                        </Form>
                        <button
                          className={styles.copyIcon}
                          title="Duplicate"
                          onClick={() => handleCopy(card.id)}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 27 27"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20.1675 4.43957C20.1675 1.98551 18.1781 -0.00390625 15.724 -0.00390625H4.61535C2.16129 -0.00390625 0.171875 1.98551 0.171875 4.43957V15.5483C0.171875 18.0023 2.16129 19.9917 4.61535 19.9917V11.1048C4.61535 7.42369 7.59947 4.43957 11.2806 4.43957H20.1675Z"
                              fill="#005BEA"
                            />
                            <path
                              d="M22.3893 6.66131C24.8433 6.66131 26.8327 8.65072 26.8327 11.1048V22.2135C26.8327 24.6675 24.8433 26.657 22.3893 26.657H11.2806C8.82651 26.657 6.83709 24.6675 6.83709 22.2135V11.1048C6.83709 8.65072 8.82651 6.66131 11.2806 6.66131H22.3893Z"
                              fill="#005BEA"
                            />
                          </svg>
                        </button>
                        <button className={styles.edit_Btn} title="Edit">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20.384 1.61947C19.3614 0.596894 17.7035 0.596894 16.6809 1.61947L15.5267 2.77375L19.2297 6.47684L20.384 5.32256C21.4066 4.29998 21.4066 2.64205 20.384 1.61947Z"
                              fill="#464646"
                            />
                            <path
                              d="M18.1717 7.53486L14.4686 3.83178L2.34799 15.9524C1.73274 16.5677 1.28047 17.3265 1.03207 18.1604L0.234279 20.8386C0.155855 21.1019 0.228022 21.387 0.422267 21.5812C0.616513 21.7755 0.90159 21.8476 1.16486 21.7692L3.84308 20.9714C4.67697 20.723 5.43583 20.2708 6.05109 19.6555L18.1717 7.53486Z"
                              fill="#464646"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className={styles.inline_stackwraper}>
                      {Array.from({ length: 3 }).map((item) => (
                        <React.Fragment>
                          <div className={styles.upper_box}>
                            <div className={styles.PolarisBox}>
                              <div className={styles.inlineStack}>
                                <div className={styles.card_img}>
                                  <img
                                    src={collectedIcon}
                                    width={33}
                                    height={40}
                                  />
                                </div>

                                <div className={styles.ContentWraper}>
                                  <Text variant="headingXs" as="h6">
                                    Revenue
                                  </Text>

                                  <Text as="h3" variant="heading2xl">
                                    5,423$
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
          </>
        )}

        {activeTab === "Products" && (
          <div className={styles.main_bundle}>
            <div className={styles.bundleWraper}>
              <span
                onClick={() => setActiveTab("Products")}
                className={showComponent >= 1 ? styles.active_tab : ""}
              >
                <div className={`${styles.tabImage} ${styles.complet_pro}`}>
                  {showComponent >= 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="29"
                      height="23"
                      fill="none"
                      viewBox="0 0 29 23"
                    >
                      <path
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4.187"
                        d="m2.453 13.096 6.98 6.979L26.88 2.627"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 26 26"
                    >
                      <path
                        fill="url(#paint0_linear_904_10273)"
                        fillRule="evenodd"
                        d="M3.922 0A3.92 3.92 0 0 0 0 3.922v5.644c0 1.04.413 2.038 1.149 2.773l12.524 12.524c1.202 1.202 3.123 1.55 4.637.56a24.6 24.6 0 0 0 7.112-7.113c.992-1.514.643-3.435-.559-4.637L12.34 1.149A3.92 3.92 0 0 0 9.566 0zm1.47 6.863a1.47 1.47 0 1 0 0-2.941 1.47 1.47 0 0 0 0 2.94"
                        clipRule="evenodd"
                      ></path>
                      <defs>
                        <linearGradient
                          id="paint0_linear_904_10273"
                          x1="26"
                          x2="0"
                          y1="-0.238"
                          y2="25.762"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#005BEA"></stop>
                          <stop offset="1" stopColor="#00C6FB"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </div>
                Products
              </span>
              <span
                onClick={() => setActiveTab("Offer")}
                className={showComponent >= 2 ? styles.active_tab : ""}
              >
                <div className={`${styles.tabImage} ${styles.complet_pro}`}>
                  {showComponent >= 2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="29"
                      height="23"
                      fill="none"
                      viewBox="0 0 29 23"
                    >
                      <path
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4.187"
                        d="m2.453 13.096 6.98 6.979L26.88 2.627"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 26 26"
                    >
                      <path
                        fill="url(#paint0_linear_904_10273)"
                        fillRule="evenodd"
                        d="M3.922 0A3.92 3.92 0 0 0 0 3.922v5.644c0 1.04.413 2.038 1.149 2.773l12.524 12.524c1.202 1.202 3.123 1.55 4.637.56a24.6 24.6 0 0 0 7.112-7.113c.992-1.514.643-3.435-.559-4.637L12.34 1.149A3.92 3.92 0 0 0 9.566 0zm1.47 6.863a1.47 1.47 0 1 0 0-2.941 1.47 1.47 0 0 0 0 2.94"
                        clipRule="evenodd"
                      ></path>
                      <defs>
                        <linearGradient
                          id="paint0_linear_904_10273"
                          x1="26"
                          x2="0"
                          y1="-0.238"
                          y2="25.762"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#005BEA"></stop>
                          <stop offset="1" stopColor="#00C6FB"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </div>
                Offer
              </span>
              <span
                onClick={() => setActiveTab("Design")}
                className={showComponent >= 3 ? styles.active_tab : ""}
              >
                <div className={`${styles.tabImage} ${styles.complet_pro}`}>
                  {showComponent >= 3 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="29"
                      height="23"
                      fill="none"
                      viewBox="0 0 29 23"
                    >
                      <path
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4.187"
                        d="m2.453 13.096 6.98 6.979L26.88 2.627"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 26 26"
                    >
                      <path
                        fill="url(#paint0_linear_904_10273)"
                        fillRule="evenodd"
                        d="M3.922 0A3.92 3.92 0 0 0 0 3.922v5.644c0 1.04.413 2.038 1.149 2.773l12.524 12.524c1.202 1.202 3.123 1.55 4.637.56a24.6 24.6 0 0 0 7.112-7.113c.992-1.514.643-3.435-.559-4.637L12.34 1.149A3.92 3.92 0 0 0 9.566 0zm1.47 6.863a1.47 1.47 0 1 0 0-2.941 1.47 1.47 0 0 0 0 2.94"
                        clipRule="evenodd"
                      ></path>
                      <defs>
                        <linearGradient
                          id="paint0_linear_904_10273"
                          x1="26"
                          x2="0"
                          y1="-0.238"
                          y2="25.762"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#005BEA"></stop>
                          <stop offset="1" stopColor="#00C6FB"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </div>
                Design
              </span>
            </div>

            <Form method="POST">
              <div className={styles.table_content}>
                <div className={styles.requestReview}>
                  <div className={styles.timing_after}>
                    {showComponent == 1 && (
                      <>
                        <div className={styles.leftContent}>
                          <h3>
                            Ready To Increase AOV?
                            <br></br>
                            <span>Select Products To Bundle</span>
                          </h3>

                          <div className={styles.input_labelCustomize}>
                            <label htmlFor="bundle_name">
                              Name your bundle
                            </label>
                            <input
                              type="text"
                              id="bundle_name"
                              name="bundle_name"
                              value={values.bundle_name}
                              onChange={handleChange}
                              className={styles.inputDiv}
                            />
                          
                          </div>

                          {productSections.map((section, index) => (
                            <div
                              className={styles.input_labelCustomize}
                              key={section.id}
                            >
                              <label htmlFor="">
                                Select Product {index + 1}
                              </label>
                              {/* <div className={styles.input_labelCustomize}>
                                <label
                                  htmlFor="file-upload"
                                  style={{ cursor: "pointer", color: "blue" }}
                                  className={styles.inputUpload}
                                  onClick={() => setIsProduct(true)}
                                >
                                  <span>+</span>Add Product
                                </label>
                                {file && <p> {file.name}</p>}
                                {imagePreview && (
                                  <div className={styles.images_upload}>
                                    <img
                                      src={imagePreview}
                                      alt="Preview"
                                      style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        objectFit: "contain",
                                      }}
                                    />
                                    <div className={styles.image_name}>
                                      <h4>14K Gold Necklace</h4>
                                      <button
                                        onClick={handleDelete}
                                        className={styles.deletedBtn}
                                      >
                                        <img
                                          src={deletedIcon}
                                          width={20}
                                          height={20}
                                        />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div> */}
                            </div>
                          ))}

                          <div className={styles.Addanotherdiv}>
                            <label
                              htmlFor="addProduct"
                              style={{ cursor: "pointer", color: "blue" }}
                            >
                              <span onClick={addProductSection}>+</span>Add
                              Product
                            </label>
                          </div>

                          <div className={styles.input_labelCustomize}>
                            <label htmlFor="">Where to display bundle</label>
                            <div className={styles.bundle_product}>
                              <input
                                type="radio"
                                name="displayBundle"
                                id="first"
                                value="Bundle Product Pages"
                                checked={
                                  values.displayBundle ===
                                  "Bundle Product Pages"
                                }
                                onChange={handleChange}
                              />
                              <label htmlFor="first">
                                Bundle Product Page(s)
                              </label>
                            </div>

                            <div className={styles.bundle_product}>
                              <input
                                type="radio"
                                name="second"
                                id="specific_Product"
                                value="Specific Products Pages"
                                checked={
                                  values.displayBundle ===
                                  "Specific Products Pages"
                                }
                                onChange={handleChange}
                              />
                              <label htmlFor="second">
                                Specific product page
                              </label>
                            </div>
                            {values.product === "Specific Products" && (
                              <div className={styles.bundle_product}>
                                <div
                                  className={` ${styles.customSelect} ${styles.customTabsec} `}
                                  id="second"
                                  onClick={() => setShowProducts(true)}
                                >
                                  <div className={styles.selectBox}>
                                    <span className={styles.selected}>
                                      Choose products
                                    </span>
                                    <div className={styles.arrow}>
                                      <img
                                        src={DorpDownIcon}
                                        width={20}
                                        height={16}
                                      />
                                    </div>
                                  </div>
                                  <ul
                                    className={styles.selectDropdown}
                                    style={{ display: "none" }}
                                  >
                                    <li data-value="option1">Option 1</li>
                                    <li data-value="option2">Option 2</li>
                                    <li data-value="option3">Option 3</li>
                                    <li data-value="option4">Option 4</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className={styles.Margintop50}>
                            <button
                              type="button"
                              className={styles.NextBtn}
                              onClick={handleFirst}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {showComponent == 2 && (
                      <div className={styles.leftContent}>
                        <h3>
                          Sweeten the Deal,
                          <br></br>
                          <span>Pick a killer discount</span>
                        </h3>

                        <div className={styles.input_labelCustomize}>
                          <label htmlFor="">Discount Method</label>
                          <div
                            className={`${styles.Add_btn} ${styles.SweetenBtn}`}
                          >
                            <button
                              type="button"
                              style={{cursor: 'pointer'}}
                              onClick={() => handleClick("Fixed")}
                              className={
                                values.discount === "Fixed"
                                  ? styles.activebtn
                                  : ""
                              }
                            >
                              <span>Fixed Amount</span>
                            </button>

                            <button
                              type="button"
                              style={{cursor: 'pointer'}}
                              onClick={() => handleClick("Percentage")}
                              className={
                                values.discount === "Percentage"
                                  ? styles.activebtn
                                  : ""
                              }
                            >
                              <span>Percentage</span>
                            </button>
                            <input
                              type="hidden"
                              name="discount_method"
                              value={values.discount}
                            />
                          </div>
                        </div>

                        <div className={styles.input_labelCustomize}>
                          <label htmlFor="amount">Choose {values.discount === "Percentage"  ? "Percentage" : "Amount"}</label>
                          <div className={styles.inputTiming}>
                            <input
                              type="number"
                              name="amount"
                              placeholder={`Enter ${
                                values.discount === "Percentage"
                                  ? "Percentage..."
                                  : "Amount..."
                              }`}
                              id="amount"
                              value={values.amount}
                              onChange={handleChange}
                            />
                            <span className={styles.inputDays}>
                              {values.discount === "Percentage" ? "%" : ""}
                            </span>
                          </div>
                        </div>

                        <input type="hidden" name="bundle_id" value={id} />
                        <input
                          type="hidden"
                          name="bundle_title"
                          value={actionResponse?.data?.name}
                        />

                        <div className={styles.Add_btn}>
                          <button
                            type="button"
                            // onClick={() => setShow("Ready To Increase")}
                            className={styles.Backbtn}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            className={styles.NextBtn}
                            onClick={handleSecond}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {showComponent >= 3 && (
                      <>
                        <div className={styles.table_content}>
                          <div className={styles.requestReview}>
                            <div className={styles.timing_after}>
                              <div className={styles.leftContent}>
                                <>
                                  <h3>
                                    You’re Almost There!
                                    <br></br>
                                    <span>Make It Stand Out</span>
                                  </h3>

                                  <div className={styles.divideDiv}>
                                    <div
                                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                                    >
                                      <h4>Placement</h4>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="">Position</label>

                                      <div
                                        className={` ${styles.bundle_product} ${styles.bundleNewApp} `}
                                        onClick={() =>
                                          setShowPosition(!showPosition)
                                        }
                                      >
                                        <div
                                          className={` ${styles.customSelect} ${styles.customTabsec} `}
                                          id="second"
                                        >
                                          <div className={styles.selectBox}>
                                            <span className={styles.selected}>
                                              {position
                                                ? position
                                                : "Below Section"}
                                            </span>
                                            <div className={styles.arrow}>
                                              <img
                                                src={DorpDownIcon}
                                                width={20}
                                                height={16}
                                              />
                                            </div>
                                          </div>
                                          {showPosition && (
                                            <ul
                                              className={`${styles.selectDropdown} ${styles.newAppdeop} `}
                                            >
                                              <li
                                                data-value="option1"
                                                onClick={() =>
                                                  setPosition("option1")
                                                }
                                              >
                                                Option 1
                                              </li>
                                              <li
                                                data-value="option2"
                                                onClick={() =>
                                                  setPosition("option2")
                                                }
                                              >
                                                Option 2
                                              </li>
                                              <li
                                                data-value="option3"
                                                onClick={() =>
                                                  setPosition("option3")
                                                }
                                              >
                                                Option 3
                                              </li>
                                              <li
                                                data-value="option4"
                                                onClick={() =>
                                                  setPosition("option4")
                                                }
                                              >
                                                Option 4
                                              </li>
                                            </ul>
                                          )}
                                          <input
                                            type="hidden"
                                            name="position"
                                            value={position}
                                          />
                                        </div>
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
                                        onChange={() =>
                                          setSection("Buy Buttons")
                                        }
                                      />
                                      <label htmlFor="Buy Buttons">
                                        Buy Buttons
                                      </label>
                                    </div>

                                    <div
                                      className={`${styles.bundle_product} ${section === "Product Description" ? styles.activeTab : ""}`}
                                    >
                                      <input
                                        type="radio"
                                        name="section"
                                        id="Product Description"
                                        value="Product Description"
                                        checked={
                                          section === "Product Description"
                                        }
                                        onChange={() =>
                                          setSection("Product Description")
                                        }
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
                                        checked={
                                          section === "End Of Product Page"
                                        }
                                        onChange={() =>
                                          setSection("End Of Product Page")
                                        }
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

                                  <div className={styles.divideDiv}>
                                    <div
                                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                                    >
                                      <h4>Above title section</h4>
                                      <button
                                        type="button"
                                        class={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={downArrow}
                                          width="20"
                                          height="20"
                                        />
                                      </button>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_section_text">
                                        Text
                                      </label>
                                      <input
                                        type="text"
                                        id="title_section_text"
                                        name="titleSectionText"
                                        value={titleSection.titleSectionText}
                                        onChange={handleTitleSection}
                                        placeholder=""
                                        className={styles.inputDiv}
                                      />
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_section_size">
                                        Size
                                      </label>

                                      <input
                                        type="number"
                                        id="title_section_size"
                                        placeholder=""
                                        name="titleSectionSize"
                                        value={titleSection.titleSectionSize}
                                        onChange={handleTitleSection}
                                      />
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_section_color">
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="title_section_color"
                                          name="titleSectionColor"
                                          value={titleSection.titleSectionColor}
                                          onChange={handleTitleSection}
                                          placeholder=""
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.divideDiv}>
                                    <div
                                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                                    >
                                      <h4>Title</h4>
                                      <button
                                        type="button"
                                        className={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={downArrow}
                                          width="20"
                                          height="20"
                                        />
                                      </button>
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_text">Text</label>
                                      <input
                                        type="text"
                                        id="title_text"
                                        name="titleText"
                                        value={title.titleText}
                                        onChange={handleTitle}
                                        placeholder=""
                                        className={styles.inputDiv}
                                      />
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_size">Size</label>

                                      <input
                                        type="number"
                                        id="title_size"
                                        name="titleSize"
                                        value={title.titleSize}
                                        onChange={handleTitle}
                                        placeholder=""
                                      />
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_color">Color</label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="title_color"
                                          name="titleColor"
                                          value={title.titleColor}
                                          onChange={handleTitle}
                                          placeholder=""
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.divideDiv}>
                                    <div
                                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                                    >
                                      <h4>Product Title</h4>
                                      <button
                                        type="button"
                                        className={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={downArrow}
                                          width="20"
                                          height="20"
                                        />
                                      </button>
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="productSize">Size</label>
                                      <input
                                        type="number"
                                        id="productSize"
                                        name="productSize"
                                        value={productTitle.productSize}
                                        onChange={handleProductTitle}
                                      />
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="productColor">
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="productColor"
                                          name="productColor"
                                          value={productTitle.productColor}
                                          onChange={handleProductTitle}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.divideDiv}>
                                    <div
                                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                                    >
                                      <h4>Bundle Cost</h4>
                                      <button
                                        type="button"
                                        className={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={downArrow}
                                          width="20"
                                          height="20"
                                        />
                                      </button>
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="bundleCostSize">
                                        Size
                                      </label>

                                      <input
                                        type="number"
                                        id="bundleCostSize"
                                        name="bundleCostSize"
                                        value={bundleCost.bundleCostSize}
                                        onChange={handleBundleCost}
                                      />
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="bundleCostColor">
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="bundleCostColor"
                                          name="bundleCostColor"
                                          value={bundleCost.bundleCostColor}
                                          onChange={handleBundleCost}
                                        />
                                      </div>
                                    </div>
                                    <div className={styles.trigerCheck}>
                                      <div
                                        className={styles.input_labelCustomize}
                                      >
                                        <div className={styles.formGroup}>
                                          <input
                                            type="checkbox"
                                            id="compared"
                                            name="bundleCostComparedPrice"
                                            checked={
                                              bundleCost.bundleCostComparedPrice
                                            }
                                            onChange={handleBundleCost}
                                          />
                                          <label htmlFor="compared">
                                            Display Compared-At Price
                                          </label>
                                        </div>
                                      </div>
                                      <div
                                        className={styles.input_labelCustomize}
                                      >
                                        <div className={styles.formGroup}>
                                          <input
                                            type="checkbox"
                                            id="save"
                                            name="bundleCostSave"
                                            checked={bundleCost.bundleCostSave}
                                            onChange={handleBundleCost}
                                          />
                                          <label htmlFor="save">
                                            Display “Save” Badge
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.divideDiv}>
                                    <div
                                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                                    >
                                      <h4>Call To Action Button</h4>
                                      <button
                                        type="button"
                                        className={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={downArrow}
                                          width="20"
                                          height="20"
                                        />
                                      </button>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="call_action_text">
                                        Text
                                      </label>
                                      <input
                                        type="text"
                                        id="call_action_text"
                                        name="ctaText"
                                        value={callAction.ctaText}
                                        onChange={handleCallToAction}
                                        className={styles.inputDiv}
                                      />
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_section_size">
                                        Size
                                      </label>

                                      <input
                                        type="number"
                                        id="title_section_size"
                                        name="ctaSize"
                                        value={callAction.ctaSize}
                                        onChange={handleCallToAction}
                                      />
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_section_color">
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="title_section_color"
                                          name="ctaColor"
                                          value={callAction.ctaColor}
                                          onChange={handleCallToAction}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.divideDiv}>
                                    <div className={styles.heading_img}>
                                      <h3>Text Below CTA</h3>{" "}
                                      <button
                                        type="button"
                                        className={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={dropdown}
                                          width={20}
                                          height={20}
                                        />
                                      </button>
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="text_below_text">
                                        Text
                                      </label>
                                      <input
                                        type="text"
                                        id="text_below_text"
                                        name="tbText"
                                        value={textBelow.tbText}
                                        onChange={handleTextBelow}
                                        className={styles.inputDiv}
                                      />
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="text_below_size">
                                        Size
                                      </label>

                                      <input
                                        type="number"
                                        id="text_below_size"
                                        name="tbSize"
                                        value={textBelow.tbSize}
                                        onChange={handleTextBelow}
                                        className={styles.inputDiv}
                                      />
                                    </div>

                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="text_below_color">
                                        {" "}
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="text_below_color"
                                          name="tbColor"
                                          value={textBelow.tbColor}
                                          onChange={handleTextBelow}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.divideDiv}>
                                    <div className={styles.heading_img}>
                                      <h3>Background</h3>{" "}
                                      <button
                                        type="button"
                                        className={styles.btn_one}
                                      >
                                        Show{" "}
                                        <img
                                          src={dropdown}
                                          width={20}
                                          height={20}
                                        />
                                      </button>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="background_color">
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                        ></span>
                                        <input
                                          type="text"
                                          id="background_color"
                                          name="backgroundColor"
                                          value={background.backgroundColor}
                                          onChange={handleBackground}
                                        />
                                      </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                      <input
                                        type="checkbox"
                                        id="shadow"
                                        name="backgroundShadow"
                                        checked={background.backgroundShadow}
                                        onChange={handleBackground}
                                      />
                                      <label htmlFor="shadow">
                                        Display “Save” tag
                                      </label>
                                    </div>
                                  </div>
                                </>

                                <>
                                  <div className={styles.Add_btn}>
                                    <button
                                      onClick={() =>
                                        setShow("Ready To Increase")
                                      }
                                      className={styles.Backbtn}
                                    >
                                      Back
                                    </button>
                                    <button
                                      name="intent"
                                      value="stepThird"
                                      className={styles.NextBtn}
                                    >
                                      Launch Bundle
                                    </button>
                                  </div>
                                </>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {showComponent <= 3 && (
                      <>
                        <div className={styles.live_preview}>
                          <img
                            src={preview_mockup}
                            width={404}
                            height={822}
                            className={styles.mockup_tab}
                          />
                          <div className={styles.Preview_bundle}>
                            <div className={styles.limited}>
                              Limited Time Offer
                            </div>
                            <h4>Add Bundle And Save 10%!</h4>

                            <div className={styles.both_product}>
                              <div className={styles.left_productsample}>
                                <img
                                  src={Productpreview}
                                  width={112}
                                  height={112}
                                  className={styles.mockup_tab}
                                />
                                <select name="" id="">
                                  <option value="newest">Gold 14K</option>
                                  <option value="old">Gold 14K</option>
                                </select>

                                <h6>Product Name</h6>
                              </div>
                              <div className={styles.AddProduct}>
                                <span>+</span>
                              </div>

                              <div className={styles.left_productsample}>
                                <img
                                  src={Productpreview}
                                  width={112}
                                  height={112}
                                  className={styles.mockup_tab}
                                />
                                <select name="" id="">
                                  <option value="newest">Gold 14K</option>
                                  <option value="old">Gold 14K</option>
                                </select>

                                <h6>Product Name</h6>
                              </div>
                            </div>

                            <div className={styles.productTotal}>
                              <span>Total</span>
                              <div className={styles.Pricetab}>
                                <span className={styles.delPriceOuter}>
                                  <span className={styles.delPrice}>230$</span>
                                </span>
                                <span className={styles.totalPrice}>130$</span>
                                <span className={styles.SaveTab}>Save 10%</span>
                              </div>

                              <button className={styles.AddBtn}>
                                👉 Add To Cart
                              </button>
                              <p className={styles.wrrantyTag}>
                                Lifetime Warranty & Free Returns
                              </p>
                            </div>
                          </div>
                          <div className={styles.btnLivePreview}>
                            <button>Live Preview</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Form>

            {activeTab === "Return" && (
              <>
                <div className={`${styles.table_content} ${styles.DesignCard}`}>
                  <div className={styles.requestReview}>
                    <h2>You Did It!</h2>
                    <p>
                      Your bundle is up and running. Sit back and let the
                      conversations roll in.
                    </p>
                    <button className={styles.NextBtn} onClick={handleDesign}>
                      Return To Dashboard
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}
