
import React from "react";
import styles from '../../styles/main.module.css'
import searchImg from '../../routes/assets/searchImg@.svg'
import Search from "../Search/Search";
import { Form } from "@remix-run/react";
import { useState } from "react";

const AddProduct = ({ onClose, products , selectProduct, setSelectedPrducts, handleSave}) => {


  console.log(selectProduct,'selectproduct')


  const handleParentCheckBox = (e, product, variants) => {
    const isSelected = e.target.checked;
    const productId = product.node.id;
  
    setSelectedPrducts((prev) => {
      const isAlreadySelected = prev.some((item) => item.productId === productId);
  
      if (isSelected) {
        if (isAlreadySelected) {
       
          return prev.filter((item) => item.productId !== productId);
        }
        
        return [...prev, { productId }];
      } else {
        console.log('Unchecking:', productId);
        return prev.filter((item) => item.productId !== productId);
      }
    });
  };
  

  // const handleChildCheckBox = (e, productId, variantId) => {
  //   const isSelected = e.target.checked;

  //   setSelectedPrducts((prev) => {
  //     const updatedProducts = [...prev];
  //     const productIndex = updatedProducts.findIndex((p) => p.productId === productId);

  //     if (productIndex > -1) {
  //       const product = updatedProducts[productIndex];

  //       if (isSelected) {
  //         product.variants.push(variantId);
  //       } else {
  //         product.variants = product.variants.filter((id) => id !== variantId);
  //         if (product.variants.length === 0) {
  //           updatedProducts.splice(productIndex, 1);
  //         }
  //       }
  //     } else if (isSelected) {
  //       updatedProducts.push({ productId, variants: [variantId] });
  //     }

  //     return updatedProducts;
  //   });
  // };


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
                        checked={selectProduct.some((check) => check.productId === item.node.id)}
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

                  
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className={`${styles.addBtn} ${styles.textEnd}`}>
          <button type="button" onClick={onClose}  className={styles.Backbtn}>
            Cancel
          </button>
          <button type="button" onClick={handleSave}  className={styles.NextBtn} >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
