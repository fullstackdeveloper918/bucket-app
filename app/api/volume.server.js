import axios from "axios";
import db from "../db.server";
import { json } from "@remix-run/react";


export const createVolumeDiscount = async (shop, selectedData, session) => {
  let data = JSON.stringify({
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
        title: "Buy 5, Get 20% Off onX hence",
        startsAt: "2025-01-01T00:00:00Z",
        endsAt: "2025-12-31T23:59:59Z",
        minimumRequirement: {
          quantity: { greaterThanOrEqualToQuantity: "10" },
        },
        customerGets: {
          value: { percentage: 0.2 },
          items: {
            products: {
              productsToAdd: selectedData,
            },
          },
        },
      },
    },
  });

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

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response?.data), "britishcolumbia");

      if (response) {
      }
      return JSON.stringify(response?.data);
    })
    .catch((error) => {
      console.log(error, "checkerror");
    });
};

export const getAllBundle = async(shop) => {
  try {
    const domainName = shop ;
    if (!domainName) {
      return json(
        { message: "Missing 'domainName' query parameter", status: 400 },
        
      );
    }
    const discounts = await db.volumeDiscount.findMany({
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


export const deleteBundle = async (request) => {
  try {
    const url = new URL(request.url);
    const domainName = url.searchParams.get("domainName"); 
    const productId = url.searchParams.get("id"); 
  
    if (!domainName || !productId) {
      return json(
        { message: "Missing 'domainName' or 'product_id' query parameter" },
        { status: 400 }
      );
    }

    
    const result = await db.volumeDiscount.deleteMany({
      where: {
        AND: [
          { id: parseInt(productId) }, 
          { domainName: domainName }, 
        ],
      },
    });

    if (result.count === 0) {
      return json(
        { message: `No discounts found for domain: ${domainName} and product_id: ${productId}` },
        { status: 404 }
      );
    }

    return json({ message: "Discount(s) successfully deleted" }, { status: 200 });
  } catch (error) {
    return json(
      { message: "Failed to delete discount(s)", error: error.message },
      { status: 500 }
    );
  }
}