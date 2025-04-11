import { useLoaderData } from "@remix-run/react";

import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import styles from "../styles/new.module.css";
import svgicon from "../routes/assets/gift.svg"
import checkIcon from "../routes/assets/checkIcon.svg"
import Guarantee from "../routes/assets/Guarantee.svg"
import arrowTab from "../routes/assets/arrowTab.svg"
import extendIcon from "../routes/assets/extendIcon.svg"
import videoplay from "../routes/assets/videoplay.svg"
import rocketsvg from "../routes/assets/rocketsvg.svg"
import emailIcon from "../routes/assets/emailIcon.svg"

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <section className={styles.containerDiv}>
      <div className={styles.pricingcontainer}>
        <div className={styles.bundleHeading}>
          <h2>Plan</h2>
        </div>
        <div className={styles.maintopbar}>
          <div className={styles.plansyear}>
            <div className={`${styles.tabbtn} ${styles.activebtn}`}>
              <button>Monthly</button>
            </div>
            <div className={styles.tabbtn}>
              <button>Annual</button>
            </div>
          </div>
          <span className={styles.saveprice}>
            <img src={arrowTab} width={100} height={100} /> <small>Save 270%!</small>
          </span>
        </div>

        <div className={styles.pricinglans}>
          <div className={styles.plan}>
            <span className={styles.mostPopular}>Most Popular</span>
            <div className={styles.gapspace}>
              <h3>Kickstarter</h3>
              <p className={styles.subtitle}>Get the essentials to launch</p>
              <p className={styles.pricenew}>
                Price <strong>$14</strong>
              </p>
              <button className={styles.currentPlan}>Current Plan</button>
            </div>
            <span className={styles.noLosstext}>Bucket’s “No-Loss Guarantee”</span>

            <h4 className={styles.whatdo}>What do you get?</h4>

            <div className={styles.features}>
              <div className={styles.featuresec}>
                <h5>E-mail Marketing</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} />1,000 Contacts</li>
                  <li> <img src={checkIcon} width={15} height={15} />10,000 Emails</li>
                </ul>
                <p className={styles.additonaltext}>Additional E-mails will be <strong>Charged Per Usage</strong></p>
              </div>

              <div className={styles.featuresec}>
                <h5>Visitors Recordings</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 30,000 Recordings</li>
                </ul>
              </div>

              <div className={styles.featuresec}>
                <h5>SMS Marketing</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 20 free SMS notifications</li>
                </ul>
                <p className={styles.additonaltext}>Additional SMS will be <strong>Charged Per Usage</strong></p>
              </div>

              <div className={styles.featuresec}>
                <h5>Product Reviews</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 100 reviews per product</li>
                </ul>
              </div>

              <div className={styles.featuresec}>
                <h5>Support</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> Live Chat + Email Support</li>
                </ul>
              </div>

            </div>

          </div>


          <div className={`${styles.plan} ${styles.popular}`}>
            <span className={styles.mostPopular}>Most Popular</span>
            <div className={styles.gapspace}>
              <h3>Game-Changer</h3>
              <p className={styles.subtitle}><strong>Dominate the market</strong> elevate your game with tools that make it easy</p>
              <p className={styles.pricenew}>
                Price <strong><del>$59</del>  $29</strong>
              </p>
              <button className={`${styles.currentPlan} ${styles.upgradebtn} `}>Upgrade Now - See Results!</button>
            </div>
            <span className={styles.noLosstext}>Bucket’s “No-Loss Guarantee”</span>

            <h4 className={styles.whatdo}>What do you get?</h4>


            <div className={styles.features}>
              <div className={styles.featuresec}>
                <h5>E-mail Marketing</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} />1,000 Contacts</li>
                  <li> <img src={checkIcon} width={15} height={15} />10,000 Emails</li>
                </ul>
                <p className={styles.additonaltext}>Additional E-mails will be <strong>Charged Per Usage</strong></p>
              </div>

              <div className={styles.featuresec}>
                <h5>Visitors Recordings</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 30,000 Recordings</li>
                </ul>
              </div>

              <div className={styles.featuresec}>
                <h5>SMS Marketing</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 20 free SMS notifications</li>
                </ul>
                <p className={styles.additonaltext}>Additional SMS will be <strong>Charged Per Usage</strong></p>
              </div>

              <div className={styles.featuresec}>
                <h5>Product Reviews</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 100 reviews per product</li>
                </ul>
              </div>

              <div className={styles.featuresec}>
                <h5>Support</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> Live Chat + Email Support</li>
                </ul>
              </div>

              <div className={`${styles.freegifts} ${styles.featuresec}`}>
                <h5>Free Gifts!</h5>
                <img src={svgicon} width={20} height={20} />
                <p className={styles.additonaltext}><strong>100 High-Converting</strong> Hooks and Headlines for Ads & Emails! (Worth 99$)</p>
                <img src={svgicon} width={20} height={20} />
                <p className={styles.additonaltext}><strong>Winning Offers Kit</strong> a list of irresistible offers to increase your conversion rate! (Worth 49$) </p>
              </div>

            </div>


          </div>

          <div className={`${styles.plan} ${styles.popular}`}>
            <span className={styles.mostPopular}>Most Popular</span>
            <div className={styles.gapspace}>
              <h3>Game-Changer</h3>
              <p className={styles.subtitle}><strong>Dominate the market</strong> elevate your game with tools that make it easy</p>
              <p className={styles.pricenew}>
                Price <strong><del>$59</del>  $29</strong>
              </p>
              <button className={`${styles.currentPlan} ${styles.upgradebtn} `}>Upgrade Now - See Results!</button>
            </div>
            <span className={styles.noLosstext}>Bucket’s “No-Loss Guarantee”</span>

            <h4 className={styles.whatdo}>What do you get?</h4>


            <div className={styles.features}>
              <div className={styles.featuresec}>
                <h5>E-mail Marketing</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} />1,000 Contacts</li>
                  <li> <img src={checkIcon} width={15} height={15} />10,000 Emails</li>
                </ul>
                <p className={styles.additonaltext}>Additional E-mails will be <strong>Charged Per Usage</strong></p>
              </div>

              <div className={styles.featuresec}>
                <h5>Visitors Recordings</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 30,000 Recordings</li>
                </ul>
              </div>

              <div className={styles.featuresec}>
                <h5>SMS Marketing</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 20 free SMS notifications</li>
                </ul>
                <p className={styles.additonaltext}>Additional SMS will be <strong>Charged Per Usage</strong></p>
              </div>

              <div className={styles.featuresec}>
                <h5>Product Reviews</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> 100 reviews per product</li>
                </ul>
              </div>

              <div className={styles.featuresec}>
                <h5>Support</h5>
                <ul>
                  <li> <img src={checkIcon} width={15} height={15} /> Live Chat + Email Support</li>
                </ul>
              </div>

              <div className={`${styles.freegifts} ${styles.featuresec}`}>

                <h5>Free Gifts!</h5>
                <img src={svgicon} width={20} height={20} />
                <p className={styles.additonaltext}><strong>100 High-Converting</strong> Hooks and Headlines for Ads & Emails! (Worth 99$)</p>
                <img src={svgicon} width={20} height={20} />
                <p className={styles.additonaltext}><strong>Winning Offers Kit</strong> a list of irresistible offers to increase your conversion rate! (Worth 49$) </p>

              </div>

            </div>


          </div>

        </div>


      </div>
      <div className={styles.guarantee}>
        <div className={styles.innerDivgurrentee}>
          <img src={Guarantee} width={40} height={40} />
          <div className={styles.bundleHeading}>
            <h2>Bucket’s “No-Loss Guarantee”</h2>
          </div>
          <h5 className={styles.guaranteesubhheading}>
            If you don’t love the new capabilities within 30 days, we’ll
            downgrade you and refund the difference.
          </h5>
          <p className={styles.guaranteeText}>Only for “game-changer” and “limitless” plans!</p>
        </div>
      </div>

      {/* Settings screen */}
      <div className={styles.Settingssec}>
        <div className={`${styles.bundleHeading} ${styles.settingSec} `}>
          <h2>Settings</h2>
          <h3>Referral : One Referral = One Coin </h3>
        </div>
        <div className={styles.exampleBundle}>
          <div className={styles.setingtopbar}>
            <div className={styles.leftsetting}>
              <h4>You referred a total of <strong>0</strong> Stores ☹️</h4>
              <p>When a merchant installs Bucket using the following link you receive 1 coin!</p>

            </div>
            <div className={styles.rightsetting}>
              <h4><strong>0</strong> Coins Left </h4>
              <p>One Install = One Coin! </p>
            </div>
          </div>

          <div className={`${styles.addBtn} ${styles.cpyLink}`}>
            <div className={styles.copyLink} >https://apps.shopify.com/example</div>
            <button
              onClick={() => setLaunch("reviewer")}
              className={styles.NextBtn}>
              Copy
            </button>
          </div>

          <div className={styles.AvailableRewards}>
            <p>Available Rewards</p>
          </div>
          
          <div className={styles.rewardsecs}>
            
            <div className={styles.Availablesec}>
              <div className={styles.rewardsecleft}>
                <div className={styles.rewardIcon}>
                  <img src={extendIcon} width={40} height={40} />
                </div>
                <div className={styles.rewardcontent}>
                  <h4>Extend Free Trial by 14 days! </h4>
                  <p>1 Coin</p>
                </div>
              </div>

              <div className={styles.rewardsecright}>
                <button className={styles.currentPlan}>Not Enough Coins</button>
              </div>
            </div>

            <div className={styles.Availablesec}>
              <div className={styles.rewardsecleft}>
                <div className={styles.rewardIcon}>
                  <img src={videoplay} width={40} height={40} />
                </div>
                <div className={styles.rewardcontent}>
                  <h4>5,000 Session Recording For 1 Month!</h4>
                  <p>1 Coin</p>
                </div>
              </div>

              <div className={styles.rewardsecright}>
                <button className={styles.currentPlan}>Not Enough Coins</button>
              </div>
            </div>

            <div className={styles.Availablesec}>
              <div className={styles.rewardsecleft}>
                <div className={styles.rewardIcon}>
                  <img src={rocketsvg} width={40} height={40} />
                </div>
                <div className={styles.rewardcontent}>
                  <h4>Get 1,000 Image Optimizations! </h4>
                  <p>1 Coin</p>
                </div>
              </div>

              <div className={styles.rewardsecright}>
                <button className={styles.currentPlan}>Not Enough Coins</button>
              </div>
            </div>
            <div className={styles.Availablesec}>
              <div className={styles.rewardsecleft}>
                <div className={styles.rewardIcon}>
                  <img src={emailIcon} width={40} height={40} />
                </div>
                <div className={styles.rewardcontent}>
                  <h4>Get 5,000 Emails!</h4>
                  <p>1 Coin</p>
                </div>
              </div>

              <div className={styles.rewardsecright}>
                <button className={styles.currentPlan}>Not Enough Coins</button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className={`${styles.bundleHeading} ${styles.settingSec} `}>
          <h3>Email Marketing Usage</h3>
          <div className={styles.rangePnael}>
          <form className={styles.fomrdiv}>
        <label for="range"></label>
        <input 
             id="range" 
             type="range" 
             min="0" 
             max="100" 
             value="70"/>
      </form>
      <div className={styles.emailcontent}>
        <h4>4220/5000 <span>Emails left </span></h4>
        <button className={styles.upgradebtn}>Upgrade Plan Now! </button>
      </div>

      <div className={styles.formGroup}>
        <input type="checkbox" />
        <label for="gid://shopify/ProductVariant/50422433874231"></label>
        <span class="_variantHeadimg_1vspd_4931">Additional E-mails beyond the plan’s limit will be <strong>Charged Per Usage automatically</strong></span>
        </div>
          </div>
        </div>


      {/* Settings screen end*/}
    </section>


  );
}
