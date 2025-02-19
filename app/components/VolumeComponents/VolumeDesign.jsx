import { useEffect, useState } from "react";
import styles from '../../styles/main.module.css'
import preview_mockup from "../../routes/assets/preview_mockup.svg";
import downArrow from "../../routes/assets/drop_downImg.svg";
import DorpDownIcon from "../../routes/assets/dropDown.svg";
import dropdown from "../../routes/assets/drop_downImg.svg";
import { toast as notify } from "sonner";
import { Form } from "@remix-run/react";


const VolumeDesign = ({onNext, actionResponse, id, setCompletedStep}) => {

  const [show, setShow] = useState(true);
  const [showPosition, setShowPosition] = useState(false);
  const [position, setPosition] = useState("Below Section");
  const [section, setSection] = useState("Buy Buttons");


  const [titleSection, seTitleSection] = useState({
    titleSectionText: "Limited Time Offer",
    titleSectionSize: 5,
    titleSectionColor: "#000000",
  });

  const [title, seTitle] = useState({
    titleText: "Add More & Save",
    titleSize: 5,
    titleColor:"#000000",
  });

  const [tiers, setTiers] = useState({
    tierColor: "#000000",
    badge_color: "#000000",
    tierComparedPrice: true,
    tierSave: true
  });

  const [textBelow, setTextBelow] = useState({
    tbText: "Lifetime warranty & Free Returns",
    tbSize: 5,
    tbColor: "#555555",
  });

  const [callAction, setCallAction] = useState({
    ctaText: "Add To Cart",
    ctaSize: 5,
    ctaColor: "#000000",
  });

  const [background, setBackGround] = useState({
    backgroundColor: "#FFFFFF",
    backgroundShadow: true,
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

  const handleTier = (e) => {
    const { name, type, checked, value } = e.target;
    setTiers((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
                                onClick={() => setPosition("Below Section")}
                              >
                                Below Section
                              </li>
                              <li
                                data-value="option2"
                                onClick={() => setPosition("Above Section")}
                              >
                               Above Section
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
                    <div className={styles.heading_img}>
                      <h3>Tiers</h3>{" "}
                      <button type="button" className={styles.btn_one}>
                        Show <img src={dropdown} width={20} height={20} />
                      </button>
                    </div>
                    <div className={styles.trigerCheck}>
                      <div className={styles.input_labelCustomize}>
                        <div className={styles.formGroup}>
                          <input
                            type="checkbox"
                            id="save"
                            name="tierSave"
                            checked={tiers.tierSave}
                            onChange={handleTier}
                          />
                          <label htmlFor="save">Display “Save” Badge</label>
                        </div>
                      </div>

                      <div className={styles.input_labelCustomize}>
                        <div className={styles.formGroup}>
                          <input
                            type="checkbox"
                            id="compared"
                            name="tierComparedPrice"
                            checked={tiers.tierComparedPrice}
                            onChange={handleTier}
                          />
                          <label for="compared">
                            Display Compared-At Price
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="tiers_color">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="tiers_color"
                          name="tierColor"
                          value={tiers.tierColor}
                          onChange={handleTier}
                        />
                      </div>
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="badge_color">“Save” Badge Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          id="badge_color"
                          name="badge_color"
                          value={tiers.badge_color}
                          onChange={handleTier}
                        />
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
                      Launch Bundle!
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
    {/* <div className={`${styles.table_content} ${styles.DesignCard}`}>
    <div className={styles.requestReview}>
          <h2>You Did It!</h2>
          <p>Your bundle is up and running. Sit back and let the conversations roll in.</p>
          <button className={styles.NextBtn} onClick={handleNext}>Return To Dashboard</button>  
          </div>
      </div>   */}
    </>
  )
}

export default VolumeDesign