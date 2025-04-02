import React from "react";
import "../../assets/modalError.css"
import { useEffectHiddenModal } from "@/hooks/useEffectHiddenModal";

interface ModalProps {
   contentError: string;
   isOpen: boolean;
   onClose: () => void
}

const ModalError: React.FC<ModalProps> = ({contentError, isOpen, onClose}) => {
   useEffectHiddenModal(isOpen);

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