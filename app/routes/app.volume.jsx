import axios from "axios";
import { Text } from "@shopify/polaris";
import db from "../db.server";
import { TitleBar } from "@shopify/app-bridge-react";
import React, { useEffect, useRef, useState } from "react";
import preview_mockup from "../routes/assets/preview_mockup.svg";
import DorpDownIcon from "../routes/assets/dropDown.svg";
import deletedIcon from "../routes/assets/deleted.svg";
import Loader from "../components/Loader/Loader";
import styles from "../styles/main.module.css";
import offerIcon from "../../app/routes/assets/offerIcon.svg";
import DesignIcon from "../../app/routes/assets/DesginIcon.svg";
import drop_downImg from "../../app/routes/assets/drop_downImg.svg";
import editIcon from "../../app/routes/assets/edit_icon.svg";
import copy_icon from "../../app/routes/assets/cpyIcon.png";
import { authenticate } from "../shopify.server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigation,
  // useSubmit,
} from "@remix-run/react";
import {
  fetchSalesData,
  getAllBundle,
  getAllDiscountId,
} from "../api/volume.server";
import { Toaster, toast as notify } from "sonner";
import DeletePopup from "../components/DeletePopup/Deletepopup";
import AddProduct from "../components/BundleModal/AddProduct";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;

    // Perform Promise.all and wait for all three responses
    const [graphqlResponse, totalBundleResponse, salesResponse, allIds] =
      await Promise.all([
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
        fetchSalesData(shop),
        getAllDiscountId(shop),
      ]);

    const parsedGraphqlResponse = await graphqlResponse.json();
    const products = parsedGraphqlResponse?.data?.products?.edges || [];

    const totalBundle = totalBundleResponse?.data || [];
    const sales = await salesResponse.json();

    const allDiscountId = await allIds.json();

    return json({ products, totalBundle, sales, allDiscountId });
  } catch (error) {
    console.error(error);
    return json(
      { message: "Error occurred while fetching data", error: error.message },
      { status: 500 },
    );
  }
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (request.method === "POST") {
    if (intent === "stepThird") {
      const bundle_id = formData.get("bundle_id");
      const product = formData.get("product");
      const bundle_name = formData.get("bundle_name");
      const discount_method = formData.get("discount_method");
      const product_details = formData.get("product_details");
      const [selectedProducts] = JSON.parse(product_details);
      const tier = formData.get("tier");
      const position = formData.get("position");
      const section = formData.get("section");
      const [tierData] = JSON.parse(tier);
      const above_title_section = {
        text: formData.get("titleSectionText"),
        size: formData.get("titleSectionSize"),
        color: formData.get("titleSectionColor"),
      };
      const title = {
        text: formData.get("titleText"),
        size: formData.get("titleSize"),
        color: formData.get("titleColor"),
      };
      const Tiers = {
        save: formData.get("tierSave"),
        comparedPrice: formData.get("tierComparedPrice"),
        color: formData.get("tierColor"),
        badgeColor: formData.get("badge_color"),
      };
      const call_to_action_button = {
        text: formData.get("ctaText"),
        size: formData.get("ctaSize"),
        color: formData.get("ctaColor"),
        cart: formData.get("cart"),
      };

      const text_below_cta = {
        text: formData.get("tbText"),
        size: formData.get("tbSize"),
        color: formData.get("tbColor"),
      };

      const background = {
        color: formData.get("backgroundColor"),
        shadow: formData.get("backgroundShadow"),
      };

      if (bundle_name) {
        // Check if a bundle with the same name already exists
        const existingBundle = await db.volumeDiscount.findFirst({
          where: {
            bundle_name, // Check for the exact match of the bundle name
          },
        });

        if (existingBundle) {
          return json({
            error: "Bundle name already exists. Please choose another title.",
            status: 500,
          });
        }
      }

      let data;

      if (product === "All Products") {
        if (discount_method === "Percentage") {
          data = JSON.stringify({
            query:
              "mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) { discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) { automaticDiscountNode { id automaticDiscount { ... on DiscountAutomaticBasic { title startsAt combinesWith { productDiscounts shippingDiscounts orderDiscounts } minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } } customerGets { value { ... on DiscountPercentage { percentage } } items { ... on AllDiscountItems { allItems } } } } } } userErrors { field code message } } }",
            variables: {
              automaticBasicDiscount: {
                title: bundle_name,
                startsAt: "2025-01-07T01:28:55-05:00",
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: tierData?.quantity,
                  },
                },
                customerGets: {
                  value: {
                    percentage: JSON.parse(tierData?.discount) / 100,
                  },
                  items: {
                    all: true,
                  },
                },
                combinesWith: {
                  productDiscounts: true,
                  shippingDiscounts: false,
                  orderDiscounts: false,
                },
              },
            },
          });
        } else if (discount_method === "Fixed Amount") {
          data = JSON.stringify({
            query: `mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
              discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
                automaticDiscountNode {
                  id
                  automaticDiscount {
                    ... on DiscountAutomaticBasic {
                      title
                      startsAt
                      combinesWith { productDiscounts shippingDiscounts orderDiscounts }
                      minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
                      customerGets {
                        value { ... on DiscountAmount { amount { amount currencyCode } } }
                        items { ... on AllDiscountItems { allItems } }
                      }
                    }
                  }
                }
                userErrors { field code message }
              }
            }`,
            variables: {
              automaticBasicDiscount: {
                title: bundle_name,
                startsAt: "2025-01-07T01:28:55-05:00",
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: tierData?.quantity,
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount: tierData?.discount,
                      appliesOnEachItem: false,
                    },
                  },
                  items: {
                    all: true,
                  },
                },
                combinesWith: {
                  productDiscounts: true,
                  shippingDiscounts: false,
                  orderDiscounts: false,
                },
              },
            },
          });
        }
      } else if (product === "Specific Products") {
        if (discount_method === "Percentage") {
          data = JSON.stringify({
            query: `mutation CreateVolumeDiscount($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
    automaticDiscountNode {
      id
      automaticDiscount {
        ... on DiscountAutomaticBasic {
          title
          startsAt
          endsAt
          customerGets {
            items {
              ... on DiscountProducts {
                products(first: 10) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
            value {
              ... on DiscountPercentage {
                percentage
              }
            }
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`,
            variables: {
              automaticBasicDiscount: {
                title: bundle_name,
                startsAt: "2025-01-01T00:00:00Z",
                endsAt: "2025-12-31T23:59:59Z",
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: tierData?.quantity,
                  },
                },
                customerGets: {
                  value: { percentage: JSON.parse(tierData?.discount) / 100 },
                  items: {
                    products: {
                      productsToAdd: selectedProducts?.productId,
                    },
                  },
                },
              },
            },
          });
        } else if (discount_method === "Fixed Amount") {
          data = JSON.stringify({
            query: `mutation CreateVolumeDiscount($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
            discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
              automaticDiscountNode {
                id
                automaticDiscount {
                  ... on DiscountAutomaticBasic {
                    title
                    startsAt
                    endsAt
                    customerGets {
                      items {
                        ... on DiscountProducts {
                          products(first: 10) {
                            edges {
                              node {
                                id
                              }
                            }
                          }
                        }
                      }
                      value {
                        ... on DiscountFixedAmount {
                          amount {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }`,
            variables: {
              automaticBasicDiscount: {
                title: bundle_name,
                startsA: "2025-01-01T00:00:00Z",
                endsAt: "2025-12-31T23:59:59Z",
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: tierData?.quantity,
                  },
                },
                customerGets: {
                  value: {
                    amount: {
                      amount: tierData?.discount,
                      currencyCode: "USD",
                    },
                  },
                  items: {
                    products: {
                      productsToAdd: ["gid://shopify/Product/10025742303543"],
                    },
                  },
                },
              },
            },
          });
        }
      }

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://${shop}/admin/api/2025-01/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session?.accessToken,
        },
        data: data,
      };

      try {
        const response = await axios.request(config);
        const discount_id =
          response?.data?.data?.discountAutomaticBasicCreate
            ?.automaticDiscountNode?.id;
        const discount_info = response?.data?.data;

        if (bundle_id) {
          const updatedDiscount = await db.volumeDiscount.update({
            where: { id: parseInt(bundle_id) },
            data: {
              bundle_name,
              product_all: product === "All Products" ? 1 : 0,
              discount_method,
              product_details,
              tier,
              position,
              section,
              above_title_section,
              title,
              Tiers,
              call_to_action_button,
              text_below_cta,
              background,
              discount_id,
              discount_info,
              domainName: shop,
            },
          });

          return json({
            message: "Volume Bundle Updated successfully",
            data: updatedDiscount,
            status: 200,
            step: 4,
            activeTab: "Return",
          });
        } else {
          const savedDiscount = await db.volumeDiscount.create({
            data: {
              bundle_name,
              product_all: product === "All Products" ? 1 : 0,
              discount_method,
              product_details,
              tier,
              position,
              section,
              above_title_section,
              title,
              Tiers,
              call_to_action_button,
              text_below_cta,
              background,
              discount_id,
              discount_info,
              domainName: shop,
            },
          });

          return json({
            message: "Volume Bundle created successfully",
            data: savedDiscount,
            status: 200,
            step: 4,
            activeTab: "Return",
          });
        }
      } catch (error) {
        console.error("Error processing the request:", error);
        return json(
          { message: "Failed to process the request", error: error.message },
          { status: 500 },
        );
      }
    } else if (intent === "deactivate") {
      const checkboxId = formData.get("checkbox_id");
      const checkStatus = formData.get("check_status");
      const checkId = formData.get("checkId");

      let mutationQuery;
      if (checkStatus == 1) {
        mutationQuery = {
          query: `
      mutation discountAutomaticDeactivate($id: ID!) {
        discountAutomaticDeactivate(id: $id) {
          automaticDiscountNode {
            automaticDiscount {
              ... on DiscountAutomaticBxgy {
                status
                startsAt
                endsAt
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
          variables: {
            id: checkboxId,
          },
        };
      } else if (checkStatus == 0) {
        mutationQuery = {
          query: `
      mutation discountAutomaticActivate($id: ID!) {
        discountAutomaticActivate(id: $id) {
          automaticDiscountNode {
            automaticDiscount {
              ... on DiscountAutomaticBxgy {
                status
                startsAt
                endsAt
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
          variables: {
            id: checkboxId,
          },
        };
      }

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://${shop}/admin/api/2025-01/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session?.accessToken,
        },
        data: JSON.stringify(mutationQuery),
      };

      try {
        // Make the Shopify API request
        const response = await axios(config);

        // Check if the response has user errors
        const errors =
          response.data.data.discountAutomaticDeactivate?.userErrors ||
          response.data.data.discountAutomaticActivate?.userErrors;
        if (errors && errors.length > 0) {
          throw new Error(errors.map((err) => err.message).join(", "));
        }

        // If no errors, update the database based on the `checkStatus`
        const updatedDiscount = await db.volumeDiscount.update({
          where: { id: parseInt(checkId) },
          data: {
            isActive: checkStatus == 1 ? 0 : 1, // Deactivate if 1, activate if 0
            domainName: shop,
          },
        });
        return json({
          message: `Discount is ${checkStatus == 1 ? "Deactived" : "Activated"} successfully`,
          data: updatedDiscount,
          status: 200,
          step: 6,
        });
      } catch (err) {
        console.error("Error during Shopify mutation or database update:", err);
        return json({
          message: "Error occurred while updating data",
          error: err.message,
          status: 500,
          step: 6,
        });
      }
    } 
    else if (intent === "handleAllDiscount") {
      const discountId = JSON.parse(formData.get("discountID"));
      const active = formData.get("active");
   
        // const deactivateDiscount = async (id) => {
        //   const query = {
        //     query: `mutation discountAutomaticDeactivate($id: ID!) {
        //       discountAutomaticDeactivate(id: $id) {
        //         automaticDiscountNode {
        //           automaticDiscount { ... on DiscountAutomaticBxgy { status startsAt endsAt } }
        //         }
        //         userErrors { field message }
        //       }
        //     }`,
        //     variables: { id },
        //   };

        const activateDiscount = async (id) => {
          const query = {
            query: `mutation discountAutomaticActivate($id: ID!) {
              discountAutomaticActivate(id: $id) {
                automaticDiscountNode {
                  automaticDiscount { ... on DiscountAutomaticBxgy { status startsAt endsAt } }
                }
                userErrors { field message }
              }
            }`,
            variables: { id },
          };

          return axios.post(
            `https://${shop}/admin/api/2025-01/graphql.json`,
            query,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": session?.accessToken,
              },
            }
          );
        };


        try {
          const responses = await Promise.all(discountId.map((id) => activateDiscount(id)));
          console.log(responses?.data?.data, 'hashkar');
          const existingApp = await prisma.appActiveInactive.findFirst({
            where: { AppType: appType },
          });



      
          if (existingApp) {
            // If the AppType exists, update the status
            const updatedApp = await prisma.appActiveInactive.update({
              where: { id: existingApp.id },
              data: { status },
            });
      
            return json({
              message: 'App status updated successfully',
              updatedApp,
            });
          } else {
            const newApp = await prisma.appActiveInactive.create({
              data: {
                AppType: appType,
                status
              }
            })
            // If the AppType doesn't exist, create a new entry
            // const newApp = await prisma.appActiveInactive.create({
            //   data: {
            //     AppType: appType,
            //     status,
            //   },
            // });
      
            return json({
              message: 'App status created successfully',
              newApp,
            });
          }
       
        }catch(err) {
          console.log(err, 'errororhas');
          return "nothing"
        }
    }
  } else if (request.method === "DELETE") {
    try {
      const productId = formData.get("product_id");
      const discount_id = formData.get("discount_id");
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

      // Configure Axios request
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

      // Make the request to Shopify
      const response = await axios.request(config);
      const responseData = response.data;

      // Handle user errors from Shopify
      if (responseData.data.discountAutomaticDelete.userErrors.length > 0) {
        return json({
          message: "Failed to delete discount on Shopify",
          errors: responseData.data.discountAutomaticDelete.userErrors,
          status: 400,
        });
      }

      // Delete from your local database
      const result = await db.volumeDiscount.deleteMany({
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
        step: 5,
      });
    } catch (error) {
      console.error("Error in delete process:", error);
      return json({
        message: "Failed to delete discount",
        error: error.message,
        status: 500,
        method: "delete",
        step: 5,
      });
    }
  } else {
    console.log("else case post");
    const bundleType = "volume";
    if (!domainName || !bundleType) {
      return json({ error: "Missing parameters" }, { status: 400 });
    }

    const sales = await db.sales.groupBy({
      by: ["bundleId"],
      where: {
        domainName: shop,
        bundleType,
      },
      _sum: {
        total: true,
      },
      _avg: {
        total: true,
      },
    });

    return json({ sales });
  }
}

