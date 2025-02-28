


import db from "../db.server";
import { json } from "@remix-run/node";



export async function fetchSalesData(shop) {
  const bundleType = "bundle"
  if (!shop ) {
    return json({ error: "Missing parameters" }, { status: 400 });
}

const sales = await db.sales.groupBy({
    by: ["domainName", "bundleType"],
    where: {
        domainName:shop,
        bundleType:bundleType,
    },
    _sum: {
        total: true, // Sum of total sales
    },
    _avg: {
        total: true, // Average of total sales
    },
});



return json(sales);
}



export const getAllBundle = async( shop) => {
    try {
      const domainName = shop ;
      if (!domainName) {
        return json(
          { message: "Missing 'domainName' query parameter", status: 400 },
          
        );
      }
      const discounts = await db.bundle.findMany({
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