


import db from "../db.server";
import { json } from "@remix-run/node";


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