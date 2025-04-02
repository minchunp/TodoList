import React, { Fragment, useEffect, useState } from "react";
import ModalError from "../modalError/page";
import { TaskInterface } from "@/types/tasks.type";
import { useUpdateTask } from "@/hooks/useTodo";
import { toast } from "react-toastify";
import { queryClient } from "@/context/ReactQueryProvider";
import { useEffectHiddenModal } from "@/hooks/useEffectHiddenModal";
interface ModalUpdateProps {
   taskProp: TaskInterface;
   isOpen: boolean;
   onClose: () => void
}

const ModalUpdateTask = ({taskProp, isOpen, onClose}: ModalUpdateProps) => {
   const [task, setTask] = useState<TaskInterface>({
      id: '',
      content: '',
      description: '',
      startTime: '',
      deadline: '',
      status: ''
   });
   const [isOpenModalError, setIsOpenModalError] = useState(false);

   useEffect(() => {
      if (isOpen) {
         console.log("Fetch data item task thành công", taskProp)
         setTask(taskProp)
      }
   }, [isOpen, taskProp]);

   useEffectHiddenModal(isOpen);

   const updateTaskMutation = useUpdateTask(task.id, task);
   const handleUpdateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         if (task.deadline < task.startTime) {
            openModalError();
            console.log('Lỗi Update mốc thời gian!');
            return null;
         }

         updateTaskMutation.mutate(undefined, {
            onSuccess: (data) => {
               console.log(data.data);
               toast.success('The task has been updated successfully!');
               queryClient.invalidateQueries({queryKey: ["tasks"]});
               console.log("invalidateQueries called", queryClient.invalidateQueries({queryKey: ["tasks"]}));
               onClose();
            }
         });
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
      <Fragment>
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
      </Fragment>
   );
}

export default ModalUpdateTask;