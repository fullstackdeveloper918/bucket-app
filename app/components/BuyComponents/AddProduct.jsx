import React, { useState } from "react";
import styles from "../../styles/main.module.css";
import searchImg from "../../routes/assets/searchImg@.svg";

const AddProduct = ({
  onClose,
  products,
  currentIndex,
  sectionProduct,
  setSectionProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState("");


  console.log(currentIndex, 'currentIndex');
  console.log(sectionProduct, 'sectionProduct');
  console.log(setSectionProduct, 'setSectionProduct');

  const filteredProducts = products?.filter((item) => {
    return item.node.title.toLowerCase().includes(searchQuery.toLowerCase());
  });



  const handleParentCheckBox = (e, product, variants) => {
    const isSelected = e.target.checked;
    const productId = product.node.id;

    setSectionProduct((prev) => {
      const updatedProducts = { ...prev };

      if (isSelected) {
        updatedProducts[currentIndex] = {
          productId,
          variants: variants.map((v) => v.node.id),
        };
      } else {
        delete updatedProducts[currentIndex];
      }

      console.log(updatedProducts, "updatedProducts");
      return updatedProducts;
    });
  };

  const handleChildCheckBox = (e, productId, variantId) => {
    const isSelected = e.target.checked;

  
    setSectionProduct((prev) => {
      const updatedProducts = { ...prev };
      if (!updatedProducts[currentIndex]) {
        updatedProducts[currentIndex] = { productId, variants: [] };
      }
      if (isSelected) {
        if (!updatedProducts[currentIndex].variants.includes(variantId)) {
          updatedProducts[currentIndex].variants = [
            ...updatedProducts[currentIndex].variants,
            variantId,
          ];
        }
      } else {
        updatedProducts[currentIndex].variants = updatedProducts[
          currentIndex
        ].variants.filter((id) => id !== variantId);
  
        if (updatedProducts[currentIndex].variants.length === 0) {
          delete updatedProducts[currentIndex];
        }
      }
      
      return updatedProducts;
    });
  };
  

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={`${styles.modal_overlay} ${styles.productModal}`}>
      <div className={styles.modal_content}>
        <h3>Add Product</h3>
        <div className={styles.search_select}>
          <div className={styles.search_images}>
            <img src={searchImg} width={20} height={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <ul className={styles.addProductlist}>
          {filteredProducts?.map((item, index) => {
            const productId = item.node.id;
            const variants = item.node.variants.edges;

            return (
              <React.Fragment key={index}>
                <li>
                  <div className={styles.addPrducttab}>
                    <div className={styles.formGroup}>
                      <input
                        type="checkbox"
                        id={item.node.id}
                        name="Parent"
                        value={productId}
                        // checked={isAllVariantsSelected(productId, variants)}
                        onChange={(e) =>
                          handleParentCheckBox(e, item, variants)
                        }
                      />
                      <label htmlFor={item.node.id}></label>
                    </div>
                    <div className={`${styles.formGroup} ${styles.variantTab}`}>
                      <img
                        src={item.node.images?.edges[0]?.node?.src}
                        alt="Product Image"
                      />
                      <div className={styles.modalHeading}>
                        <span>{item.node.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.productbyx}>
                    {variants.map((variant, photoIndex) => {
                      const variantId = variant.node.id;

                      return (
                        <React.Fragment key={photoIndex}>
                          <div className={styles.formGroup}>
                            <input
                              type="checkbox"
                              name={`Child-${productId}`}
                              id={variantId}
                              value={variantId}
                              checked={
                                sectionProduct[currentIndex]?.variants.includes(
                                  variantId,
                                ) || false
                              }
                              onChange={(e) =>
                                handleChildCheckBox(e, productId, variantId)
                              }
                            />
                            <label htmlFor={variantId}></label>
                            <span className={styles.variantHeadimg}>
                              {variant.node.title}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className={`${styles.addBtn} ${styles.textEnd}`}>
          <button type="button" onClick={onClose} className={styles.Backbtn}>
            Cancel
          </button>
          <button type="button" className={styles.NextBtn}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
