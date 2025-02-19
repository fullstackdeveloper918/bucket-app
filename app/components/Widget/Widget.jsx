import styles from "../../styles/main.module.css";
import dropdown from "../../routes/assets/drop_downImg.svg";
import pllaceholderImg from "../../routes/assets/images_place.svg";
import preview_mockup from "../../routes/assets/preview_mockup.svg";
// import stars from "../../routes/assets/star_svg.svg";
import stars from "../../routes/assets/stars.png";
import Productpreview from "../../routes/assets/product_sample.png";
import check_svg from "../../routes/assets/circle-check-solid.svg";
import grid_img from "../../routes/assets/gridImg.png";
import listImg from "../../routes/assets/listImg.png";
import { Form } from "@remix-run/react";
import { useState } from "react";

const Widget = () => {
  const [fields, setFields] = useState({
    title: { text: "", size: "", color: "" },
    productTitle: { size: "", color: "" },
    bundleCost: {
      size: "",
      color: "",
      displayComparedAtPrice: false,
      displaySaveTag: false,
    },
    callToAction: { text: "", size: "", redirectTo: "", color: "" },
    textBelowCTA: { text: "", size: "", color: "" },
    background: { color: "", displayShadow: false },
  });

  const handleChange = (event) => {
    const { name, value, type, checked, dataset } = event.target;
    const { field, property } = dataset;

    setFields((prevFields) => ({
      ...prevFields,
      [field]: {
        ...prevFields[field],
        [property]: type === "checkbox" ? checked : value,
      },
    }));
  };

  return (
    <>
      <div className={`${styles.timing_after} ${styles.table_content}`}>
        <Form>
          <div className={styles.firstAppBtn}>
            <div
              className={`${styles.requestReview} ${styles.firstAppRequest}`}
            >
              <div>
                <div>
                  <div className={styles.heading_img}>
                    <h3>You’re Almost There!</h3>{" "}
                  </div>
                  <p className={styles.paragraph_div}>Make It Stand Out</p>
                </div>
              </div>
              <div className={styles.timing_after}>
                <div>
                  <label htmlFor="">Layout</label>

                  <div className={styles.flexcolumn}>
                    <div className={`${styles.layoutBox} ${styles.selected}`}>
                      {/* <img
                        src={grid_img}
                        alt="grid img"
                        width={50}
                        height={50}
                      /> */}
                      <svg
                        width="53"
                        height="53"
                        viewBox="0 0 53 53"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0 8.83333C0 3.95482 3.95482 0 8.83333 0H15.4583C20.3368 0 24.2917 3.95482 24.2917 8.83333V15.4583C24.2917 20.3368 20.3368 24.2917 15.4583 24.2917H8.83333C3.95482 24.2917 0 20.3368 0 15.4583V8.83333ZM28.7083 8.83333C28.7083 3.95482 32.6632 0 37.5417 0H44.1667C49.0452 0 53 3.95482 53 8.83333V15.4583C53 20.3368 49.0452 24.2917 44.1667 24.2917H37.5417C32.6632 24.2917 28.7083 20.3368 28.7083 15.4583V8.83333ZM0 37.5417C0 32.6632 3.95482 28.7083 8.83333 28.7083H15.4583C20.3368 28.7083 24.2917 32.6632 24.2917 37.5417V44.1667C24.2917 49.0452 20.3368 53 15.4583 53H8.83333C3.95482 53 0 49.0452 0 44.1667V37.5417ZM28.7083 37.5417C28.7083 32.6632 32.6632 28.7083 37.5417 28.7083H44.1667C49.0452 28.7083 53 32.6632 53 37.5417V44.1667C53 49.0452 49.0452 53 44.1667 53H37.5417C32.6632 53 28.7083 49.0452 28.7083 44.1667V37.5417Z"
                          fill="url(#paint0_linear_2460_40141)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_2460_40141"
                            x1="53"
                            y1="0"
                            x2="6.31809e-06"
                            y2="53"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stop-color="#1C76EB" />
                            <stop offset="1" stop-color="#1CC0F7" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <h6>Grid</h6>
                      <p>(Recommended)</p>
                    </div>
                    <div className={styles.layoutBox}>
                      {/* <img
                        src={listImg}
                        alt="grid img"
                        width={52}
                        height={40}
                      /> */}
                      <svg
                        width="56"
                        height="39"
                        viewBox="0 0 56 39"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0 3.42857C0 1.53502 1.53502 0 3.42857 0C5.32212 0 6.85714 1.53502 6.85714 3.42857C6.85714 5.32212 5.32212 6.85714 3.42857 6.85714C1.53502 6.85714 0 5.32212 0 3.42857ZM14.8571 3.42857C14.8571 2.16621 15.8805 1.14286 17.1429 1.14286H53.7143C54.9767 1.14286 56 2.16621 56 3.42857C56 4.69094 54.9767 5.71429 53.7143 5.71429H17.1429C15.8805 5.71429 14.8571 4.69094 14.8571 3.42857ZM0 19.4286C0 17.535 1.53502 16 3.42857 16C5.32212 16 6.85714 17.535 6.85714 19.4286C6.85714 21.3221 5.32212 22.8571 3.42857 22.8571C1.53502 22.8571 0 21.3221 0 19.4286ZM14.8571 19.4286C14.8571 18.1662 15.8805 17.1429 17.1429 17.1429H53.7143C54.9767 17.1429 56 18.1662 56 19.4286C56 20.6909 54.9767 21.7143 53.7143 21.7143H17.1429C15.8805 21.7143 14.8571 20.6909 14.8571 19.4286ZM0 35.4286C0 33.535 1.53502 32 3.42857 32C5.32212 32 6.85714 33.535 6.85714 35.4286C6.85714 37.3221 5.32212 38.8571 3.42857 38.8571C1.53502 38.8571 0 37.3221 0 35.4286ZM14.8571 35.4286C14.8571 34.1662 15.8805 33.1429 17.1429 33.1429H53.7143C54.9767 33.1429 56 34.1662 56 35.4286C56 36.6909 54.9767 37.7143 53.7143 37.7143H17.1429C15.8805 37.7143 14.8571 36.6909 14.8571 35.4286Z"
                          fill="#0F172A"
                        />
                      </svg>

                      <h6>List</h6>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className={styles.left_content}>
                  <div className={styles.heading_img}>
                    <h3>Title</h3>{" "}
                    {/* <button className={styles.btn_one}>
                      Show <img src={dropdown} width={20} height={20} />
                    </button> */}
                    <div
                      className={styles.activeButton}
                      id="second"
                      onClick={() => setShowProducts(true)}
                    >
                      <div className={styles.butttonsTab}>
                        <span className={styles.selected}>Show</span>
                        <div className={styles.arrowActive}>
                          <svg
                            width="15"
                            height="8"
                            viewBox="0 0 22 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                              fill="#0F172A"
                            />
                          </svg>
                        </div>
                      </div>

                      <ul
                        className={styles.selectDropdown}
                        style={{ display: "none" }}
                      >
                        <li data-value="option1">Show</li>
                        <li data-value="option2">Show</li>
                      </ul>
                    </div>
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Text</label>
                    <input
                      type="text"
                      name="customerReviews"
                      placeholder="Customer reviews"
                      value={fields.title.text}
                      data-field="title"
                      data-property="text"
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Size</label>
                    <input
                      type="number"
                      name="size"
                      placeholder="5"
                      value={fields.title.size}
                      data-field="title"
                      data-property="size"
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Color</label>
                    <div className={styles.color_styles}>
                      <span className={styles.color_pilate}></span>
                      <input
                        type="text"
                        placeholder="Enter Text..."
                        name="color"
                        value={fields.title.color}
                        data-field="title"
                        data-property="color"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Product Title */}
                  <div className={styles.divideDiv}>
                    <div className={styles.heading_img}>
                      <h3>Product Title</h3>{" "}
                      {/* <button className={styles.btn_one}>
                        Show <img src={dropdown} width={20} height={20} />
                      </button> */}
                      <div
                className={styles.activeButton}
                id="second"
                onClick={() => setShowProducts(true)}
              >
                <div className={styles.butttonsTab}>
                  <span className={styles.selected}>Show</span>
                  <div className={styles.arrowActive}>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                        fill="#0F172A"
                      />
                    </svg>
                  </div>
                </div>

                <ul
                  className={styles.selectDropdown}
                  style={{ display: "none" }}
                >
                  <li data-value="option1">Show</li>
                  <li data-value="option2">Show</li>
                </ul>
              </div>
                    </div>

                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Size</label>
                      <input type="number" name="size" placeholder="5" />
                    </div>
                    <div className={styles.input_labelCustomize}>
                      <label htmlFor="">Color</label>
                      <div className={styles.color_styles}>
                        <span className={styles.color_pilate}></span>
                        <input
                          type="text"
                          name="btnColor"
                          placeholder="Enter Text..."
                        />
                      </div>
                    </div>
                  </div>
                  {/* Product Title end*/}

                  
                  {/*Bundle Cost*/}
                  <div className={styles.divideDiv}>
                  <div className={styles.heading_img}>
                    <h3>Bundle Cost</h3>{" "}
                    {/* <button className={styles.btn_one}>
                      Show <img src={dropdown} width={20} height={20} />
                    </button> */}
                          <div
                className={styles.activeButton}
                id="second"
                onClick={() => setShowProducts(true)}
              >
                <div className={styles.butttonsTab}>
                  <span className={styles.selected}>Show</span>
                  <div className={styles.arrowActive}>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                        fill="#0F172A"
                      />
                    </svg>
                  </div>
                </div>

                <ul
                  className={styles.selectDropdown}
                  style={{ display: "none" }}
                >
                  <li data-value="option1">Show</li>
                  <li data-value="option2">Show</li>
                </ul>
              </div>
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Size</label>
                    <input
                      type="number"
                      name="size"
                      value={fields.bundleCost.size}
                      data-field="bundleCost"
                      data-property="size"
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Color</label>
                    <div className={styles.color_styles}>
                      <span className={styles.color_pilate}></span>
                      <input
                        type="text"
                        name="color"
                        placeholder="Enter Text..."
                        value={fields.bundleCost.color}
                        data-field="bundleCost"
                        data-property="color"
                        onChange={handleChange}
                      />
                    </div>
           
                  </div>


                 <div className={` ${styles.trigerCheck} ${styles.marginTop20}`}> 
                  <div className={styles.formGroup}>
                      <input
                        type="checkbox"
                        id="html"
                        name="displayComparedAtPrice"
                        checked={fields.bundleCost.displayComparedAtPrice}
                        data-field="bundleCost"
                        data-property="displayComparedAtPrice"
                        onChange={handleChange}
                      />
                      <label for="html">Display Compared-At Price</label>
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        type="checkbox"
                        id="save"
                        name="displaySaveTag"
                        checked={fields.bundleCost.displaySaveTag}
                        data-field="bundleCost"
                        data-property="displaySaveTag"
                        onChange={handleChange}
                      />
                      <label for="save">Display “Save” tag</label>
                    </div>
                    </div>
                  </div>

                      {/*Bundle Cost end*/}

                             {/*Call To Action Button*/}
                             <div className={styles.divideDiv}>
                  <div className={styles.heading_img}>
                    <h3>Call To Action Button</h3>{" "}
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Text</label>
                    <input
                      type="text"
                      name="customerReviews"
                      placeholder="👉 Add To Cart"
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Size</label>
                    <input type="number" name="size" placeholder="5" />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Redirect To</label>

                    <select className={styles.select_box}>
                      <option value="1" selected>
                        Cart
                      </option>
                      <option value="2">Cart</option>
                      <option value="3">Cart</option>
                    </select>
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Color</label>
                    <div className={styles.color_styles}>
                      <span className={styles.color_pilate}></span>
                      <input
                        type="text"
                        name="btnColor"
                        placeholder="Enter Text..."
                      />
                    </div>
                  </div>
</div>
                   {/*Call To Action Button end*/}

                  
                     {/*Text Below CTA*/}
                     <div className={styles.divideDiv}>
                  <div className={styles.heading_img}>
                    <h3>Text Below CTA</h3>{" "}
                    {/* <button className={styles.btn_one}>
                      Show <img src={dropdown} width={20} height={20} />
                    </button> */}
      <div
                className={styles.activeButton}
                id="second"
                onClick={() => setShowProducts(true)}
              >
                <div className={styles.butttonsTab}>
                  <span className={styles.selected}>Show</span>
                  <div className={styles.arrowActive}>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                        fill="#0F172A"
                      />
                    </svg>
                  </div>
                </div>

                <ul
                  className={styles.selectDropdown}
                  style={{ display: "none" }}
                >
                  <li data-value="option1">Show</li>
                  <li data-value="option2">Show</li>
                </ul>
              </div>

                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Text</label>
                    <input
                      type="text"
                      name="customerReviews"
                      placeholder="Customer reviews"
                    />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Size</label>
                    <input type="number" name="size" placeholder="5" />
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Color</label>
                    <div className={styles.color_styles}>
                      <span className={styles.color_pilate}></span>
                      <input
                        type="text"
                        name="color"
                        placeholder="Enter Text..."
                      />
                    </div>
                  </div>
</div>
 {/*Text Below CTA end*/}


                  <div className={styles.heading_img}>
                    <h3>Background</h3>{" "}
                    {/* <button className={styles.btn_one}>
                      Show <img src={dropdown} width={20} height={20} />
                    </button> */}
      <div
                className={styles.activeButton}
                id="second"
                onClick={() => setShowProducts(true)}
              >
                <div className={styles.butttonsTab}>
                  <span className={styles.selected}>Show</span>
                  <div className={styles.arrowActive}>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                        fill="#0F172A"
                      />
                    </svg>
                  </div>
                </div>

                <ul
                  className={styles.selectDropdown}
                  style={{ display: "none" }}
                >
                  <li data-value="option1">Show</li>
                  <li data-value="option2">Show</li>
                </ul>
              </div>

                  </div>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Color</label>
                    <div className={styles.color_styles}>
                      <span className={styles.color_pilate}></span>
                      <input
                        type="text"
                        name="color"
                        placeholder="Enter Text..."
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <input type="checkbox" id="save" checked />
                    <label for="save">Display Shadow</label>
                  </div>



                </div>
              </div>
              <div className={styles.Add_btn}>
                <button
                  onClick={() => setShow("Ready To Increase")}
                  className={styles.Backbtn}
                >
                  Back
                </button>
                <button className={styles.NextBtn}>Launch Bundle!</button>
              </div>
            </div>
          </div>
        </Form>

        <div className={styles.live_preview}>
          <img
            src={preview_mockup}
            width={404}
            height={822}
            className={styles.mockup_tab}
          />
          <div className={styles.previewFirstapp}>
            <div className={styles.Preview_bundle}>
              <div className={styles.customer_review}>Customer review</div>
              <h3 className={styles.reviewTotal}>4.3</h3>
              <div className={styles.text_center_img}>
                <img
                  src={stars}
                  width={26}
                  height={26}
                  className={styles.star_img}
                />
              </div>
              <h3 className={styles.allover_rating}>56 Reviews</h3>

              <div class={styles.rating_bar}>
                <h5>40</h5>
                <div className={styles.rating_progress}>
                  <div
                    className={styles.rating_value}
                    style={{ width: "4%" }}
                  ></div>
                </div>
                <span className={styles.rating_label}>5 Stars</span>
              </div>
              <div class={styles.rating_bar}>
                <h5>40</h5>
                <div className={styles.rating_progress}>
                  <div
                    className={styles.rating_value}
                    style={{ width: "4%" }}
                  ></div>
                </div>
                <span className={styles.rating_label}>5 Stars</span>
              </div>
              <div class={styles.rating_bar}>
                <h5>40</h5>
                <div className={styles.rating_progress}>
                  <div
                    className={styles.rating_value}
                    style={{ width: "4%" }}
                  ></div>
                </div>
                <span className={styles.rating_label}>5 Stars</span>
              </div>
              <div class={styles.rating_bar}>
                <h5>40</h5>
                <div className={styles.rating_progress}>
                  <div
                    className={styles.rating_value}
                    style={{ width: "4%" }}
                  ></div>
                </div>
                <span className={styles.rating_label}>5 Stars</span>
              </div>
              <div class={styles.rating_bar}>
                <h5>40</h5>
                <div className={styles.rating_progress}>
                  <div
                    className={styles.rating_value}
                    style={{ width: "4%" }}
                  ></div>
                </div>
                <span className={styles.rating_label}>5 Stars</span>
              </div>
              <button className={styles.AddBtn}>Add A Review</button>
            </div>
            <div className={styles.reviewTestimonial}>
              <div className={styles.Preview_bundle}>
                <div className={styles.testimonialMobile}>
                  <div className={styles.testimobileText}>
                    <img src={stars} width={20} height={20} alt="star" />
                    <h6>Caroline B</h6>
                    <div className={styles.verfiyText}>
                      {" "}
                      <img
                        src={check_svg}
                        className={styles.checkSVG}
                        width={12}
                        height={12}
                        alt="img"
                      />{" "}
                      Verfied Purchase
                    </div>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Culpa, suscipit?
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.Preview_bundle}>
                <div className={styles.testimonialMobile}>
                  <div className={styles.testimobileText}>
                    <img src={stars} width={15} height={15} alt="star" />
                    <h6>Caroline B</h6>
                    <div className={styles.verfiyText}>
                      {" "}
                      <img
                        src={check_svg}
                        className={styles.checkSVG}
                        width={12}
                        height={12}
                        alt="img"
                      />{" "}
                      Verfied Purchase
                    </div>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Natus suscipit voluptatem, ipsam consequatur culpa
                      corrupti....{" "}
                      <span className={styles.showMore}>Show more</span>{" "}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.btnLivePreview}>
            <button>Live Preview</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Widget;
