import axios from "axios";
import React, { useEffect, useState } from "react";
import ModalError from "../modalError/page";

interface TaskInterface {
   id: string,
   content: string,
   description: string,
   startTime: string,
   deadline: string,
   status: string
}

interface ModalUpdateProps {
   id: string;
   isOpen: boolean;
   onClose: () => void
}

const ModalUpdateTask = ({id, isOpen, onClose}: ModalUpdateProps) => {
   const [task, setTask] = useState<TaskInterface>({
      id: '',
      content: '',
      description: '',
      startTime: '',
      deadline: '',
      status: ''
   });
   const [isOpenModalError, setIsOpenModalError] = useState(false);

   const fetchTask = async (id: string) => {
      try {
         const respone = await axios.get(`http://localhost:5500/tasks/${id}`);
         const dataTask = respone.data;
         console.log("Fetch data Task thành công!", dataTask);
         setTask(dataTask);
      } catch (error) {
         console.log("Fetch data Task thất bại!", error);
      }
   }

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
         if (id) fetchTask(id);
      } else {
         document.body.style.overflow = ""
      }

      return () => {
         document.body.style.overflow = ""
      }
   }, [isOpen, id]);

   const handleUpdateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         if (task.deadline < task.startTime) {
            openModalError();
            console.log('Lỗi Update mốc thời gian!');
            return;
         }

         const respone = await axios.patch(`http://localhost:5500/tasks/${task.id}`, 
            {
               content: task.content,
               description: task.description,
               startTime: task.startTime,
               deadline: task.deadline,
               status: task.status
            }
         );
         console.log("Update data Task thành công!", respone.data);
         window.location.reload();
      } catch (error) {
         console.log("Update data Task thất bại!", error);
      }
   }

   const isExpired = new Date(task.deadline) < new Date();
   const isErrorDeadline = new Date(task.deadline) < new Date(task.startTime);

   // Func open/close modal error
   const openModalError = () => setIsOpenModalError(true);
   const closeModalError = () => setIsOpenModalError(false);

   return (
      <>
         <ModalError contentError="The timestamp you set is invalid!" isOpen={isOpenModalError} onClose={closeModalError} />
         <div className={`main-modal-error main-modal-task-detail ${isOpen?'open':''}`} onClick={onClose} >
            <div className="container-modal-error container-modal-task-detail" onClick={(e) => e.stopPropagation()}>
               <h1>Update task</h1>
               <form onSubmit={handleUpdateTask}>
                  <div className="container-input-detail-task">
                     <input value={task.content} onChange={(e) => setTask({...task, content: e.target.value})} type="text" placeholder="Enter new task here" required />
                     <input value={task.description} onChange={(e) => setTask({...task, description: e.target.value})} type="text" placeholder="Enter your description here" />
                     <div className="container-input-datetime">
                        <div className={`item-input-datetime ${isErrorDeadline?'update':''}`}>
                           <p>Start time:</p>
                           <input value={task.startTime} onChange={(e) => setTask({...task, startTime: e.target.value})} type="datetime-local" name="startTime"  />
                        </div>
                        <div className={`item-input-datetime ${isExpired || isErrorDeadline?'update':''}`}>
                           <p>Deadline:</p>
                           <input value={task.deadline} onChange={(e) => setTask({...task, deadline: e.target.value})} type="datetime-local" name="deadline" />
                        </div>
                     </div>
                     <button type="submit" className="btn-confirm btn-confirm__taskdetail">Confirm</button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}

export default ModalUpdateTask;