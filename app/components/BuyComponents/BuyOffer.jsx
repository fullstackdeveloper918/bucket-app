import { useEffect, useState } from "react";
import styles from "../../styles/main.module.css";
import preview_mockup from "../../routes/assets/preview_mockup.svg";
import deletedIcon from "../../routes/assets/deleted.svg";
import Productpreview from "../../routes/assets/product_sample.png";
import { Form } from "@remix-run/react";
import { toast as notify } from "sonner";

const BuyOffer = ({
  actionResponse,
  setId,
  id,
  setActiveTab,
  setCompletedStep,
}) => {
  const [values, setValues] = useState({
    bundle_name: "",
    buysx: [],
    gety: [],
    where_to_display: "Bundle Product Pages",
    discount_method: "Free Gift",
    amount: 10,
    domainName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
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
        setActiveTab("Design");
        setCompletedStep(2);
        setId(actionResponse?.data?.id);
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
            <Form method="POST">
              <div className={styles.leftContent}>
                <h3>
                  Sweeten the Deal,
                  <br></br>
                  <span>Pick a killer discount</span>
                </h3>

                <input type="hidden" name="bundle_id" value={id} />

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="">Discount Method</label>
                  <div
                    className={` ${styles.bundle_product} ${values.discount_method === "Free Gift" ? styles.activeTab : ""} `}
                  >
                    <input
                      type="radio"
                      name="discount_method"
                      id="free_gift"
                      value="Free Gift"
                      checked={values.discount_method === "Free Gift"}
                      onChange={handleChange}
                    />
                    <label htmlFor="free_gift">Free Gift</label>
                  </div>
                  <div
                    className={` ${styles.bundle_product} ${values.discount_method === "Percentage" ? styles.activeTab : ""} `}
                  >
                    <input
                      type="radio"
                      name="discount_method"
                      id="percentage"
                      value="Percentage"
                      checked={values.discount_method === "Percentage"}
                      onChange={handleChange}
                    />
                    <label htmlFor="percentage">Percentage</label>
                  </div>

                  <div
                    className={` ${styles.bundle_product} ${values.discount_method === "Fixed Amount" ? styles.activeTab : ""} `}
                  >
                    <input
                      type="radio"
                      name="discount_method"
                      id="amount"
                      value="Fixed Amount"
                      checked={values.discount_method === "Fixed Amount"}
                      onChange={handleChange}
                    />
                    <label htmlFor="amount">Fixed Amount</label>
                  </div>
                </div>

                {values.discount_method !== "Free Gift" && (
                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="amount">
                      Choose
                      {values.discount_method === "Percentage"
                        ? "Percentage"
                        : "Amount"}
                    </label>
                    <div className={styles.inputTiming}>
                      <input
                        type="number"
                        name="amount"
                        placeholder={`Enter ${
                          values.discount_method === "Percentage"
                            ? "Percentage..."
                            : "Amount..."
                        }`}
                        id="amount"
                        value={values.amount}
                        onChange={handleChange}
                      />
                      <span className={styles.inputDays}>
                        {values.discount_method === "Percentage" ? "%" : ""}
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.Add_btn}>
                  <button type="button" className={styles.Backbtn}>
                    Back
                  </button>

                  <button
                    className={styles.NextBtn}
                    name="intent"
                    type="submit"
                    value="secondStep"
                  >
                    Next
                  </button>
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
              <div className={styles.Preview_bundle}>
                <div className={styles.limited}>Limited Time Offer</div>
                <h4>Add Bundle And Save 10%!</h4>

                <div className={styles.both_product}>
                  <div className={styles.left_productsample}>
                    <img
                      src={Productpreview}
                      width={112}
                      height={112}
                      className={styles.mockup_tab}
                    />
                    <select name="" id="">
                      <option value="newest">Gold 14K</option>
                      <option value="old">Gold 14K</option>
                    </select>

                    <h6>Product Name</h6>
                  </div>
                  <div className={styles.AddProduct}>
                    <span>+</span>
                  </div>

                  <div className={styles.left_productsample}>
                    <img
                      src={Productpreview}
                      width={112}
                      height={112}
                      className={styles.mockup_tab}
                    />
                    <select name="" id="">
                      <option value="newest">Gold 14K</option>
                      <option value="old">Gold 14K</option>
                    </select>

                    <h6>Product Name</h6>
                  </div>
                </div>

                <div className={styles.productTotal}>
                  <span>Total</span>
                  <div className={styles.Pricetab}>
                    <span className={styles.delPriceOuter}>
                      <span className={styles.delPrice}>230$</span>
                    </span>
                    <span className={styles.totalPrice}>130$</span>
                    <span className={styles.SaveTab}>Save 10%</span>
                  </div>

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

export default BuyOffer;
