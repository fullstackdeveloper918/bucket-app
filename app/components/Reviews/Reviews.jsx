import React, { lazy, Suspense, useState } from "react";
import styles from "../Reviews/Reviews.module.css";
const Modal = lazy(() => import("../Modal/Modal"));

import Search from "../../components/Search/Search";
import ImportIcon from "../../routes/assets/import.svg";
import edit_icon from "../../routes/assets/edit_icon.svg";
import activeEdit from "../../routes/assets/activeEdit.png";
import searchImg from "../../routes/assets/searchImg@.svg";
import deletedIcon from "../../routes/assets/deleted.svg";
import { Form, useFetcher } from "@remix-run/react";

const Reviews = ({ productReviews }) => {
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const fetcher = useFetcher();
  const [reviews, setRevies] = useState([]);
  const [activeSelect, setActiveSelect] = useState("Newest");
  const [sort, setSort] = useState(false);

  const handleEditClick = (productId) => {
    setEdit(!edit);
    const data = fetcher.load(`?productId=${productId}`);
  };

  const handleSelect = (item) => {
    setActiveSelect(item);
    setSort(false);
  };

  return (
    <>
      <div className={styles.table_content}>
        <div className={styles.search_select}>
          <div className={styles.search_images}>
            <Search />
            <img src={searchImg} width={20} height={20} />
          </div>
          {/* <div className={styles.selectDiv}>
            <label>Short by :</label>
            <select name="" id="">
              <option value="newest">Newest</option>
              <option value="old">Old</option>
            </select>
          </div> */}
          <div
            className={` ${styles.activeButton} ${styles.sortBy} `}
            id="second"
            onClick={() => setShowProducts(true)}
          >
            <div className={styles.butttonsTab} onClick={() => setSort(!sort)}>
              <span className={styles.selected}>
                Sort by : <b>{activeSelect}</b>
              </span>
              <div className={styles.arrowActive}>
                <svg
                  width="15"
                  height="8"
                  viewBox="0 0 22 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.441 11.441C11.0594 11.8227 10.4406 11.8227 10.059 11.441L0.286236 1.66831C-0.0954121 1.28666 -0.0954121 0.667886 0.286236 0.286238C0.667886 -0.0954117 1.28666 -0.0954117 1.66831 0.286238L10.75 9.36793L19.8317 0.286237C20.2133 -0.0954123 20.8321 -0.0954124 21.2138 0.286237C21.5954 0.667885 21.5954 1.28666 21.2138 1.66831L11.441 11.441Z"
                    fill="#0F172A"
                  />
                </svg>
              </div>
            </div>
            {sort && (
              <ul className={styles.selectDropdown} >
                <li
                  data-value="option1"
                  onClick={() => handleSelect("Newest")}
                >
                  Sort by : <b>Newest</b>
                </li>
                <li
                  data-value="option2"
                  onClick={() => handleSelect("Oldest")}
                >
                  Sort by : <b>Oldest</b>
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className={styles.table_review} style={{ width: "100%" }}>
          <div className={styles.tableWarpper}>
            <table>
              <thead>
                <tr>
                  <th>Images</th>
                  {edit ? (
                    <>
                      <th>Rating</th>
                      <th>Content</th>
                    </>
                  ) : (
                    <>
                      <th>Product Name</th>
                      <th>Reviews #</th>
                    </>
                  )}
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {edit
                  ? fetcher?.data?.singleReviews?.reviews.map((item) => (
                      <React.Fragment>
                        {console.log(item, "item")}
                        <tr>
                          <td>
                            <img
                              src="https://archive.org/download/placeholder-image/placeholder-image.jpg"
                              width={60}
                              height={60}
                            />
                          </td>
                          <td>{item?.rating}*</td>
                          <td>{item?.userName}</td>
                          <td>
                            <div className={styles.buttonFlexer}>
                              <label className={styles.switch}>
                                <input type="checkbox" />
                                <span className={styles.slider}></span>
                              </label>

                              <Form method="DELETE">
                                <button
                                  name="reviewId"
                                  value={item?.id}
                                  className={styles.deletedBtn}
                                >
                                  {/* <img
                                    src={deletedIcon}
                                    width={20}
                                    height={20}
                                  /> */}
                                  <svg
                                    width="16"
                                    height="18"
                                    viewBox="0 0 18 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M12.8573 2.83637V3.05236C13.7665 3.13559 14.6683 3.24505 15.5617 3.37998C15.8925 3.42994 16.2221 3.48338 16.5506 3.54028C16.9393 3.60761 17.1998 3.9773 17.1325 4.366C17.0652 4.7547 16.6955 5.01522 16.3068 4.94789C16.2405 4.93641 16.1741 4.92507 16.1078 4.91388L15.1502 17.362C15.0357 18.8506 13.7944 20 12.3015 20H4.84161C3.34865 20 2.10739 18.8506 1.99289 17.362L1.03534 4.91388C0.968948 4.92507 0.902608 4.93641 0.836318 4.94789C0.447617 5.01522 0.07793 4.7547 0.0105981 4.366C-0.0567338 3.9773 0.203787 3.60761 0.592487 3.54028C0.920962 3.48338 1.25062 3.42994 1.58141 3.37998C2.47484 3.24505 3.37657 3.13559 4.28583 3.05236V2.83637C4.28583 1.34639 5.44062 0.0744596 6.9672 0.0256258C7.49992 0.00858464 8.03474 0 8.57155 0C9.10835 0 9.64318 0.00858464 10.1759 0.0256258C11.7025 0.0744596 12.8573 1.34639 12.8573 2.83637ZM7.01287 1.45347C7.53037 1.43691 8.04997 1.42857 8.57155 1.42857C9.09312 1.42857 9.61272 1.43691 10.1302 1.45347C10.8489 1.47646 11.4287 2.07994 11.4287 2.83637V2.94364C10.4836 2.88625 9.53092 2.85714 8.57155 2.85714C7.61217 2.85714 6.65951 2.88625 5.7144 2.94364V2.83637C5.7144 2.07994 6.29419 1.47646 7.01287 1.45347ZM6.67497 7.11541C6.65981 6.72121 6.32796 6.41394 5.93376 6.4291C5.53957 6.44426 5.2323 6.77611 5.24746 7.17031L5.57713 15.7417C5.59229 16.1359 5.92414 16.4432 6.31834 16.428C6.71254 16.4129 7.01981 16.081 7.00464 15.6868L6.67497 7.11541ZM11.8948 7.17031C11.9099 6.77611 11.6026 6.44426 11.2084 6.4291C10.8143 6.41394 10.4824 6.72121 10.4672 7.11541L10.1376 15.6868C10.1224 16.081 10.4297 16.4129 10.8239 16.428C11.2181 16.4432 11.5499 16.1359 11.5651 15.7417L11.8948 7.17031Z"
                                      fill="#F24747"
                                    />
                                  </svg>
                                </button>
                              </Form>
                            </div>
                          </td>

                          <td>
                            <div className="editbuttons">
                              <button
                                style={{ cursor: "pointer" }}
                                onClick={() => handleEditClick(item.productId)}
                                className={edit ? styles.importBtn : ""}
                              >
                                <img
                                  src={edit ? activeEdit : edit_icon}
                                  width={14}
                                  height={14}
                                  // className={styles.EditBtnwraper}
                                />{" "}
                                <span
                                  className={edit ? styles.gradientText : ""}
                                >
                                  Edit
                                </span>
                              </button>
                            </div>
                          </td>

                          <td className={styles.ImportBtnwraper}>
                            {edit ? (
                              ""
                            ) : (
                              <button
                                style={{ cursor: "pointer" }}
                                onClick={() => setShow(true)}
                                className={styles.importBtn}
                              >
                                <img src={ImportIcon} width={15} height={21} />
                                <span className={styles.gradientText}>
                                  import
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  : productReviews.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td>
                            <img
                              src="https://img.freepik.com/premium-psd/locket-isolated-transparent-background_191095-29173.jpg?w=826"
                              width={73}
                              height={73}
                            />
                          </td>
                          <td>{item?.productName}</td>
                          <td>{item?.totalReviews}</td>
                          <td>
                            {edit && (
                              <div className={styles.buttonFlexer}>
                                <label className={styles.switch}>
                                  <input type="checkbox" />
                                  <span className={styles.slider}></span>
                                </label>
                              </div>
                            )}
                          </td>

                          <td>
                            <button
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEditClick(item.productId)}
                              className={edit ? styles.importBtn : ""}
                            >
                              <img
                                src={edit ? activeEdit : edit_icon}
                                width={14}
                                height={14}
                              />{" "}
                              <span className={edit ? styles.gradientText : ""}>
                                Edit
                              </span>
                            </button>
                          </td>

                          <td>
                            {edit ? (
                              ""
                            ) : (
                              <button
                                style={{ cursor: "pointer" }}
                                onClick={() => setShow(true)}
                                className={styles.importBtn}
                              >
                                <img src={ImportIcon} width={15} height={21} />
                                <span className={styles.gradientText}>
                                  {" "}
                                  import
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
              </tbody>
            </table>
            {productReviews.length > 1 && (
              <div className={styles.paginationFlex}>
                <p>Showing 1 of 8 pages</p>

                <div className={styles.pagination}>
                  <a
                    href="#"
                    className={`${styles.prev} ${styles.marginGiven}`}
                    aria-label="Previous"
                  >
                    «
                  </a>
                  <a
                    href="#"
                    className={`${styles.prev} ${styles.active}`}
                    aria-label="Page 1"
                  >
                    1
                  </a>
                  <a href="#" className={styles.prev} aria-label="Page 2">
                    2
                  </a>
                  <a href="#" className={styles.prev} aria-label="Page 3">
                    3
                  </a>
                  <a
                    href="#"
                    className={`${styles.prev} ${styles.dot}`}
                    aria-label="Page 3"
                  >
                    ....
                  </a>
                  <a href="#" aria-label="Page 3">
                    8
                  </a>
                  <a
                    href="#"
                    className={`${styles.next} ${styles.marginGiven}`}
                    aria-label="Next"
                  >
                    »
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {show && (
        <Suspense fallback={<p>Loading...</p>}>
          <Modal onClose={() => setShow(false)} />
        </Suspense>
      )}

      {/* fetcher?.data?.singleReviews?.reviews */}
    </>
  );
};

export default Reviews;
