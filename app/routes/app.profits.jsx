import React, { useState } from "react";
import styles from "../styles/main.module.css";
import arrowIcon from "../../app/routes/assets/backarrow.png";
import arrowActive from "../../app/routes/assets/arrowActive.png";
import { Text } from "@shopify/polaris";
//import ImportIcon from "../../routes/assets/import.svg";
import searchImg from "../../app/routes/assets/searchImg@.svg";
import AddProduct from "../components/BuyComponents/AddProduct";
import collectedIcon from "../../app/routes/assets/collected_icon.png";
import replay from "../../app/routes/assets/replay.png";
import playlistIcon from "../../app/routes/assets/playlistIcon.png";
import videoImgplayer from "../../app/routes/assets/videoImgplayer.png";
import forward from "../../app/routes/assets/forward.png";
import pause from "../../app/routes/assets/pause.png";
import nextPlay from "../../app/routes/assets/nextPlay.png";
import notFound from "../../app/routes/assets/notFound.png";
import maximiz from "../../app/routes/assets/maximize.png";
// import Search from "app/components/Search/Search";
import Search from "../components/Search/Search";
import EnableModal from "../components/EnabelModal/EnableModal";


export default function ProfitsPage() {
  const [isProduct, setIsProduct] = useState(false);
  const [show, setShow] = useState('visitor');
  const [isModal, setIsModal] = useState(false);

  const [activeApp, setActiveApp] = useState("Active");
  const [active, setActive] = useState(false);

  const handleActive = (item) => {
    setActiveApp(item);
    setActive(false);
  };

  return (
    <>
      <div className={styles.containerDiv}>
      {show === "visitor" &&  <div className={styles.flexWrapper}>
          <div className={styles.headingFlex}>
            <button className={styles.btn_Back}>
              {" "}
              <img src={arrowIcon} width={20} height={16} />{" "}
            </button>
            <h2>Visitors Replay</h2>
          </div>
          {/* <button className={styles.activeButton}>
            Active <img src={arrowActive} width={15} height={8} />{" "}
          </button> */}
           <div
                className={` ${styles.activeButton} ${activeApp === "Inactive" ? styles.InactiveButton : ""} `}
                id="second"
                onClick={() => setActive(!active)}
              >
                <div className={styles.butttonsTab} >
                  <span className={styles.selected} >{activeApp}</span>
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
                {active && (
                  <ul className={styles.selectDropdown}>
                    <li
                      data-value="option1"
                      onClick={() => handleActive("Active")}
                    >
                      Active
                    </li>
                    <li
                      data-value="option2"
                      onClick={() => handleActive("Inactive")}
                    >
                      Inactive
                    </li>
                  </ul>
                )}
              </div>
        </div>}

       {show === "visitor" &&  <div className={styles.visitor_not_captured}>
          <h2>Visitors Replays Are NOT Captured Yet</h2>
          <p>
            Just a quick switch, enable the app in the Theme Editor to finish
            setup!
          </p>
          <div className={styles.Add_btn}>
            <button className={styles.NextBtn}  onClick={() => setIsModal(true)}>Enable Now</button>
            <button className={styles.Backbtn}>See How</button>
          </div>
        </div>}
       {show === "visitor" &&  <div className={styles.visitor_not_captured}>
          <h2>0 Recording Left In Your plan</h2>
          <p>
            You’ve hit your recording limit! No worries—here’s what you can do
            next
          </p>
          <div className={styles.Add_btn}>
            <button className={styles.NextBtn}>
              Get 5,000 Recordings For Free!
            </button>
            <button className={styles.Backbtn}>Upgrade Plan</button>
          </div>
        </div>}

      {show === "visitor" &&   <div
          className={`${styles.inline_stackwraper} ${styles.visitor_record}`}
        >
          {Array.from({ length: 3 }).map((item) => (
            <React.Fragment>
              <div className={styles.upper_box}>
                <div className={styles.PolarisBox}>
                  <div className={styles.inlineStack}>
                    <div className={styles.card_img}>
                      <img src={collectedIcon} width={33} height={40} />
                    </div>

                    <div className={styles.ContentWraper}>
                      <Text variant="headingXs" as="h6">
                        Sessions Collected
                      </Text>

                      <Text as="h3" variant="heading2xl">
                        3579
                      </Text>
                      <Text variant="headingXs" as="h6">
                        Out Of 6000
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>}

        {/* table started */}
        {show === "visitor" && <div className={styles.table_content}>
          <div className={`${styles.search_select} ${styles.recording_table}`}>
            <div className={styles.recording_heading}>
              <h2>Recordings</h2>
              <p>
                3,568 / 5,000 Recordings Left{" "}
                <span style={{ textDecoration: "underline" }}>
                  Upgrade Plan
                </span>
              </p>
            </div>

            <div className={styles.search_images}>
              <Search />
              <img src={searchImg} width={20} height={20} />
            </div>

            <div className={styles.selectDiv}>
              <label>Short by :</label>
              <select name="" id="">
                <option value="newest">Newest</option>
                <option value="old">Old</option>
              </select>
            </div>
          </div>
          <div className={styles.table_review} style={{ width: "100%" }}>
            <div className={styles.tableWarpper}>
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th style={{ textAlign: "center" }}>Date</th>
                    <th style={{ textAlign: "center" }}>Country</th>
                    <th style={{ textAlign: "center" }}>Actions Number</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 20 }).map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td>532465</td>
                        <td style={{ textAlign: "center" }}>07 Mar, 13:50</td>
                        <td style={{ textAlign: "center" }}>Israel</td>
                        <td style={{ textAlign: "center" }}>66</td>
                        <td>
                          <button
                            style={{ cursor: "pointer" }}
                            className={styles.importBtn}
                          >
                            <img src={playlistIcon} width={15} height={21} />
                            <span
                              className={styles.gradientContet}
                              onClick={() => setShow('record')}
                            >
                              {" "}
                              Play
                            </span>
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
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
            </div>
          </div>
        </div>}
   
      {show === "record" &&   <div className={styles.flexWrapper}>
          <div className={styles.headingFlex}>
            <button className={styles.btn_Back}>
              {" "}
              <img src={arrowIcon} width={20} height={16} />{" "}
            </button>
            <h2>Recordings</h2>
          </div>
        </div>}
        {show === "record" && <div className={styles.recording_page_list}>
          <div className={styles.grid_wrapper}>
            <div className={styles.play_list}>
              <ul className={styles.music_playlist}>
                <li className={styles.active}>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={playlistIcon} width={20} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li className={styles.active}>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={playlistIcon} width={20} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
                <li>
                  <h6 className={styles.date_list}>07 Mar, 13:50</h6>
                  <p className={styles.time_list}>0:58</p>
                  <img src={replay} width={26} height={20} alt="img" />
                </li>
              </ul>
            </div>


            <div className={styles.playlistView}>
              <div>
                <div className={styles.relativeDiv}>
                  <img
                    src={videoImgplayer}
                    alt="videoImgplayer"
                    className={styles.videoPlayerImg}
                  />
                </div>
              </div>

              <div className={styles.audio_player}>
                <div className={styles.controls}>
                  <div className={styles.roundSwitch}>
                    <label className={styles.switch}>
                      <input type="checkbox" />
                      <span
                        className={`${styles.slider} ${styles.round}`}
                      ></span>
                    </label>
                    <p>Skip Inactivity </p>
                  </div>

                  <div className={styles.button}>
                    <img src={forward} alt="forward" width={20} height={20} />
                  </div>
                  <div className="button">
                    <img src={pause} alt="forward" width={20} height={20} />
                  </div>
                  <div className="button">
                    <img src={nextPlay} alt="forward" width={20} height={20} />
                  </div>
                  <div className="button">
                    <img src={maximiz} alt="forward" width={20} height={20} />
                  </div>
                </div>

                <div className={styles.time}>
                  <span id="current_time">00:01</span>{" "}
                  <div className={styles.progress_bar}>
                    <div className={styles.progress}></div>
                  </div>
                  <span id="total_time">03:21</span>
                </div>
              </div>

              <div className={`${styles.audio_player} ${styles.block_player}`}>
                <h3>Session Info</h3>
                <div className={styles.session_info_Wrapper}>
                    <div className={styles.sessionContent}>
                        <h5>User</h5>
                        <p>129065</p>
                    </div>
                    <div className={styles.sessionContent}>
                        <h5>User</h5>
                        <p>129065</p>
                    </div>
                    <div className={styles.sessionContent}>
                        <h5>User</h5>
                        <p>129065</p>
                    </div>
                    <div className={styles.sessionContent}>
                        <h5>User</h5>
                        <p>129065</p>
                    </div>
                    <div className={styles.sessionContent}>
                        <h5>User</h5>
                        <p>129065</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {isProduct&& <AddProduct onClose={() => setIsProduct(false)} />}
      </div>
      {isModal && <EnableModal />}
    </>
  );
}