const svgs = [
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="30"
    fill="none"
    viewBox="0 0 36 40"
  >
    <path
      fill="#00AC4F"
      fillRule="evenodd"
      d="M9.485 9.166v1.387H5.808a3.47 3.47 0 0 0-3.451 3.107L.019 35.867a3.47 3.47 0 0 0 3.451 3.834h28.686a3.47 3.47 0 0 0 3.45-3.834L33.27 13.66a3.47 3.47 0 0 0-3.45-3.107H26.14V9.167a8.328 8.328 0 1 0-16.656 0m8.328-5.552a5.55 5.55 0 0 0-5.552 5.552v1.387h11.104V9.167a5.55 5.55 0 0 0-5.552-5.552M12.26 18.88a5.552 5.552 0 0 0 11.104 0v-1.388a1.388 1.388 0 1 1 2.776 0v1.388a8.328 8.328 0 1 1-16.656 0v-1.388a1.388 1.388 0 1 1 2.776 0z"
      clipRule="evenodd"
    ></path>
  </svg>,

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="29"
    height="28"
    fill="none"
    viewBox="0 0 39 38"
  >
    <path
      fill="#00AC4F"
      fillRule="evenodd"
      d="M6.685 0A5.73 5.73 0 0 0 .953 5.732v8.25c0 1.52.604 2.977 1.679 4.052l18.305 18.305c1.756 1.756 4.564 2.266 6.777.817A36 36 0 0 0 38.11 26.76c1.449-2.213.94-5.021-.817-6.777L18.987 1.679A5.73 5.73 0 0 0 14.934 0zm2.149 10.03a2.15 2.15 0 1 0 0-4.298 2.15 2.15 0 0 0 0 4.298"
      clipRule="evenodd"
    ></path>
  </svg>,
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    fill="none"
    viewBox="0 0 35 35"
  >
    <path
      fill="#00AC4F"
      fillRule="evenodd"
      d="M3.399 2.037c4.654-.79 9.435-1.2 14.312-1.2s9.658.41 14.312 1.2a3.24 3.24 0 0 1 2.688 3.2v1.821a5.23 5.23 0 0 1-1.532 3.699L22.4 21.536a2.62 2.62 0 0 0-.766 1.849v5.104a5.23 5.23 0 0 1-2.892 4.679l-3.062 1.53a1.308 1.308 0 0 1-1.892-1.169V23.385c0-.694-.276-1.359-.766-1.85L2.243 10.758A5.23 5.23 0 0 1 .711 7.058v-1.82a3.24 3.24 0 0 1 2.688-3.201"
      clipRule="evenodd"
    ></path>
  </svg>,
];

