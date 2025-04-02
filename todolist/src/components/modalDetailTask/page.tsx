import React, { useState } from "react";
import "../../assets/modalDetailTask.css";
import "../../assets/modalError.css";
import ModalError from "../modalError/page";
import { TaskInterface } from "@/types/tasks.type";
import { useAddTask } from "@/hooks/useTodo";
import { toast } from "react-toastify";
import { queryClient } from "@/context/ReactQueryProvider";
import { useEffectHiddenModal } from "@/hooks/useEffectHiddenModal";

const INCOMPLETE_COMPLETE = "incomplete";
type TaskInput = Omit<TaskInterface, "id">;
const initialTaskInput: TaskInput = {
   content: "",
   description: "",
   startTime: "",
   deadline: "",
   status: INCOMPLETE_COMPLETE,
};

interface ModalProps {
   tasks: TaskInterface[] | undefined;
   isOpen: boolean;
   onClose: () => void;
}

const ModalDetailTask: React.FC<ModalProps> = ({ isOpen, onClose, tasks }) => {
   const [taskInput, setTaskInput] = useState<TaskInput>(initialTaskInput);
   const [isOpenModalError, setIsOpenModalError] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const addNewTaskDetail = useAddTask();
   const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTaskInput({ ...taskInput, [e.target.name]: e.target.value });
   };

   const handleSubmitTaskDetail = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      setIsLoading(true);
      const isContentExist = tasks?.some((t: TaskInterface) => t.content.toLowerCase() === taskInput.content.toLowerCase());
      if (isContentExist) {
         openModalError();
         return;
      }

      if (new Date(taskInput.deadline) < new Date(taskInput.startTime)) {
         openModalError();
         return;
      }

      try {
         if (taskInput) {
            addNewTaskDetail.mutate(taskInput, {
               onSuccess: (dataTask) => {
                  toast.success("The task has been added successfully!");
                  console.log("Thêm data task thành công!", dataTask.data);
                  queryClient.invalidateQueries({ queryKey: ["tasks"] });
                  onClose();
               },
               onError: () => {
                  toast.error("The task has been added failed!");
               },
            });
         }
      } catch (error) {
         console.log("Thêm task thất bại!", error);
      } finally {
         setIsLoading(false);
         setTaskInput({
            content: "",
            description: "",
            startTime: "",
            deadline: "",
            status: INCOMPLETE_COMPLETE,
         });
      }
   };

   useEffectHiddenModal(isOpen);

   const openModalError = () => setIsOpenModalError(true);
   const closeModalError = () => setIsOpenModalError(false);

   const isErrorDeadline = new Date(taskInput.deadline) < new Date(taskInput.startTime);

   return (
      <>
         <ModalError
            contentError={
               new Date(taskInput.deadline) < new Date(taskInput.startTime) ? "The timestamp you set is invalid!" : "This task already exists!"
            }
            isOpen={isOpenModalError}
            onClose={closeModalError}
         />
         <div className={`main-modal-error main-modal-task-detail ${isOpen ? "open" : ""}`} onClick={onClose}>
            <div className="container-modal-error container-modal-task-detail" onClick={(e) => e.stopPropagation()}>
               <h1>Add task</h1>
               <form onSubmit={handleSubmitTaskDetail}>
                  <div className="container-input-detail-task">
                     <input
                        name="content"
                        value={taskInput.content}
                        onChange={handleChangeInput}
                        type="text"
                        placeholder="Enter new task here"
                        required
                     />
                     <input
                        name="description"
                        value={taskInput.description}
                        onChange={handleChangeInput}
                        type="text"
                        placeholder="Enter your description here"
                     />
                     <div className="container-input-datetime">
                        <div className={`item-input-datetime ${isErrorDeadline ? "update" : ""}`}>
                           <p>Start time:</p>
                           <input onChange={handleChangeInput} value={taskInput.startTime} type="datetime-local" name="startTime" />
                        </div>
                        <div className={`item-input-datetime ${isErrorDeadline ? "update" : ""}`}>
                           <p>Deadline:</p>
                           <input onChange={handleChangeInput} value={taskInput.deadline} type="datetime-local" name="deadline" />
                        </div>
                     </div>
                     <button disabled={isLoading} type="submit" className="btn-confirm btn-confirm__taskdetail">
                        {isLoading ? "Confirming..." : "Confirm"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
};

export default ModalDetailTask;
