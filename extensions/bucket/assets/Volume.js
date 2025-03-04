$(document).ready(function () {
    const shopifyConfig = window.shopifyConfig || {}; 
    const appUrl = shopifyConfig.AppUrl

    const productId = $("#bucketproduct-id").val() || null;
   
    const defaultVariantID = $("input#bucketV-id").val();

    const ProductPrice = $('input#bucketV-price').val();
   
let currencyCode = $("#bucketV-currency").val() || "INR"; // Default to INR if not found

// ✅ Currency Symbol Mapping
const currencySymbols = {
    "USD": "$",   // US Dollar
    "EUR": "€",   // Euro
    "GBP": "£",   // British Pound
    "INR": "₹",   // Indian Rupee
    "JPY": "¥",   // Japanese Yen
    "CNY": "¥",   // Chinese Yuan
    "AUD": "A$",  // Australian Dollar
    "CAD": "C$",  // Canadian Dollar
    "SGD": "S$",  // Singapore Dollar
    "AED": "د.إ", // UAE Dirham
};

// ✅ Get the correct currency symbol
let currencySymbol = currencySymbols[currencyCode] || currencyCode; // Use code if symbol not found


    const domain = window.location.hostname;
    let selectedQuantity = null; // ✅ Set to null initially
    let isApiLoaded = false; // ✅ Track if API data has loaded
    $("#loader").show();
    $(".discount_main").hide();
    // ✅ API endpoint for getting product data
    const apiUrl = `${appUrl}/app/api/volume/get/signleproduct/volume?domainName=${domain}`;

    const storeinfor= `${appUrl}/app/api/get/info`

    const themestores=`${appUrl}/app/api/get/theme`
 
    $.ajax({
        url: storeinfor,
        type: "GET",
        dataType: "json",
        success: function (response) {
            const accesstoken = response.accessToken;
            $.ajax({
                url: apiUrl,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    $.ajax({
                        url: themestores,
                        type: "GET",
                        dataType: "json",
                        success: function (response) {
                          
                        }
                    });
                    if (response && response.data) {
                        $(".bundle_main_option").empty(); 
                        
                        response.data.forEach((item) => {
                            const Method = item.discount_method; 
                            let aboveTitle = item.above_title_section?.text || "xyz";
                            let aboveTitleColor = item.above_title_section?.color || "#000";
                            let aboveTitleSize = item.above_title_section?.size || "16px";
                        
                            let mainTitle = item.title?.text || "";
                            let mainTitleColor = item.title?.color || "#000";
                            let mainTitleSize = item.title?.size || "18px";
                        
                            let belowCTA = item.text_below_cta?.text || "";
                            let belowCTAColor = item.text_below_cta?.color || "#000";
                            let belowCTASize = item.text_below_cta?.size || "14px";
                             let savebadge= item.Tiers.save;
                             if(!savebadge == 'on'){
                                $('.save_discount').css('display','none')
                             }
                             const Buttontext = item.call_to_action_button.text;
                             $('.discount_main .add-to-cart').html(Buttontext)
                            if ($('.heading_bundle h2').length) {
                                $('.heading_bundle h2').html(mainTitle);
                                $('.heading_bundle h2').css({ fontSize: mainTitleSize, color: mainTitleColor });
                            } else {
                                console.warn("⚠️ .heading_bundle h2 not found!");
                            }
                        
                            if ($('.subheading_bundle p').length) {
                                $('.subheading_bundle p').html(aboveTitle);
                                $('.subheading_bundle p').css({ fontSize: aboveTitleSize, color: aboveTitleColor });
                            } else {
                                console.warn("⚠️ .subheading_bundle p not found!");
                            }
                        
                            $('.Discount.discount_main .footer').html(belowCTA);
                            $('.Discount.discount_main .footer').css({ fontSize: belowCTASize, color: belowCTAColor });
                        
                            // ✅ Parse `tier` data
                            let tiers = [];
                            if (item.tier) {
                                try {
                                    tiers = JSON.parse(item.tier); // Convert tier string to array
                                } catch (error) {
                                    console.error("❌ Error parsing `tier` data:", error);
                                }
                            }
                        
                            // ✅ Loop through tiers and create HTML dynamically
                            tiers.forEach((tierItem) => {
                                 // Extract background color and shadow
    let backgroundColor = item.background.color || "transparent"; // Default to transparent if not provided
  
    let shadowEffect = item.background.shadow === "on" ? "5px 5px 10px rgba(0, 0, 0, 0.2)" : "none"; // Apply shadow if 'on'

    const comparedPrice=item.Tiers.comparedPrice;
    if (comparedPrice !== 'on'){
        $('span.pricediscount').addClass('displayshow')

        $('span.pricediscount').css('display','none')
    }
                                let discountText = Method === "Percentage" ? `${tierItem.discount}%` : `-${tierItem.discount}`;
                                let discountPercentage = parseFloat(tierItem.discount); // Convert to number
                               
                                let producttotal= (ProductPrice *  tierItem.quantity)
                                let discountedPrice = (ProductPrice *  tierItem.quantity) - discountPercentage ;
                              

                                let discountedPriceforpercenatge =  (discountPercentage / 100) * producttotal; // Calculate discount amount
                                let discountedPrice2 = producttotal - discountedPriceforpercenatge;
                              
                                if (Method === "Percentage") {
                                    // Calculate discount for percentage
                                    let discountedPriceForPercentage = (discountPercentage / 100) * producttotal; // Calculate discount amount
                                    discountedPrice = producttotal - discountedPriceForPercentage; // Apply percentage discount
                                      // Round the final price
                                        discountedPrice = Math.round(discountedPrice); 
                                } else {
                                    // Calculate discount for fixed amount
                                    discountedPrice = producttotal - discountPercentage; // Subtract fixed discount
                                        // Round the final price
                                         discountedPrice = Math.round(discountedPrice); 
                                }
                                let bundleHtml = `
                                    <div class="bundle-option" id="option${tierItem.quantity}">
                                          <div class="box_checked"><span>x</span></div>

                                        <strong qbuckt="2">Buy ${tierItem.quantity} Products</strong>
                                        
                                        <div class="priceSave">
                                        <span class="pricediscount">
                                         
                                            <small style="color:#777;text-decoration:line-through;">    ${currencySymbol} ${producttotal}</small>
                                            <small style="color:#777">   ${currencySymbol} ${discountedPrice}</small>
        
                                        </span>
                                        <div class="save_discount">
                                            <span>Save ${discountText}</span>
                                        </div>
                                        </div>
                                        <div class="dropdown-section" id="dropdown${tierItem.quantity}">
                                            
                                           
                                        </div>
                                    </div>
                                `;
                        
                                $(".bundle_main_option").append(bundleHtml); // ✅ Append new bundle option
                            });
                        });
                        
                      
        
                        isApiLoaded = true; 
        
                        // ✅ Hide loader & show content after data loads
                        $("#loader").hide();
                        $(".discount_main").show();
        
                        // ✅ Attach click event after elements are added
                        // $(".bundle-option").off("click").on("click", function () {
                        //     $(".bundle-option").removeClass("active").find(".dropdown-section").removeClass("show");
                        //     $(this).addClass("active").find(".dropdown-section").addClass("show");
                        //     selectedQuantity = parseInt($(this).attr("id").replace("option", ""));
                          
                        // });
                        $(".bundle-option").off("click").on("click", function () {
                            // Remove 'active' class, hide dropdowns, and uncheck checkboxes from all options
                            $(".bundle-option").removeClass("active").find(".dropdown-section").removeClass("show").find(".box_checked").removeClass('active');
                            
                            // Add 'active' class to the clicked option and show the dropdown
                            $(this).addClass("active").find(".dropdown-section").addClass("show");
                            
                            // Get the selected quantity based on the ID
                            selectedQuantity = parseInt($(this).attr("id").replace("option", ""));
                            
                            // Check the checkbox for the currently clicked option
                            var checkbox = $(this).find(".box");
                            checkbox.addClass('box_checked'); // Check the checkbox for the active option
                        });
                        
                    }
                },
                error: function (error) {
               
                }
                
            });

            // store information
            
        }
    })
  

  // ✅ Add to Cart with Correct Quantity
$('.add-to-cart').on('click', function () {
    // Get the current URL
var currentUrl = window.location.href;

// Use URLSearchParams to extract the 'variant' query parameter
var urlParams = new URLSearchParams(window.location.search);
var variantId = urlParams.get('variant');

// If variantId is blank, use the default variant ID
var finalVariantId = variantId ? variantId : defaultVariantID; // Use variantId if it's available, otherwise defaultVariantID

    if (!isApiLoaded) {
        console.warn("⚠️ API Data Not Loaded Yet! Please wait...");
        return; // Stop the function until API loads
    }

    // Set default quantity to 1 if none is selected
    if (!selectedQuantity) {
        selectedQuantity = 1;  // Default to 1 if no quantity is selected
    }

    // Only proceed if quantity is valid (greater than 0)
    if (selectedQuantity <= 0) {
        alert('Please select a valid quantity.');
        return;
    }

    console.log("🛒 Adding to Cart - Quantity:", selectedQuantity, "Variant ID:", defaultVariantID);

    $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: {
            quantity: selectedQuantity,
            id: finalVariantId
        },
        dataType: 'json',
        success: function (data) {
            $('#CartCount span:first').text(data.quantity);
           
            $.ajax({
                url: '/?section_id=cart-drawer',
                type: 'GET',
                dataType: 'html',
                success:function(data) {
                    $('cart-drawer').html($(data).find('cart-drawer').html());
                  
                    $('cart-drawer').removeClass('is-empty').addClass('animate active');
                 

                    // Redirect to cart page
                    window.location.href = "/cart";
                }
            });
        },
        error: function (error) {
            // Check if the "Product is not available" message isn't already shown
         
                $('.add-to-cart').before('<div class="bundle_main_option2" style="color: red;">Product is not available</div>');
                setTimeout(function () {
                    $('.bundle_main_option2').fadeOut();
                }, 1000);
       

            console.error("❌ Add to Cart Error:", error);

            let errorMessage = 'Unknown error';
            let errorDescription = '';

            if (error.responseJSON) {
                errorMessage = error.responseJSON.message || 'Unknown message from response';
                errorDescription = error.responseJSON.description || '';
            } else if (error.message) {
                errorMessage = error.message;
            }
        }
    });
});

});
