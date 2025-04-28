import React, { useState } from "react";
import styles from "../../styles/main.module.css";
import searchImg from "../../routes/assets/searchImg@.svg";
import { Toaster, toast as notify } from "sonner";

const AddProduct = ({
  onClose,
  products,
  currentIndex,
  sectionProduct,
  setSectionProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on the search query
  const filteredProducts = products?.filter((item) => {
    return item.node.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Check if the product already exists in the section
  const isProductAlreadyAdded = (productId) => {
    return Object.values(sectionProduct).some(
      (item) => item.productId === productId
    );
  };

  const handleParentCheckBox = (e, product, variants) => {
    const isSelected = e.target.checked;
    const productId = product.node.id;
    console.log("error nee222")

    // Prevent adding the product if it already exists
    if (isSelected && isProductAlreadyAdded(productId)) {
      console.log("Product already added");
      notify.success("This product has already been added. Please select a different product.", {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
          position:'absolute',
          zIndex:"999"
        },
      });
      return;
    }
    console.log("error nee11")
  
    setSectionProduct((prev) => {
      const updatedProducts = { ...prev };
  
      if (isSelected) {

        updatedProducts[currentIndex] = {
          productId,
          variants: variants.map((v) => v.node.id),
          price: variants.reduce((acc, v) => acc + parseFloat(v.node.price || 0), 0),
          titles: variants.map((v) => v.node.title),
          images: variants.map((v) => v.node.image || product.node.images?.edges[0]?.node?.src),
        };
      } else {
        console.log("error neee")
        // Remove the product by its index when unchecked
        const { [currentIndex]: removedProduct, ...rest } = updatedProducts;
        return rest; // Return a new object without the removed product
      }
  
      return updatedProducts;
    });
  };
  
  
  const handleChildCheckBox = (e, productId, variantId, variant, item) => {
    const isSelected = e.target.checked;
  
    setSectionProduct((prev) => {
      const updatedProducts = { ...prev };
  
      if (!updatedProducts[currentIndex]) {
        updatedProducts[currentIndex] = { productId, variants: [], price: 0, titles: [], images: [] };
      }
  
      const currentProduct = updatedProducts[currentIndex];
  
      if (isSelected) {
        if (!currentProduct.variants.includes(variantId)) {
          currentProduct.variants.push(variantId);
          currentProduct.titles.push(variant.node.title);
          currentProduct.price += parseFloat(variant.node.price || 0);
          const imageSrc = variant.node.image || item.node.images?.edges[0]?.node?.src;
          currentProduct.images.push(imageSrc);
        }
      } else {
        currentProduct.variants = currentProduct.variants.filter(
          (id) => id !== variantId
        );
        currentProduct.titles = currentProduct.titles.filter(
          (title) => title !== variant.node.title
        );
        currentProduct.price -= parseFloat(variant.node.price || 0);
  
        if (currentProduct.variants.length === 0) {
          delete updatedProducts[currentIndex];
        }
      }
  
      updatedProducts[currentIndex] = { ...currentProduct };
      return updatedProducts;
    });
  };
  

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
    <Toaster />

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
          {filteredProducts && filteredProducts?.map((item, index) => {
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
                          onChange={(e) =>
                            handleParentCheckBox(e, item, variants)
                          }
                          // disabled={isProductAlreadyAdded(productId)} // Disable checkbox if product is already added
                          checked={sectionProduct[currentIndex]?.productId === productId} // Ensure checkbox reflects correct state
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
                    {variants && variants.map((variant, photoIndex) => {
                      const variantId = variant.node.id;

                      return (
                        <React.Fragment key={photoIndex}>
                          <div className={styles.formGroup}>
                            <input
                              type="checkbox"
                              name={`Child-${productId}`}
                              id={variantId}
                              value={variantId}
                              checked={sectionProduct[currentIndex]?.variants.includes(variantId) || false}
                              onChange={(e) =>
                                handleChildCheckBox(e, productId, variantId, variant, item)
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
          <button type="button" onClick={onClose} className={styles.NextBtn}>
            Save
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddProduct;
