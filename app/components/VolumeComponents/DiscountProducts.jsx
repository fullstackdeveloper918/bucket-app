
import React from "react";
import styles from '../../styles/main.module.css'
import searchImg from '../../routes/assets/searchImg@.svg'
import Search from "../Search/Search";
import { Form } from "@remix-run/react";
import { useState } from "react";

const DiscountPoducts = ({ onClose, products }) => {

  const [selectedProducts, setSelectedProducts] = useState([]);
  const handleParentCheckBox = (e, product, variants) => {
    const isSelected = e.target.checked;
    const productId = (product.node.id);
    const variantIds = variants.map((variant) => (variant.node.id));

    setSelectedProducts((prev) => {
      if (isSelected) {
        return [...prev, { productId, variants: variantIds }];
      } else {
        return prev.filter((item) => item.productId !== productId);
      }
    });
  };

  const handleChildCheckBox = (e, productId, variantId) => {
    const isSelected = e.target.checked;

    setSelectedProducts((prev) => {
      const updatedProducts = [...prev];
      const productIndex = updatedProducts.findIndex((p) => p.productId === productId);

      if (productIndex > -1) {
        const product = updatedProducts[productIndex];

        if (isSelected) {
          product.variants.push(variantId);
        } else {
          product.variants = product.variants.filter((id) => id !== variantId);
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

  const isParentChecked = (productId, variantIds) =>
    selectedProducts.some(
      (product) =>
        product.productId === productId &&
        variantIds.every((id) => product.variants.includes(id))
    );

  const isChildChecked = (variantId) =>
    selectedProducts.some((product) => product.variants.includes(variantId));

  return (
    <div className={`${styles.modal_overlay} ${styles.productModal}`}>
      <div className={styles.modal_content}>
        <h3>Add Product</h3>
        <div className={styles.search_select}>
          <div className={styles.search_images}>
            <img src={searchImg} width={20} height={20} />
            <Search />
          </div>
        </div>
        <Form method="POST">    
        <ul className={styles.addProductlist}>
          {products?.map((item, index) => {
            const productId = (item.node.id);
            const variantIds = item.node.variants.edges.map((variant) =>
              (variant.node.id)
            );

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
                        checked={isParentChecked(productId, variantIds)}
                        onChange={(e) =>
                          handleParentCheckBox(e, item, item.node.variants.edges)
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
                    {item.node.variants.edges.map((variant, photoIndex) => {
                      const variantId = (variant.node.id);
                      return (
                        <React.Fragment key={photoIndex}>
                          <div className={styles.formGroup}>
                            {console.log(`Child-${variantId}`)}
                            <input
                              type="checkbox"
                              name={`Child-${productId}`}
                              id={variantId}
                              value={variantId}
                              checked={isChildChecked(variantId)}
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
          <button  className={styles.Backbtn}>
            Cancel
          </button>
          <button  className={styles.NextBtn} name="intent" value="addProduct">
            Save
          </button>
        </div>
        </Form>
      </div>
    </div>
  );
};

export default DiscountPoducts;
