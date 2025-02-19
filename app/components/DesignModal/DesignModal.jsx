
import { useEffect,useState } from 'react';
import styles from '../../styles/main.module.css'
import preview_mockup from "../../routes/assets/preview_mockup.svg";
import DorpDownIcon from "../../routes/assets/dropDown.svg";
import downArrow from "../../routes/assets/drop_downImg.svg";
import dropdown from "../../routes/assets/dropDown.svg";
import { Form } from "@remix-run/react";
import { toast as notify } from "sonner";


const DesignModal = ({onNext, id, setCompletedStep, actionResponse}) => {

  const [show, setShow] = useState(true);
  const [showPosition, setShowPosition] = useState(false);
  const [section, setSection] = useState("Buy Buttons");

  const [position, setPosition] = useState("");

  const [titleSection, seTitleSection] = useState({
    titleSectionText: "",
    titleSectionSize: "",
    titleSectionColor: "",
  });

  const [title, seTitle] = useState({
    titleText: "",
    titleSize: "",
    titleColor: "",
  });

  const [textBelow, setTextBelow] = useState({
    tbText: "",
    tbSize: "",
    tbColor: "",
  });

  const [product, setProduct] = useState({
    productText: "",
    productSize: "",
    productColor: "",
  });


  const [bundleCost, setBundleCost] = useState({
   
    bundleCostSize: "",
    bundleCostColor: "",
    bundleCostComparedPrice: "",
    bundleCostSave: "",

  });

  const [callAction, setCallAction] = useState({
    ctaText: "",
    ctaSize: "",
    ctaColor: "",
  });

  const [background, setBackGround] = useState({
    backgroundColor: "",
    backgroundShadow: false,
  });

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


  

  const handleProduct = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBundleCost = (e) => {
    const { name, value } = e.target;
    setBundleCost((prev) => ({
      ...prev,
      [name]: value,
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

  useEffect(() => {
    if (actionResponse?.step === "third") {
      notify.success(actionResponse?.message, {
        position: "top-center",
        style: {
          background: "green",
          color: "white",
        },
      });
      setCompletedStep(3);
      onNext();
    } else if (actionResponse?.status === 500) {
      notify.success(actionResponse?.message, {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    }
  }, [actionResponse]);



  return (
    <>
   
   <Form method="POST">
        <input type="hidden" name="bundle_id" value={id} />
        <div className={styles.table_content}>
          <div className={styles.requestReview}>
            <div className={styles.timing_after}>
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
                        onClick={() => setShowPosition(!showPosition)}
                      >
                        <div
                          className={` ${styles.customSelect} ${styles.customTabsec} `}
                          id="second"
                        >
                          <div className={styles.selectBox}>
                            <span className={styles.selected}>
                              {position ? position : "Below Section"}
                            </span>
                            <div className={styles.arrow}>
                              <img src={DorpDownIcon} width={20} height={16} />
                            </div>
                          </div>
                          {showPosition && (
                            <ul
                              className={`${styles.selectDropdown} ${styles.newAppdeop} `}
                            >
                              <li
                                data-value="option1"
                                onClick={() => setPosition("option1")}
                              >
                                Option 1
                              </li>
                              <li
                                data-value="option2"
                                onClick={() => setPosition("option2")}
                              >
                                Option 2
                              </li>
                              <li
                                data-value="option3"
                                onClick={() => setPosition("option3")}
                              >
                                Option 3
                              </li>
                              <li
                                data-value="option4"
                                onClick={() => setPosition("option4")}
                              >
                                Option 4
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
                      className={` ${styles.bundle_product} ${styles.bundleNewApp} ${section === "Buy Buttons" ?  styles.activeTab : ""} `}
                    >
                      <input
                        type="radio"
                        name="section"
                        id="Buy Buttons"
                        value="Buy Buttons"
                        checked={section === "Buy Buttons"}
                        onChange={() => setSection("Buy Buttons")}

                      />
                      <label htmlFor="Buy Buttons">Buy Buttons</label>
                    </div>

                    <div className={`${styles.bundle_product} ${section === "Product Description" ?  styles.activeTab : ""}`}>
                      <input
                        type="radio"
                        name="section"
                        id="Product Description"
                        value="Product Description"
                        checked={section === "Product Description"}
                        onChange={() => setSection("Product Description")}

                      />
                      <label htmlFor="Product Description">Product Description</label>
                    </div>

                    <div className={`${styles.bundle_product} ${section === "End Of Product Page" ?  styles.activeTab : ""}`}>
                      <input
                        type="radio"
                        name="section"
                        id="End Of Product Page"
                        value="End Of Product Page"
                        checked={section === "End Of Product Page"}
                        onChange={() => setSection("End Of Product Page")}
                      />
                      <label htmlFor="End Of Product Page">End Of Product Page</label>
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
                      <button type="button" class={styles.btn_one}>
                        Show <img src={downArrow} width="20" height="20" />
                      </button>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="title_section_text">Text</label>
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
                      <label htmlFor="title_section_size">Size</label>
                      
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
                      <label htmlFor="title_section_color">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="title_section_color"
                          name="titleSectionColor"
                          value={titleSection.titleSectionColor}
                          onChange={handleTitleSection}
                          placeholder=""
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.divideDiv}>
                    <div
                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                    >
                      <h4>Title</h4>
                      <button type="button" class={styles.btn_one}>
                        Show <img src={downArrow} width="20" height="20" />
                      </button>
                    </div>

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
                      <label htmlFor="title_color">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="title_color"
                          name="titleColor"
                          value={title.titleColor}
                          onChange={handleTitle}
                          placeholder=""
                        />
                      </div>
                    </div>
                  </div>
                 
                  <div className={styles.divideDiv}>
                    <div
                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                    >
                      <h4>Product Title</h4>
                      <button type="button" class={styles.btn_one}>
                        Show <img src={downArrow} width="20" height="20" />
                      </button>
                    </div>

                   
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="productSize">Size</label>
                    
                        <input
                          type="number"
                          id="productSize"
                          name="productSize"
                          value={product.productSize}
                          onChange={handleProduct}
                          
                        />
                      
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="productColor">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="productColor"
                          name="productColor"
                          value={product.productColor}
                          onChange={handleProduct}
                          
                        />
                      </div>
                    </div>
                  </div>


                  <div className={styles.divideDiv}>
                    <div
                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                    >
                      <h4>Bundle Cost</h4>
                      <button type="button" class={styles.btn_one}>
                        Show <img src={downArrow} width="20" height="20" />
                      </button>
                    </div>

                   
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
                      <label htmlFor="bundleCostColor">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
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
                    <div className={styles.input_labelCustomize}>
                        <div className={styles.formGroup}>
                          <input
                            type="checkbox"
                            id="compared"
                            name="bundleCostComparedPrice"
                            checked={bundleCost.bundleCostComparedPrice}
                            onChange={handleBundleCost}
                          />
                          <label for="compared">
                            Display Compared-At Price
                          </label>
                        </div>
                      </div>
                      <div className={styles.input_labelCustomize}>
                        <div className={styles.formGroup}>
                          <input
                            type="checkbox"
                            id="save"
                            name="bundleCostSave"
                            checked={bundleCost.bundleCostSave}
                            onChange={handleBundleCost}
                          />
                          <label htmlFor="save">Display “Save” Badge</label>
                        </div>
                      </div>

                   
                    </div>
                  </div>
              

                  <div className={styles.divideDiv}>
                    <div
                      className={`${styles.headingWrapper} ${styles.heading_img}`}
                    >
                      <h4>Call To Action Button</h4>
                      <button type="button" class={styles.btn_one}>
                        Show <img src={downArrow} width="20" height="20" />
                      </button>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="call_action_text">Text</label>
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
                      <label htmlFor="title_section_size">Size</label>
                      
                        <input
                          type="number"
                          id="title_section_size"
                          name="ctaSize"
                          value={callAction.ctaSize}
                          onChange={handleCallToAction}
                        />
                   
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="title_section_color">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="title_section_color"
                          name="ctaColor"
                          value={callAction.ctaColor}
                          onChange={handleCallToAction}
                        />
                      </div>
                    </div>
                  </div>

          
                  <div className={styles.divideDiv}>
                    <div className={styles.heading_img}>
                      <h3>Text Below CTA</h3>{" "}
                      <button type="button" className={styles.btn_one}>
                        Show <img src={dropdown} width={20} height={20} />
                      </button>
                    </div>

                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="text_below_text">Text</label>
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
                      <label htmlFor="text_below_size">Size</label>
                      
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
                      <label htmlFor="text_below_color"> Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="text_below_color"
                          name="tbColor"
                          value={textBelow.tbColor}
                          onChange={handleTextBelow}
                        />
                      </div>
                    </div>
                  </div>
               
                  <div className={styles.divideDiv}>
                    <div className={styles.heading_img}>
                      <h3>Background</h3>{" "}
                      <button type="button" className={styles.btn_one}>
                        Show <img src={dropdown} width={20} height={20} />
                      </button>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="background_color">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="background_color"
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
                      <label htmlFor="shadow">Display “Save” tag</label>
                    </div>
                  </div>
             
                </>

                <>
                  <div className={styles.Add_btn}>
                    <button
                      onClick={() => setShow("Ready To Increase")}
                      className={styles.Backbtn}
                    >
                      Back
                    </button>
                    <button
                      name="intent"
                      value="stepThird"
                      className={styles.NextBtn}
                    >
                      Launch Bundle
                    </button>
                  </div>
                </>
              </div>

              <div className={styles.live_preview}>
                <img
                  src={preview_mockup}
                  width={404}
                  height={822}
                  className={styles.mockup_tab}
                />
                <div className={styles.Preview_bundle}>
                  <div className={styles.limited}>Limited Time Offer</div>
                  <h4>Add Bundle And Save 10%!</h4>

                  <div className={styles.left_productsample}>
                    <div className={styles.bundlewrapper}>
                      <div
                        className={` ${styles.leftProduct} ${styles.leftProductWraper}`}
                      >
                        <div className={styles.inputDiv}>
                          <input
                            type="radio"
                            name=""
                            id="bundle Product"
                            checked
                          />
                          <label htmlFor="">Buy 2 Products</label>
                        </div>

                        <div className={styles.Pricetab}>
                          <span className={styles.delPriceOuter}>
                            <span className={styles.delPrice}>$50</span>
                          </span>
                          <span className={styles.totalPrice}>$25</span>
                          <span className={styles.SaveTab}>Save 50%</span>
                        </div>
                      </div>

                      <div className={styles.sizecolor}>
                        <ul>
                          <li>
                            <div className={styles.sizecolrDiv}>
                              <label>
                                <span>Size</span>
                              </label>
                              <select name="" id="">
                                <option value="newest">25+5 CM</option>
                                <option value="old">25+5 CM</option>
                              </select>
                            </div>

                            <div className={styles.sizecolrDiv}>
                              <label>
                                <span>Color</span>
                              </label>
                              <select name="" id="">
                                <option value="newest">Gold 14K</option>
                                <option value="old">Gold 14K</option>
                              </select>
                            </div>
                          </li>

                          <li>
                            <div className={styles.sizecolrDiv}>
                              <select name="" id="">
                                <option value="newest">25+5 CM</option>
                                <option value="old">25+5 CM</option>
                              </select>
                            </div>

                            <div className={styles.sizecolrDiv}>
                              <select name="" id="">
                                <option value="newest">Gold 14K</option>
                                <option value="old">Gold 14K</option>
                              </select>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className={styles.mostPopular}>Most Popular ⭐️</div>
                    </div>

                    <div
                      className={`${styles.bundlewrapper} ${styles.bundle_wrap}`}
                    >
                      <div
                        className={` ${styles.leftProduct} ${styles.leftProductWraper}`}
                      >
                        <div className={styles.inputDiv}>
                          <input
                            type="radio"
                            name=""
                            id="bundle Product"
                            checked
                          />
                          <label htmlFor="">Buy 4 Products</label>
                        </div>

                        <div className={styles.Pricetab}>
                          <span className={styles.delPriceOuter}>
                            <span className={styles.delPrice}>$75</span>
                          </span>
                          <span className={styles.totalPrice}>$35</span>
                          <span className={styles.SaveTab}>Save 65%</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${styles.bundlewrapper} ${styles.bundle_wrap}`}
                    >
                      <div
                        className={` ${styles.leftProduct} ${styles.leftProductWraper}`}
                      >
                        <div className={styles.inputDiv}>
                          <input
                            type="radio"
                            name=""
                            id="bundle Product"
                            checked
                          />
                          <label htmlFor="">Buy 6 Products</label>
                        </div>

                        <div className={styles.Pricetab}>
                          <span className={styles.delPriceOuter}>
                            <span className={styles.delPrice}>$125</span>
                          </span>
                          <span className={styles.totalPrice}>$50</span>
                          <span className={styles.SaveTab}>Save 70%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.productTotal}>
                    <button className={styles.AddBtn}>👉 Add To Cart</button>
                    <p className={styles.wrrantyTag}>
                      Lifetime Warranty & Free Returns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </>
  )
}

export default DesignModal