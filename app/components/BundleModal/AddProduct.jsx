
import React, { useState } from "react";
import styles from "../../styles/main.module.css";
import searchImg from "../../routes/assets/searchImg@.svg";

const AddProduct = ({
  onClose,
  products,
  productIndex,
  selectProduct,
  setSelectedPrducts,
  handleSave,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products?.filter((item) => {
    return item.node.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

// New bucket testing app
  const isAllVariantsSelected = (productId, variants) => {
    const selectedProduct = selectProduct.find(
      (selected) => selected.productId === productId
    );
    const selectedVariants = selectedProduct ? selectedProduct.variants : [];
    return variants.every((variant) => selectedVariants.includes(variant.node.id));
  };

  const handleParentCheckBox = (e, product, variants) => {
    const isSelected = e.target.checked;
    const productId = product.node.id;
  
    setSelectedPrducts((prev) => {
      const isAlreadySelected = prev.some((item) => item.productId === productId);
  
      if (isSelected) {
        if (!isAlreadySelected) {
          return [
            ...prev,
            {
              productId,
              variants: variants.map((v) => v.node.id), 
            },
          ];
        }
      } else {
        return prev.filter((item) => item.productId !== productId);
      }
  
      return prev;
    });
  };
  

  const handleChildCheckBox = (e, productId, variantId) => {
    const isSelected = e.target.checked;
  
    setSelectedPrducts((prev) => {
      const updatedProducts = [...prev];
      const productIndex = updatedProducts.findIndex(
        (p) => p.productId === productId
      );
  
      if (productIndex > -1) {
        const product = updatedProducts[productIndex];
  
        if (isSelected) {
          // Add the variant to the product if it is selected
          if (!product.variants.includes(variantId)) {
            product.variants.push(variantId);
          }
        } else {
          // Remove the variant from the product if it is unselected
          product.variants = product.variants.filter((id) => id !== variantId);
          // If no variants are left for this product, remove it from the list
          if (product.variants.length === 0) {
            updatedProducts.splice(productIndex, 1);
          }
        }
      } else if (isSelected) {
        updatedProducts.push({ productId, variants: [variantId] });
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
                        checked={isAllVariantsSelected(productId, variants)}
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
                              checked={selectProduct
                                .find((item) => item.productId === productId)
                                ?.variants.includes(variantId) || false}
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
          <button type="button" onClick={handleSave} className={styles.NextBtn}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