export default function VolumePage() {
  const { products, totalBundle, sales, allDiscountId } = useLoaderData();
  const actionResponse = useActionData();
  // const submit = useSubmit();
  const navigation = useNavigation();

  console.log(allDiscountId, "allDiscountId");

  console.log(totalBundle, "totalBundle");
  const formRef = useRef(null);
  const [showComponent, setShowComponent] = useState(0);
  const [editState, setEditState] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPage, setShowPage] = useState(null);
  const [checkstatus, setCheckstatus] = useState(1);
  const [checkIndex, setCheckIndex] = useState(null);
  const [checked, setChecked] = useState(true);
  const [checkboxId, setCheckBoxId] = useState(null);
  const [productId, setProductId] = useState(null);
  const [cart, setCart] = useState("Cart");
  const [showCart, setShowCart] = useState(false);
  const [isMonth, setIsMonth] = useState(false);
  const [month, setMonth] = useState("This Month");
  const [showButton, setShowButton] = useState({
    titleSection: "Show",
    title: "Show",
    tiers: "Show",
    textBelow: "Show",
    callAction: "Show",
    background: "Show",
  });

  const [showStatus, setShowStatus] = useState({
    titleSection: false,
    title: false,
    tiers: false,
    textBelow: false,
    callAction: false,
    background: false,
  });
  
  const [discountId, setDiscountId] = useState("");
  const [showPosition, setShowPosition] = useState(false);
  const [details, setDetails] = useState({});
  const [isProduct, setIsProduct] = useState(false);
  const [selectProducts, setSelectedPrducts] = useState([]);
  const [position, setPosition] = useState("Below Section");
  const [section, setSection] = useState("Buy Buttons");
  const [values, setValues] = useState({
    bundle_name: "Example Bundle 1",
    product: "All Products",
    discount_method: "Percentage",
  });

  const [activeTab, setActiveTab] = useState("Home");
  const [id, setId] = useState(null);
  const [activeApp, setActiveApp] = useState("Active");
  const [active, setActive] = useState(false);
  const [tier, setTier] = useState([
    {
      quantity: "2",
      discount: "50",
      title: "Buy 2 Products",
      badge: "Most Popular",
    },
  ]);
  const [titleSection, seTitleSection] = useState({
    titleSectionText: "Limited Time Offer",
    titleSectionSize: 13,
    titleSectionColor: "#000000",
  });

  const [title, seTitle] = useState({
    titleText: "Add More & Save",
    titleSize: 13,
    titleColor: "#000000",
  });

  const [tiers, setTiers] = useState({
    tierColor: "#000000",
    badge_color: "#000000",
    tierComparedPrice: true,
    tierSave: true,
  });

  const [textBelow, setTextBelow] = useState({
    tbText: "Lifetime warranty & Free Returns",
    tbSize: 11,
    tbColor: "#555555",
  });

  const [callAction, setCallAction] = useState({
    ctaText: "Add To Cart",
    ctaSize: 13,
    ctaColor: "#FFFFFF",
  });

  const [background, setBackGround] = useState({
    backgroundColor: "#FFFFFF",
    backgroundShadow: true,
  });

  const handleBtn = (type,item) => {
    setShowStatus((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    setShowButton((prev) => ({
      ...prev,
      [type]: item
    }));
  };

  const handleTitleSection = (e) => {
    const { name, value } = e.target;
    seTitleSection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShowStatus = (item) => {
    setShowStatus((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleTitle = (e) => {
    const { name, value } = e.target;
    seTitle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTier = (e) => {
    const { name, type, checked, value } = e.target;
    setTiers((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  const handleClose = () => {
    setIsProduct(false);
  };

  const handleSave = () => {
    if (selectProducts.length > 1) {
      notify.error("Please select only one product", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }
    setIsProduct(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleActive = (e,item) => {
    e.preventDefault();
    setActive(false);
    setActiveApp(item);
      formRef.current.submit(); 
  };

  const handleDesign = () => {
    setActiveTab("Home");
    setEditState(false);
    setShowComponent(0);
    setId(null);
  };

  const handleFirst = () => {
    if (values.bundle_name === "") {
      notify.success("Bundle Name is Required", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else {
      setShowComponent(2);
      setShowPage("second");
    }
  };

  const getLabelText = (method) => {
    switch (method) {
      case "Percentage":
        return "Percentage";
      case "Fixed Amount":
        return "Amount";
      case "Set Selling Price":
        return "Price";
      default:
        return "";
    }
  };

  const handleSecond = () => {
    const [singleTier] = tier;
    if (singleTier.badge === "") {
      notify.error("Please enter badge text", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else if (singleTier.quantity === "") {
      notify.error("Please enter quantity", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else if (singleTier.title === "") {
      notify.error("Please enter title", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else if (singleTier.discount === "") {
      notify.error(`Please enter ${values.discount_method}`, {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else if (values.discount_method === "Percentage") {
      if (singleTier.discount == 100 || singleTier.discount > 100) {
        notify.error("Discount can not be 100 or more", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else if (!/^\d+(\.\d{1,2})?$/.test(singleTier.discount)) {
        notify.error(`${values.discount_method} must be a number`, {
          position: "top-center",
          style: { background: "red", color: "white" },
        });
      } else if (!/^\d+(\.\d{1,2})?$/.test(singleTier.quantity)) {
        notify.error("Quantity must be a number", {
          position: "top-center",
          style: { background: "red", color: "white" },
        });
      } else {
        setShowComponent(3);
        setShowPage("third");
      }
    } else {
      setShowComponent(3);
      setShowPage("third");
    }
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = tier.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setTier(updatedTiers);
  };

  const handleEdit = (item) => {
    setDetails(item);
    setEditState(true);
    setActiveTab("Products");
    setShowComponent(1);
    setShowPage("first");
  };

  const handleCreate = () => {
    setActiveTab("Products");
    setShowComponent(1);
    setShowPage("first");
  };

  const handleDelete = (item) => {
    setShowPopup(true);
    setProductId(item.id);
    setDiscountId(item.discount_id);
  };

  const handleOnChange = (e, index) => {
    e.preventDefault();
    setCheckIndex(index);
    // setChecked(!checked);
    // setCheckBoxId(card);
    submit(e.target.form);
  };

  useEffect(() => {
    if (actionResponse?.status == 6) {
      if (actionResponse?.status === 200) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "green",
            color: "white",
          },
        });
        console.log(actionResponse, "kro");
        // setChecked(actionResponse.isActive)
      } else if (actionResponse?.status === 500) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      }
    }
  }, actionResponse);

  useEffect(() => {
    if (actionResponse?.status === 200) {
      if (actionResponse?.step === 4) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "green",
            color: "white",
          },
        });
        setShowPage("Return");
      }
      setValues({
        bundle_name: "Example Bundle 1",
        product: "All Products",
        discount_method: "Percentage",
      });
      setTier([
        {
          quantity: "2",
          discount: "50",
          title: "Buy 2 Products",
          badge: "Most Popular",
        },
      ]);
      setPosition("Below Section");
      setSection("Buy Buttons");
      seTitleSection({
        titleSectionText: "Limited Time Offer",
        titleSectionSize: 5,
        titleSectionColor: "#000000",
      });
      seTitle({
        titleText: "Add More & Save",
        titleSize: 5,
        titleColor: "#000000",
      });
      setTiers({
        tierColor: "#000000",
        badge_color: "#000000",
        tierComparedPrice: true,
        tierSave: true,
      });

      setCallAction({
        ctaText: "Add To Cart",
        ctaSize: 5,
        ctaColor: "#000000",
      });
      setCart("Cart");
      setTextBelow((prev) => ({
        ...prev,
        tbText: "Lifetime warranty & Free Returns",
        tbSize: 5,
        tbColor: "#555555",
      }));
      setBackGround((prev) => ({
        ...prev,
        backgroundColor: "#FFFFFF",
        backgroundShadow: true,
      }));

      setShowComponent(actionResponse?.step);
    } else if (actionResponse?.status === 500) {
      notify.success(actionResponse?.error, {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    }
  }, [actionResponse]);


  // useEffect(() => {
  //   if (activeApp) {
  //     formRef.current.submit(); 
  //   }
  // }, [activeApp]);

  useEffect(() => {
    if (actionResponse?.step === 5) {
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

  useEffect(() => {
    if (editState) {
      setId(details.id);
      setValues((prev) => ({
        ...prev,
        bundle_name: details.bundle_name,
        product:
          details.product_all == 1 ? "All Products" : "Specific Products",
        discount_method: details.discount_method,
      }));
      setTier(JSON.parse(details.tier));
      setPosition(details.position);
      setSection(details.section);
      seTitleSection((prev) => ({
        ...prev,
        titleSectionText: details.above_title_section.text,
        titleSectionSize: details.above_title_section.size,
        titleSectionColor: details.above_title_section.color,
      }));
      seTitle((prev) => ({
        ...prev,
        titleText: details.title.text,
        titleSize: details.title.size,
        titleColor: details.title.color,
      }));
      setTiers((prev) => ({
        ...prev,
        tierColor: details.Tiers.color,
        tierComparedPrice: details.Tiers.comparedPrice === "on" ? true : false,
        tierSave: details.Tiers.save === "on" ? true : false,
        badge_color: details.Tiers.badgeColor,
      }));

      setCallAction((prev) => ({
        ...prev,
        ctaText: details.call_to_action_button.text,
        ctaSize: details.call_to_action_button.size,
        ctaColor: details.call_to_action_button.color,
      }));
      setCart(details.call_to_action_button.cart);
      setTextBelow((prev) => ({
        ...prev,
        tbText: details.text_below_cta.text,
        tbSize: details.text_below_cta.size,
        tbColor: details.text_below_cta.color,
      }));
      setBackGround((prev) => ({
        ...prev,
        backgroundColor: details.background.color,
        backgroundShadow: details.background.shadow == "on" ? true : false,
      }));
    }
  }, [editState]);

  const handleMonth = (item) => {
    setMonth(item);
  };

  const getFilteredBundles = () => {
    if (!totalBundle) return [];

    const currentDate = new Date();
    return totalBundle.filter((card) => {
      const bundleDate = new Date(card.createdAt);

      switch (month) {
        case "Today":
          return bundleDate.toDateString() === currentDate.toDateString();
        case "Yesterday":
          return (
            bundleDate.toDateString() ===
            new Date(
              currentDate.setDate(currentDate.getDate() - 1),
            ).toDateString()
          );
        case "Last 3 Days":
          return (
            bundleDate >=
            new Date(currentDate.setDate(currentDate.getDate() - 3))
          );
        case "Last 7 Days":
          return (
            bundleDate >=
            new Date(currentDate.setDate(currentDate.getDate() - 7))
          );
        case "This Month":
          return (
            bundleDate.getMonth() === currentDate.getMonth() &&
            bundleDate.getFullYear() === currentDate.getFullYear()
          );
        case "Last Month":
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return (
            bundleDate.getMonth() === lastMonth.getMonth() &&
            bundleDate.getFullYear() === lastMonth.getFullYear()
          );
        default:
          return true;
      }
    });
  };

  const filteredBundles = getFilteredBundles();

  return (
    <>
      <div className={styles.containerDiv}>
        <TitleBar title="Volume Bundles"></TitleBar>
        <div className={styles.flexWrapper}>
          <div className={styles.headingFlex}>
            <button className={styles.btn_Back}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.78033 0.21967C9.07322 0.512563 9.07322 0.987437 8.78033 1.28033L2.56066 7.5H18.75C19.1642 7.5 19.5 7.83579 19.5 8.25C19.5 8.66421 19.1642 9 18.75 9H2.56066L8.78033 15.2197C9.07322 15.5126 9.07322 15.9874 8.78033 16.2803C8.48744 16.5732 8.01256 16.5732 7.71967 16.2803L0.21967 8.78033C-0.0732233 8.48744 -0.0732233 8.01256 0.21967 7.71967L7.71967 0.21967C8.01256 -0.0732233 8.48744 -0.0732233 8.78033 0.21967Z"
                  fill="#0F172A"
                />
              </svg>
            </button>
            <h2>Volume Discount</h2>
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
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                    fill="#0F172A"
                  />
                </svg>
              </div>
            </div>
            {active && (
              <Form method="POST" ref={formRef}>
                <input type="hidden" name="active" value={activeApp} />
                <input
                  type="hidden"
                  name="discountID"
                  value={JSON.stringify(allDiscountId?.data)}
                />
                <input type="hidden" name="intent" value="handleAllDiscount" />

                <ul className={styles.selectDropdown}>
                  <li 
                  onClick={(e) => handleActive(e,"Active")}
                  >
                    Active
                    </li>
                  <li 
                  onClick={(e) => handleActive(e, "Inactive")}
                  >
                      Inactive
                      </li>
                </ul>
              </Form>
            )}
          </div>
        </div>

        {activeTab === "Home" && (
          <div className={styles.inline_stackwraper}>
            {Array.from({ length: 2 }).map((item, index) => (
              <React.Fragment>
                <div className={styles.upper_box}>
                  <div className={styles.PolarisBox}>
                    <div className={styles.inlineStack}>
                      <div className={styles.card_img}>{svgs[index]}</div>

                      <div className={styles.ContentWraper}>
                        <Text variant="headingXs" as="h6">
                          {index == 0 ? "Revenue" : "Average"}
                        </Text>

                        {index === 0 ? (
                          <>
                            <Text as="h3" variant="heading2xl">
                              {sales[0]?._sum?.total || 0}{" "}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text as="h3" variant="heading2xl">
                              {sales[0]?._avg?.total || 0}{" "}
                            </Text>
                          </>
                        )}
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
              <div className={styles.btnFlexWrapper}>
                <div
                  className={styles.activeButton}
                  onClick={() => setIsMonth(!isMonth)}
                >
                  <div className={styles.butttonsTab}>
                    {month}{" "}
                    <img
                      src={drop_downImg}
                      className={styles.inactiveImg}
                      width={15}
                      height={8}
                    />{" "}
                  </div>
                  {isMonth && (
                    <>
                      <ul
                        className={` ${styles.selectDropdown} ${styles.InactiveButton} `}
                      >
                        <li onClick={() => handleMonth("Today")}>Today</li>
                        <li onClick={() => handleMonth("Yesterday")}>
                          Yesterday
                        </li>
                        <li onClick={() => handleMonth("Last 3 Days")}>
                          Last 3 Days
                        </li>
                        <li onClick={() => handleMonth("Last 7 Days")}>
                          Last 7 Days
                        </li>
                        <li onClick={() => handleMonth("This Month")}>
                          This Month
                        </li>
                        <li onClick={() => handleMonth("Last Month")}>
                          Last Month
                        </li>
                        <li onClick={() => handleMonth("Custom")}>Custom</li>
                      </ul>
                    </>
                  )}
                </div>
                <button
                  onClick={handleCreate}
                  className={`${styles.btn_one} ${styles.active}`}
                >
                  Create Volume Discount
                </button>
              </div>
            </div>

            {filteredBundles &&
              filteredBundles.map((card, index) => (
                <React.Fragment key={card.id}>
                  <div className={styles.exampleBundle}>
                    <div className={styles.bundleHeading}>
                      <div
                        className={styles.btnFlexWrapper}
                        style={{ alignItems: "center" }}
                      >
                        <Form method="POST">
                          <label className={styles.switch}>
                            <input
                              type="hidden"
                              name="checkbox_id"
                              value={card.discount_id}
                            />
                            <input
                              type="hidden"
                              name="check_status"
                              value={card?.isActive}
                            />
                            <input
                              type="hidden"
                              name="checkId"
                              value={card.id}
                            />

                            <input
                              type="checkbox"
                              name="checkbox"
                              value={checked}
                              checked={index}
                              onChange={(e) => handleOnChange(e, index)}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <input
                            type="hidden"
                            name="intent"
                            value="deactivate"
                          />
                        </Form>

                        <h2 className={styles.cardHeading}>
                          {card?.bundle_name}
                        </h2>
                      </div>

                      <div className={styles.btnFlexWrapper}>
                        <Form method="DELETE">
                          <input
                            type="hidden"
                            name="product_id"
                            value={productId}
                          />

                          <input
                            type="hidden"
                            name="discount_id"
                            value={discountId}
                          />

                          <button
                            className={styles.deletedBtn}
                            type="button"
                            onClick={() => handleDelete(card)}
                          >
                            <svg
                              width="20"
                              height="24"
                              viewBox="0 0 18 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12.8573 2.83637V3.05236C13.7665 3.13559 14.6683 3.24505 15.5617 3.37998C15.8925 3.42994 16.2221 3.48338 16.5506 3.54028C16.9393 3.60761 17.1998 3.9773 17.1325 4.366C17.0652 4.7547 16.6955 5.01522 16.3068 4.94789C16.2405 4.93641 16.1741 4.92507 16.1078 4.91388L15.1502 17.362C15.0357 18.8506 13.7944 20 12.3015 20H4.84161C3.34865 20 2.10739 18.8506 1.99289 17.362L1.03534 4.91388C0.968948 4.92507 0.902608 4.93641 0.836318 4.94789C0.447617 5.01522 0.07793 4.7547 0.0105981 4.366C-0.0567338 3.9773 0.203787 3.60761 0.592487 3.54028C0.920962 3.48338 1.25062 3.42994 1.58141 3.37998C2.47484 3.24505 3.37657 3.13559 4.28583 3.05236V2.83637C4.28583 1.34639 5.44062 0.0744596 6.9672 0.0256258C7.49992 0.00858464 8.03474 0 8.57155 0C9.10835 0 9.64318 0.00858464 10.1759 0.0256258C11.7025 0.0744596 12.8573 1.34639 12.8573 2.83637ZM7.01287 1.45347C7.53037 1.43691 8.04997 1.42857 8.57155 1.42857C9.09312 1.42857 9.61272 1.43691 10.1302 1.45347C10.8489 1.47646 11.4287 2.07994 11.4287 2.83637V2.94364C10.4836 2.88625 9.53092 2.85714 8.57155 2.85714C7.61217 2.85714 6.65951 2.88625 5.7144 2.94364V2.83637C5.7144 2.07994 6.29419 1.47646 7.01287 1.45347ZM6.67497 7.11541C6.65981 6.72121 6.32796 6.41394 5.93376 6.4291C5.53957 6.44426 5.2323 6.77611 5.24746 7.17031L5.57713 15.7417C5.59229 16.1359 5.92414 16.4432 6.31834 16.428C6.71254 16.4129 7.01981 16.081 7.00464 15.6868L6.67497 7.11541ZM11.8948 7.17031C11.9099 6.77611 11.6026 6.44426 11.2084 6.4291C10.8143 6.41394 10.4824 6.72121 10.4672 7.11541L10.1376 15.6868C10.1224 16.081 10.4297 16.4129 10.8239 16.428C11.2181 16.4432 11.5499 16.1359 11.5651 15.7417L11.8948 7.17031Z"
                                fill="#F24747"
                              />
                            </svg>
                          </button>
                          {showPopup && (
                            <DeletePopup
                              setShowPopup={setShowPopup}
                              actionResponse={actionResponse}
                              state={navigation.state}
                            />
                          )}
                        </Form>
                        <button className={styles.copyIcon}>
                          <img src={copy_icon} width={20} height={20} />
                        </button>
                        <button
                          className={styles.edit_Btn}
                          onClick={() => handleEdit(card)}
                        >
                          <img src={editIcon} width={20} height={20} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.inline_stackwraper}>
                      {Array.from({ length: 3 }).map((item, index) => (
                        <React.Fragment>
                          <div className={styles.upper_box}>
                            <div className={styles.PolarisBox}>
                              <div className={styles.inlineStack}>
                                <div className={styles.card_img}>
                                  {svgs[index]}
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
                  </div>
                </React.Fragment>
              ))}
          </>
        )}

        {activeTab === "Products" && (
          <div className={styles.main_bundle}>
            <div className={styles.bundleWraper}>
              <span
                className={`${showPage === "first" ? styles.bordercolor : ""} ${showComponent > 1 ? styles.active_tab : ""}`}
              >
                <div className={`${styles.tabImage} ${styles.complet_pro}`}>
                  {showComponent > 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="16"
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
                className={`${showPage === "second" ? styles.bordercolor : ""} ${showComponent > 2 ? styles.active_tab : ""}`}
              >
                <div className={`${styles.tabImage} ${styles.complet_pro}`}>
                  {showComponent > 2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="16"
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
                    <img src={offerIcon} width={20} height={20} />
                  )}
                </div>
                Offer
              </span>
              <span
                className={`${showPage === "third" ? styles.bordercolor : ""} ${showComponent > 3 ? styles.active_tab : ""}`}
              >
                <div className={`${styles.tabImage} ${styles.complet_pro}`}>
                  {showComponent > 3 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="16"
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
                    <img src={DesignIcon} width={20} height={20} />
                  )}
                </div>
                Design
              </span>
            </div>

            <Form method="POST">
              <div className={styles.table_content}>
                <div className={styles.requestReview}>
                  <div className={styles.timing_after}>
                    {showPage == "first" && (
                      <>
                        <div className={styles.leftContent}>
                          <h3>
                            Ready To Increase AOV?
                            <br></br>
                            <span>Let’s Get Started</span>
                          </h3>

                          <div className={styles.input_labelCustomize}>
                            <label htmlFor="bundle_name">
                              Name your bundle
                            </label>
                            <input
                              type="text"
                              placeholder=""
                              name="bundle_name"
                              value={values.bundle_name}
                              onChange={handleChange}
                              className={styles.inputDiv}
                            />
                          </div>

                          <div className={styles.input_labelCustomize}>
                            <label htmlFor="">
                              Select Products for Volume Discount
                            </label>

                            <div className={styles.bundle_product}>
                              <input
                                type="radio"
                                name="product"
                                id="first"
                                value="All Products"
                                checked={values.product === "All Products"}
                                onChange={handleChange}
                              />
                              <label htmlFor="first">All Products</label>
                            </div>

                            <div className={styles.bundle_product}>
                              <input
                                type="radio"
                                name="product"
                                id="second"
                                value="Specific Products"
                                checked={values.product === "Specific Products"}
                                onChange={handleChange}
                              />
                              <label htmlFor="second">Specific products</label>
                            </div>

                            {values.product === "Specific Products" && (
                              <div className={styles.bundle_product}>
                                <div
                                  className={` ${styles.customSelect} ${styles.customTabsec} `}
                                  id="second"
                                >
                                  {selectProducts.length > 0 ? (
                                    products
                                      .filter((item) =>
                                        selectProducts.some(
                                          (buy) =>
                                            buy.productId === item?.node?.id,
                                        ),
                                      )
                                      .map((item, index) => (
                                        <>
                                          <label htmlFor="">
                                            Select Product {index + 1}
                                          </label>
                                          <div
                                            className={styles.images_upload}
                                            key={index}
                                          >
                                            <img
                                              src={
                                                item?.node?.images?.edges[0]
                                                  ?.node?.src
                                              }
                                              alt="Preview"
                                              style={{
                                                width: "100px",
                                                height: "100px",
                                                maxHeight: "100px",
                                                maxWidth: "100px",
                                                objectFit: "cover",
                                                borderRadius: "15px",
                                              }}
                                            />
                                            <div className={styles.image_name}>
                                              <h4>14K Gold Necklace</h4>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setSelectedPrducts([])
                                                }
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
                                        </>
                                      ))
                                  ) : (
                                    <>
                                      <div
                                        className={styles.selectBox}
                                        onClick={() => setIsProduct(true)}
                                      >
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
                                    </>
                                  )}
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

                    {showPage == "second" && (
                      <>
                        <div className={styles.leftContent}>
                          <h3>
                            Sweeten the Deal,
                            <br></br>
                            <span>Pick a killer discount</span>
                          </h3>
                          <div className={styles.input_labelCustomize}>
                            <label htmlFor="">Discount Method</label>
                            <div
                              className={` ${styles.bundle_product} ${values.discount_method === "Percentage" ? styles.activeTab : ""} `}
                            >
                              <input
                                type="radio"
                                id="Percentage"
                                name="discount_method"
                                value="Percentage"
                                checked={
                                  values.discount_method === "Percentage"
                                }
                                onChange={handleChange}
                              />
                              <label htmlFor="Percentage">Percentage</label>
                            </div>

                            <div
                              className={`${styles.bundle_product} ${values.discount_method === "Fixed Amount" ? styles.activeTab : ""}`}
                            >
                              <input
                                type="radio"
                                id="Fixed Amount"
                                name="discount_method"
                                value="Fixed Amount"
                                checked={
                                  values.discount_method === "Fixed Amount"
                                }
                                onChange={handleChange}
                              />
                              <label htmlFor="Fixed Amount">Fixed Amount</label>
                            </div>

                            <div
                              className={`${styles.bundle_product} ${values.discount_method === "Set Selling Price" ? styles.activeTab : ""}`}
                            >
                              <input
                                type="radio"
                                id="Set Selling Price"
                                name="discount_method"
                                value="Set Selling Price"
                                checked={
                                  values.discount_method === "Set Selling Price"
                                }
                                onChange={handleChange}
                              />
                              <label htmlFor="Set Selling Price">
                                Set Selling Price
                              </label>
                            </div>
                          </div>

                          {tier.map((item, index) => (
                            <React.Fragment key={index}>
                              <div className={styles.input_labelCustomize}>
                                <label htmlFor="">Tier #{index + 1}</label>

                                <div className={styles.formGroup}>
                                  <input
                                    type="checkbox"
                                    id="html"
                                    onChange={(e) =>
                                      handleTierChange(
                                        index,
                                        "isDefault",
                                        e.target.checked,
                                      )
                                    }
                                  />
                                  <label htmlFor="html">Set Default</label>
                                </div>
                                <div key={index} className={styles.input_tier}>
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="quantity">Quantity</label>
                                    <input
                                      type="text"
                                      name="quantity"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        handleTierChange(
                                          index,
                                          "quantity",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="quantity">
                                      Set {getLabelText(values.discount_method)}
                                    </label>

                                    <input
                                      type="text"
                                      name="discount"
                                      value={item.discount}
                                      onChange={(e) =>
                                        handleTierChange(
                                          index,
                                          "discount",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="quantity">Title</label>
                                    <input
                                      type="text"
                                      name="title"
                                      value={item.title}
                                      onChange={(e) =>
                                        handleTierChange(
                                          index,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="quantity">Badge Text</label>
                                    <div>
                                      <input
                                        type="text"
                                        name="badge"
                                        value={item.badge}
                                        onChange={(e) =>
                                          handleTierChange(
                                            index,
                                            "badge",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className={styles.image_name}>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className={styles.deletedBtn}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="20"
                                        fill="none"
                                        viewBox="0 0 18 20"
                                      >
                                        <path
                                          fill="#F24747"
                                          fillRule="evenodd"
                                          d="M12.857 2.836v.216a47 47 0 0 1 3.694.488.714.714 0 0 1-.244 1.408l-.2-.034-.957 12.448A2.857 2.857 0 0 1 12.302 20h-7.46a2.857 2.857 0 0 1-2.85-2.638L1.036 4.914l-.199.034A.714.714 0 0 1 .592 3.54a46 46 0 0 1 3.694-.488v-.216c0-1.49 1.155-2.762 2.681-2.81a50 50 0 0 1 3.209 0c1.527.048 2.681 1.32 2.681 2.81M7.013 1.453a49 49 0 0 1 3.117 0c.719.023 1.299.627 1.299 1.383v.108a47 47 0 0 0-5.715 0v-.108c0-.756.58-1.36 1.299-1.383m-.338 5.662a.714.714 0 1 0-1.428.055l.33 8.572a.714.714 0 1 0 1.428-.055zm5.22.055a.714.714 0 0 0-1.428-.055l-.33 8.572a.714.714 0 1 0 1.428.055z"
                                          clipRule="evenodd"
                                        ></path>
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}

                          <div className={styles.Add_btn}>
                            <button
                              type="button"
                              onClick={() => setShowPage("first")}
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
                      </>
                    )}

                    {showPage == "third" && (
                      <>
                        <div>
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

                                <input
                                  type="hidden"
                                  name="bundle_id"
                                  value={id}
                                />
                                <input
                                  type="hidden"
                                  name="tier"
                                  value={JSON.stringify(tier)}
                                />
                                <input
                                  type="hidden"
                                  name="bundle_name"
                                  value={values.bundle_name}
                                />
                                <input
                                  type="hidden"
                                  name="product"
                                  value={values.product}
                                />
                                <input
                                  type="hidden"
                                  name="discount_method"
                                  value={values.discount_method}
                                />
                                <input
                                  type="hidden"
                                  name="product_details"
                                  value={JSON.stringify(selectProducts)}
                                />
                                <div className={styles.input_labelCustomize}>
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
                                            onClick={() =>
                                              setPosition("Below Section")
                                            }
                                          >
                                            Below Section
                                          </li>
                                          <li
                                            onClick={() =>
                                              setPosition("Above Section")
                                            }
                                          >
                                            Above Section
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
                                    onChange={() => setSection("Buy Buttons")}
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
                                    checked={section === "Product Description"}
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
                                    checked={section === "End Of Product Page"}
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

                                  <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() =>
                                        handleShowStatus("titleSection")
                                      }
                                      className={styles.butttonsTab}
                                    >
                                      {showButton.titleSection}
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
                                          fill="#00AC4F"
                                        ></path>
                                      </svg>
                                    </div>

                                    {showStatus.titleSection && (
                                      <ul className={styles.selectDropdown}>
                                        <>
                                          <li
                                            onClick={() =>
                                              handleBtn("titleSection", "Show")
                                            }
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() =>
                                              handleBtn("titleSection", "Hide")
                                            }
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                                {showButton.titleSection === "Show" && (
                                  <>
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
                                          style={{
                                            backgroundColor:
                                              titleSection.titleSectionColor,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            name="titleSectionColor"
                                            value={
                                              titleSection.titleSectionColor
                                            }
                                            onChange={handleTitleSection}
                                          />
                                        </span>

                                        <input
                                          type="text"
                                          id="title_section_color"
                                          name="titleSectionColor"
                                          value={titleSection.titleSectionColor}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className={styles.divideDiv}>
                                <div
                                  className={`${styles.headingWrapper} ${styles.heading_img}`}
                                >
                                  <h4>Title</h4>
                                  <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() => handleShowStatus("title")}
                                      className={styles.butttonsTab}
                                    >
                                      {showButton.title}
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
                                          fill="#00AC4F"
                                        ></path>
                                      </svg>
                                    </div>

                                    {showStatus.title && (
                                      <ul className={styles.selectDropdown}>
                                        <>
                                          <li
                                            onClick={() => handleBtn("title", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() => handleBtn("title", "Hide")}
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                                {showButton.title === "Show" && (
                                  <>
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
                                      />
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="title_color">Color</label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                          style={{
                                            backgroundColor: title.titleColor,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            name="titleColor"
                                            value={title.titleColor}
                                            onChange={handleTitle}
                                          />
                                        </span>
                                        <input
                                          type="text"
                                          id="title_color"
                                          name="titleColor"
                                          value={title.titleColor}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className={styles.divideDiv}>
                                <div className={styles.heading_img}>
                                  <h3>Tiers</h3>{" "}
                                  <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() => handleShowStatus("tiers")}
                                      className={styles.butttonsTab}
                                    >
                                      {showButton.tiers}
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
                                          fill="#00AC4F"
                                        ></path>
                                      </svg>
                                    </div>

                                    {showStatus.tiers && (
                                      <ul className={styles.selectDropdown}>
                                        <>
                                          <li
                                           
                                            onClick={() => handleBtn("tiers", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                           
                                            onClick={() => handleBtn("tiers", "Hide")}
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                                {showButton.tiers === "Show" && (
                                  <>
                                    <div className={styles.trigerCheck}>
                                      <div
                                        className={styles.input_labelCustomize}
                                      >
                                        <div className={styles.formGroup}>
                                          <input
                                            type="checkbox"
                                            id="save"
                                            name="tierSave"
                                            checked={tiers.tierSave}
                                            onChange={handleTier}
                                          />
                                          <label htmlFor="save">
                                            Display “Save” Badge
                                          </label>
                                        </div>
                                      </div>

                                      <div
                                        className={styles.input_labelCustomize}
                                      >
                                        <div className={styles.formGroup}>
                                          <input
                                            type="checkbox"
                                            id="compared"
                                            name="tierComparedPrice"
                                            checked={tiers.tierComparedPrice}
                                            onChange={handleTier}
                                          />
                                          <label for="compared">
                                            Display Compared-At Price
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="tiers_color">Color</label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                          style={{
                                            backgroundColor: tiers.tierColor,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            name="tierColor"
                                            value={tiers.tierColor}
                                            onChange={handleTier}
                                          />
                                        </span>
                                        <input
                                          type="text"
                                          id="tiers_color"
                                          name="tierColor"
                                          value={tiers.tierColor}
                                        />
                                      </div>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="badge_color">
                                        “Save” Badge Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                          style={{
                                            backgroundColor: tiers.badge_color,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            name="badge_color"
                                            value={tiers.badge_color}
                                            onChange={handleTier}
                                          />
                                        </span>
                                        <input
                                          type="text"
                                          id="badge_color"
                                          name="badge_color"
                                          value={tiers.badge_color}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className={styles.divideDiv}>
                                <div
                                  className={`${styles.headingWrapper} ${styles.heading_img}`}
                                >
                                  <h4>Call To Action Button</h4>
                                  <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() =>
                                        handleShowStatus("callAction")
                                      }
                                      className={styles.butttonsTab}
                                    >
                                      {showButton.callAction}
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
                                          fill="#00AC4F"
                                        ></path>
                                      </svg>
                                    </div>

                                    {showStatus.callAction && (
                                      <ul className={styles.selectDropdown}>
                                        <>
                                          <li
                                            data-value="option1"
                                            onClick={() =>
                                              handleBtn("callAction", "Show")
                                            }
                                          >
                                            Show
                                          </li>
                                          <li
                                            data-value="option2"
                                            onClick={() =>
                                              handleBtn("callAction", "Hide")
                                            }
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                                {showButton.callAction === "Show" && (
                                  <>
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
                                      <label htmlFor="">Redirect To</label>

                                      <div
                                        className={` ${styles.bundle_product} ${styles.bundleNewApp} `}
                                        onClick={() => setShowCart(!showCart)}
                                      >
                                        <div
                                          className={` ${styles.customSelect} ${styles.customTabsec} `}
                                          id="second"
                                        >
                                          <div className={styles.selectBox}>
                                            <span className={styles.selected}>
                                              {cart}
                                            </span>
                                            <div className={styles.arrow}>
                                              <img
                                                src={DorpDownIcon}
                                                width={20}
                                                height={16}
                                              />
                                            </div>
                                          </div>
                                          {showCart && (
                                            <ul
                                              className={`${styles.selectDropdown} ${styles.newAppdeop} `}
                                            >
                                              <li
                                                onClick={() => setCart("Cart")}
                                              >
                                                Cart
                                              </li>
                                              <li
                                                onClick={() =>
                                                  setCart("Checkout")
                                                }
                                              >
                                                Checkout
                                              </li>
                                              <li
                                                onClick={() =>
                                                  setCart(
                                                    "Don't redirect (only add to cart)",
                                                  )
                                                }
                                              >
                                                Don't redirect (only add to
                                                cart)
                                              </li>
                                            </ul>
                                          )}
                                          <input
                                            type="hidden"
                                            name="cart"
                                            value={cart}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="">Color</label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                          style={{
                                            backgroundColor:
                                              callAction.ctaColor,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            name="ctaColor"
                                            value={callAction.ctaColor}
                                            onChange={handleCallToAction}
                                          />
                                        </span>
                                        <input
                                          type="text"
                                          id=""
                                          name="ctaColor"
                                          value={callAction.ctaColor}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className={styles.divideDiv}>
                                <div className={styles.heading_img}>
                                  <h3>Text Below CTA</h3>{" "}
                                  <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() =>
                                        handleShowStatus("textBelow")
                                      }
                                      className={styles.butttonsTab}
                                    >
                                      {showButton.textBelow}
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
                                          fill="#00AC4F"
                                        ></path>
                                      </svg>
                                    </div>

                                    {showStatus.textBelow && (
                                      <ul className={styles.selectDropdown}>
                                        <>
                                          <li
                                            onClick={() =>
                                              handleBtn("textBelow", "Show")
                                            }
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() =>
                                              handleBtn("textBelow", "Hide")
                                            }
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                </div>

                                {showButton.textBelow === "Show" && (
                                  <>
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
                                          style={{
                                            backgroundColor: textBelow.tbColor,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            id="text_below_color"
                                            name="tbColor"
                                            value={textBelow.tbColor}
                                            onChange={handleTextBelow}
                                          />
                                        </span>
                                        <input
                                          type="text"
                                          id="text_below_color"
                                          name="tbColor"
                                          value={textBelow.tbColor}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className={styles.divideDiv}>
                                <div className={styles.heading_img}>
                                  <h3>Background</h3>{" "}
                                  <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() =>
                                        handleShowStatus("background")
                                      }
                                      className={styles.butttonsTab}
                                    >
                                      {showButton.background}
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
                                          fill="#00AC4F"
                                        ></path>
                                      </svg>
                                    </div>

                                    {showStatus.background && (
                                      <ul className={styles.selectDropdown}>
                                        <>
                                          <li
                                            onClick={() =>
                                              handleBtn("background", "Show")
                                            }
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() =>
                                              handleBtn("background", "Hide")
                                            }
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                </div>

                                {showButton.background === "Show" && (
                                  <>
                                    <div
                                      className={styles.input_labelCustomize}
                                    >
                                      <label htmlFor="background_color">
                                        Color
                                      </label>
                                      <div className={styles.color_styles}>
                                        <span
                                          className={styles.color_pilate}
                                          style={{
                                            backgroundColor:
                                              background.backgroundColor,
                                          }}
                                        >
                                          <input
                                            type="color"
                                            name="backgroundColor"
                                            value={background.backgroundColor}
                                            onChange={handleBackground}
                                          />
                                        </span>
                                        <input
                                          type="text"
                                          id="background_color"
                                          name="backgroundColor"
                                          value={background.backgroundColor}
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
                                      <label htmlFor="shadow">Shadow</label>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>

                            <>
                              <div className={styles.Add_btn}>
                                <button
                                  onClick={() => setShowPage("second")}
                                  className={styles.Backbtn}
                                >
                                  Back
                                </button>
                                <button
                                  disabled={navigation.state == "submitting"}
                                  name="intent"
                                  value="stepThird"
                                  className={styles.NextBtn}
                                >
                                  {navigation.state == "submitting" ? (
                                    <Loader />
                                  ) : (
                                    "Launch Bundle"
                                  )}
                                </button>
                              </div>
                            </>
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
                          <div
                            className={styles.Preview_bundle}
                            style={{
                              backgroundColor: background.backgroundColor,
                              boxShadow: background.backgroundShadow
                                ? "0px 40.5px 108.01px 0px #0000001a"
                                : "none",
                            }}
                          >
                            <div
                              className={styles.limited}
                              style={{
                                fontSize: `${titleSection.titleSectionSize}px`,
                                color: titleSection.titleSectionColor,
                              }}
                            >
                              {titleSection.titleSectionText}
                            </div>
                            <h4
                              style={{
                                fontSize: `${title.titleSize}px`,
                                color: title.titleColor,
                              }}
                            >
                              {title.titleText}
                            </h4>

                            <div className={styles.left_productsample}>
                              <div className={styles.bundlewrapper}>
                                <div
                                  className={` ${styles.leftProduct} ${styles.leftProductWraper}`}
                                >
                                  <div className={styles.inputDiv}>
                                    <input
                                      type="radio"
                                      name=""
                                      id="bundle Product"
                                      checked
                                    />
                                    <label htmlFor="">Buy 2 Products</label>
                                  </div>

                                  <div className={styles.Pricetab}>
                                    <span className={styles.delPriceOuter}>
                                      <span className={styles.delPrice}>
                                        $50
                                      </span>
                                    </span>
                                    <span className={styles.totalPrice}>
                                      $25
                                    </span>
                                    <span className={styles.SaveTab}>
                                      Save 50%
                                    </span>
                                  </div>
                                </div>

                                <div className={styles.sizecolor}>
                                  <ul>
                                    <li>
                                      <div className={styles.sizecolrDiv}>
                                        <label>
                                          <span>Size</span>
                                        </label>
                                        <select name="" id="">
                                          <option value="newest">
                                            25+5 CM
                                          </option>
                                          <option value="old">25+5 CM</option>
                                        </select>
                                      </div>

                                      <div className={styles.sizecolrDiv}>
                                        <label>
                                          <span>Color</span>
                                        </label>
                                        <select name="" id="">
                                          <option value="newest">
                                            Gold 14K
                                          </option>
                                          <option value="old">Gold 14K</option>
                                        </select>
                                      </div>
                                    </li>

                                    <li>
                                      <div className={styles.sizecolrDiv}>
                                        <select name="" id="">
                                          <option value="newest">
                                            25+5 CM
                                          </option>
                                          <option value="old">25+5 CM</option>
                                        </select>
                                      </div>

                                      <div className={styles.sizecolrDiv}>
                                        <select name="" id="">
                                          <option value="newest">
                                            Gold 14K
                                          </option>
                                          <option value="old">Gold 14K</option>
                                        </select>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                                <div className={styles.mostPopular}>
                                  Most Popular ⭐️
                                </div>
                              </div>

                              <div
                                className={`${styles.bundlewrapper} ${styles.bundle_wrap}`}
                              >
                                <div
                                  className={` ${styles.leftProduct} ${styles.leftProductWraper}`}
                                >
                                  <div className={styles.inputDiv}>
                                    <input
                                      type="radio"
                                      name=""
                                      id="bundle Product"
                                      checked
                                    />
                                    <label htmlFor="">Buy 4 Products</label>
                                  </div>

                                  <div className={styles.Pricetab}>
                                    <span className={styles.delPriceOuter}>
                                      <span className={styles.delPrice}>
                                        $75
                                      </span>
                                    </span>
                                    <span className={styles.totalPrice}>
                                      $35
                                    </span>
                                    <span className={styles.SaveTab}>
                                      Save 65%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`${styles.bundlewrapper} ${styles.bundle_wrap}`}
                              >
                                <div
                                  className={` ${styles.leftProduct} ${styles.leftProductWraper}`}
                                >
                                  <div className={styles.inputDiv}>
                                    <input
                                      type="radio"
                                      name=""
                                      id="bundle Product"
                                      checked
                                    />
                                    <label htmlFor="">Buy 6 Products</label>
                                  </div>

                                  <div className={styles.Pricetab}>
                                    <span className={styles.delPriceOuter}>
                                      <span className={styles.delPrice}>
                                        $125
                                      </span>
                                    </span>
                                    <span className={styles.totalPrice}>
                                      $50
                                    </span>
                                    <span className={styles.SaveTab}>
                                      Save 70%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className={styles.productTotal}>
                              <button
                                className={styles.AddBtn}
                                style={{
                                  fontSize: `${callAction.ctaSize}px`,
                                  color: callAction.ctaColor,
                                }}
                              >
                                {callAction.ctaText}
                              </button>
                              <p
                                className={styles.wrrantyTag}
                                style={{
                                  fontSize: `${textBelow.tbSize}px`,
                                  color: textBelow.tbColor,
                                }}
                              >
                                {textBelow.tbText}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {showPage === "Return" && (
                    <>
                      <div
                        className={`${styles.table_content} ${styles.DesignCard}`}
                      >
                        <div className={styles.requestReview}>
                          <h2>You Did It!</h2>
                          <p>
                            Your bundle is up and running. Sit back and let the
                            conversations roll in.
                          </p>
                          <button
                            className={styles.NextBtn}
                            onClick={handleDesign}
                          >
                            Return To Dashboard
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Form>
          </div>
        )}
      </div>

      <Toaster />
      {isProduct && (
        <AddProduct
          onClose={handleClose}
          products={products}
          handleSave={handleSave}
          selectProduct={selectProducts}
          setSelectedPrducts={setSelectedPrducts}
        />
      )}
    </>
  );
}
