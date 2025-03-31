import React, { useEffect } from "react";
import "../../../assets/modalError.css"

interface ModalProps {
   contentError: string;
   isOpen: boolean;
   onClose: () => void
}

const ModalError: React.FC<ModalProps> = ({contentError, isOpen, onClose}) => {
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      }
   }, [isOpen]);

   return (
      <>
         <div className={`main-modal-error ${isOpen?"open":""}`} onClick={onClose}>
            <div className="container-modal-error">
               <i className="bi bi-exclamation-circle"></i>
               <p>{contentError}</p>
               <button onClick={onClose} className="btn-confirm">Countinue</button>
            </div>
         </div>
      </>
   )
}

export default ModalError;