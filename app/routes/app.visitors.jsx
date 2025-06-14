import React, { useCallback, useEffect, useRef, useState } from "react";

import styles from "../styles/main.module.css";
import arrowIcon from "../../app/routes/assets/backarrow.png";
import db from "../db.server";
import { Text } from "@shopify/polaris";
import searchImg from "../../app/routes/assets/searchImg@.svg";
import AddProduct from "../components/BuyComponents/AddProduct";
import collectedIcon from "../../app/routes/assets/collected_icon.png";
import replay from "../../app/routes/assets/replay.png";
import NoProduct from "../../app/routes/assets/暂无消息.svg";
import playlistIcon from "../../app/routes/assets/playlistIcon.png";
import forward from "../../app/routes/assets/forward.png";
import pause from "../../app/routes/assets/pause.png";
import nextPlay from "../../app/routes/assets/nextPlay.png";
import maximiz from "../../app/routes/assets/maximize.png";
import Search from "../components/Search/Search";
import EnableModal from "../components/EnabelModal/EnableModal";
import { authenticate } from "../shopify.server";
import { Form, json, useLoaderData } from "@remix-run/react";
import ReactPlayer from "react-player";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;

    const visitorActions = await db.visitorAction.findMany({
      where: {
        domain: shop,
      },
      select: {
        id: true,
        domain: true,
        country: true,
        ipAddress: true,
        videoURL: true,
        message: true,
        userName: true,

        createdAt: true,
      },
    });

    return json(visitorActions);
  } catch (error) {
    console.error("Error fetching visitor actions:", error);
    return json(
      { message: "Failed to fetch visitor actions" },
      { status: 500 },
    );
  }
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();

  try {
    return undefined;
  } catch (error) {
    return undefined;
  }
}

