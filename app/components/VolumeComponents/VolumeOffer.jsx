import React, { useEffect, useState } from "react";
import styles from "../../styles/main.module.css";
import deletedIcon from "../../routes/assets/deleted.svg";
import preview_mockup from "../../routes/assets/preview_mockup.svg";
// import DorpDownIcon from "../../routes/assets/dropDown.svg";
// import UnionIcon from "../../routes/assets/Union.svg";
// import DiscountPoducts from "./DiscountProducts";
import { toast as notify } from "sonner";
import { Form } from "@remix-run/react";

const VolumeOffer = ({
  onNext,
  actionResponse,
  id,
  setCompletedStep,
  setActiveTab,
}) => {
  const [values, setValues] = useState({
    discount_method: "Percentage",
    badge: "",
  });

  const [errors, setErrors] = useState([])



  const [tier, setTier] = useState([{ id: 1,  }]);

  const addAnotherTier = () => {
    setTier((prevSections) => [
      ...prevSections,
      { id: prevSections.length + 1 },
    ]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleDelete = (id) => {
    const updatedTier = tier.filter((_, index) => index !== id - 1);
    const updatedErrors = errors.filter((_, index) => index !== id - 1);
    setTier(updatedTier);
    setErrors(updatedErrors);
  };

  const getLabelText = (method) => {
    switch (method) {
      case "Percentage":
        return "Percentage";
      case "Fixed Amount":
        return "Amount";
      case "Set Selling Price":
        return "Price";
      default:
        return "";
    }
  };



  const handleTierChange = (index, field, value) => {
    const updatedTier = [...tier];
    const errorMessages = [...errors];

    if (field === "quantity" || field === "discount") {
      if (!/^\d*$/.test(value)) {
        errorMessages[index] = {
          ...errorMessages[index],
          [field]: "Only numbers are allowed.",
        };
      } else {
        errorMessages[index] = { ...errorMessages[index], [field]: "" };
      }
    } else if (field === "title" || field === "badge") {
      if (/[^a-zA-Z\s]/.test(value)) {
        errorMessages[index] = {
          ...errorMessages[index],
          [field]: "Only letters are allowed.",
        };
      } else {
        errorMessages[index] = { ...errorMessages[index], [field]: "" };
      }
    }

    updatedTier[index][field] = value;
    setTier(updatedTier);
   
  };

  useEffect(() => {
    if (actionResponse?.step === "second") {
    if (actionResponse?.status === 200) {
      notify.success(actionResponse?.message, {
        position: "top-center",
        style: {
          background: "green",
          color: "white",
        },
      });

        setCompletedStep(2);
        setActiveTab("Design");
      } else if (actionResponse?.status === 500) {
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
                  <h3>
                    Sweeten the Deal,
                    <br></br>
                    <span>Pick a killer discount</span>
                  </h3>
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Discount Method</label>
                    <div className={styles.bundle_product}>
                      <input
                        type="radio"
                        id="Percentage"
                        name="discount_method"
                        value="Percentage"
                        checked={values.discount_method === "Percentage"}
                        onChange={handleChange}
                      />
                      <label htmlFor="Percentage">Percentage</label>
                    </div>

                    <div className={styles.bundle_product}>
                      <input
                        type="radio"
                        id="Fixed Amount"
                        name="discount_method"
                        value="Fixed Amount"
                        checked={values.discount_method === "Fixed Amount"}
                        onChange={handleChange}
                      />
                      <label htmlFor="Fixed Amount">Fixed Amount</label>
                    </div>

                    <div className={styles.bundle_product}>
                      <input
                        type="radio"
                        id="Set Selling Price"
                        name="discount_method"
                        value="Set Selling Price"
                        checked={values.discount_method === "Set Selling Price"}
                        onChange={handleChange}
                      />
                      <label htmlFor="Set Selling Price">
                        Set Selling Price
                      </label>
                    </div>
                  </div>

                  {tier.map((item, index) => (
                    <React.Fragment>
                      <div className={styles.input_labelCustomize}>
                        <label htmlFor="">Tier #{index + 1}</label>

                        <div className={styles.formGroup}>
                          <input
                            type="checkbox"
                            id="html"
                            onChange={(e) =>
                              handleTierChange(
                                index,
                                "isDefault",
                                e.target.checked,
                              )
                            }
                          />
                          <label htmlFor="html">Set Default</label>
                        </div>

                        <div className={styles.input_tier}>
                          <div className={styles.input_labelCustomize}>
                            <label htmlFor="quantity">Quantity</label>
                          
                              <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                min="1"
                                placeholder="2"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleTierChange(
                                    index,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                              />
                          
                          </div>

                          <div className={styles.input_labelCustomize}>
                            <label for="quantity">
                             
                              Set {getLabelText(values.discount_method)}
                            </label>
                            
                              <input
                                type="number"
                                id="discount"
                                name="discount"
                                min="1"
                                placeholder="50"
                                value={item.discount}
                                onChange={(e) =>
                                  handleTierChange(
                                    index,
                                    "discount",
                                    e.target.value,
                                  )
                                }
                              />
                         
                          </div>

                          <div className={styles.input_labelCustomize}>
                            <label for="quantity">Title</label>
                            
                              <input
                                type="text"
                                name="title"
                                id="bundle Product"
                                checked
                                placeholder="Buy 2 Products"
                                value={item.title}
                                onChange={(e) =>
                                  handleTierChange(
                                    index,
                                    "title",
                                    e.target.value,
                                  )
                                }
                              />
                           
                          </div>

                          <div className={styles.input_labelCustomize}>
                            <label for="quantity">Badge Text</label>
                            <div >
                              <input
                                type="text"
                                name="badge"
                                id="bundle Product"
                                checked
                                placeholder="Most Popular"
                                value={item.badge}
                                onChange={(e) =>
                                  handleTierChange(
                                    index,
                                    "badge",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            {actionResponse?.errors?.tier && (
                              <span className={styles.errorMessage}>
                                {actionResponse?.errors?.tier}
                              </span> 
                            )}
                          </div>

                          <div className={styles.image_name}>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className={styles.deletedBtn}
                            >
                              <img src={deletedIcon} width={20} height={20} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  <input type="hidden" name="bundle_id" value={id} />
                  <input
                    type="hidden"
                    name="tier"
                    value={JSON.stringify(tier)}
                  />
                  <input
                    type="hidden"
                    name="bundle_title"
                    value={actionResponse?.data?.bundle_name}
                  />

                  <div className={styles.Addanotherdiv}>
                    <label
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={addAnotherTier}
                    >
                      <span>+</span>Add Another Tier
                    </label>
                  </div>

                  <div className={styles.Add_btn}>
                    <button
                      // onClick={() => setShow("Ready To Increase")}
                      className={styles.Backbtn}
                    >
                      Back
                    </button>
                    <button
                      className={styles.NextBtn}
                      name="intent"
                      value="secondStep"
                      // style={{
                      //   userSelect: loading ? "none" : null,
                      //   opacity: loading ? "0.4" : 1,
                      //   cursor: loading ? "default" : "pointer",
                      // }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </Form>
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

export default VolumeOffer;
