import React, { useEffect, useState } from "react";
import "../../../assets/modalDetailTask.css";
import "../../../assets/modalError.css";
import ModalError from "../modalError/page";
import axios from "axios";

interface ModalProps {
   tasks: TaskInterface[];
   isOpen: boolean;
   onClose: () => void;
}

interface TaskInterface {
   id: string;
   content: string;
   description: string;
   startTime: string;
   deadline: string;
   status: string;
}

const ModalDetailTask: React.FC<ModalProps> = ({ isOpen, onClose, tasks }) => {
   const [content, setContent] = useState('');
   const [description, setDescription] = useState('');
   const [startTime, setStartTime] = useState('');
   const [deadline, setDeadline] = useState('');
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [status, setStatus] = useState('incomplete');
   const [isOpenModalError, setIsOpenModalError] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleSubmitTaskDetail = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      setIsLoading(true);
      const isContentExist = tasks.some((t: TaskInterface) => t.content.toLowerCase() === content.toLowerCase());
      if (isContentExist) {
         openModalError();
         return;
      }

      if (new Date(deadline) < new Date(startTime)) {
         openModalError();
         return;
      }

      const newTask = {
         content: content,
         description: description,
         startTime: startTime,
         deadline: deadline,
         status: status
      }

      try {
         const respone = await axios.post('http://localhost:5500/tasks', newTask);
         const dataTask = respone.data;
         console.log('Thêm task mới thành công!', dataTask);
         window.location.reload();
      } catch (error) {
         console.log('Thêm task mới thất bại!', error);
      } finally {
         setIsLoading(false);
      }
   }

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

   const openModalError = () => setIsOpenModalError(true);
   const closeModalError = () => setIsOpenModalError(false);

   const isErrorDeadline = new Date(deadline) < new Date(startTime);

   return (
      <>
         <ModalError contentError={new Date(deadline) < new Date(startTime)?"The timestamp you set is invalid!":"This task already exists!"} isOpen={isOpenModalError} onClose={closeModalError} />
         <div className={`main-modal-error main-modal-task-detail ${isOpen ? "open" : ""}`} onClick={onClose}>
            <div className="container-modal-error container-modal-task-detail" onClick={(e) => e.stopPropagation()}>
               <h1>Add task</h1>
               <form onSubmit={handleSubmitTaskDetail}>
                  <div className="container-input-detail-task">
                     <input value={content} onChange={(e) => setContent(e.target.value)} type="text" placeholder="Enter new task here" required />
                     <input value={description} onChange={(e) => setDescription(e.target.value)} type="text" placeholder="Enter your description here" />
                     <div className="container-input-datetime">
                        <div className={`item-input-datetime ${isErrorDeadline?'update':''}`}>
                           <p>Start time:</p>
                           <input onChange={(e) => setStartTime(e.target.value)} value={startTime} type="datetime-local" name="startTime"  />
                        </div>
                        <div className={`item-input-datetime ${isErrorDeadline?'update':''}`}>
                           <p>Deadline:</p>
                           <input onChange={(e) => setDeadline(e.target.value)} value={deadline} type="datetime-local" name="deadline" />
                        </div>
                     </div>
                     <button disabled={isLoading} type="submit" className="btn-confirm btn-confirm__taskdetail">{isLoading?'Confirming...':'Confirm'}</button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
};

export default ModalDetailTask;
