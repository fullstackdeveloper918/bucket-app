import db from "../db.server";
import { json } from "@remix-run/node";
import axios from "axios";



export const createDiscount = async (shop, selectedData,session) => {
  console.log(shop, 'shopmall')
  let data = JSON.stringify({
    query:
      "mutation CreateBxgyDiscount($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) { discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) { automaticDiscountNode { id automaticDiscount { ... on DiscountAutomaticBxgy { title startsAt endsAt } } } userErrors { field message } } }",
    variables: {
      automaticBxgyDiscount: {
        title: "Buy first product, get second product free",
        startsAt: "2025-01-01T00:00:00Z",
        endsAt: "2025-12-31T23:59:59Z",
        customerBuys: {
          items: {
            products: {
              productsToAdd: selectedData,
            },
          },
          value: {
            quantity: "1",
          },
        },
        customerGets: {
          items: {
            products: {
              productsToAdd: ["gid://shopify/Product/10025742303543"],
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

  console.log(shop,'shophaikonsi')

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://${shop}/admin/api/2025-01/graphql.json`,
    // url: shop,
    headers: {
      "Content-Type": "application/json",
      // "X-Shopify-Access-Token": "shpua_273a396e75845272934c89cb89e8b1a4",
       "X-Shopify-Access-Token": session?.accessToken,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response?.data), 'requestcheck');
    })
    .catch((error) => {
      console.log(error, 'errorhai');
      
    });

}

export const bundleFirstStep = async (domainName, request) => {

  let data = JSON.stringify({
    query:
      "mutation CreateBxgyDiscount($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) { discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) { automaticDiscountNode { id automaticDiscount { ... on DiscountAutomaticBxgy { title startsAt endsAt } } } userErrors { field message } } }",
    variables: {
      automaticBxgyDiscount: {
        title: "Buy first product, get second product free  thetgdggtg",
        startsAt: "2025-01-01T00:00:00Z",
        endsAt: "2025-12-31T23:59:59Z",
        customerBuys: {
          items: {
            products: {
              productsToAdd: request,
            },
          },
          value: {
            quantity: "1",
          },
        },
        customerGets: {
          items: {
            products: {
              productsToAdd: ["gid://shopify/Product/10025742303543"],
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

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    // url: "https://rohit-cybersify.myshopify.com/admin/api/2025-01/graphql.json",
    url: domainName,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": "shpua_273a396e75845272934c89cb89e8b1a4",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response?.data), 'requestcheck');
    })
    .catch((error) => {
      console.log(error);
    });

  // Second Step starts from here.

  try {
    let {
      bundle_name,
      // buysx,
      // gety,
      where_to_display,
      discount_method,
      amount,
    } = request;

    amount = parseFloat(amount);
    const addBogo = await db.bogoxy.create({
      data: {
        bundle_name,
        // buysx,
        // gety,
        where_to_display,
        discount_method,
        amount,
        domainName,
      },
    });
    return json({ success: true, addBogoId: addBogo.id });
  } catch (error) {
    return { message: "Failed to save bundle information", status: 500 };
  }
};

export const getAllBundle = async( shop) => {
  try {
    const domainName = shop ;
    if (!domainName) {
      return json(
        { message: "Missing 'domainName' query parameter", status: 400 },
        
      );
    }
    const discounts = await db.bogoxy.findMany({
      where: {
        domainName, 
      },
    });

    if (discounts.length === 0) {
      return json(
        { message: `No discounts found for domain: ${domainName}` , status: 404 },
       
      );
    }

    return ({status: 200,  data: discounts});
  } catch (error) {
    console.log(error,'checko')
    return json(
      { message: "Failed to fetch discounts", error: error.message, status: 500 },
   
    );
  }
}



export let launchBundle = async (domainName, request) => {
  const title_section = {
    text: request.get("text"),
    size: request.get("size"),
    color: request.get("color"),
  };
  const title = {
    text: request.get("text"),
    size: request.get("size"),
    color: request.get("color"),
  };
  const product = {
    size: request.get("size"),
    color: request.get("color"),
  };
  const bundle_cost = {
    size: request.get("size"),
    color: request.get("color"),
    comparedPrice: request.get("comparedPrice"),
    save: request.get("save"),
  };
  const call_to_action_button = {
    text: request.get("text"),
    size: request.get("size"),
    color: request.get("color"),
  };

  const text_below_cta = {
    text: request.get("text"),
    size: request.get("size"),
    color: request.get("color"),
  };

  const backgroud = {
    color: request.get("color"),
    shadow: request.get("shadow"),
  };

  // return json({
  //   offerSection: true,
  // });

  const discount_id = 1;
  try {
    const addBogoOffer = await db.bogoOffer.create({
      data: {
        bogo_id,
        discount_id,
        domainName,
        title_section,
        title,
        product,
        bundle_cost,
        call_to_action_button,
        text_below_cta,
        backgroud,
      },
    });

    return json({ success: true, addBogoOffer: addBogoOffer.id });
  } catch (error) {
    return json(
      { message: "Failed to save addBogoOffer information" },
      { status: 500 },
    );
  }
};
