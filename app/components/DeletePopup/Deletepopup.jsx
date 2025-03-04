import React, { useEffect } from "react";
import styles from "../../styles/main.module.css";
import Loader from "../Loader/Loader";
// import infoImage from "../../routes/assets/infoImage.png";
// import AddGradient from "../../routes/assets/AddGradient.png";
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
};

const DeletePopup = ({ setShowPopup,state }) => {


  return (
    <div className={styles.modal_overlay}>
      <div className={` ${styles.modal_content} ${styles.deletePop} `}>
        <div className={styles.deletPopup}>
          <div className={styles.deletIcon}>
            <svg
              width="30"
              height="33"
              viewBox="0 0 24 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M18.0375 3.77704V4.06497C19.2496 4.17592 20.4516 4.32183 21.6426 4.50169C22.0835 4.56828 22.5229 4.63953 22.9608 4.71538C23.479 4.80513 23.8262 5.29794 23.7365 5.81608C23.6467 6.33423 23.1539 6.68151 22.6358 6.59176C22.5474 6.57645 22.459 6.56134 22.3705 6.54642L21.094 23.1401C20.9414 25.1244 19.2868 26.6566 17.2966 26.6566H7.35243C5.36227 26.6566 3.70764 25.1244 3.555 23.1401L2.27857 6.54642C2.19007 6.56134 2.10164 6.57645 2.01327 6.59176C1.49512 6.68151 1.00232 6.33423 0.912565 5.81609C0.82281 5.29794 1.17009 4.80513 1.68824 4.71538C2.1261 4.63953 2.56554 4.56828 3.0065 4.50169C4.19746 4.32183 5.39949 4.17592 6.61156 4.06497V3.77704C6.61156 1.79087 8.15093 0.0953502 10.1859 0.0302536C10.896 0.0075373 11.609 -0.00390625 12.3245 -0.00390625C13.0401 -0.00390625 13.753 0.0075373 14.4632 0.0302536C16.4981 0.0953503 18.0375 1.79087 18.0375 3.77704ZM10.2468 1.9336C10.9366 1.91153 11.6293 1.90042 12.3245 1.90042C13.0198 1.90042 13.7124 1.91153 14.4023 1.9336C15.3603 1.96425 16.1332 2.7687 16.1332 3.77704V3.92004C14.8733 3.84354 13.6034 3.80474 12.3245 3.80474C11.0457 3.80474 9.77573 3.84354 8.51588 3.92004V3.77704C8.51588 2.7687 9.28875 1.96425 10.2468 1.9336ZM9.79635 9.48111C9.77614 8.95563 9.33377 8.54604 8.8083 8.56625C8.28282 8.58646 7.87322 9.02882 7.89343 9.5543L8.33289 20.9802C8.3531 21.5057 8.79547 21.9153 9.32094 21.8951C9.84642 21.8749 10.256 21.4325 10.2358 20.907L9.79635 9.48111ZM16.7544 9.5543C16.7747 9.02882 16.3651 8.58646 15.8396 8.56625C15.3141 8.54604 14.8717 8.95563 14.8515 9.48111L14.4121 20.907C14.3919 21.4325 14.8015 21.8749 15.3269 21.8951C15.8524 21.9153 16.2948 21.5057 16.315 20.9802L16.7544 9.5543Z"
                fill="#F24747"
              />
            </svg>
          </div>

          <h2>
          Are You Sure You Want To Delete Bundle?
          </h2>

          <p>
          This action cannot be undone
          </p>
          <div className={`${styles.addBtn} ${styles.textEnd} `}>
            <button className={styles.Backbtn} type="button" onClick={() => setShowPopup(false)}>
            Cancel
            </button>

            {console.log(state, 'state see')}

            <button className={styles.NextBtn} type="submit">
            {state == "submitting" ? <Loader /> :  "Delete Bundle"}
            </button>
          </div>
        </div>
      </div>
   
    </div>
  );
};

export default DeletePopup;
