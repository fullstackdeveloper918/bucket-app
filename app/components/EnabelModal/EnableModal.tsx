import React, { useState } from "react";
import styles from "../../styles/main.module.css";
import closeModal from "../../routes/assets/closeModal.png";

const EnableModal = () => {
  const [launch, setLaunch] = useState("launch");
  return (
    <div className={`${styles.modal_overlay} ${styles.enableProduct}`}>
      {launch === "launch" && (
        <div className={styles.modal_content}>
          <button className={styles.closeModalBtn} onClick={() => setLaunch('')}>
            <img src={closeModal} alt="closeModal" width={26} height={26} />
          </button>
          <div className={styles.limited}>Limited Time Offer</div>

          <h3>Share & Unlock Reward! 📣</h3>
          <p className={styles.subheading}>
            To access <strong>5,000 More Recordings</strong> - share the app with a friend! they
            install the app = you get the reward!
          </p>
          <ul className={styles.stepsModal}>
            <li>
              <div className={styles.importBtn}>
                <span className={styles.gradientContet}>1</span>
              </div>
              <div>
                <h5>Step 1</h5>
                <p>Copy your referral link</p>
              </div>
            </li>
            <li>
              <div className={styles.importBtn}>
                <span className={styles.gradientContet}>2</span>
              </div>
              <div>
                <h5>Step 2</h5>
                <p>Share the app with a friend</p>
              </div>
            </li>
            <li>
              <div className={styles.importBtn}>
                <span className={styles.gradientContet}>3</span>
              </div>
              <div>
                <h5>Step 3</h5>
                <p>They install the app - we will notify you and unlock the reward!</p>
              </div>
            </li>
          </ul>

          {/* <div className={`${styles.addBtn} ${styles.textEnd}`}> */}
          <div className={`${styles.addBtn} ${styles.cpyLink}`}>
           <div className={styles.copyLink} >Https://apps.shopify.com/example</div>
            <button
              onClick={() => setLaunch("reviewer")}
              className={styles.NextBtn}>
             Copy
            </button>
          </div>
        </div>
      )}

      {launch === "reviewer" && (
        <div className={styles.modal_content}>
          <div className={styles.left_content}>
            <div className={styles.ai_review}>
              <div>
                <p>
                  All review edits must follow Shopify's policy Article 7
                  Shopify's Policy. Edits should not change the review's
                  original meaning and must maintain transparency and the
                  integrity of the source. Make sure you comply with the
                  following instructions
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
            <div className={styles.timing_after} style={{ margin: "0" }}>
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
                <input type="file" id="photoInput" accept="image/*" />
                <div className={styles.addPhotoButton}>
                  <span></span>
                  <p>Add Photo</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.addBtn} ${styles.textEnd}`}>
            <button className={styles.Backbtn} >Cancel</button>
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

export default EnableModal;
