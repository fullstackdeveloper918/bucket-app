const shopifyConfig1 = window.shopifyConfig || {};

// jQuery code for fetching discount data
$(document).ready(async function() {
    $('.sectionloader').show();
    const appUrl12 = "https://voted-checks-coupon-edited.trycloudflare.com"
    console.log(appUrl12,"Running");
const productid= $('.bundle_main').attr('date_area');
console.log("product id bundle",productid);
    const fetchDiscountCodeCount = async () => {

        const apiUrl = `${appUrl12}/app/api/get/bundle`;

        try {
            const response = await $.ajax({
                url: apiUrl,
                method: 'GET',
                dataType: 'json',
            });
        
            if (response && response.shopDetails) {
                $('.bundle_main').hide();
            
                response.shopDetails.forEach(bundle => {
                    if (bundle.products) {
                        const sectionarea = bundle.section; 
                       
                        const sectionposition = bundle.position;
                        const bundleproduct=bundle.product_bundle_id;
                        const method = bundle.method; 
                        const chooseAmount = bundle.chooseAmount;
                        const priceshow = `${chooseAmount}${method === "Percentage" ? "%" : ""}`;
                        const headingText = `Add Product and save ${chooseAmount}${method === "Percentage" ? "%" : ""}!`;
                        const titleSection = bundle.title_section;
                        const titleText = bundle.title_section.text;
                        const titleColor = bundle.title_section.color;
                        const titleSize = bundle.title_section.size;     
                        const text_below_cta = bundle.text_below_cta;
                        const text_below_cta_text = bundle.text_below_cta.text;
                        const text_below_cta_color = bundle.text_below_cta.color;
                        const text_below_cta_size = bundle.text_below_cta.size;
                        const addtocarttext= bundle.call_to_action_button.text;
                        const addtocartsize= bundle.call_to_action_button.size;
                        const addtocartcolor= bundle.call_to_action_button.color;
                        const bundle_cost = bundle.bundle_cost;
                        const bundle_cost_size = bundle.bundle_cost.size;
                        const bundle_cost_color = bundle.bundle_cost.color;
                        const bundle_cost_comparedPrice = bundle.bundle_cost.comparedPrice;
                        const bundle_cost_save = bundle.bundle_cost.save;
                         // Initialize variables for total calculation
                        let totalOriginalPrice = 0;
                        let totalDiscountedPrice = 0;

                        // Arrays to store product images and names
                        let productImages = [];
                        let productNames = [];
                        let variantDetails = [];
                
                    
                        let accessToken = ''; // Global variable
                        let formattedShopDomain = window.location.origin.replace(/^https?:\/\//, "");
                        let fetchPromises = [];

fetch(`${appUrl12}/app/api/getToken`)
    .then(response => response.json())
    .then(tokenData => {
        accessToken = tokenData.shopDetails.accessToken;

        Object.keys(bundle.products).forEach(key => {
            const product = bundle.products[key];
            const productId = product.productId;
            const extractedProductId = productId.split('/').pop();
            const productName = `Product ${productId}`;
            // price
            const productPrice = product.price;
            const productimages= product.images;
            let discountedPrice = productPrice;
          
            totalOriginalPrice += productPrice;
            totalDiscountedPrice += discountedPrice;
            // wnd price

            const fetchPromise = fetch(`https://${formattedShopDomain}/admin/api/2025-04/products/${extractedProductId}.json`, {
                method: 'GET',
                headers: { 'X-Shopify-Access-Token': accessToken }
            })
            .then(response => response.json())
            .then(data => {

                const productData = data.product;
                const productImage = productData.images[0].src;
                const variantIds = productData.variants.map(variant => variant.id.toString());

                product.variants.forEach(variant => {
                    const extractedVariantId = variant.split('/').pop();

                    if (variantIds.includes(extractedVariantId)) {
                        const matchedVariant = productData.variants.find(v => v.id === parseInt(extractedVariantId));
                        const matchedImage = productData.images.find(image => image.id === matchedVariant.image_id);
                        if (matchedImage) {
                            productImages.push(matchedImage.src);
                            productNames.push(productName);
                        } else {
                            // Use fallback product image if no variant image matched
                            productImages.push(productImage);
                        }
                        
                    }
                });
            })
            .catch(error => console.error("Fetch error:", error));
            // Then, calculate discounted total
            if (method === "Percentage") {
                totalDiscountedPrice = totalOriginalPrice - (totalOriginalPrice * (chooseAmount / 100));
            } else {
                totalDiscountedPrice = totalOriginalPrice - chooseAmount;
            }
            
            console.log("Total Discounted Price:", totalDiscountedPrice);
            
            // Final discount summary
            const totalDiscountAmount = totalOriginalPrice - totalDiscountedPrice;
            fetchPromises.push(fetchPromise);
        });
        console.log("sectionarea ",sectionarea)
        // After all product data is fetched
        Promise.all(fetchPromises).then(() => {
            $('.sectionloader').hide();
             if(sectionarea === "Product Description"){
                console.log(sectionarea)
             }
             let bundleHTML = "";

             if (sectionarea === "Product Description") {
                 bundleHTML = `
                   <div class="bundle_csrt page-width ${sectionarea} for_desktop_block">
                         <div class="child_bundle_csrt">
                             <div class="subheading_bundle" style="color:${titleColor}; font-size:${titleSize}">
                                 <p>${titleText}</p>
                             </div>
                             <div class="heading_bundle_csrt"><h2>${headingText}</h2></div>
                              <div class="bundle_child_csrt">
                             ${productImages.map((image, index) => `
                                 <div class="product_block_csrt">
                                     <div class="product_variants">
                                         <img class="image_csrt" src="${image}" alt="${productNames[index]}">
                                     </div>
                                 </div>
                             `).join('')}
                         </div>
                             <div class="price_block">
                                 ${bundle_cost_comparedPrice === "on" ? `
                                     <div class="total_csrt"><span>Total</span></div>
                                     <div class="bundle_price">
                                         <div class="pro_price linethoorgh"><h3>${totalOriginalPrice}$</h3></div>
                                         <div class="pro_price noneline"><h3>${totalDiscountedPrice}$</h3></div>
                                         ${bundle_cost_save === "on" ? `
                                     <div class="save_block" style="background:#000; color:#fff;">Save ${priceshow}</div>` : ''}
                                     </div>` : ''}
                                 
                             </div>
                             <div class="bucket_add_cart_btn" data-pro-nsrt="${bundleproduct}" style="color:${addtocartcolor}; font-size:${addtocartsize}">
                                 <a class="add_cart">${addtocarttext}</a>
                                 <img class="cartloader" style="display:none" src="https://cdn.shopify.com/s/files/1/0619/3784/4303/files/Animation_-_1744185329762.gif?v=1744185431"/>
                             </div>
                             <p style="color:${text_below_cta_color}; font-size:${text_below_cta_size}">${text_below_cta_text}</p>
                         </div>
                        
                     </div>
                 `;
             } 
             else if (sectionarea === "Buy Buttons") {
                bundleHTML = `
               <div class="bundle_csrt page-width ${sectionarea} for_desktop_block">
                         <div class="child_bundle_csrt">
                             <div class="subheading_bundle" style="color:${titleColor}; font-size:${titleSize}">
                                 <p>${titleText}</p>
                             </div>
                             <div class="heading_bundle_csrt"><h2>${headingText}</h2></div>
                              <div class="bundle_child_csrt">
                             ${productImages.map((image, index) => `
                                 <div class="product_block_csrt">
                                     <div class="product_variants">
                                         <img class="image_csrt" src="${image}" alt="${productNames[index]}">
                                     </div>
                                 </div>
                             `).join('')}
                         </div>
                             <div class="price_block">
                                 ${bundle_cost_comparedPrice === "on" ? `
                                     <div class="total_csrt"><span>Total</span></div>
                                     <div class="bundle_price">
                                         <div class="pro_price linethoorgh"><h3>${totalOriginalPrice}$</h3></div>
                                         <div class="pro_price noneline"><h3>${totalDiscountedPrice}$</h3></div>
                                         ${bundle_cost_save === "on" ? `
                                     <div class="save_block" style="background:#000; color:#fff;">Save ${priceshow}</div>` : ''}
                                     </div>` : ''}
                                 
                             </div>
                             <div class="bucket_add_cart_btn" data-pro-nsrt="${bundleproduct}" style="color:${addtocartcolor}; font-size:${addtocartsize}">
                                 <a class="add_cart">${addtocarttext}</a>
                                 <img class="cartloader" style="display:none" src="https://cdn.shopify.com/s/files/1/0619/3784/4303/files/Animation_-_1744185329762.gif?v=1744185431"/>
                             </div>
                             <p style="color:${text_below_cta_color}; font-size:${text_below_cta_size}">${text_below_cta_text}</p>
                         </div>
                        
                     </div>
            `;
             }
             else {
                 bundleHTML = `
                     <div class="bundle_csrt page-width ${sectionarea} for_desktop">
                         <div class="child_bundle_csrt">
                             <div class="subheading_bundle" style="color:${titleColor}; font-size:${titleSize}">
                                 <p>${titleText}</p>
                             </div>
                             <div class="heading_bundle_csrt"><h2>${headingText}</h2></div>
                             <div class="price_block">
                                 ${bundle_cost_comparedPrice === "on" ? `
                                     <div class="total_csrt"><span>Total</span></div>
                                     <div class="bundle_price">
                                         <div class="pro_price linethoorgh"><h3>${totalOriginalPrice}$</h3></div>
                                         <div class="pro_price noneline"><h3>${totalDiscountedPrice}$</h3></div>
                                         ${bundle_cost_save === "on" ? `
                                     <div class="save_block" style="background:#000; color:#fff;">Save ${priceshow}</div>` : ''}
                                     </div>` : ''}
                                 
                             </div>
                             <div class="bucket_add_cart_btn" data-pro-nsrt="${bundleproduct}" style="color:${addtocartcolor}; font-size:${addtocartsize}">
                                 <a class="add_cart">${addtocarttext}</a>
                                 <img class="cartloader" style="display:none" src="https://cdn.shopify.com/s/files/1/0619/3784/4303/files/Animation_-_1744185329762.gif?v=1744185431"/>
                             </div>
                             <p style="color:${text_below_cta_color}; font-size:${text_below_cta_size}">${text_below_cta_text}</p>
                         </div>
                         <div class="bundle_child_csrt">
                             ${productImages.map((image, index) => `
                                 <div class="product_block_csrt">
                                     <div class="product_variants">
                                         <img class="image_csrt" src="${image}" alt="${productNames[index]}">
                                     </div>
                                 </div>
                             `).join('')}
                         </div>
                     </div>
                        <div class="bundle_csrt page-width ${sectionarea} for_mobile">
                         <div class="child_bundle_csrt">
                             <div class="subheading_bundle" style="color:${titleColor}; font-size:${titleSize}">
                                 <p>${titleText}</p>
                             </div>
                             <div class="heading_bundle_csrt"><h2>${headingText}</h2></div>
                              <div class="bundle_child_csrt">
                             ${productImages.map((image, index) => `
                                 <div class="product_block_csrt">
                                     <div class="product_variants">
                                         <img class="image_csrt" src="${image}" alt="${productNames[index]}">
                                     </div>
                                 </div>
                             `).join('')}
                         </div>
                             <div class="price_block">
                                 ${bundle_cost_comparedPrice === "on" ? `
                                     <div class="total_csrt"><span>Total</span></div>
                                     <div class="bundle_price">
                                         <div class="pro_price linethoorgh"><h3>${totalOriginalPrice}$</h3></div>
                                         <div class="pro_price noneline"><h3>${totalDiscountedPrice}$</h3></div>
                                         ${bundle_cost_save === "on" ? `
                                     <div class="save_block" style="background:#000; color:#fff;">Save ${priceshow}</div>` : ''}
                                     </div>` : ''}
                                 
                             </div>
                             <div class="bucket_add_cart_btn" data-pro-nsrt="${bundleproduct}" style="color:${addtocartcolor}; font-size:${addtocartsize}">
                                 <a class="add_cart">${addtocarttext}</a>
                                 <img class="cartloader" style="display:none" src="https://cdn.shopify.com/s/files/1/0619/3784/4303/files/Animation_-_1744185329762.gif?v=1744185431"/>
                             </div>
                             <p style="color:${text_below_cta_color}; font-size:${text_below_cta_size}">${text_below_cta_text}</p>
                         </div>
                        
                     </div>
                 `;
             }
    
        
            console.log("Section area refff:", sectionarea);
             if(sectionarea==="Buy Buttons"){
                   if(sectionposition === "Below Section"){
                    $(`div .product-form`).each(function () {
                        $(this).after(bundleHTML);
                    });
                   }
                   else{
                    $(`div .product-form`).each(function () {
                        $(this).before(bundleHTML);
                    });
                   }
            
             }
             else if(sectionarea==="Product Description"){
                if(sectionposition === "Below Section"){
                    $(`div .product__description`).each(function () {
                        $(this).before(bundleHTML);
                    });
                }
                
                else{
                    $(`div .product__description`).each(function () {
                        $(this).after(bundleHTML);
                    });
                }
               
             }
             else if(sectionarea ==="End Of Product Page"){
                $(`footer.footer`).each(function () {
                    $(this).before(bundleHTML);
                });
             }
          
        });

    })
    .catch(error => {
        console.error("Error fetching access token:", error);
    });
    let isProcessing = false;

    $(document).off('click', '.bucket_add_cart_btn').on('click', '.bucket_add_cart_btn', function () {
        $('a.add_cart').hide();
        $('img.cartloader').show();

        $('.bucket_add_cart_btn').toggleClass("active_btn")

        if (isProcessing) return; // prevent rapid repeat clicks
        isProcessing = true;
    
        const productcart = $(this).attr('data-pro-nsrt');
        console.log("Clicked once. Product cart:", productcart);
    
        fetch(`https://${formattedShopDomain}/admin/api/2025-04/products/${productcart}.json`, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            const variants = data.product.variants;
            const variantIds = variants.map(variant => variant.id);
    
            const themestores = `${appUrl12}/app/api/get/theme`;
    
            $.ajax({
                url: themestores,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    console.log("Theme info:", response);
    
                    if (response.cart_type === "drawer") {
                        const addAllVariants = async () => {
                            for (let id of variantIds) {
                                await $.ajax({
                                    type: 'POST',
                                    url: '/cart/add.js',
                                    data: {
                                        quantity: 1,
                                        id: id
                                    },
                                    dataType: 'json'
                                }).catch(error => {
                                    console.error(`❌ Error adding variant ${id}:`, error);
                                });
                            }
                            $('a.add_cart').show();
                            $('img.cartloader').hide();
                            $.ajax({
                                url: '/?section_id=cart-drawer',
                                type: 'GET',
                                dataType: 'html',
                                success: function (data) {
                                    const drawerContent = $(data).find('cart-drawer').html();
                                    $('cart-drawer').html(drawerContent);
                                    $('cart-drawer').removeClass('is-empty').addClass('animate active');
    
                                    // ✅ allow future clicks again
                                    isProcessing = false;
                                },
                                error: function () {
                                    isProcessing = false; // in case of error too
                                }
                            });
                        };
    
                        addAllVariants();
                    } else {
                        const addAllVariants = async () => {
                            for (let id of variantIds) {
                                await $.ajax({
                                    type: 'POST',
                                    url: '/cart/add.js',
                                    data: {
                                        quantity: 1,
                                        id: id
                                    },
                                    dataType: 'json'
                                }).catch(error => {
                                    console.error(`❌ Error adding variant ${id}:`, error);
                                });
                            }
    
                            $.ajax({
                                url: '/?section_id=cart-drawer',
                                type: 'GET',
                                dataType: 'html',
                                success: function (data) {
                                    window.location.href = '/cart';
                                    isProcessing = false;
                                },
                                error: function () {
                                    isProcessing = false; // in case of error too
                                }
                            });
                        };
    
                        addAllVariants();
                    }
                },
                error: function () {
                    isProcessing = false; // reset on theme fetch error
                }
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            isProcessing = false; // reset on product fetch error
        });
    });
    
                    }
                });
                
                
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        
    };

    await fetchDiscountCodeCount();
});
