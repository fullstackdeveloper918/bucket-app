
// const label = document.querySelector('.dropdown__filter-selected');
// const domain= window.location.hostname;
// console.log("domain",domain)
// const options = Array.from(document.querySelectorAll('.dropdown__select-option'));


// options.forEach((option) => {
//     option.addEventListener('click', () => {
//     console.log("first")
//         label.textContent = option.textContent;
//         // Close the dropdown after selection
//         document.querySelector('.dropdown__switch').checked = false;
//     });
// });

// // Change option selected for second dropdown
// const label2 = document.querySelector('.dropdown__filter-selected2');
// const options2 = Array.from(document.querySelectorAll('.dropdown__select-option2'));

// options2.forEach((option) => {
//     option.addEventListener('click', () => {
//     console.log("first")

//         label2.textContent = option.textContent;
//         // Close the dropdown after selection
//         document.querySelector('.dropdown__switch2').checked = false;
//     });
// });

// // Close dropdown onclick outside (for the first dropdown)
// document.addEventListener('click', (e) => {
//     const toggle = document.querySelector('.dropdown__switch');
//     const element = e.target;

//     if (element === toggle) return;

//     const isDropdownChild = element.closest('.dropdown__filter');
//     if (!isDropdownChild) {
//         toggle.checked = false;  // Close the first dropdown
//     }
// });

// // Close dropdown onclick outside (for the second dropdown)
// document.addEventListener('click', (e) => {
 
//     const toggle2 = document.querySelector('.dropdown__switch2');
//     const element = e.target;

//     if (element === toggle2) return;

//     const isDropdownChild2 = element.closest('.dropdown__filter2');
//     if (!isDropdownChild2) {
//         toggle2.checked = false;  // Close the second dropdown
//     }
// });
const appUrl = "https://voted-checks-coupon-edited.trycloudflare.com";
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Running");

  const shopifyConfig = window.shopifyConfig || {};
  // const appUrl = "https://turning-portion-erik-skirts.trycloudflare.com"
  console.log("Shopify APP URL:", appUrl);

  const fetchDiscountCodeCount = async () => {
    const domain = window.location.hostname;
    const apiUrl = `${appUrl}/app/api/bogoxy/get/bogoxydata?domainName=${domain}`;

    const getImageSrc = (imageArr) => {
      if (!imageArr || imageArr.length === 0) return '';
      const first = imageArr[0];
      return typeof first === 'string' ? first : first?.src || '';
    };

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const result = await response.json();
      console.log("API Response:", result);

      const where_to_display = result.data.where_to_display;
      console.log("Where to display:", where_to_display);
      console.log("Where to display:", result.data?.where_to_display);

      // Loop through the bundles and log specific fields
      result.data.forEach((bundle) => {
        const { id, title_section, title, call_to_action_button, backgroud } = bundle;

        // Log the extracted fields
        console.log(`Bundle ID: ${id}`);
        console.log(`Title Section Text: ${title_section.text}`);
        console.log(`Title Section Size: ${title_section.size}`);
        console.log(`Title Section Color: ${title_section.color}`);
        console.log(`Button Text: ${call_to_action_button.text}`);
        console.log(`Button Color: ${call_to_action_button.color}`);
        console.log(`Background Color: ${backgroud.color}`);
        console.log(`Background Shadow: ${backgroud.shadow}`);
        console.log(`Discount Title: ${title.text}`);
        console.log(`Discount Size: ${title.size}`);
        console.log(`Discount Color: ${title.color}`);
      });
      
    } catch (error) {
      console.error("Error fetching discount data:", error);
      document.querySelector(".buyxgety.page-width").innerHTML = "<p>Error loading discounts.</p>";
    }
  };

  fetchDiscountCodeCount();

  if (window.Shopify && window.Shopify.cart) {
    const cart = window.Shopify.cart;
    console.log("Cart Object:", cart);

    const cartType = cart.attributes?.cart_type || "No cart type specified";
    console.log("Cart Type:", cartType);
  } else {
    console.log("Cart information not available in window.Shopify.");
  }
});


// $(document).ready(function () {
//   $(document).on('click', 'button.product_button', function () {
//     console.log("🟡 Button clicked");

//     if (window.isProcessing) return;
//     window.isProcessing = true;

//     const rawIds = $(this).attr('product_ids');
//     if (!rawIds) {
//       console.error("❌ No product IDs found.");
//       window.isProcessing = false;
//       return;
//     }

//     const productIds = rawIds.split(',')
//       .map(id => id.trim())
//       .filter(id => !isNaN(id));

//     if (productIds.length === 0) {
//       console.error("❌ All product IDs are invalid.");
//       window.isProcessing = false;
//       return;
//     }

//     console.log("🛒 Variant IDs to add:", productIds);

//     // Helper function for sequential adds
//     function addVariantsSequentially(ids) {
//       let results = [];

//       return ids.reduce((promiseChain, variantId) => {
//         return promiseChain.then(() => {
//           return $.ajax({
//             type: 'POST',
//             url: '/cart/add.js',
//             data: {
//               quantity: 1,
//               id: variantId
//             },
//             dataType: 'json'
//           }).then(
//             () => {
//               results.push({ id: variantId, success: true });
//             },
//             (err) => {
//               console.error(`❌ Failed to add variant ${variantId}:`, err);
//               results.push({ id: variantId, success: false });
//             }
//           );
//         });
//       }, Promise.resolve()).then(() => results);
//     }

