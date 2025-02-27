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
  const fetcher = useFetcher();
  const [reviews, setRevies] = useState([]);

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
