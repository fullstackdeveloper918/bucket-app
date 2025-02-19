
import styles from './Skelton.module.css';

const RequestSkelton = () => {
  return (
    <>
      <div className={styles.table_content}>
      <div className={`${styles.requestReview} ${styles.skeleton}`}>
        <div>
          <div className={styles.heading_img}>
            <div className={styles.skeleton_box}></div>
            <div className={styles.skeleton_button}></div>
          </div>
          <div className={styles.skeleton_line}></div>
        </div>
        <div className={styles.timing_after}>
          <div>
            <div className={styles.skeleton_label}></div>
            <div className={styles.inputTiming}>
              <div className={styles.skeleton_input}></div>
              <span className={styles.inputDays}></span>
            </div>
          </div>
          <div>
            <div className={styles.skeleton_label}></div>
            <div className={styles.active_tabs}>
              <div className={styles.skeleton_button}></div>
              <div className={styles.skeleton_button}></div>
            </div>
          </div>
        </div>
        <div className={styles.customizeEmail}>
          <div className={styles.left_content}>
            <div>
              <div className={styles.skeleton_label}></div>
            </div>
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className={styles.skeleton_input}></div>
            ))}
          </div>
          <div className={styles.right_content}>
            <div className={styles.livePre}>
              <div className={styles.skeleton_button}></div>
            </div>
            <div className={styles.product_title}>
              <div className={styles.skeleton_image}></div>
              <div>
                <div className={styles.skeleton_line}></div>
                <div className={styles.skeleton_line}></div>
              </div>
            </div>
            <div className={styles.review_tabs}>
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className={styles.reviewAdd}>
                  <div className={styles.skeleton_radio}></div>
                  <div className={styles.starIcon}>
                    {[...Array(idx + 1)].map((__, starIdx) => (
                      <div key={starIdx} className={styles.skeleton_star}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default RequestSkelton