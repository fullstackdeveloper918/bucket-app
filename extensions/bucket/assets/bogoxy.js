
const label = document.querySelector('.dropdown__filter-selected');
const domain= window.location.hostname;
console.log("domain",domain)
const options = Array.from(document.querySelectorAll('.dropdown__select-option'));
console.log("VuY c true ")
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

  const shopifyConfig = window.shopifyConfig || {};
  const appUrl = shopifyConfig.AppUrl;
  console.log("Shopify APP URL:", appUrl);

  const fetchDiscountCodeCount = async () => {
    const domain = window.location.hostname; // Ensure domain is set correctly
    const apiUrl = `${appUrl}/app/api/bogoxy/get/bogoxydata?domainName=${domain}`;

    try {
      const response = await fetch(apiUrl, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json(); // Properly await the JSON response
      console.log("API Response:", data);

      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const bundle = data.data[0]; // Assuming first bundle for now

        const buysxProductIds = bundle.buysx.map(item => item.productId);
        const getyProductIds = bundle.gety.map(item => item.productId);

        console.log("BuysX Product IDs:", buysxProductIds);
        console.log("GetY Product IDs:", getyProductIds);
      } else {
        console.warn("No valid data found in API response.");
      }

    } catch (error) {
      console.error("Error fetching discount codes:", error);
    }
  };

  await fetchDiscountCodeCount();

  if (window.Shopify && window.Shopify.cart) {
    const cart = window.Shopify.cart;
    console.log("Cart Object:", cart);

    const cartType = cart.attributes?.cart_type || "No cart type specified";
    console.log("Cart Type:", cartType);
  } else {
    console.log("Cart information not available in window.Shopify.");
  }
});

$(document).ready(function() {
    $('.bucket_add_cart_btn').on('click', function() {
        var product_id = $(this).attr('data-product-id');
        $.ajax({
            type: 'POST',
            url: '/cart/add.js',
            data: {
              quantity: 1,
              id: $(this).find('.ad_to_cart_id').attr("var_id")
            },
              dataType: 'json', 
             success: function (data) { 
              $('#CartCount span:first').text(data.quantity);
              console.log(data.quantity);
             
             } 
             });
    });
});