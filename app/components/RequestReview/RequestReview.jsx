import styles from "../../styles/main.module.css";
import dropdown from "../../routes/assets/drop_downImg.svg";
import pllaceholderImg from "../../routes/assets/images_place.svg";
import stars from "../../routes/assets/star_svg.svg";
import { useState } from "react";
import { Form } from "@remix-run/react";

function RequestReview() {
  const [values, setValues] = useState({
    email_send_at: 10,
    subject: "Quick Question: How’s Your New [Product Name]?",
    text: `Hey [Customer’s First Name]!
We’re all about making our customers’ lives better with [Product Name], and we’d love to hear how it’s working for you! Just a quick, honest review could help so many others who are looking for the right fit, just like you were.`,
    five_star: "Absolutely love it!",
    four_star: "Really good!",
    three_star: "It’s okay",
    two_star: "Not quite what i expected",
    one_star: "Disappointed",
    button_color: "#ffffff",
    button_text: "Submit The Review",
    footer_unsubscribe_text: "If you’d like to stop receiving emails",
    button_unsubscribe_text: "unsubscribe here",
  });

    const [activeEnable, setActiveEnable] = useState("Enable");
    const [dropDown, setDropDown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleEnable = (item) => {
    setActiveEnable(item);
    setDropDown(false)
  }

  return (
    <>
      <Form method="POST">
        <div className={styles.table_content}>
          <div className={styles.requestReview}>
            <div>
              <div>
                <div className={styles.heading_img}>
                  <h3>Request Reviews By Mail</h3>{" "}
                  {/* <button className={styles.btn_one}>
                    Enable <img src={dropdown} width={20} height={20} />
                  </button> */}
                   <div
                className={`${styles.activeButton} ${activeEnable === "Disable" ? styles.InactiveButton  : ""}`}
                id="second"
                onClick={() => setShowProducts(true)}
              >
                <div className={styles.butttonsTab} onClick={() => setDropDown(!dropDown)}>
                  <span className={styles.selected}>{activeEnable}</span>
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

                {
                  dropDown && 
                  
                  <ul
                  className={styles.selectDropdown}
                  
                  >
                  <li data-value="option1" onClick={() => handleEnable('Enable')}>Enable</li>
                  <li data-value="option2" onClick={()=> handleEnable('Disable')}>Disable</li>
                </ul>
                }
              </div>


                </div>
                <p className={styles.paragraph_div}>
                  Automatically send review requests via email to collect
                  valuable customer feedback
                </p>
              </div>
            </div>
            <div className={styles.timing_after}>
              <div>
                <label htmlFor="email_send_at">Email Timing</label>
                <div className={styles.inputTiming}>
                  <input
                    type="number"
                    id="email_send_at"
                    name="email_send_at"
                    placeholder="Enter Days..."
                    value={values.email_send_at}
                    onChange={handleChange}
                  />
                  <span className={styles.inputDays}>Days</span>
                </div>
              </div>
              <div>
                <label htmlFor="">Send After</label>
                <div className={styles.active_tabs}>
                  <button className={styles.active}>Fulfilment</button>
                  <button>Purchase</button>
                </div>
              </div>
            </div>
            <div className={styles.customizeEmail}>
              <div className={styles.left_content}>
                <div>
                  <h4 htmlFor="" className={styles.h4_content}>
                    Customize Your Email
                  </h4>
                </div>
                <div className={styles.input_labelCustomize}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Enter Text..."
                    value={values.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="">Text</label>
                  <textarea
                    type="text"
                    name="text"
                    placeholder="Enter Text..."
                    style={{ resize: "none", scrollbarWidth: "none" }}
                    value={values.text}
                    onChange={handleChange}
                  >
                    {" "}
                  </textarea>
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="five_star">5 star</label>
                  <input
                    type="text"
                    name="five_star"
                    placeholder="Enter Text..."
                    value={values.five_star}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="four_star">4 star</label>
                  <input
                    type="text"
                    name="four_star"
                    placeholder="Enter Text..."
                    value={values.four_star}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="three_star">3 star</label>
                  <input
                    type="text"
                    name="three_star"
                    placeholder="Enter Text..."
                    value={values.three_star}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="two_star">2 star</label>
                  <input
                    type="text"
                    name="two_star"
                    placeholder="Enter Text..."
                    value={values.two_star}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="one_star">1 star</label>
                  <input
                    type="text"
                    name="one_star"
                    placeholder="Enter Text..."
                    value={values.one_star}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="button_color">Button Color</label>
                  <div className={styles.color_styles}>
                    <span className={styles.color_pilate}></span>
                    <input
                      type="text"
                      name="button_color"
                      placeholder="Enter Text..."
                      value={values.button_color}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="button_text">Button Text</label>
                  <input
                    type="text"
                    name="button_text"
                    placeholder="Enter Text..."
                    value={values.button_text}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="footer_unsubscribe_text">
                    Footer-Unsubscribe text
                  </label>
                  <input
                    type="text"
                    name="footer_unsubscribe_text"
                    placeholder="Enter Text..."
                    value={values.footer_unsubscribe_text}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.input_labelCustomize}>
                  <label htmlFor="button_unsubscribe_text">
                    Unsubscribe Button text
                  </label>
                  <input
                    type="text"
                    name="button_unsubscribe_text"
                    placeholder="Enter Text..."
                    value={values.button_unsubscribe_text}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.right_content}>
                <div className={styles.livePre}>
                  <button>
                    <span>Live Review</span>
                  </button>
                </div>
                <div className={styles.input_labelCustomize}>
                  <p>{values.subject}</p>
                </div>

                <div className={styles.input_labelContent}>{values.text}</div>

                <div className={styles.product_title}>
                  <img src={pllaceholderImg} width={100} height={100} />
                  <div>
                    <p>Product Name</p>
                    <span>[Variant]</span>
                  </div>
                </div>

                <div className={styles.review_tabs}>
                  <div className={styles.reviewAdd}>
                    <input type="radio" />
                    <div className={styles.starIcon}>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                    </div>

                    <span className={styles.rating_content}>
                      {values.five_star}
                    </span>
                  </div>
                  <div className={styles.reviewAdd}>
                    <input type="radio" />
                    <div className={styles.starIcon}>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                    </div>
                    <span className={styles.rating_content}>
                      {values.four_star}
                    </span>
                  </div>
                  <div className={styles.reviewAdd}>
                    <input type="radio" />
                    <div className={styles.starIcon}>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                    </div>

                    <span className={styles.rating_content}>
                      {values.three_star}
                    </span>
                  </div>
                  <div className={styles.reviewAdd}>
                    <input type="radio" />

                    <div className={styles.starIcon}>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                    </div>
                    <span className={styles.rating_content}>
                      {values.two_star}
                    </span>
                  </div>
                  <div className={styles.reviewAdd}>
                    <input type="radio" />
                    <div className={styles.starIcon}>
                      <span>
                        <img src={stars} width={25} height={25} />
                      </span>
                    </div>

                    <span className={styles.rating_content}>
                      {values.one_star}
                    </span>
                  </div>
                </div>
                <div className={styles.add_richtext}>
                  <textarea name="" id="" placeholder="Add text"></textarea>
                </div>
                <button
                  className={styles.submit_btn}
                  style={{ color: values.button_color }}
                >
                  {values.button_text}
                </button>
                <div style={{ textAlign: "center" }}>
                  <p
                    className={styles.receivedEmail}
                    style={{ color: values.button_color }}
                  >
                    {values.footer_unsubscribe_text}
                  </p>
                  <p className={styles.receivedEmail}>
                    [{values.button_unsubscribe_text}]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}

export default RequestReview;
