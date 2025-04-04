import { Text } from "@shopify/polaris";
import db from "../db.server";
import { TitleBar } from "@shopify/app-bridge-react";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import preview_mockup from "../routes/assets/preview_mockup.svg";
import Productpreview from "../routes/assets/product_sample.png";
import offerIcon from "../../app/routes/assets/offerIcon.svg";
import DesignIcon from "../../app/routes/assets/DesginIcon.svg";
import DorpDownIcon from "../routes/assets/dropDown.svg";
import styles from "../styles/main.module.css";
import deletedIcon from "../routes/assets/deleted.svg";
import collectedIcon from "../../app/routes/assets/collected_icon.png";
import drop_downImg from "../../app/routes/assets/drop_downImg.svg";
import {
  Form,
  json,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Toaster, toast as notify } from "sonner";
import {
  fetchSalesData,
  getAllBundle,
  getAllDiscountId,
} from "../api/bundle.server";
import DeletePopup from "../components/DeletePopup/Deletepopup";
import AddProduct from "../components/BundleModal/AddProduct";
import axios from "axios";
import Loader from "../components/Loader/Loader";

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
  const { session,admin } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (request.method === "POST") {
    
    if (intent === "stepThird") {
      const bundle_id = formData.get("bundle_id");
      const name = formData.get("bundle_name");
      const products = formData.get("selectProducts");
      const selectProducts = JSON.parse(products);
      const position = formData.get("position");
      const section = formData.get("section");
      const displayLocation = formData.get("displayBundle");
      const method = formData.get("discount");
      const chooseAmount = formData.get("amount");
     

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
        cart: formData.get("cart"),
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

      const result = [];

      const sectionProductArray = Object.values(selectProducts);
      sectionProductArray.forEach((product) => {
        product.variants.forEach((variantId) => {
          result.push({
            option1: variantId,
            price: "3.05",
            compare_at_price: "5.02",
          });
        });
      });


      try {
        let productData = JSON.stringify({
          product: {
            title: name,
            body_html: "<strong>Good snowboard!</strong>",
            vendor: "Burton",
            product_type: "Snowboard",
            status: "active",
            tags: "dddfdfs",
            variants: result,
          },
        });

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `https://${shop}/admin/api/2024-10/products.json`,
          headers: {
            "X-Shopify-Access-Token": session?.accessToken,
            "Content-Type": "application/json",
          },
          data: productData,
        };

        let productResponse = await axios.request(config);
        
     

        let data;

        if (method === "Percentage") {
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
                title: name,
                startsAt: "2025-01-07T01:28:55-05:00",
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: null,
                  },
                },
                customerGets: {
                  value: {
                    percentage: parseFloat(chooseAmount) / 100,
                  },
                  items: {
                    products: {
                      productsToAdd:
                        productResponse?.data?.product?.admin_graphql_api_id,
                    },
                  },
                },
                combinesWith: {
                  productDiscounts: true,
                  shippingDiscounts: true,
                  orderDiscounts: true,
                },
              },
            },
          });
        } else if (method === "Fixed Amount") {
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
                title: name,
                startsAt: "2025-01-07T01:28:55-05:00",
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: "1",
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount: parseFloat(chooseAmount),
                      appliesOnEachItem: false,
                    },
                  },
                  items: {
                    products: {
                      productsToAdd:
                        productResponse?.data?.product?.admin_graphql_api_id,
                    },
                  },
                },
                combinesWith: {
                  productDiscounts: true,
                  shippingDiscounts: true,
                  orderDiscounts: true,
                },
              },
            },
          });
        }
        let discountconfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `https://${shop}/admin/api/2025-01/graphql.json`,
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session?.accessToken,
          },
          data: data,
        };

        const discountResponse = await axios.request(discountconfig);
        const discount_id =
          discountResponse?.data?.data?.discountAutomaticBasicCreate
            ?.automaticDiscountNode?.id;

        const discount_info =
          discountResponse?.data?.data?.discountAutomaticBasicCreate;
      


        const bundleData = {
          name,
          displayLocation,
          method,
          discount_id: discount_id,
          discount_info: discount_info,
          chooseAmount: parseFloat(chooseAmount),
          products: selectProducts,
          position,
          section,
          product_bundle_id: String(productResponse?.data?.product?.id),
          title_section,
          title,
          product,
          bundle_cost,
          call_to_action_button,
          text_below_cta,
          backgroud,
          domainName: shop,
        };


        if (bundle_id) {
          const updatedDiscount = await db.bundle.update({
            where: { id: parseInt(bundle_id) },
            data: bundleData,
          });

          return json({
            message: "Bundle updated successfully",
            data: updatedDiscount,
            status: 200,
            step: 4,
            activeTab: "Return",
          });
        }

        console.log(bundleData, 'hence bundleData')

        const savedDiscount = await db.bundle.create({
          data: bundleData,
        });

        return json({
          message: "Bundle created successfully",
          data: savedDiscount,
          status: 200,
          step: 4,
          activeTab: "Return",
        });
      } catch (error) {
        console.log("Error encountered:", error);
        return json({
          message: "Failed to process the request",
          error: error.message,
          status: 500,
        });
      }
    } else if (intent === "deactivate") {
      const active = formData.get("active");
      let data = JSON.stringify({
        query:
          "mutation discountAutomaticDeactivate($id: ID!) { discountAutomaticDeactivate(id: $id) { automaticDiscountNode { automaticDiscount { ... on DiscountAutomaticBxgy { status startsAt endsAt } } } userErrors { field message } } }",
        variables: {
          id: bundle_id,
        },
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://${shop}/admin/api/2025-01/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session?.accessToken,
          Cookie:
            "_master_udr=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaEpJaWxrTlRaalptVTJNUzFqTURVd0xUUTVPR1F0WVRGaU9DMHlOelpoTWpOa016azRPVGNHT2daRlJnPT0iLCJleHAiOiIyMDI3LTAyLTEyVDA1OjM3OjU5Ljc0NVoiLCJwdXIiOiJjb29raWUuX21hc3Rlcl91ZHIifX0%3D--6a2ae39f942f1b36d2674a0bdaf23f7b38b88770; _secure_admin_session_id=efdc1b1f18ec43e79a4d28387c8a81cb; _secure_admin_session_id_csrf=efdc1b1f18ec43e79a4d28387c8a81cb",
        },
        data: data,
      };

      try {
        const deactivateResponse = await axios.request(config);
        console.log(
          deactivateResponse?.data?.data?.discountAutomaticDeactivate,
          "deactivateResponse",
        );
        return { error: "Bundle Deactivated Successfully" };
      } catch (err) {
        console.log(err, "check err");
        return { error: "Failed to deactivate bundle" };
      }
    } else if (intent === "handleAllDiscount") {
      const discountId = JSON.parse(formData.get("discountID"));
      const active = formData.get("active");
      const appType = "bundle";

      if (discountId.length == 0) {
        return json({
          error: "No Discount Id present",
          status: 500,
          step: 6,
        });
      }

      const activateDiscount = async (id) => {
        try {
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
          const response = await axios.post(
            `https://${shop}/admin/api/2025-01/graphql.json`,
            query,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": session?.accessToken,
              },
            },
          );
          return response.data;
        } catch (error) {
          console.error("Activate Discount Error:", error);
          return { error: "Failed to activate discount", id };
        }
      };

      const deactivateDiscount = async (id) => {
        try {
          const query = {
            query: `mutation discountAutomaticDeactivate($id: ID!) {
            discountAutomaticDeactivate(id: $id) {
              automaticDiscountNode {
                automaticDiscount { ... on DiscountAutomaticBxgy { status startsAt endsAt } }
              }
              userErrors { field message }
            }
          }`,
            variables: { id },
          };
          const response = await axios.post(
            `https://${shop}/admin/api/2025-01/graphql.json`,
            query,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": session?.accessToken,
              },
            },
          );
          return response.data;
        } catch (error) {
          console.error("Deactivate Discount Error:", error);
          return { error: "Failed to deactivate discount", id };
        }
      };
      try {
        let responses;

        if (active === "Active") {
          responses = await Promise.all(
            discountId.map((id) => activateDiscount(id)),
          );
        } else if (active === "Inactive") {
          responses = await Promise.all(
            discountId.map((id) => deactivateDiscount(id)),
          );
        }

        const existingApp = await prisma.appActiveInactive.findFirst({
          where: { AppType: appType },
        });

        if (existingApp) {
          const updatedApp = await prisma.appActiveInactive.update({
            where: { id: existingApp.id },
            data: { status: active === "Active" ? 1 : 0 },
          });

          return json({
            message: "App status updated successfully",
            data: updatedApp,
            status: 200,
            step: 6,
          });
        } else {
          const newApp = await prisma.appActiveInactive.create({
            data: {
              AppType: appType,
              status: active === "Active" ? 1 : 0,
            },
          });

          return json({
            message: "App status created successfully",
            data: newApp,
            status: 200,
            step: 6,
          });
        }
      } catch (err) {
        console.error("Main Function Error:", err);
        return json({
          message: "Something went wrong",
          step: 6,
          status: 500,
        });
      }
    } else if (intent === "handleCopy") {
      try {
        const card = JSON.parse(formData.get("card"));
        const {
          isActive,
          name,
          displayLocation,
          method,
          chooseAmount,
          products,
          position,
          section,
          title_section,
          title,
          product,
          bundle_cost,
          call_to_action_button,
          text_below_cta,
          backgroud,
        } = card;

        const bundleData = {
          name: name + " copy",
          isActive: isActive,
          displayLocation: displayLocation,
          method: method,
          chooseAmount: parseFloat(chooseAmount),
          products: products,
          position: position,
          section: section,
          title_section: title_section,
          title: title,
          product: product,
          bundle_cost: bundle_cost,
          call_to_action_button: call_to_action_button,
          text_below_cta: text_below_cta,
          backgroud: backgroud,
          domainName: shop,
        };

        const savedDiscount = await db.bundle.create({
          data: bundleData,
        });

        console.log(savedDiscount, "savedDiscount");
        return json({
          message: "Bundle copied successfully",
          data: savedDiscount,
          status: 200,
          step: 7,
        });
      } catch (error) {
        console.log(error, "check error");
        return json({
          message: "Failed to process the request",
          error: error.message,
          status: 500,
          step: 7,
        });
      }
    }
  } else if (request.method === "DELETE") {
    try {
      const productId = formData.get("product_id");
      const discount_id = formData.get("discount_id");
      const product_bundle_id = formData.get("product_bundle_id");

      console.log(product_bundle_id, 'cancel')

      if (discount_id) {
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
      }
    
       // Proceed to delete the product after discount deletion
    // const productDeleteData = JSON.stringify({
    //   query: `mutation {
    //     productDelete(input: {id: "gid://shopify/Product/${product_bundle_id}"}) {
    //       deletedProductId
    //       userErrors {
    //         field
    //         message
    //       }
    //     }
    //   }`,
    // });

    // const productDeleteConfig = {
    //   method: 'post',
    //   maxBodyLength: Infinity,
    //   url: `https://${shop}/admin/api/2025-04/graphql.json`, 
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Shopify-Access-Token': session?.accessToken,
    //   },
    //   data: productDeleteData,
    // };

    // const productDeleteResponse = await axios.request(productDeleteConfig);
    // const productDeleteResponseData = productDeleteResponse.data?.data?.productDelete?.userErrors;

    // // Handle user errors from product deletion
    // if (productDeleteResponseData.data.productDelete.userErrors.length > 0) {
    //   return json({
    //     message: "Failed to delete product from Shopify",
    //     errors: productDeleteResponseData.data.productDelete.userErrors,
    //     status: 400,
    //   });
    // }
  


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
    return undefined;
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

export default function PlansPage() {
  const { products, totalBundle, sales, allDiscountId } = useLoaderData();
  const fetcher = useFetcher();

  const actionResponse = useActionData();

  console.log(actionResponse, "actionResponse");

  const navigation = useNavigation();
  const [discountId, setDiscountId] = useState("");
  const [productId, setProductId] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [position, setPosition] = useState("Below Section");
  const [activeApp, setActiveApp] = useState("Active");
  const [active, setActive] = useState(false);
  const [checkboxId, setCheckBoxId] = useState("");
  const [showPosition, setShowPosition] = useState(false);
  const [showComponent, setShowComponent] = useState(1);
  const [checked, setChecked] = useState(true);
  const [showPage, setShowPage] = useState(null);

  const [sections, setSections] = useState([1]);
  const [sectionProduct, setSectionProduct] = useState({});
  const [currentIndex, setCurrentIndex] = useState(null);

  const [selectProducts, setSelectedPrducts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [cart, setCart] = useState("Cart");
  const [isMonth, setIsMonth] = useState(false);
  const [month, setMonth] = useState("This Month");
  const [section, setSection] = useState("Buy Buttons");
  const [showCart, setShowCart] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isProduct, setIsProduct] = useState(false);
  const [id, setId] = useState(null);
  const [details, setDetails] = useState({});

  const [showButton, setShowButton] = useState({
    titleSection: "Show",
    title: "Show",
    productTitle: "Show",
    bundleCost: "Show",
    callAction: "Show",
    textBelow: "Show",
    background: "Show",
  });

  const [showStatus, setShowStatus] = useState({
    titleSection: false,
    title: false,
    productTitle: false,
    bundleCost: false,
    callAction: false,
    textBelow: false,
    background: false,
  });

  const [values, setValues] = useState({
    bundle_name: "Example Bundle 1",
    displayBundle: "Bundle Product Pages",
    amount: "",
    discount: "Percentage",
  });

  const handleClick = (item) => {
    setValues((prev) => ({
      ...prev,
      discount: item,
    }));
  };

  const handleOnChange = (e, card) => {
    e.preventDefault();
    console.log(card, "card");
    setChecked(!checked);
    setCheckBoxId();
    fetcher.submit(
      { active: !checked, bundle_id: card?.discount_id, intent: "deactivate" },
      { method: "POST" },
    );
  };

  const [cards, setCards] = useState([
    { id: 1, title: "Example Bundle 1", reviews: 280 },
  ]);

  const [titleSection, seTitleSection] = useState({
    titleSectionText: "Limited Time Offer",
    titleSectionSize: "12",
    titleSectionColor: "#000000",
  });

  const [title, seTitle] = useState({
    titleText: "Add Bundle And Save 10%!",
    titleSize: "12",
    titleColor: "#000000",
  });

  const [productTitle, setProductTitle] = useState({
    productSize: "12",
    productColor: "#000000",
  });

  const [bundleCost, setBundleCost] = useState({
    bundleCostSize: "12",
    bundleCostColor: "#000000",
    bundleCostComparedPrice: true,
    bundleCostSave: true,
  });

  const [callAction, setCallAction] = useState({
    ctaText: "👉 Add To Cart",
    ctaSize: "12",
    ctaColor: "#FFFFFF",
  });

  const [textBelow, setTextBelow] = useState({
    tbText: "Lifetime warranty & Free Returns",
    tbSize: "12",
    tbColor: "#555555",
  });

  const [background, setBackGround] = useState({
    backgroundColor: "#FFFFFF",
    backgroundShadow: true,
  });

  const openModal = (section) => {
    setCurrentIndex(section);
    setIsProduct(true);
  };

  const closeModal = () => {
    setCurrentIndex(null);
    setIsProduct(false);
  };

  const handleBtn = (type, item) => {
    setShowStatus((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    setShowButton((prev) => ({
      ...prev,
      [type]: item,
    }));
  };


  const handleEdit = (item) => {
    setDetails(item);
    setShowEdit(true);
    setActiveTab("Products");
    setShowComponent(1);
    setShowPage("first");
  };

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
    const { name, type, checked, value } = e.target;
    setBundleCost((prev) => ({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addProductSection = () => {
    setSections([...sections, sections.length + 1]);
  };

  const handleCopy = (e, card) => {
    e.preventDefault();
    fetcher.submit(
      { card: JSON.stringify(card), intent: "handleCopy" },
      { method: "POST" },
    );
  };

  const handleDesign = () => {
    setActiveTab("Home");
    setShowEdit(false);
    setShowComponent(0);
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
    } else if (Object.keys(sectionProduct).length == 0) {
      notify.error("Please select at least one product", {
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

  const handleMonth = (item) => {
    setMonth(item);
  };

  const handleCreate = () => {
    setActiveTab("Products");
    setShowComponent(1);
    setShowPage("first");
  };

  const handleActive = (e, item) => {
    e.preventDefault();
    setActive(false);
    setActiveApp(item);
    fetcher.submit(
      {
        active: item,
        discountID: JSON.stringify(allDiscountId?.data),
        intent: "handleAllDiscount",
      },
      { method: "POST" },
    );
  };

  const handleShowStatus = (item) => {
    setShowStatus((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleBack = () => {
    if (activeTab === "Products") {
      if (showPage == "second") {
        setShowPage("first");
      } else if (showPage == "third") {
        setShowPage("second");
      } else if (showPage == "first") {
        setActiveTab("Home");
      }
    }
  };

  const handleSecond = () => {
    if (values.discount === "Percentage") {
      if (values.amount == 100) {
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
      } else if (values.amount == "") {
        notify.error("Please enter percentage", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else {
        setShowComponent(3);
        setShowPage("third");
      }
    } else if (values.discount === "Fixed Amount") {
      if (values.amount === "") {
        notify.error("Please enter amount", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else {
        setShowComponent(3);
        setShowPage("third");
      }
    }
  };

  useEffect(() => {
    if (actionResponse) {
      if (actionResponse?.status === 200) {
        if (actionResponse?.step === 6) {
          notify.success(actionResponse?.message, {
            position: "top-center",
            style: {
              background: "green",
              color: "white",
            },
          });
        }
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
  }, [actionResponse]);

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
      setId(null);
      setValues({
        bundle_name: "Example Bundle 1",
        displayBundle: "Bundle Product Pages",
        discount: "Percentage",
        amount: "",
      });
      setChecked(true);
      setSectionProduct({});
      setCurrentIndex(null)
      setPosition("Below Section");
      setSection("Buy Buttons");
      seTitleSection({
        titleSectionText: "Limited Time Offer",
        titleSectionSize: 5,
        titleSectionColor: "#000000",
      });
      seTitle({
        titleText: "Add Product and save 10%!",
        titleSize: 5,
        titleColor: "#000000",
      });
      setProductTitle({
        productSize: 5,
        productColor: "#000000",
      });
      setBundleCost({
        bundleCostSize: 5,
        bundleCostColor: "#000000",
        bundleCostComparedPrice: true,
        bundleCostSave: true,
      });

      setCallAction({
        ctaText: "Add To Cart",
        ctaSize: 5,
        ctaColor: "#000000",
      });
      setCart("Cart");
      setTextBelow({
        tbText: "Lifetime warranty & Free Returns",
        tbSize: 5,
        tbColor: "#555555",
      });
      setBackGround({
        backgroundColor: "#FFFFFF",
        backgroundShadow: true,
      });
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

  useEffect(() => {
    if (showEdit) {
      console.log(details?.products, 'check details')
      setSectionProduct(details?.products);
      setId(details.id);
      setValues((prev) => ({
        ...prev,
        bundle_name: details.name,
        displayBundle: details.displayLocation,
        amount: details.chooseAmount,
        discount: details.method,
      }));
      setChecked(details.isActive === 1 ? true : false);

      setPosition(details.position);
      setSection(details.section);
      seTitleSection((prev) => ({
        ...prev,
        titleSectionText: details?.title_section?.text,
        titleSectionSize: details?.title_section?.size,
        titleSectionColor: details?.title_section?.color,
      }));
      seTitle((prev) => ({
        ...prev,
        titleText: details.title.text,
        titleSize: details.title.size,
        titleColor: details.title.color,
      }));
      setProductTitle((prev) => ({
        ...prev,
        productColor: details.product.color,
        productSize: details.product.size,
      }));
      setBundleCost((prev) => ({
        ...prev,
        bundleCostSize: details.bundle_cost.size,
        bundleCostColor: details.bundle_cost.color,
        bundleCostComparedPrice:
          details.bundle_cost.comparedPrice === "on" ? true : false,
        bundleCostSave: details.bundle_cost.save === "on" ? true : false,
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
        backgroundColor: details.backgroud.color,
        backgroundShadow: details.backgroud.shadow === "on" ? true : false,
      }));
    }
  }, [showEdit]);

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
        notify.error(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      }
    }
  }, [actionResponse]);

  const handleDelete = (item) => {
    setShowPopup(true);
    setProductId(item.id);
    setDiscountId(item.discount_id);
  };

  const handleDeleteProducts = (item) => {
 
    if (sectionProduct.hasOwnProperty(item)) {
 
      const updatedSectionProduct = { ...sectionProduct };
      delete updatedSectionProduct[item];
  
      // Update the state with the new object
      setSectionProduct(updatedSectionProduct);
  
      console.log(`Product at index ${item} has been deleted.`);
    } else {
      console.log(`No product found at index ${item}`);
    }
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
        <TitleBar title="Bundles App"></TitleBar>
        <div className={styles.flexWrapper}>
          <div className={styles.headingFlex}>
            {activeTab !== "Home" && (
              <button
                type="button"
                className={styles.btn_Back}
                onClick={handleBack}
              >
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
            )}

            <h2>Product Bundles</h2>
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
              <fetcher.Form method="POST">
                <ul className={styles.selectDropdown}>
                  <li onClick={(e) => handleActive(e, "Active")}>Active</li>
                  <li onClick={(e) => handleActive(e, "Inactive")}>Inactive</li>
                </ul>
              </fetcher.Form>
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
              <div className={` ${styles.btnFlexWrapper} `}>
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
                        <li
                          data-value="option1"
                          onClick={() => handleMonth("Today")}
                        >
                          Today
                        </li>
                        <li
                          data-value="option2"
                          onClick={() => handleMonth("Yesterday")}
                        >
                          Yesterday
                        </li>
                        <li
                          data-value="option2"
                          onClick={() => handleMonth("Last 3 Days")}
                        >
                          Last 3 Days
                        </li>
                        <li
                          data-value="option2"
                          onClick={() => handleMonth("Last 7 Days")}
                        >
                          Last 7 Days
                        </li>
                        <li
                          data-value="option2"
                          onClick={() => handleMonth("This Month")}
                        >
                          This Month
                        </li>
                        <li
                          data-value="option2"
                          onClick={() => handleMonth("Last Month")}
                        >
                          Last Month
                        </li>
                        <li
                          data-value="option2"
                          onClick={() => handleMonth("Custom")}
                        >
                          Custom
                        </li>
                      </ul>
                    </>
                  )}
                </div>

                <button
                  className={`${styles.btn_one} ${styles.active}`}
                  onClick={handleCreate}
                >
                  Create Bundle
                </button>
              </div>
            </div>

            {filteredBundles
              ? filteredBundles.map((card, index) => (
                  <React.Fragment key={card.id}>
                    {console.log(card,'card has')}
                    <div className={styles.exampleBundle}>
                      <div className={styles.bundleHeading}>
                        <div
                          className={styles.btnFlexWrapper}
                          style={{ alignItems: "center" }}
                        >
                          <Form method="POST">
                            <label className={styles.switch}>
                              <input
                                type="checkbox"
                                name="checkbox"
                                value={card?.isActive}
                                checked={card?.isActive === 1 ? true : false}
                                onChange={(e) => handleOnChange(e, card)}
                              />
                              <span className={styles.slider}></span>
                            </label>
                          </Form>
                          <h2 className={styles.cardHeading}>{card?.name}</h2>
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
                              name="product_bundle_id"
                              value={card?.product_bundle_id}
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
                          <Form method="POST">
                            <button
                              className={styles.copyIcon}
                              title="Duplicate"
                              onClick={(e) => handleCopy(e, card)}
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
                          </Form>
                          <button
                            className={styles.edit_Btn}
                            title="Edit"
                            onClick={() => handleEdit(card)}
                          >
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
                ))
              : "No Bundle"}
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
                    {showPage === "first" && (
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

                          <div className={styles.addProductdiv}>
                            {sections.map((section, index) => (
                              <div
                                className={styles.input_labelCustomize}
                                key={section.id}
                              >
                                <label htmlFor="">
                                  Select Product {index + 1}
                                </label>
                                <div className={styles.input_labelCustomize}>
                                  {!sectionProduct[section] ? (
                                    <label
                                      htmlFor="file-upload"
                                      style={{
                                        cursor: "pointer",
                                        color: "blue",
                                      }}
                                      className={styles.inputUpload}
                                      onClick={() => openModal(section)}
                                    >
                                      <span>+</span>Add Product
                                    </label>
                                  ) : (
                                    <div className={styles.images_upload}>
                                      {
                                        products.filter((item) => item.node.id === sectionProduct[section].productId).map((product) => (
                                          <>
                                          {console.log(product, 'chekor')}
                                          <img
                                          src={product.node.images.edges[0].node.src}
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
                                            className={styles.deletedBtn}
                                            onClick={() => handleDeleteProducts(section)}
                                          >
                                            <img
                                              src={deletedIcon}
                                              width={20}
                                              height={20}
                                              />
                                            Delete
                                          </button>
                                        </div>
                                              </>
                                        ))
                                      }
                                      
                                      
                                     
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className={styles.Addanotherdiv}>
                            <label
                              onClick={addProductSection}
                              htmlFor="addProduct"
                              style={{ cursor: "pointer", color: "blue" }}
                            >
                              <span>+</span>Add Another Product
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
                                name="displayBundle"
                                id="second"
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

                    {showPage === "second" && (
                      <div className={styles.leftContent}>
                        <h3>
                          Sweeten the Deal,
                          <br></br>
                          <span>Pick a killer discount</span>
                        </h3>

                        <div className={styles.input_labelCustomize}>
                          <label htmlFor="">Pick Method</label>
                          <div
                            className={`${styles.Add_btn} ${styles.SweetenBtn}`}
                          >
                            <button
                              type="button"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleClick("Fixed Amount")}
                              className={
                                values.discount === "Fixed Amount"
                                  ? styles.activebtn
                                  : ""
                              }
                            >
                              <span>Fixed Amount</span>
                            </button>

                            <button
                              type="button"
                              style={{ cursor: "pointer" }}
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
                          <label htmlFor="amount">
                            Choose{" "}
                            {values.discount === "Percentage"
                              ? "Percentage"
                              : "Amount"}
                          </label>
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
                    )}

                    {showPage === "third" && (
                      <>
                        <input type="hidden" name="bundle_id" value={id} />
                        <input
                          type="hidden"
                          name="bundle_name"
                          value={values.bundle_name}
                        />
                        <input
                          type="hidden"
                          name="displayBundle"
                          value={values.displayBundle}
                        />
                        <input
                          type="hidden"
                          name="discount"
                          value={values.discount}
                        />
                        <input
                          type="hidden"
                          name="amount"
                          value={values.amount}
                        />

                        <input
                          type="hidden"
                          name="selectProducts"
                          value={JSON.stringify(sectionProduct)}
                        />
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
                                      <span className={styles.selected}>
                                        {position ? position : "Below Section"}
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
                                            setPosition("Below Section")
                                          }
                                        >
                                          Below Section
                                        </li>
                                        <li
                                          data-value="option2"
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
                                  <div className={styles.input_labelCustomize}>
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

                                  <div className={styles.input_labelCustomize}>
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

                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="titleSectionColor">
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
                                          id="titleSectionColor"
                                          name="titleSectionColor"
                                          value={titleSection.titleSectionColor}
                                          onChange={handleTitleSection}
                                        />
                                      </span>

                                      <input
                                        type="text"
                                        id="titleSectionColor"
                                        name="titleSectionColor"
                                        value={titleSection.titleSectionColor}
                                        onChange={handleTitleSection}
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
                                          onClick={() =>
                                            handleBtn("title", "Show")
                                          }
                                        >
                                          Show
                                        </li>
                                        <li
                                          onClick={() =>
                                            handleBtn("title", "Hide")
                                          }
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
                                  <div className={styles.input_labelCustomize}>
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
                                  <div className={styles.input_labelCustomize}>
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
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="titleColor">Color</label>
                                    <div className={styles.color_styles}>
                                      <span
                                        className={styles.color_pilate}
                                        style={{
                                          backgroundColor: title.titleColor,
                                        }}
                                      >
                                        <input
                                          type="color"
                                          id="titleColor"
                                          name="titleColor"
                                          value={title.titleColor}
                                          onChange={handleTitle}
                                        />
                                      </span>

                                      <input
                                        type="text"
                                        id="titleColor"
                                        name="titleColor"
                                        value={title.titleColor}
                                        onChange={handleTitle}
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
                                <h4>Product Title</h4>
                                <div type="button" class={styles.btn_one}>
                                  <div
                                    onClick={() =>
                                      handleShowStatus("productTitle")
                                    }
                                    className={styles.butttonsTab}
                                  >
                                    {showButton.productTitle}
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

                                  {showStatus.productTitle && (
                                    <ul className={styles.selectDropdown}>
                                      <>
                                        <li
                                          onClick={() =>
                                            handleBtn("productTitle", "Show")
                                          }
                                        >
                                          Show
                                        </li>
                                        <li
                                          onClick={() =>
                                            handleBtn("productTitle", "Hide")
                                          }
                                        >
                                          Hide
                                        </li>
                                      </>
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {showButton.productTitle === "Show" && (
                                <>
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="productSize">Size</label>
                                    <input
                                      type="number"
                                      id="productSize"
                                      name="productSize"
                                      value={productTitle.productSize}
                                      onChange={handleProductTitle}
                                    />
                                  </div>
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="productColor">Color</label>
                                    <div className={styles.color_styles}>
                                      <span
                                        className={styles.color_pilate}
                                        style={{
                                          backgroundColor:
                                            productTitle.productColor,
                                        }}
                                      >
                                        <input
                                          type="color"
                                          id="productColor"
                                          name="productColor"
                                          value={productTitle.productColor}
                                          onChange={handleProductTitle}
                                        />
                                      </span>

                                      <input
                                        type="text"
                                        id="productColor"
                                        name="productColor"
                                        value={productTitle.productColor}
                                        onChange={handleProductTitle}
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
                                <h4>Bundle Cost</h4>
                                <div type="button" class={styles.btn_one}>
                                  <div
                                    onClick={() =>
                                      handleShowStatus("bundleCost")
                                    }
                                    className={styles.butttonsTab}
                                  >
                                    {showButton.bundleCost}
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

                                  {showStatus.bundleCost && (
                                    <ul className={styles.selectDropdown}>
                                      <>
                                        <li
                                          onClick={() =>
                                            handleBtn("bundleCost", "Show")
                                          }
                                        >
                                          Show
                                        </li>
                                        <li
                                          onClick={() =>
                                            handleBtn("bundleCost", "Hide")
                                          }
                                        >
                                          Hide
                                        </li>
                                      </>
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {showButton.bundleCost === "Show" && (
                                <>
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="bundleCostSize">Size</label>

                                    <input
                                      type="number"
                                      id="bundleCostSize"
                                      name="bundleCostSize"
                                      value={bundleCost.bundleCostSize}
                                      onChange={handleBundleCost}
                                    />
                                  </div>
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="bundleCostColor">
                                      Color
                                    </label>
                                    <div className={styles.color_styles}>
                                      <span
                                        className={styles.color_pilate}
                                        style={{
                                          backgroundColor:
                                            bundleCost.bundleCostColor,
                                        }}
                                      >
                                        <input
                                          type="color"
                                          id="bundleCostColor"
                                          name="bundleCostColor"
                                          value={bundleCost.bundleCostColor}
                                          onChange={handleBundleCost}
                                        />
                                      </span>

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
                                          onClick={() =>
                                            handleBtn("callAction", "Show")
                                          }
                                        >
                                          Show
                                        </li>
                                        <li
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
                                  <div className={styles.input_labelCustomize}>
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

                                  <div className={styles.input_labelCustomize}>
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
                                  <div className={styles.input_labelCustomize}>
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
                                            <li onClick={() => setCart("Cart")}>
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
                                              Don't redirect (only add to cart)
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
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="title_section_color">
                                      Color
                                    </label>
                                    <div className={styles.color_styles}>
                                      <span
                                        className={styles.color_pilate}
                                        style={{
                                          backgroundColor: callAction.ctaColor,
                                        }}
                                      >
                                        <input
                                          type="color"
                                          id="ctaColor"
                                          name="ctaColor"
                                          value={callAction.ctaColor}
                                          onChange={handleCallToAction}
                                        />
                                      </span>

                                      <input
                                        type="text"
                                        id="ctaColor"
                                        name="ctaColor"
                                        value={callAction.ctaColor}
                                        onChange={handleCallToAction}
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
                                  <div className={styles.input_labelCustomize}>
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

                                  <div className={styles.input_labelCustomize}>
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

                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="tbColor"> Color</label>
                                    <div className={styles.color_styles}>
                                      <span
                                        className={styles.color_pilate}
                                        style={{
                                          backgroundColor: textBelow.tbColor,
                                        }}
                                      >
                                        <input
                                          type="color"
                                          id="tbColor"
                                          name="tbColor"
                                          value={textBelow.tbColor}
                                          onChange={handleTextBelow}
                                        />
                                      </span>

                                      <input
                                        type="text"
                                        id="tbColor"
                                        name="tbColor"
                                        value={textBelow.tbColor}
                                        onChange={handleTextBelow}
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
                                  <div className={styles.input_labelCustomize}>
                                    <label htmlFor="backgroundColor">
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
                                          id="backgroundColor"
                                          name="backgroundColor"
                                          value={background.backgroundColor}
                                          onChange={handleBackground}
                                        />
                                      </span>

                                      <input
                                        type="text"
                                        id="backgroundColor"
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
                                      Display Shadow
                                    </label>
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

                            <div className={styles.both_product}>
                              {Object.keys(sectionProduct).length > 0 ? (
                                products
                                  .filter((item) =>
                                    Object.values(sectionProduct).some(
                                      (selected) =>
                                        selected.productId === item.node.id,
                                    ),
                                  )
                                  .map((item) => (
                                    <>
                                      <div
                                        className={styles.left_productsample}
                                      >
                                        <img
                                          src={
                                            item?.node?.images?.edges[0]?.node
                                              ?.src
                                          }
                                          width={112}
                                          height={112}
                                          className={styles.mockup_tab}
                                        />
                                        <select name="" id="">
                                          <option value="newest">
                                            Gold 14K
                                          </option>
                                          <option value="old">Gold 14K</option>
                                        </select>

                                        <h6>Product Name</h6>
                                      </div>
                                      <div className={styles.AddProduct}>
                                        <span>+</span>
                                      </div>
                                    </>
                                  ))
                              ) : (
                                <>
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
                                </>
                              )}
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
                          <div className={styles.btnLivePreview}>
                            <button>Live Preview</button>
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
          onClose={closeModal}
          products={products}
          currentIndex={currentIndex}
          sectionProduct={sectionProduct}
          setSectionProduct={setSectionProduct}
        />
      )}
    </>
  );
}