const format = (seconds) => {
  if (isNaN(seconds)) {
    return `00:00`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export default function ProfitsPage() {
  const data = useLoaderData();
  const videoRef = useRef(null);

  const [isProduct, setIsProduct] = useState(false);
  const [shareReward, setShareReward] = useState(false);
  const [component, setComponent] = useState("first");
  const [show, setShow] = useState("visitor");
  const [duration, setDuration] = useState(0);

  const [videoUrl, setVideoUrl] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [details, setDetails] = useState({});
  const [state, setState] = useState({
    pip: false,
    playing: true,
    controls: false,
    light: false,

    muted: true,
    played: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1,
    loop: false,
    seeking: false,
  });
  const [isModal, setIsModal] = useState(false);

  const [activeApp, setActiveApp] = useState("Active");
  const [active, setActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filteredDatas, setFilteredDatas] = useState(data);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

    const searchResult = data.filter(
      (item) =>
        // Check all fields except videoURL
        item?.country?.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item?.message?.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item?.domain?.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item?.ipAddress?.toLowerCase().includes(e.target.value.toLowerCase()),
    );

    setFilteredDatas(searchResult);
  };

  // Handle sorting based on the selected option (newest or oldest)
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };


  // Filter and sort the data
  const filteredData = data.filter(
    (item) =>
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.videoURL.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedData = filteredData.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    if (sortBy === "newest") {
      return dateB - dateA; // Newest first
    } else {
      return dateA - dateB; // Oldest first
    }
  });

  // Pagination: Slice the sortedData to get the current page's data
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  console.log(data, "data check");
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const {
    playing,
    controls,
    light,
    muted,
    loop,
    playbackRate,
    pip,
    played,
    seeking,
    volume, } = state;

  const handleActive = (item) => {
    setActiveApp(item);
    setActive(false);
  };
  const handleProgress = (changeState) => {
    if (!state.seeking) {
      setState({ ...state, ...changeState });
    }
  };

  const handleDuration = (duration) => {
    if (duration !== Infinity && !isNaN(duration)) {
      setDuration(duration);
    } else {
      console.error("Invalid duration:", duration);
    }
  };

  const handlePlay = (item) => {
    setDetails(item);
    setComponent("second");
  };

  const handlePlayPause = () => {
    setState({ ...state, playing: !state.playing });
  };

  const handleRewind = () => {
    videoRef.current.seekTo(videoRef.current.getCurrentTime() - 2);
  };

  const handleFastForward = () => {
    videoRef.current.seekTo(videoRef.current.getCurrentTime() + 2);
  };

  const currentTime =
    videoRef && videoRef.current ? videoRef.current.getCurrentTime() : "00:00";

  const elapsedTime = format(currentTime);
  const totalDuration = format(duration);
  const handleBack = () => {
    setComponent("first");
  };

  console.log(details.videoURL,"details.videoURL")
  return (
    <>
      <div className={styles.containerDivReplay}>
        {component === "first" && (
          <>
            <div className={styles.flexWrapper}>
              <div className={styles.headingFlex}>
                <button className={styles.btn_Back}>
                  {" "}
                  <img src={arrowIcon} width={20} height={16} />{" "}
                </button>
                <h2>Visitors Replay</h2>
              </div>
              <div
                className={` ${styles.activeButton} ${activeApp === "Inactive" ? styles.InactiveButton : ""} `}
                id="second"
                onClick={() => setActive(!active)}
              >
                <div className={styles.butttonsTab}>
                  <span className={styles.selected}>{activeApp}</span>
                  <div className={styles.arrowActive}>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
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
            </div>
            <div className={styles.visitor_not_captured}>
              <h2>Visitors Replays Are NOT Captured Yet</h2>
              <p>
                Just a quick switch, enable the app in the Theme Editor to
                finish setup!
              </p>
              <div className={styles.Add_btn}>
                <button
                  className={styles.NextBtn}
                  onClick={() => setIsModal(true)}
                >
                  Enable Now
                </button>
                <button className={styles.Backbtn}>See How</button>
              </div>
            </div>

            <div className={styles.visitor_not_captured}>
              <h2>0 Recording Left In Your plan</h2>
              <p>
                You’ve hit your recording limit! No worries—here’s what you can
                do next
              </p>
              <div className={styles.Add_btn}>
                <button className={styles.NextBtn}>
                  Get 5,000 Recordings For Free!
                </button>
                <button className={styles.Backbtn}>Upgrade Plan</button>
              </div>
            </div>

            <div
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
            </div>

            <div className={styles.table_content}>
              <div
                className={`${styles.search_select} ${styles.recording_table}`}
              >
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search..."
                  />
                  <img src={searchImg} width={20} height={20} />
                </div>

                <div className={styles.selectDiv}>
                  <label>Short by :</label>
                  <select name="" id="">
                    <option onClick={(e)=>handleSortChange(e)} value="newest">Newest</option>
                    <option onClick={(e)=>handleSortChange(e)}  value="old">Old</option>
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
                      {filteredDatas.length > 0 ? (
                        filteredDatas.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td>{item?.userName || "Unknown"}</td>
                              <td style={{ textAlign: "center" }}>
                                {new Date(item?.createdAt).toLocaleDateString()}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                {item?.country}
                              </td>
                              <td style={{ textAlign: "center" }}>66</td>
                              <td>
                                <button
                                  style={{ cursor: "pointer" }}
                                  className={styles.importBtn}
                                  onClick={() => handlePlay(item)}
                                >
                                  <img
                                    src={playlistIcon}
                                    width={15}
                                    height={21}
                                  />
                                  <span className={styles.gradientContet}>
                                    Play
                                  </span>
                                </button>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            <section>
                              <div>
                                <img src={NoProduct} width={100} height={100} />
                                <div className={styles.recodingconntent}>
                                  <h2>No Recordings Found</h2>
                                  <p>
                                    Looks like it's quiet here, no recordings
                                    yet!
                                  </p>
                                </div>
                              </div>
                            </section>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className={styles.paginationFlex}>
                    <p>
                      Showing {currentPage} of {totalPages} pages
                    </p>

                    <div className={styles.pagination}>
                      {/* Previous button */}
                      <a
                        href="#"
                        className={`${styles.prev} ${styles.marginGiven}`}
                        aria-label="Previous"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        «
                      </a>

                      {/* Page number buttons */}
                      {[...Array(totalPages).keys()].map((pageNumber) => (
                        <a
                          key={pageNumber}
                          href="#"
                          className={`${styles.prev} ${currentPage === pageNumber + 1 ? styles.active : ""}`}
                          aria-label={`Page ${pageNumber + 1}`}
                          onClick={() => handlePageChange(pageNumber + 1)}
                        >
                          {pageNumber + 1}
                        </a>
                      ))}

                      {/* Ellipsis if needed */}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <a
                          href="#"
                          className={`${styles.prev} ${styles.dot}`}
                          aria-label="Ellipsis"
                        >
                          ....
                        </a>
                      )}

                      {/* Last page button */}
                      {totalPages > 1 && (
                        <a
                          href="#"
                          aria-label={`Page ${totalPages}`}
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </a>
                      )}

                      {/* Next button */}
                      <a
                        href="#"
                        className={`${styles.next} ${styles.marginGiven}`}
                        aria-label="Next"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        »
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {filteredDatas.length === 0 && searchQuery && (
              <div className={styles.noMatchFound}>
                <p>Not matched data here</p>
              </div>
            )}
          </>
        )}

        {component === "second" && (
          <>
            <div className={styles.flexWrapper}>
              <div className={styles.headingFlex}>
                <button className={styles.btn_Back}     onClick={handleBack}>
                  {" "}
                  <img src={arrowIcon} width={20} height={16} />{" "}
                </button>
                <h2>Recordings</h2>
              </div>
            </div>

            <div className={styles.recording_page_list}>
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

                      {console.log(details, "details")}

                      <img
                        src={playlistIcon}
                        width={20}
                        height={20}
                        alt="img"
                      />
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
                      <img
                        src={playlistIcon}
                        width={20}
                        height={20}
                        alt="img"
                      />
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
{console.log(videoRef, details.videoURL,"here to see")}
                <div className={styles.playlistView}>
                  <div>
                    <div className={styles.relativeDiv}>
                    {/* <iframe
  src={details.videoURL}
  className={styles.videoPlayerImg}
  width="100%"
  height="600"
  frameBorder="0"
  allowFullScreen
></iframe> */}

<iframe
  src={details.videoURL}
    className={styles.videoPlayerImg}
  width="100%"
  height="600"
  frameBorder="0"
  allowFullScreen
></iframe>




                      {/* <ReactPlayer
                        ref={videoRef}
                        className={styles.videoPlayerImg}
                        url={details.videoURL}
                        // url={`https://dictionaries-hugh-bailey-reflection.trycloudflare.com/${details.videoURL}`}

                        pip={pip}
                        playing={playing}
                        controls={true}
                        light={light}
                        loop={loop}
                        playbackRate={playbackRate}
                        volume={volume}
                        muted={muted}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        config={{
                          file: {
                            attributes: {
                              crossOrigin: "anonymous",
                            },
                          },
                        }}
                      /> */}
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
                        <button onClick={handleRewind}>
                          <img
                            src={forward}
                            alt="forward"
                            width={20}
                            height={20}
                          />
                        </button>
                      </div>
                      <div className="button">
                        <button
                          onClick={handlePlayPause}
                          style={{ cursor: "pointer" }}
                        >
                          {state.playing ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              id="icon"
                              width="32"
                              height="32"
                              viewBox="0 0 32 32"
                            >
                              <path d="M12 6h-2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2M22 6h-2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2"></path>
                              <path
                                id="_Transparent_Rectangle_"
                                fill="none"
                                d="M0 0h32v32H0z"
                                data-name="&lt;Transparent Rectangle&gt;"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="28"
                              height="31"
                              fill="none"
                              viewBox="0 0 28 31"
                            >
                              <path
                                fill="#0F172A"
                                fillRule="evenodd"
                                d="M0 3.438C0 .827 2.8-.829 5.088.43l21.133 11.623c2.372 1.304 2.372 4.712 0 6.017L5.088 29.693C2.8 30.952 0 29.296 0 26.685z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="button">
                        <button onClick={handleFastForward}>
                          <img
                            src={nextPlay}
                            alt="forward"
                            width={20}
                            height={20}
                          />
                        </button>
                      </div>
                      <div className="button">
                        <button>
                          <img
                            src={maximiz}
                            alt="forward"
                            width={20}
                            height={20}
                          />
                        </button>
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

                  <div
                    className={`${styles.audio_player} ${styles.block_player}`}
                  >
                    <h3>Session Info</h3>
                    <div className={styles.session_info_Wrapper}>
                      <div className={styles.sessionContent}>
                        <h5>User</h5>
                        <p>129065</p>
                      </div>
                      <div className={styles.sessionContent}>
                        <h5>Country</h5>
                        <p>{details.country}</p>
                      </div>
                      <div className={styles.sessionContent}>
                        <h5>Date</h5>
                        <p>{new Date(details.createdAt).toDateString()}</p>
                      </div>
                      <div className={styles.sessionContent}>
                        <h5>Device</h5>
                        <p>129065</p>
                      </div>
                      <div className={styles.sessionContent}>
                        <h5>OS</h5>
                        <p>129065</p>
                      </div>
                      <div className={styles.sessionContent}>
                        <h5>Channel</h5>
                        <p>129065</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {isProduct && <AddProduct onClose={() => setIsProduct(false)} />}
      </div>

      {/* {shareReward && */}

      {shareReward && (
        <section className={styles.modal_overlay}>
          <div className={`${styles.popup} ${styles.UnlockReward}`}>
            <button className={styles.closeBtn}>&times;</button>
            <p className={styles.timeInfo}>Takes Less Than 3 Minutes</p>
            <h2>
              Share & Unlock Reward! <span>:mega:</span>
            </h2>
            <p className={styles.description}>
              To access <strong>5,000 More Recordings</strong> - share the app
              with a friend! They install the app = you get the reward!
            </p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  <span className={styles.nuberstep}>1</span>
                </div>
                <div className={styles.stepInfo}>
                  <h3>Step 1</h3>
                  <p>Copy your referral link</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  <span className={styles.nuberstep}>2</span>
                </div>
                <div className={styles.stepInfo}>
                  <h3>Step 2</h3>
                  <p>Share the app with a friend</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  <span className={styles.nuberstep}>3</span>
                </div>
                <div className={styles.stepInfo}>
                  <h3>Step 3</h3>
                  <p>
                    They install the app - we will notify you and unlock the
                    reward!
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.linkContainer}>
              <input
                type="text"
                value="https://apps.shopify.com/example"
                readOnly
              />
              <button className={styles.copyBtn}>Copy</button>
            </div>
          </div>
        </section>
      )}
      {/* } */}
      {isModal && <EnableModal />}
    </>
  );
}