//     // Step 1: Get access token
//     fetch(`${appUrl}/app/api/getToken`)
//       .then(res => res.json())
//       .then(tokenData => {
//         const accessToken = tokenData.shopDetails?.accessToken;
//         if (!accessToken) throw new Error("❌ Missing access token.");
//         return fetch(`${appUrl}/app/api/get/theme`);
//       })
//       .then(res => res.json())
//       .then(themeResponse => {
//         const isDrawer = themeResponse.cart_type === "drawer";

//         // Step 2: Add variants one-by-one
//         return addVariantsSequentially(productIds).then(results => {
//           const allSuccess = results.every(r => r.success);
//           return { isDrawer, allSuccess };
//         });
//       })
//       .then(({ isDrawer, allSuccess }) => {
//         if (!allSuccess) {
//           console.warn("⚠️ Some variants failed to add. Check console for details.");
//         } else {
//           console.log("✅ All variants successfully added to cart.");
//         }

//         if (isDrawer) {
//           $.ajax({
//             url: '/?section_id=cart-drawer',
//             type: 'GET',
//             dataType: 'html',
//             success: function (html) {
//               const drawerContent = $(html).find('cart-drawer').html();
//               $('cart-drawer').html(drawerContent)
//                 .removeClass('is-empty')
//                 .addClass('animate active');
//               window.isProcessing = false;
//             },
//             error: function () {
//               console.error("❌ Failed to load cart drawer.");
//               window.isProcessing = true;
//             }
//           });
//         } else {
//           window.location.href = '/cart';
//         }
//       })
//       .catch(err => {
//         console.error("❌ Unexpected error during cart operation:", err);
//         window.isProcessing = false;
//       });
//   });
// });
$(document).ready(function () {
  $(document).on('click', 'button.product_button', function () {
    $('button.product_button a').hide();
    $('.cartloaderbxgy').show();
    console.log("🟡 Button clicked");

    if (window.isProcessing) return;
    window.isProcessing = true;

    const rawIds = $(this).attr('product_ids');
    if (!rawIds) {
      console.error("❌ No product IDs found.");
      window.isProcessing = false;
      return;
    }

    const productIds = rawIds.split(',')
      .map(id => id.trim())
      .filter(id => !isNaN(id));

    if (productIds.length === 0) {
      console.error("❌ All product IDs are invalid.");
      window.isProcessing = false;
      return;
    }

    console.log("🛒 Variant IDs to add:", productIds);

    // Helper function for sequential adds
    function addVariantsSequentially(ids) {
      let results = [];

      return ids.reduce((promiseChain, variantId) => {
        return promiseChain.then(() => {
          return $.ajax({
            type: 'POST',
            url: '/cart/add.js',
            data: {
              quantity: 1,
              id: variantId
            },
            dataType: 'json'
          }).then(
            () => {
              $('button.product_button a').show();
    $('.cartloaderbxgy').hide();
              results.push({ id: variantId, success: true });
            },
            (err) => {
              $('.error_message').show()
              $('.error_message p').text("Error adding product to cart");
              console.error(`❌ Failed to add variant ${variantId}:`, err);
              results.push({ id: variantId, success: false });
            }
          );
        });
      }, Promise.resolve()).then(() => results);
    }

    // Step 1: Get access token
    fetch(`${appUrl}/app/api/getToken`)
      .then(res => res.json())
      .then(tokenData => {
        const accessToken = tokenData.shopDetails?.accessToken;
        if (!accessToken) throw new Error("❌ Missing access token.");
        return fetch(`${appUrl}/app/api/get/theme`);
      })
      .then(res => res.json())
      .then(themeResponse => {
        const isDrawer = themeResponse.cart_type === "drawer";

        // Step 2: Add variants one-by-one
        return addVariantsSequentially(productIds).then(results => {
          const allSuccess = results.every(r => r.success);
          return { isDrawer, allSuccess };
        });
      })
      .then(({ isDrawer, allSuccess }) => {
        if (!allSuccess) {
          $('button.product_button a').show();
    $('.cartloaderbxgy').hide();
          console.warn("⚠️ Some variants failed to add. Aborting drawer/redirect.");
          window.isProcessing = false; // release lock
          return;
        }
        

        console.log("✅ All variants successfully added to cart.");

        if (isDrawer) {
          $.ajax({
            url: '/?section_id=cart-drawer',
            type: 'GET',
            dataType: 'html',
            success: function (html) {
              const drawerContent = $(html).find('cart-drawer').html();
              $('cart-drawer').html(drawerContent)
                .removeClass('is-empty')
                .addClass('animate active');
              window.isProcessing = false;
            },
            error: function () {
              console.error("❌ Failed to load cart drawer.");
              window.isProcessing = false;
            }
          });
        } else {
          window.location.href = '/cart';
        }
      })
      .catch(err => {
        console.error("❌ Unexpected error during cart operation:", err);
        window.isProcessing = false;
      });
  });
});
