import Styles from './Card.module.css'
const CardSkeleton = () => {
  return (
    <>
      <div className={Styles.card}>
        <div className={Styles.profile_thumb}></div>
      <div className={Styles.CardSkeletonHheding}>
      <h1 className={Styles.post_title}></h1>
      <p className={Styles.paragraph}></p>
      </div>
      </div>
    </>
  );
};

export default CardSkeleton;
