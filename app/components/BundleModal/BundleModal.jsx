import { useEffect, useState } from "react";
import styles from "../../styles/main.module.css";
import preview_mockup from "../../routes/assets/preview_mockup.svg";
import Productpreview from "../../routes/assets/product_sample.png";
import deletedIcon from "../../routes/assets/deleted.svg";
import AddProduct from "../BuyComponents/AddProduct";
import DeletePopup from "../DeletePopup/Deletepopup";
import { Form } from "@remix-run/react";
import { toast as notify } from "sonner";

const BundleModal = ({
  onNext,
  products,
  actionResponse,
  setId,
  id,
  setCompletedStep,
  setActiveTab,
}) => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProduct, setIsProduct] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState("Ready To Increase");
  const [discount, setDiscount] = useState("Percentage");
  const [modal, setModal] = useState(false);

  const [productSections, setProductSections] = useState([{ id: 1 }]);

  const [values, setValues] = useState({
    bundle_name: "",
    displayBundle: "Bundle Product Pages",
    amount: "",
  });

  const addProductSection = () => {
    setProductSections((prevSections) => [
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

  const handleDelete = () => {
    setFile(null);
    setImagePreview(null);
  };

  useEffect(() => {
    if (actionResponse?.step === "first") {
      if (actionResponse?.status === 200) {
        notify.success(actionResponse?.message, {
          position: "top-center",
          style: {
            background: "green",
            color: "white",
          },
        });
        setActiveTab("Offer");
        setCompletedStep(1);
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
            <div>
              <Form method="POST">
                <div className={styles.leftContent}>
                  <h3>
                    Ready To Increase AOV?
                    <br></br>
                    <span>Select Products To Bundle</span>
                  </h3>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="bundle_name">Name your bundle</label>
                    <input
                      type="text"
                      id="bundle_name"
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

                  {productSections.map((section, index) => (
                    <div
                      className={styles.input_labelCustomize}
                      key={section.id}
                    >
                      <label htmlFor="">Select Product {index + 1}</label>
                      <div className={styles.input_labelCustomize}>
                        <label
                          htmlFor="file-upload"
                          style={{ cursor: "pointer", color: "blue" }}
                          className={styles.inputUpload}
                          onClick={() => setIsProduct(true)}
                        >
                          <span>+</span>Add Product
                        </label>
                        {file && <p> {file.name}</p>}
                        {imagePreview && (
                          <div className={styles.images_upload}>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "300px",
                                objectFit: "contain",
                              }}
                            />
                            <div className={styles.image_name}>
                              <h4>14K Gold Necklace</h4>
                              <button
                                onClick={handleDelete}
                                className={styles.deletedBtn}
                              >
                                <img src={deletedIcon} width={20} height={20} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className={styles.Addanotherdiv}>
                    <label
                      htmlFor="addProduct"
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      <span onClick={addProductSection}>+</span>Add Product
                    </label>
                  </div>

                  <div className={styles.input_labelCustomize}>
                    <label htmlFor="">Where to display bundle</label>
                    <div className={styles.bundle_product}>
                      <input
                        type="radio"
                        name="displayBundle"
                        id="first"
                        value="Bundle Product Pages"
                        checked={
                          values.displayBundle === "Bundle Product Pages"
                        }
                        onChange={handleChange}
                      />
                      <label htmlFor="first">Bundle Product Page(s)</label>
                    </div>

                    <div className={styles.bundle_product}>
                      <input
                        type="radio"
                        name="second"
                        id="specific_Product"
                        value="Specific Products Pages"
                        checked={
                          values.displayBundle === "Specific Products Pages"
                        }
                        onChange={handleChange}
                      />
                      <label htmlFor="second">Specific product page</label>
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
                              <img src={DorpDownIcon} width={20} height={16} />
                            </div>
                          </div>
                          <ul
                            className={styles.selectDropdown}
                            style={{ display: "none" }}
                          >
                            <li data-value="option1">Option 1</li>
                            <li data-value="option2">Option 2</li>
                            <li data-value="option3">Option 3</li>
                            <li data-value="option4">Option 4</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.Margintop50}>
                    <button
                      type="submit"
                      name="intent"
                      value="firstStep"
                      className={styles.NextBtn}
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

        {modal && <DeletePopup />}
      </div>

      {isProduct && (
        <AddProduct onClose={() => setIsProduct(false)} products={products} />
      )}
    </>
  );
};

export default BundleModal;
