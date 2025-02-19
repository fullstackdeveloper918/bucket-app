import React, { useState } from "react";
import styles from "../../styles/main.module.css";
import infoImage from "../../routes/assets/infoImage.png";
import AddGradient from "../../routes/assets/AddGradient.png";
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
};

const Modal = ({ onClose }) => {
  const [launch, setLaunch] = useState("launch");
  return (
    <div className={styles.modal_overlay}>
      {launch === "launch" && (
        <div className={styles.modal_content}>
          <h3>Import Reviews</h3>
          <div className={styles.modalHeading}>
            <img
              src="https://img.freepik.com/premium-psd/locket-isolated-transparent-background_191095-29173.jpg?w=826"
              width={60}
              height={60}
            />
            <span>Necklace 14k</span>
          </div>
          <div className={styles.gridBox}>
            <div className={styles.timing_after}>
              <div className={styles.input_labelCustomize}>
                <label htmlFor="">Product URL</label>
                <input type="text" placeholder="Insert URL" />
              </div>
            </div>
            <div className={styles.timing_after}>
              <div>
                <label>Import From</label>
                <select className={styles.select_box}>
                  <option value="1" selected>
                    Aliexpress
                  </option>
                  <option value="2">Amazon</option>
                  <option value="3">Temu</option>
                </select>
              </div>
            </div>

            <div className={styles.timing_after}>
              <div>
                <label>Number of imports</label>
                <select className={styles.select_box}>
                  <option value="1" selected>
                    5
                  </option>
                  <option value="2">10</option>
                  <option value="3">20</option>
                  <option value="3">30</option>
                  <option value="3">50</option>
                  <option value="3">100</option>
                  <option value="3">200</option>
                  <option value="3">300</option>
                  <option value="3">400</option>
                  <option value="3">500</option>
                </select>
              </div>
            </div>

            <div className={styles.timing_after}>
              <div>
                <label>Content Types</label>
                <select className={styles.select_box}>
                  <option value="1" selected>
                    All reviews
                  </option>
                  <option value="2">Photo Reviews only</option>
                  <option value="3">Text Reviews only</option>
                </select>
              </div>
            </div>

            <div className={styles.timing_after}>
              <div>
                <label>Status</label>
                <select className={styles.select_box}>
                  <option value="1" selected>
                    Published
                  </option>
                  <option value="2">Unpublished</option>
                </select>
              </div>
            </div>

            <div className={styles.timing_after}>
              <div>
                <label htmlFor="">Reviewer Country</label>
                <select className={styles.select_box}>
                  <option value="1" selected>
                    All
                  </option>
                  {/* <option value="2">Unpublished</option> */}
                </select>
              </div>
            </div>
          </div>
          <div className={styles.timing_after}>
            <div className={styles.formGroup}>
              <input type="checkbox" id="html" />
              <label for="html">
                {" "}
                I confirm that I either own the imported reviews or have
                permission to use them
              </label>
            </div>
          </div>
          <div className={`${styles.addBtn} ${styles.textEnd}`}>
            <button onClick={onClose} className={styles.Backbtn}>
              Cancel
            </button>
            <button
              onClick={() => setLaunch("reviewer")}
              className={styles.NextBtn}
            >
              Launch
            </button>
          </div>
        </div>
      )}

      {launch === "reviewer" && (
        <div className={styles.modal_content}>
          <div className={styles.left_content}>
          <div className={styles.ai_review}>
            <img src={infoImage} alt="img template" width={30} height={30} />
            <div>
              <p>
                All review edits must follow Shopify's policy Article 7
                <strong style={{textDecoration:"underline"}}> Shopify's Policy </strong> . Edits should not change the review's original
                meaning and must maintain transparency and the integrity of the
                source. Make sure you comply with the following instructions
              </p>
              <ul>
                <li>
                  <span>Allowed:</span> Corrections of typos or grammatical
                  mistakes
                </li>
                <li>
                  <span>Allowed:</span> Adjustments to improve translated
                  language
                </li>
                <li>
                  <span>Allowed:</span> Updates to review information as
                  requested by reviewers
                </li>
                <li>
                  <span>NOT Allowed:</span> Modifying star rating
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.ai_review_check}>
            <div className={styles.formGroup}>
              <input type="checkbox" id="save" checked />
              <label for="save">Pin review to the top of the page</label>
            </div>
          </div>
          <div className={`${styles.timing_after} ${styles.maxWidth}`}>
            <div className={styles.input_labelCustomize}>
              <label htmlFor="">Reviewer Name</label>
              <input
                type="text"
                name="customerReviews"
                placeholder="John Doe"
                value="John Doe"
              />
            </div>
          </div>
          <div>
            <label htmlFor="">Reviewer Name</label>
          </div>
          <div className={styles.timing_after} style={{margin:"0"}}>
            <div className={styles.modalTextarea}>
              <textarea
                name=""
                id=""
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing..."
              ></textarea>
            </div>
          </div>
          <div>
            <label htmlFor="">Reviewer Name</label>
          </div>
          <div>
            {/* <label htmlFor="photo">
              <input type="file" name="" id="" />
            </label> */}
            <div className={styles.addPhotoContainer}>
  <input type="file" id="photoInput" accept="image/*"  />
  <div className={styles.addPhotoButton}>
    <span><img src={AddGradient} alt="add" width={30} height={30} /></span>
    <p>Add Photo</p>
  </div>
</div>
          </div>
          </div>

          <div className={`${styles.addBtn} ${styles.textEnd}`}>
            <button onClick={onClose} className={styles.Backbtn}>
              Cancel
            </button>
            <button
              onClick={() => setLaunch("reviewer")}
              className={styles.NextBtn}
            >
              Launch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
