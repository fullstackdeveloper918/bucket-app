
import { Form } from '@remix-run/react'
import styles from '../../styles/main.module.css'
import { useEffect, useState } from 'react';

import preview_mockup from "../../routes/assets/preview_mockup.svg";
import { toast as notify } from "sonner";

const BuyDesign = ({onNext, actionResponse, id, setCompletedStep}) => {


 

  useEffect(() => {
    if (actionResponse?.step === "third") {
      notify.success(actionResponse?.message, {
        position: "top-center",
        style: {
          background: "green",
          color: "white",
        },
      });
      setCompletedStep(3);
      onNext();
    } else if (actionResponse?.status === 500) {
      notify.success(actionResponse?.message, {
        position: "top-center",
        style: {
          background: "red",
          color: "white",
        },
      });
    }
  }, [actionResponse]);

  return (
    <>
   
   
    </>
  )
}

export default BuyDesign