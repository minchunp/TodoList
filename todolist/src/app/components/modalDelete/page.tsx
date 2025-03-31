import React, { useEffect, useState } from "react";
import "../../../assets/modalError.css";
import axios from "axios";

interface ModalProps {
   id: string;
   isOpen: boolean;
   onClose: () => void;
}

const ModalDelete: React.FC<ModalProps> = ({ id, isOpen, onClose }) => {
   const [isLoading, setIsLoading] = useState(false);
   
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   const handleDelete = async () => {
      if (isLoading) return;
      setIsLoading(true);
      try {
         const respone = await axios.delete(`http://localhost:5500/tasks/${id}`);
         console.log("Xoá task thành công!", respone.data);
         window.location.reload();
      } catch (e) {
         console.log("Xoá task thất bại!", e);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         <div className={`main-modal-error ${isOpen ? "open" : ""}`} onClick={onClose}>
            <div className="container-modal-error">
               <i className="bi bi-exclamation-circle"></i>
               <p>Are you sure you want to delete this task?</p>
               <div className="container-btn-modal">
                  <button onClick={onClose} className="btn-confirm">
                     No
                  </button>
                  <button disabled={isLoading} onClick={handleDelete} className="btn-confirm">
                     {isLoading?'Deleting':'Yes'}
                  </button>
               </div>
            </div>
         </div>
      </>
   );
};

export default ModalDelete;
