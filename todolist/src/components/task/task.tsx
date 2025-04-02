import React, { useEffect, useState } from "react";
import "../../assets/task.css";
import ModalDelete from "../modalDelete/page";
import { format } from "date-fns";
import ModalUpdateTask from "../modalUpdateTask/updateTask";
import { useUpdateStatusTask } from "@/hooks/useTodo";
import { queryClient } from "@/context/ReactQueryProvider";
import { toast } from "react-toastify";
import { TaskInterface } from "@/types/tasks.type";

const CHECKTIME_WARNING_DEADLINE = 10 * 60 * 1000; // 10 phút

enum Modal {
   NONE,
   DELETE,
   UPDATE
}

interface TaskProps {
   task: TaskInterface;
}

const Task: React.FC<TaskProps> = ({ task }) => {
   const [isOpenModal, setIsOpenModal] = useState<Modal>(Modal.NONE);
   const [isCheck, setIsCheck] = useState(task.status === "complete");

   useEffect(() => {
      setIsCheck(task.status === "complete");
   }, [task.status]);

   // Func open/close modal delete
   const openModal = (statusModal: Modal) => setIsOpenModal(statusModal);
   const closeModal = () => setIsOpenModal(Modal.NONE);

   const updateStatus = useUpdateStatusTask();
   const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsCheck(e.target.checked);

      const newStatus = e.target.checked ? "complete" : "incomplete";

      try {
         updateStatus.mutate(
            { id: task.id, newStatus: newStatus },
            {
               onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["tasks"] });
                  toast.success("Status update successful!");
               },
               onError: (error) => {
                  console.error("Cập nhật trạng thái thất bại!", error);
                  toast.error("Update status failed!");
                  setIsCheck(!e.target.checked);
               },
            }
         );
      } catch (error) {
         console.log("Thay đổi trạng thái task thất bại!", error);
      }
   };

   // Format ngày giờ lấy từ input
   const formatDateTime = (dateTime: string) => {
      return format(new Date(dateTime), "dd/MM/yyyy HH:mm");
   };

   const isExpired = new Date(task.deadline) < new Date();

   const checkDateWarning = (deadlineTime: string) => {
      const dateNow = new Date();
      const dateDealine = new Date(deadlineTime);
      const timeDiff = dateDealine.getTime() - dateNow.getTime();

      if (timeDiff <= CHECKTIME_WARNING_DEADLINE && timeDiff > 0) {
         return true;
      } else {
         return false;
      }
   };

   const isWarning = checkDateWarning(task.deadline);

   return (
      <>
         <ModalUpdateTask taskProp={task} isOpen={isOpenModal === Modal.UPDATE} onClose={closeModal} />
         <ModalDelete id={task.id} isOpen={isOpenModal === Modal.DELETE} onClose={closeModal} />
         <div key={task.id} className="item-task">
            {task.deadline && <div className="line line-safe"></div>}
            {isWarning && <div className="line line-warning"></div>}
            {isExpired && <div className="line line-expired"></div>}
            <div className={`main-content-task ${task.deadline || isExpired || isWarning ? "mrt" : ""}`}>
               <input onChange={handleChange} checked={isCheck} className="checkTask" type="checkbox" />
               <div className="main-content">
                  <p className="content-task">{task.content}</p>
                  {isExpired && <p className="expired">The task is overdue!</p>}
                  {isWarning && <p className="warning">The task will expire at {formatDateTime(task.deadline)}</p>}
                  {task.description !== "" && <p className="description-task">Description: {task.description}</p>}
                  {task.startTime !== "" && (
                     <p className="description-task">
                        Date-time: {formatDateTime(task.startTime)} - {formatDateTime(task.deadline)}
                     </p>
                  )}
               </div>
            </div>
            <div className="func-task">
               <i onClick={() => openModal(Modal.UPDATE)} className="bi bi-pencil-square"></i>
               <i onClick={() => openModal(Modal.DELETE)} className="bi bi-trash"></i>
            </div>
         </div>
      </>
   );
};

export default Task;
