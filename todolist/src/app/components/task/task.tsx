import React, { useEffect, useState } from "react";
import "../../../assets/task.css";
import ModalDelete from "../modalDelete/page";
import axios from "axios";
import { format } from "date-fns";
import ModalUpdateTask from "../modalUpdateTask/updateTask";

interface TaskInterface {
   id: string;
   content: string;
   description: string;
   startTime: string;
   deadline: string;
   status: string;
}

interface TaskProps {
   task: TaskInterface;
   onUpdateStatus: (id: string, status: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, onUpdateStatus }) => {
   const [isOpenModal, setIsOpenModal] = useState(false);
   const [isOpenModalUpdate, setIsOpenModalUpdate] = useState(false);
   const [isCheck, setIsCheck] = useState(task.status === "complete");

   useEffect(() => {
      setIsCheck(task.status === "complete");
   }, [task.status]);

   // Func open/close modal delete
   const openModal = () => setIsOpenModal(true);
   const closeModal = () => setIsOpenModal(false);

   // Func open/close modal update
   const openModalUpdate = () => setIsOpenModalUpdate(true);
   const closeModalUpate = () => setIsOpenModalUpdate(false);

   const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsCheck(e.target.checked);
      console.log(e.target.checked);

      const newStatus = e.target.checked ? "complete" : "incomplete";

      try {
         const respone = await axios.patch(`http://localhost:5500/tasks/${task.id}`, { status: newStatus });
         console.log("Cập nhật trạng thái thành công", respone.data);
         onUpdateStatus(task.id, newStatus);
      } catch (error) {
         console.log("Thay đổi trạng thái task thất bại!", error);
      }
   };

   const formatDateTime = (dateTime: string) => {
      return format(new Date(dateTime), "dd/MM/yyyy HH:mm");
   }

   const isExpired = new Date(task.deadline) < new Date();

   const checkDateWarning = (deadlineTime: string) => {
      const dateNow = new Date();
      const dateDealine = new Date(deadlineTime);
      const timeDiff = dateDealine.getTime() - dateNow.getTime();

      if (timeDiff <= 10*60*1000 && timeDiff > 0) {
         return true;
      } else {
         return false;
      }
   }
   // const isWarning = useDeadlineWarning(task.deadline);
   const isWarning = checkDateWarning(task.deadline);

   return (
      <>
         <ModalUpdateTask id={task.id} isOpen={isOpenModalUpdate} onClose={closeModalUpate} />
         <ModalDelete id={task.id} isOpen={isOpenModal} onClose={closeModal} />
         <div key={task.id} className="item-task">
            {task.deadline && (<div className="line line-safe"></div>)}
            {isWarning && (<div className="line line-warning"></div>)}
            {isExpired && (<div className="line line-expired"></div>)}
            <div className={`main-content-task ${task.deadline || isExpired || isWarning ? 'mrt' : ''}`}>
               <input onChange={handleChange} checked={isCheck} className="checkTask" type="checkbox" />
               <div className="main-content">
                  <p className="content-task">{task.content}</p>
                  {isExpired && (<p className="expired">The task is overdue!</p>)}
                  {isWarning && (<p className="warning">The task will expire at {formatDateTime(task.deadline)}</p>)}
                  {task.description !== '' && (<p className="description-task">Description: {task.description}</p>)}
                  {task.startTime !== '' && (<p className="description-task">Date-time: {formatDateTime(task.startTime)} - {formatDateTime(task.deadline)}</p>)}
               </div>
            </div>
            <div className="func-task">
               <i onClick={openModalUpdate} className="bi bi-pencil-square"></i>
               <i onClick={openModal} className="bi bi-trash"></i>
            </div>
         </div>
      </>
   );
};

export default Task;
