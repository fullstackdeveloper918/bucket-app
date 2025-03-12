import { TitleBar } from "@shopify/app-bridge-react";
import React, { useEffect, useState, useRef } from "react";
import db from "../db.server";
import styles from "../styles/main.module.css";
import preview_mockup from "../routes/assets/preview_mockup.svg";
import Productpreview from "../routes/assets/product_sample.png";
import deletedIcon from "../routes/assets/deleted.svg";
import offerIcon from "../../app/routes/assets/offerIcon.svg";
import DesignIcon from "../../app/routes/assets/DesginIcon.svg";
import collectedIcon from "../../app/routes/assets/collected_icon.png";
import arrowIcon from "../../app/routes/assets/backarrow.png";
import drop_downImg from "../../app/routes/assets/drop_downImg.svg";
import editIcon from "../../app/routes/assets/edit_icon.svg";
import Loader from "../components/Loader/Loader";
import downArrow from "../routes/assets/drop_downImg.svg";
import DorpDownIcon from "../routes/assets/dropDown.svg";
import dropdown from "../routes/assets/drop_downImg.svg";
import copy_icon from "../../app/routes/assets/cpyIcon.png";
import axios from "axios";
import { Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import AddProduct from "../components/BuyComponents/AddProduct";
import { Toaster, toast as notify } from "sonner";
import { fetchSalesData, getAllBundle, getAllDiscountId } from "../api/buyxGety.server";
import DeletePopup from "../components/DeletePopup/Deletepopup";

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
      const bundle_name = formData.get("bundle_name");
      const where_to_display = formData.get("where_to_display");
      const amount = formData.get("amount");
      const discount_method = formData.get("discount_method");
      const buysx = JSON.parse(formData.get("buyProducts"));
      const gety = JSON.parse(formData.get("getProducts"));

      const [buyProducts] = buysx;
      const [getProducts] = gety;

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

      let data, discount_id, discount_info;

      if (discount_method === "Percentage") {
        data = JSON.stringify({
          query:
            "mutation CreateBxgyDiscount($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) { discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) { automaticDiscountNode { id automaticDiscount { ... on DiscountAutomaticBxgy { title startsAt endsAt } } } userErrors { field message } } }",
          variables: {
            automaticBxgyDiscount: {
              title: bundle_name,
              startsAt: "2025-01-01T00:00:00Z",
              endsAt: "2025-12-31T23:59:59Z",
              customerBuys: {
                items: {
                  products: {
                    productsToAdd: buyProducts.productId,
                  },
                },
                value: {
                  quantity: "1",
                },
              },
              customerGets: {
                items: {
                  products: {
                    productsToAdd: getProducts.productId,
                  },
                },
                value: {
                  discountOnQuantity: {
                    quantity: "1",
                    effect: {
                      percentage: amount / 100,
                    },
                  },
                },
              },
              usesPerOrderLimit: "1",
            },
          },
        });
        console.log("in the percentage");
      } else if (discount_method === "Free Gift") {
        data = JSON.stringify({
          query:
            "mutation CreateBxgyDiscount($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) { discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) { automaticDiscountNode { id automaticDiscount { ... on DiscountAutomaticBxgy { title startsAt endsAt } } } userErrors { field message } } }",
          variables: {
            automaticBxgyDiscount: {
              title: bundle_name,
              startsAt: "2025-01-01T00:00:00Z",
              endsAt: "2025-12-31T23:59:59Z",
              customerBuys: {
                items: {
                  products: {
                    productsToAdd: buyProducts.productId,
                  },
                },
                value: {
                  quantity: "1",
                },
              },
              customerGets: {
                items: {
                  products: {
                    productsToAdd: getProducts.productId,
                  },
                },
                value: {
                  discountOnQuantity: {
                    quantity: "1",
                    effect: {
                      percentage: 1,
                    },
                  },
                },
              },
              usesPerOrderLimit: "1",
            },
          },
        });
      } else if (discount_method === "Fixed Amount") {
        data = JSON.stringify({
          query:
            "mutation CreateBxgyDiscount($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) { discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) { automaticDiscountNode { id automaticDiscount { ... on DiscountAutomaticBxgy { title startsAt endsAt } } } userErrors { field message } } }",
          variables: {
            automaticBxgyDiscount: {
              title: bundle_name,
              startsAt: "2025-01-01T00:00:00Z",
              endsAt: "2025-12-31T23:59:59Z",
              customerBuys: {
                items: {
                  products: {
                    productsToAdd: buyProducts.productId,
                  },
                },
                value: {
                  quantity: "1",
                },
              },
              customerGets: {
                items: {
                  products: {
                    productsToAdd: getProducts.productId,
                  },
                },
                value: {
                  discountOnQuantity: {
                    quantity: "1",
                    effect: {
                      amount: amount,
                    },
                  },
                },
              },
              usesPerOrderLimit: "1",
            },
          },
        });
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

        discount_id =
          response?.data?.data?.discountAutomaticBxgyCreate
            ?.automaticDiscountNode?.id;
        discount_info = response?.data?.data;

        console.log(bundle_name, 'checkmybundlename')

     
        // const existingBundle = await db.bogoxy.findUnique({
        //   where: { bundle_name: bundle_name},
        // });

        // if (existingBundle) {
        //   return json({
        //     error: "Bundle name is already in use. Please choose a different name.",
        //     status: 500,
        //   });
        // }

        if (bundle_id) {
          const updatedDiscount = await db.bogoxy.update({
            where: { id: parseInt(bundle_id) },
            data: {
              bundle_name,
              buysx,
              gety,
              where_to_display,
              discount_method,
              amount: parseFloat(amount),
              discount_id,
              discount_info,
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
            step: 4,
            activeTab: "Return",
          });
        } else {
          const savedDiscount = await db.bogoxy.create({
            data: {
              bundle_name,
              buysx,
              gety,
              where_to_display,
              discount_method,
              amount: parseFloat(amount),
              discount_id,
              discount_info,
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
            message: "Bundle created successfully",
            data: savedDiscount,
            status: 200,
            step: 4,
            activeTab: "Return",
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
  
      console.log(discount_id, 'discount_id');
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
  
  
      console.log(responseData?.data?.discountAutomaticDelete?.userErrors, 'responsh')
  
      // Handle user errors from Shopify
      if (responseData.data.discountAutomaticDelete.userErrors.length > 0) {
        return json({
          message: "Failed to delete discount on Shopify",
          errors: responseData.data.discountAutomaticDelete.userErrors,
          status: 400,
        });
      }
  
      // Delete from your local database
      const result = await db.bogoxy.deleteMany({
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
    height="34"
    fill="none"
    viewBox="0 0 34 40"
  >
    <path
      fill="#00AC4F"
      fillRule="evenodd"
      d="M26.684 6.897c-5.464-5.465-14.323-5.465-19.787 0-5.465 5.464-5.465 14.323 0 19.787a1.4 1.4 0 0 1-1.98 1.98c-6.556-6.558-6.556-17.19 0-23.746 6.558-6.557 17.19-6.557 23.746 0a16.74 16.74 0 0 1 4.918 11.872 1.4 1.4 0 1 1-2.798 0c0-3.583-1.366-7.161-4.099-9.893m-3.957 3.957a8.395 8.395 0 1 0-11.873 11.873 1.4 1.4 0 1 1-1.979 1.979c-4.371-4.372-4.371-11.46 0-15.83 4.372-4.372 11.46-4.372 15.83 0a11.16 11.16 0 0 1 3.28 7.914 1.4 1.4 0 0 1-2.8 0c0-2.15-.819-4.296-2.458-5.936m-6.779 2.451a1.4 1.4 0 0 1 1.53.58l9.752 14.77a1.4 1.4 0 0 1-1.448 2.142l-3.913-.8 1.949 7.274a1.4 1.4 0 1 1-2.703.724l-1.95-7.274-2.987 2.65a1.4 1.4 0 0 1-2.325-1.131l1.06-17.667a1.4 1.4 0 0 1 1.035-1.268"
      clipRule="evenodd"
    ></path>
  </svg>,
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="35"
    height="35"
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
  <svg
    width="38"
    height="33"
    viewBox="0 0 38 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.8441 29.8571C10.0758 29.8571 9.36059 29.4292 9.07945 28.7142C8.47488 27.1767 8.14286 25.5021 8.14286 23.75C8.14286 20.585 9.22629 17.673 11.0425 15.3648C11.3156 15.0177 11.7159 14.8057 12.1277 14.6462C12.9833 14.315 13.7389 13.7156 14.3207 12.9737C15.7198 11.1898 17.4831 9.70519 19.4986 8.63182C20.8053 7.93591 21.9392 6.90204 22.489 5.52744C22.8738 4.5656 23.0714 3.53919 23.0714 2.50326V1.35714C23.0714 0.607614 23.679 0 24.4286 0C26.6772 0 28.5 1.82284 28.5 4.07143C28.5 6.15533 28.0303 8.12953 27.191 9.89394C26.7105 10.9043 27.3846 12.2143 28.5034 12.2143H34.1597C36.0174 12.2143 37.6803 13.4701 37.8769 15.3174C37.9583 16.0814 38 16.8573 38 17.6429C38 22.7957 36.2052 27.5293 33.2066 31.2527C32.5052 32.1236 31.4209 32.5714 30.3027 32.5714H23.0357C22.1605 32.5714 21.291 32.4303 20.4607 32.1536L14.825 30.275C13.9947 29.9982 13.1252 29.8571 12.25 29.8571H10.8441Z"
      fill="#00AC4F"
    />
    <path
      d="M1.5046 15.7919C0.533457 18.2562 0 20.9408 0 23.75C0 25.9578 0.329484 28.0886 0.941961 30.0959C1.41127 31.6341 2.90279 32.5714 4.51094 32.5714H6.1536C6.95979 32.5714 7.45772 31.6698 7.10099 30.9468C6.03019 28.7767 5.42857 26.3336 5.42857 23.75C5.42857 20.659 6.28969 17.7691 7.78512 15.3072C8.22845 14.5774 7.73397 13.5714 6.88002 13.5714H4.97502C3.46946 13.5714 2.05661 14.3912 1.5046 15.7919Z"
      fill="#00AC4F"
    />
  </svg>,
];

export default function BuyGetPage() {
  const { products, totalBundle, sales, allDiscountId } = useLoaderData();
  const actionResponse = useActionData();
  const navigation = useNavigation();


  console.log(allDiscountId, 'allDiscountId')

  console.log(actionResponse, "actionResponse");
   const formRef = useRef(null);
  const [id, setId] = useState(null);
  const [values, setValues] = useState({
    bundle_name: "Example Bundle 1",
    where_to_display: "Bundle Product Pages",
    discount_method: "Percentage",
    amount: "",
  });
  const [activeSelection, setActiveSelection] = useState("Buy");
  const [buyProducts, setBuyProducts] = useState([]);

  const [showComponent, setShowComponent] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPage, setShowPage] = useState(null);
  const [productId, setProductId] = useState(null);
  const [discountId, setDiscountId] = useState("");
  const [isMonth, setIsMonth] = useState(false);
  const [month, setMonth] = useState("This Month");
  const [getProducts, setGetProducts] = useState([]);
  const [activeApp, setActiveApp] = useState("Active");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState("Cart");
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [isProduct, setIsProduct] = useState(false);
  const [active, setActive] = useState(false);

  const [cards, setCards] = useState([
    { id: 1, title: "Example Bundle 1", reviews: 280 },
  ]);

  const [buysXSections, setBuysXSections] = useState([{ id: 1 }]);
  const [GetYSections, setGetYSections] = useState([{ id: 1 }]);

  const [showPosition, setShowPosition] = useState(false);
  const [details, setDetails] = useState({});
  const [section, setSection] = useState("Buy Buttons");

  const [position, setPosition] = useState("Below Section");

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
      titleSection:false,
      title:false,
      productTitle:false,
      bundleCost:false,
      callAction:false,
      textBelow:false,
      background:false,
        });

  const [titleSection, seTitleSection] = useState({
    titleSectionText: "Limited Time Offer",
    titleSectionSize: 5,
    titleSectionColor: "#000000",
  });

  const [title, seTitle] = useState({
    titleText: "Add Product and save 10%!",
    titleSize: 5,
    titleColor: "#000000",
  });

  const [productTitle, setProductTitle] = useState({
    productSize: 5,
    productColor: "#000000",
  });

  const [bundleCost, setBundleCost] = useState({
    bundleCostSize: 5,
    bundleCostColor: "#000000",
    bundleCostComparedPrice: true,
    bundleCostSave: true,
  });

  const [callAction, setCallAction] = useState({
    ctaText: "Add to Cart",
    ctaSize: 5,
    ctaColor: "#000000",
  });

  const [textBelow, setTextBelow] = useState({
    tbText: "Lifetime warranty & Free Returns",
    tbSize: 5,
    tbColor: "#555555",
  });

  const [background, setBackGround] = useState({
    backgroundColor: "#FFFFFF",
    backgroundShadow: true,
  });

  const handleBtn = (type,item) => {
    console.log(type, item,'item kya hai')
    setShowStatus((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    setShowButton((prev) => ({
      ...prev,
      [type]: item
    }));
  };

  const handleMonth = (item) => {
    setMonth(item);
  };

  const addBuysXSection = () => {
    setBuysXSections((prevSections) => [
      ...prevSections,
      { id: prevSections.length + 1 },
    ]);
  };

  const addGetYSection = () => {
    setGetYSections((prevSections) => [
      ...prevSections,
      { id: prevSections.length + 1 },
    ]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
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

  const handleClose = () => {
    setIsProduct(false);
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

  const handleSave = () => {
    if (buyProducts.length > 1) {
      notify.error("Please select only one product", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else if (getProducts.length > 1) {
      notify.error("Please select only one product", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else {
      setIsProduct(false);
    }
  };

  const handleDesign = () => {
    setActiveTab("Home");
    setShowEdit(false);
    setShowComponent(0);
    setId(null);
  };

  const handleCreate = () => {
    setActiveTab("Products");
    setShowComponent(1);
    setShowPage("first");
  };


  const handleBack = () => {
    console.log('handleback clicked', showPage);
  
    if(activeTab === "Products") {
      if(showPage == "second") {
        setShowPage("first");
      }else if(showPage == "third"){
        setShowPage("second");
      }else if(showPage == "first") {
        setActiveTab('Home')
      }
    }
  }

  const handleProduct = (btn) => {
    if (btn === "Buy") {
      setActiveSelection("Buy");
    } else {
      setActiveSelection("Get");
    }
    setIsProduct(true);
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
    } else if (buyProducts.length == 0) {
      notify.success("Please select Buy Product", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    } else if (getProducts.length == 0) {
      notify.success("Please select Get Product", {
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

  const handleSecond = () => {
    if (values.discount_method === "Percentage") {
      if (values.amount == 100) {
        notify.success("Discount can not be 100%", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else if (values.amount > 100) {
        notify.success("Discount can not be more than 100%", {
          position: "top-center",
          style: {
            background: "red",
            color: "white",
          },
        });
      } else if (values.amount === "") {
        notify.success("Please enter percentage", {
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
    } else if (values.discount_method === "Fixed Amount") {
      if (values.amount === "") {
        notify.success("Please enter Amount", {
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
    } else {
      setShowComponent(3);
      setShowPage("third");
    }
  };

  const handleActive = (e,item) => {
    e.preventDefault();
    setActive(false);
    setActiveApp(item);
      formRef.current.submit(); 
  };

  const handleCopy = (id) => {
    const newCard = { ...cards.find((card) => card.id === id), id: Date.now() };
    setCards([...cards, newCard]);
  };

  const handleEdit = (item) => {
    setDetails(item);
    setShowEdit(true);
    setActiveTab("Products");
    setShowComponent(1);
    setShowPage("first");
  };

  const handleDelete = (item) => {
    setShowPopup(true);
    setProductId(item.id);
    setDiscountId(item.discount_id);
  };

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
        where_to_display: "Bundle Product Pages",
        discount_method: "Percentage",
        amount: "",
      });
      setBuyProducts([]);
      setGetProducts([]);
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
      setId(details.id);
      console.log(details, "mine");
      setValues((prev) => ({
        ...prev,
        bundle_name: details.bundle_name,
        where_to_display: details.where_to_display,
        discount_method: details.discount_method,
        amount: details.amount,
      }));
      setBuyProducts(JSON.parse(JSON.stringify(details.buysx)));
      setGetProducts(JSON.parse(JSON.stringify(details.gety)));
      setPosition(details.position);
      setSection(details.section);
      seTitleSection((prev) => ({
        ...prev,
        titleSectionText: details.title_section.text,
        titleSectionSize: details.title_section.size,
        titleSectionColor: details.title_section.color,
      }));
      seTitle((prev) => ({
        ...prev,
        titleText: details.title.text,
        titleSize: details.title.size,
        titleColor: details.title.color,
      }));
      setProductTitle((prev) => ({
        ...prev,
        productSize: details.product.size,
        productColor: details.product.color,
      }));
      setBundleCost((prev) => ({
        ...prev,
        bundleCostColor: details.bundle_cost.color,
        bundleCostSize: details.bundle_cost.size,
        bundleCostComparedPrice:
          details.bundle_cost.comparedPrice == "on" ? true : false,
        bundleCostSave: details.bundle_cost.save == "on" ? true : false,
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
        backgroundShadow: details.backgroud.shadow == "on" ? true : false,
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

  const handlePreviewDelete = (type, item) => {
    if (type === "BUY") {
      setBuyProducts((prev) =>
        prev.filter((value) => value.productId !== item),
      );
    } else if (type === "GET") {
      setGetProducts((prev) =>
        prev.filter((value) => value.productId !== item),
      );
    }
  };

  const handleShowStatus = (item) => {
    setShowStatus((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const getFilteredBundles = () => {
    if (!totalBundle) return [];

    const currentDate = new Date();
    console.log(currentDate, "check currentDate");
    return totalBundle.filter((card) => {
      const bundleDate = new Date(card.createdAt);
      console.log(bundleDate, "check bundleDate");

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
        <TitleBar title="Buy X and Get Y"></TitleBar>
        <div className={styles.flexWrapper}>
          <div className={styles.headingFlex}>
            <button type="button" className={styles.btn_Back} onClick={handleBack}>
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
            <h2>BOGO & Buy X Get Y</h2>
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
                  onClick={handleCreate}
                  className={`${styles.btn_one} ${styles.active}`}
                >
                  Create A Bundle{" "}
                </button>
              </div>
            </div>
            <div>
              {filteredBundles &&
                filteredBundles.map((card, index) => (
                  <div key={card?.id} className={styles.exampleBundle}>
                    <div className={styles.bundleHeading}>
                      <div
                        className={styles.btnFlexWrapper}
                        style={{ alignItems: "center" }}
                      >
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            value={card?.isActive}
                            checked={card?.isActive == 1 ? true : false}
                          />
                          <span className={styles.slider}></span>
                        </label>
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

                        <button
                          className={styles.copyIcon}
                          onClick={() => handleCopy(card.id)}
                        >
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
                      <div className={styles.upper_box}>
                        <div className={styles.PolarisBox}>
                          <div className={styles.inlineStack}>
                            <div className={styles.card_img}>
                              <img src={collectedIcon} width={33} height={40} />
                            </div>
                            <div className={styles.ContentWraper}>
                              <h6>Reviews Collected</h6>
                              <h3>Reviews</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {activeTab === "Products" && (
          <>
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
                              <label htmlFor="">Name your bundle</label>

                              <input
                                type="text"
                                name="bundle_name"
                                value={values.bundle_name}
                                onChange={handleChange}
                                className={styles.inputDiv}
                              />
                            </div>
                            <div className={styles.addProductdiv}>
                              {buysXSections.map((section, index) => (
                                <React.Fragment key={index}>
                                  <div
                                    key={section.id}
                                    className={styles.input_labelCustomize}
                                  >
                                    <label htmlFor="">
                                      Customer Buys X {index + 1}
                                    </label>
                                    <div
                                      className={styles.input_labelCustomize}
                                      onClick={() => handleProduct("Buy")}
                                    >
                                      {buyProducts.length > 0 ? (
                                        products
                                          .filter((item) =>
                                            buyProducts.some(
                                              (buy) =>
                                                buy.productId ===
                                                item?.node?.id,
                                            ),
                                          )
                                          .map((item, idx) => (
                                            <React.Fragment key={idx}>
                                              <div
                                                className={styles.images_upload}
                                              >
                                                <img
                                                  src={
                                                    item?.node?.images?.edges[0]
                                                      ?.node?.src
                                                  }
                                                  alt={item?.node?.title}
                                                  style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    maxHeight: "100px",
                                                    maxWidth: "100px",
                                                    objectFit: "cover",
                                                    borderRadius: "15px",
                                                  }}
                                                />
                                                <div
                                                  className={styles.image_name}
                                                >
                                                  <h4>{item?.node?.title}</h4>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handlePreviewDelete(
                                                        "BUY",
                                                        buyProducts[index]
                                                          .productId,
                                                      );
                                                    }}
                                                    className={
                                                      styles.deletedBtn
                                                    }
                                                  >
                                                    <img
                                                      src={deletedIcon}
                                                      width={20}
                                                      height={20}
                                                      alt="Delete"
                                                    />
                                                    Delete
                                                  </button>
                                                </div>
                                              </div>
                                            </React.Fragment>
                                          ))
                                      ) : (
                                        <label
                                          style={{
                                            cursor: "pointer",
                                            color: "blue",
                                          }}
                                          className={styles.inputUpload}
                                        >
                                          <span>+</span>Add Product
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>

                            <div className={styles.Addanotherdiv}>
                              <label
                                style={{ cursor: "pointer", color: "blue" }}
                                onClick={addBuysXSection}
                              >
                                <span>+</span>Add Another Product
                              </label>
                            </div>

                            <div className={styles.addProductdiv}>
                              {GetYSections.map((section, index) => (
                                <div
                                  key={section.id}
                                  className={styles.input_labelCustomize}
                                >
                                  <label htmlFor="">
                                    Customer Gets Y {index + 1}
                                  </label>
                                  <div
                                    className={styles.input_labelCustomize}
                                    onClick={() => handleProduct("Get")}
                                  >
                                    {getProducts.length > 0 ? (
                                      products
                                        .filter((item) =>
                                          getProducts.some(
                                            (buy) =>
                                              buy.productId === item?.node?.id,
                                          ),
                                        )
                                        .map((item, idx) => (
                                          <React.Fragment key={idx}>
                                            <div
                                              className={styles.images_upload}
                                            >
                                              <img
                                                src={
                                                  item?.node?.images?.edges[0]
                                                    ?.node?.src
                                                }
                                                alt={item?.node?.title}
                                                style={{
                                                  width: "100px",
                                                  height: "100px",
                                                  maxHeight: "100px",
                                                  maxWidth: "100px",
                                                  objectFit: "cover",
                                                  borderRadius: "15px",
                                                }}
                                              />
                                              <div
                                                className={styles.image_name}
                                              >
                                                <h4>{item?.node?.title}</h4>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePreviewDelete(
                                                      "GET",
                                                      getProducts[index]
                                                        .productId,
                                                    );
                                                  }}
                                                  className={styles.deletedBtn}
                                                >
                                                  <img
                                                    src={deletedIcon}
                                                    width={20}
                                                    height={20}
                                                    alt="Delete"
                                                  />
                                                  Delete
                                                </button>
                                              </div>
                                            </div>
                                          </React.Fragment>
                                        ))
                                    ) : (
                                      <label
                                        style={{
                                          cursor: "pointer",
                                          color: "blue",
                                        }}
                                        className={styles.inputUpload}
                                      >
                                        <span>+</span>Add Product
                                      </label>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className={styles.Addanotherdiv}>
                              <label
                                style={{ cursor: "pointer", color: "blue" }}
                                onClick={addGetYSection}
                              >
                                <span>+</span>Add Another Product
                              </label>
                            </div>

                            <input
                              type="hidden"
                              name="buyProduct"
                              value={buyProducts}
                            />
                            <input
                              type="hidden"
                              name="getProduct"
                              value={getProducts}
                            />

                            <div className={styles.input_labelCustomize}>
                              <label htmlFor="">Where to display bundle</label>
                              <div className={styles.bundle_product}>
                                <input
                                  type="radio"
                                  id="Bundle Product Pages"
                                  name="where_to_display"
                                  value="Bundle Product Pages"
                                  checked={
                                    values.where_to_display ===
                                    "Bundle Product Pages"
                                  }
                                  onChange={handleChange}
                                />
                                <label htmlFor="Bundle Product Pages">
                                  Bundle Product Pages
                                </label>
                              </div>
                              <div className={styles.bundle_product}>
                                <input
                                  type="radio"
                                  name="where_to_display"
                                  id="Specific product page"
                                  value="Specific product page"
                                  checked={
                                    values.where_to_display ===
                                    "Specific product page"
                                  }
                                  onChange={handleChange}
                                />
                                <label htmlFor="Specific product page">
                                  Specific product page
                                </label>
                              </div>
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

                      <>
                        {showPage === "second" && (
                          <>
                            <div className={styles.leftContent}>
                              <h3>
                                Sweeten the Deal,
                                <br></br>
                                <span>Pick a killer discount</span>
                              </h3>

                              <input
                                type="hidden"
                                name="bundle_id"
                                value={id}
                              />

                              <div className={styles.input_labelCustomize}>
                                <label htmlFor="">Discount Method</label>
                                <div
                                  className={` ${styles.bundle_product} ${values.discount_method === "Free Gift" ? styles.activeTab : ""} `}
                                >
                                  <input
                                    type="radio"
                                    name="discount_method"
                                    id="free_gift"
                                    value="Free Gift"
                                    checked={
                                      values.discount_method === "Free Gift"
                                    }
                                    onChange={handleChange}
                                  />
                                  <label htmlFor="free_gift">Free Gift</label>
                                </div>
                                <div
                                  className={` ${styles.bundle_product} ${values.discount_method === "Percentage" ? styles.activeTab : ""} `}
                                >
                                  <input
                                    type="radio"
                                    name="discount_method"
                                    id="percentage"
                                    value="Percentage"
                                    checked={
                                      values.discount_method === "Percentage"
                                    }
                                    onChange={handleChange}
                                  />
                                  <label htmlFor="percentage">Percentage</label>
                                </div>

                                <div
                                  className={` ${styles.bundle_product} ${values.discount_method === "Fixed Amount" ? styles.activeTab : ""} `}
                                >
                                  <input
                                    type="radio"
                                    name="discount_method"
                                    id="amount"
                                    value="Fixed Amount"
                                    checked={
                                      values.discount_method === "Fixed Amount"
                                    }
                                    onChange={handleChange}
                                  />
                                  <label htmlFor="amount">Fixed Amount</label>
                                </div>
                              </div>

                              {values.discount_method !== "Free Gift" && (
                                <div className={styles.input_labelCustomize}>
                                  <label htmlFor="amount">
                                    Choose
                                    {values.discount_method === "Percentage"
                                      ? " Percentage"
                                      : " Amount"}
                                  </label>
                                  <div className={styles.inputTiming}>
                                    <input
                                      type="number"
                                      name="amount"
                                      placeholder={`Enter ${
                                        values.discount_method === "Percentage"
                                          ? "Percentage..."
                                          : "Amount..."
                                      }`}
                                      id="amount"
                                      value={values.amount}
                                      onChange={handleChange}
                                    />
                                    <span className={styles.inputDays}>
                                      {values.discount_method === "Percentage"
                                        ? "%"
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className={styles.Add_btn}>
                                <button
                                  type="button"
                                  className={styles.Backbtn}
                                  onClick={() => setShowPage("first")}
                                >
                                  Back
                                </button>

                                <button
                                  className={styles.NextBtn}
                                  type="button"
                                  onClick={handleSecond}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </>

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
                            name="where_to_display"
                            value={values.where_to_display}
                          />
                          <input
                            type="hidden"
                            name="discount_method"
                            value={values.discount_method}
                          />
                          <input
                            type="hidden"
                            name="amount"
                            value={values.amount}
                          />

                          <input
                            type="hidden"
                            name="buyProducts"
                            value={JSON.stringify(buyProducts)}
                          />
                          <input
                            type="hidden"
                            name="getProducts"
                            value={JSON.stringify(getProducts)}
                          />
                          <div className={styles.table_content}>
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
                                            {position}
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
                                  </>)}
                                </div>

                                <div className={styles.divideDiv}>
                                  <div
                                    className={`${styles.headingWrapper} ${styles.heading_img}`}
                                  >
                                    <h4>Product Title</h4>
                                    <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() => handleShowStatus("productTitle")}
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
                                            onClick={() => handleBtn("productTitle", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() => handleBtn("productTitle", "Hide")}
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
                                  </> )}
                                </div>

                                <div className={styles.divideDiv}>
                                  <div
                                    className={`${styles.headingWrapper} ${styles.heading_img}`}
                                  >
                                    <h4>Bundle Cost</h4>
                                    <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() => handleShowStatus("bundleCost")}
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
                                            onClick={() => handleBtn("bundleCost", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() => handleBtn("bundleCost", "Hide")}
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
                                        <label for="compared">
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
                                      onClick={() => handleShowStatus("callAction")}
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
                                            onClick={() => handleBtn("callAction", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() => handleBtn("callAction", "Hide")}
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                  </div>


                                  {

showButton.callAction === "Show" && (
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
                                            <li
                                              data-value="option1"
                                              onClick={() => setCart("Cart")}
                                            >
                                              Cart
                                            </li>
                                            <li
                                              data-value="option1"
                                              onClick={() =>
                                                setCart("Checkout")
                                              }
                                            >
                                              Checkout
                                            </li>
                                            <li
                                              data-value="option2"
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
                                  </>  )}
                                </div>

                                <div className={styles.divideDiv}>
                                  <div className={styles.heading_img}>
                                    <h3>Text Below CTA</h3>{" "}
                                    <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() => handleShowStatus("textBelow")}
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
                                            onClick={() => handleBtn("textBelow", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() => handleBtn("textBelow", "Hide")}
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                  </div>

                                  {
                                showButton.textBelow === "Show" && (
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
                                  </>)}
                                </div>

                                <div className={styles.divideDiv}>
                                  <div className={styles.heading_img}>
                                    <h3>Background</h3>{" "}
                                    <div type="button" class={styles.btn_one}>
                                    <div
                                      onClick={() => handleShowStatus("background")}
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
                                            onClick={() => handleBtn("background", "Show")}
                                          >
                                            Show
                                          </li>
                                          <li
                                            onClick={() => handleBtn("background", "Hide")}
                                          >
                                            Hide
                                          </li>
                                        </>
                                      </ul>
                                    )}
                                  </div>
                                  </div>
                                  { showButton.background === "Show" && (
                                  <>
                                  <div className={styles.input_labelCustomize}>
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
                                      Display “Save” tag
                                    </label>
                                  </div>
                                  </>)}
                                </div>
                              </>

                              <>
                                <div className={styles.Add_btn}>
                                  <button
                                    type="button"
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

                      {showComponent <= 3 &&
                        (buyProducts.length > 0 ? (
                          products
                            .filter((item) =>
                              buyProducts.some(
                                (buy) => buy.productId === item?.node?.id,
                              ),
                            )
                            .map((item) => (
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
                                      backgroundColor:
                                        background.backgroundColor,
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

                                    <div className={styles.both_product}>
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

                                        <h6>{item?.node?.title}</h6>
                                      </div>
                                      <div className={styles.AddProduct}>
                                        <span>+</span>
                                      </div>

                                      <div
                                        className={styles.left_productsample}
                                      >
                                        <img
                                          src={Productpreview}
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
                                    </div>

                                    <div className={styles.productTotal}>
                                      <span>Total</span>
                                      <div className={styles.Pricetab}>
                                        <span className={styles.delPriceOuter}>
                                          <span
                                            className={styles.delPrice}
                                            style={{
                                              display:
                                                bundleCost.bundleCostComparedPrice
                                                  ? "block"
                                                  : "none",
                                            }}
                                          >
                                            230$
                                          </span>
                                        </span>
                                        <span
                                          className={styles.totalPrice}
                                          style={{
                                            fontSize: `${bundleCost.bundleCostSize}px`,
                                            color: bundleCost.bundleCostColor,
                                          }}
                                        >
                                          130$
                                        </span>
                                        <span
                                          className={styles.SaveTab}
                                          style={{
                                            display: bundleCost.bundleCostSave
                                              ? "block"
                                              : "none",
                                          }}
                                        >
                                          Save 10%
                                        </span>
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
                            ))
                        ) : (
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
                                      <span className={styles.delPrice}>
                                        230$
                                      </span>
                                    </span>
                                    <span className={styles.totalPrice}>
                                      130$
                                    </span>
                                    <span className={styles.SaveTab}>
                                      Save 10%
                                    </span>
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
                        ))}
                    </div>

                    {showPage === "Return" && (
                      <>
                        <div
                          className={`${styles.table_content} ${styles.DesignCard}`}
                        >
                          <div className={styles.requestReview}>
                            <h2>You Did It!</h2>
                            <p>
                              Your bundle is up and running. Sit back and let
                              the conversations roll in.
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
          </>
        )}
      </div>
      <Toaster />
      {isProduct && (
        <AddProduct
          onClose={handleClose}
          products={products}
          handleSave={handleSave}
          selectProduct={activeSelection === "Buy" ? buyProducts : getProducts}
          setSelectedPrducts={
            activeSelection === "Buy" ? setBuyProducts : setGetProducts
          }
        />
      )}
    </>
  );
}
