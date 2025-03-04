
const label = document.querySelector('.dropdown__filter-selected');
const options = Array.from(document.querySelectorAll('.dropdown__select-option'));

options.forEach((option) => {
    option.addEventListener('click', () => {
    console.log("first")
        label.textContent = option.textContent;
        // Close the dropdown after selection
        document.querySelector('.dropdown__switch').checked = false;
    });
});

// Change option selected for second dropdown
const label2 = document.querySelector('.dropdown__filter-selected2');
const options2 = Array.from(document.querySelectorAll('.dropdown__select-option2'));

options2.forEach((option) => {
    option.addEventListener('click', () => {
    console.log("first")

        label2.textContent = option.textContent;
        // Close the dropdown after selection
        document.querySelector('.dropdown__switch2').checked = false;
    });
});

// Close dropdown onclick outside (for the first dropdown)
document.addEventListener('click', (e) => {
    const toggle = document.querySelector('.dropdown__switch');
    const element = e.target;

    if (element === toggle) return;

    const isDropdownChild = element.closest('.dropdown__filter');
    if (!isDropdownChild) {
        toggle.checked = false;  // Close the first dropdown
    }
});

// Close dropdown onclick outside (for the second dropdown)
document.addEventListener('click', (e) => {
 
    const toggle2 = document.querySelector('.dropdown__switch2');
    const element = e.target;

    if (element === toggle2) return;

    const isDropdownChild2 = element.closest('.dropdown__filter2');
    if (!isDropdownChild2) {
        toggle2.checked = false;  // Close the second dropdown
    }
});
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Running");

  const fetchDiscountCodeCount = async () => {
    const apiUrl = "https://mocki.io/v1/f33ccdd5-4c32-48fa-b323-5f98f662381c";

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const { data } = await response.json(); 
      if (data && data.length > 0) {
        const discount = data[0]; 
        const intial= discount.buy_x.product_id;
        const second= discount.get_y.product_id;
        const productinitial= document.querySelector(".product_mainc.product_intial");
        productinitial.setAttribute('product',productinitial)
        const product_image1=discount.buy_x.product_imge;
        const product_image2=discount.get_y.product_imge;

        const productimageinitial=document.querySelector(".product_mainc.product_intial img");
    
        productimageinitial.src =product_image1;
        const productimageinitial2=document.querySelector(".product_mainc.product_final img");
        productimageinitial2.src =product_image2;
        const productsecond= document.querySelector(".product_mainc.product_final");
        productsecond.setAttribute('product',second)
        const discountCountElement = document.querySelector(".heading_bundle h2");
        const saveblock = document.querySelector(".save_block");
        if (discountCountElement) {
          discountCountElement.textContent = `Add Bundle And Save ${discount.discount_off }`;
        }
        if (saveblock) {
            saveblock.textContent=`Save ${discount.discount_off}`;
        }
       
      
 
       function parsePrice(price) {
           const currencySymbol = price.match(/[^0-9.]/g)?.join("") || ""; // Extract currency symbol
           const numericValue = parseFloat(price.replace(/[^0-9.]/g, "")); // Remove non-numeric characters
           return { numericValue, currencySymbol }; // Return both numeric value and symbol
       }
       
       // Parse prices and extract their numeric values and symbols
       const parsedInitialPrice = parsePrice(discount.buy_x.product_price);
       const parsedSecondPrice = parsePrice(discount.get_y.product_price);
       
       // Use the currency symbol from the first product as the default
       const currencySymbol = parsedInitialPrice.currencySymbol;
       
       // Extract numeric values
       const productInitialPrice = parsedInitialPrice.numericValue;
       const productSecondPrice = parsedSecondPrice.numericValue;
       
       // Calculate the total price
       const totalPrice = productInitialPrice + productSecondPrice;
       
       // Log total price for debugging
       console.log("Total Price:", totalPrice);
       
       // Update total price in the DOM (with extracted currency symbol)
       const pricediv = document.querySelector(".pro_price.linethoorgh h3");
       pricediv.textContent = `${totalPrice.toFixed(2)}${currencySymbol}`; // Add currency symbol dynamically
       
       // Calculate discount amount
       const discount_off = discount.discount_off;
       const discount_off2 = parseFloat(discount_off.replace("%", "")); // Remove % and parse as number
       const discountAmount = (totalPrice * discount_off2) / 100;
       
       // Calculate discounted price
       const discountedPrice = totalPrice - discountAmount;
       
       // Update discounted price in the DOM (with extracted currency symbol)
       const actualprice = document.querySelector(".pro_price.noneline h3");
       actualprice.textContent = `${discountedPrice.toFixed(2)}${currencySymbol}`; // Add currency symbol dynamically
       
      } else {
        console.warn("No discount data available");
      }
    } catch (error) {
      console.error("Error fetching discount codes:", error);
    }
  };

  fetchDiscountCodeCount();
  if (window.Shopify && window.Shopify.cart) {
    const cart = window.Shopify.cart;
    console.log("Cart Object:", cart);

    // Access cart type (if available)
    const cartType = cart.attributes?.cart_type || "No cart type specified";
    console.log("Cart Type:", cartType);
} else {
    console.log("Cart information not available in window.Shopify.");
}


});
$(document).ready(function () {
    $('.bucket_add_cart_btn').on('click', function () {
        // Fetch discount data from the API
        $.ajax({
            type: 'GET',
            url: 'https://mocki.io/v1/f33ccdd5-4c32-48fa-b323-5f98f662381c',
            dataType: 'json',
            success: function (response) {
                if (response.status === "success" && response.data.length > 0) {
                    // Extract buy_x and get_y data
                    const discountData = response.data[0];
                    const buyX = discountData.buy_x;
                    const getY = discountData.get_y;

                    // Prepare items for adding to the cart
                    const items = [
                        { id: buyX.variant_id, quantity: buyX.quantity_required },
                        { id: getY.variant_id, quantity: getY.quantity_given }
                    ];

                    // Add items to cart
                    $.ajax({
                        type: 'POST',
                        url: '/cart/add.js',
                        data: JSON.stringify({ items: items }),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data) {
                            console.log("Cart updated successfully:", data);
                            $('#CartCount span:first').text(data.item_count); // Update cart count
                        },
                        error: function (error) {
                            console.error("Error adding items to cart:", error);
                        }
                    });
                } else {
                    console.error("Invalid response from API");
                }
            },
            error: function (error) {
                console.error("Error fetching discount data:", error);
            }
        });
    });
});
