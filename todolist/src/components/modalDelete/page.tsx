import React, { useEffect, useState } from "react";
import "../../assets/modalError.css";
import { useDeleteTask } from "@/hooks/useTodo";
import { queryClient } from "@/context/ReactQueryProvider";
import { toast } from "react-toastify";

interface ModalProps {
   id: string;
   isOpen: boolean;
   onClose: () => void;
}

const ModalDelete: React.FC<ModalProps> = ({ id, isOpen, onClose }) => {
   const [isLoading, setIsLoading] = useState(false);
   const deleteTask = useDeleteTask();

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
         deleteTask.mutate(id, {
            onSuccess: () => {
               console.log("Xoá thành công task");
               toast.success("The task deleted successfully!");
               queryClient.invalidateQueries({ queryKey: ["tasks"] });
            },
         });
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
                     {isLoading ? "Deleting" : "Yes"}
                  </button>
               </div>
            </div>
         </div>
      </>
   );
};

export default ModalDelete;
