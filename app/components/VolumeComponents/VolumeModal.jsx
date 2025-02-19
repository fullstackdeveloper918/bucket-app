import React, { useEffect, useState } from "react";
import styles from "../../styles/main.module.css";
import Loader from "../Loader/Loader";
import preview_mockup from "../../routes/assets/preview_mockup.svg";
import DorpDownIcon from "../../routes/assets/dropDown.svg";
import UnionIcon from "../../routes/assets/Union.svg";
import DiscountPoducts from "./DiscountProducts";
import { Form } from "@remix-run/react";
import { toast as notify } from "sonner";

const VolumeModal = ({

  products,
  actionResponse,
  setId,
  id,
  setActiveTab,
  setCompletedStep,
}) => {

  const [showProducts, setShowProducts] = useState(false);
  
  const [values, setValues] = useState({
    bundle_name: "Example Bundle 1",
    product: "All Products",
    discount_method: "Percentage",
    badge: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };


  useEffect(() => {
    if(actionResponse?.step === "first") {

   
    if (actionResponse?.status === 200) {
      notify.success(actionResponse?.message, {
        position: "top-center",
        style: {
          background: "green",
          color: "white",
        },
      });
        setActiveTab("Offer")
        setCompletedStep(1);
        setId(actionResponse?.data?.id);
    } else if(actionResponse?.status === 500) {
      
         notify.success(actionResponse?.error, {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    }
  }
  }, [actionResponse]);

  return (
    <>
      <div className={styles.table_content}>
        <div className={styles.requestReview}>
          <div className={styles.timing_after}>
            <div>
              <Form method="POST">
                <div className={styles.leftContent}>
                    <>
                      <h3>
                        Ready To Increase AOV?
                        <br></br>
                        <span>Let’s Get Started</span>
                      </h3>

                      <div className={styles.input_labelCustomize}>
                        <label htmlFor="bundle_name">Name your bundle</label>
                        <input
                          type="text"
                          placeholder=""
                          name="bundle_name"
                          value={values.bundle_name}
                          onChange={handleChange}
                          className={styles.inputDiv}
                        />
                        {actionResponse?.errors?.bundle_name && (
                          <span className={styles.errorMessage}>
                            {actionResponse?.errors.bundle_name}
                          </span>
                        )}
                      </div>

                      <div className={styles.input_labelCustomize}>
                        <label htmlFor="">
                          Select Products for Volume Discount
                        </label>
                        <div className={styles.bundle_product}>
                          <input
                            type="radio"
                            name="product"
                            id="first"
                            value="All Products"
                            checked={values.product === "All Products"}
                            onChange={handleChange}
                          />
                          <label htmlFor="first">All Products</label>
                        </div>

                        <div className={styles.bundle_product}>
                          <input
                            type="radio"
                            name="product"
                            id="second"
                            value="Specific Products"
                            checked={values.product === "Specific Products"}
                            onChange={handleChange}
                          />
                          <label htmlFor="second">Specific products</label>
                        </div>
                        {values.product === "Specific Products" && (
                          <div className={styles.bundle_product}>
                            <div
                              className={` ${styles.customSelect} ${styles.customTabsec} `}
                              id="second"
                              onClick={() => setShowProducts(true)}
                            >
                              <div className={styles.selectBox}>
                                <span className={styles.selected}>
                                  Choose products
                                </span>
                                <div className={styles.arrow}>
                                  <img
                                    src={DorpDownIcon}
                                    width={20}
                                    height={16}
                                  />
                                </div>
                              </div>
                            
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.Margintop50}>
                        <button
                          type="submit"
                          className={styles.NextBtn}
                          name="intent"
                          value="firstStep"
                        >
                          Next
                        </button>
                      </div>
                    </>
       
                </div>
              </Form>

              {showProducts && (
                <DiscountPoducts
                  onClose={() => setShowProducts(false)}
                  products={products}
                />
              )}

            
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
              <div className={styles.btnLivePreview}>
                <button>Live Preview</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolumeModal;
