import Task from "./task";
import "../../../assets/task.css";
import React from "react";

interface TaskInterface {
   id: string;
   content: string;
   description: string;
   startTime: string;
   deadline: string;
   status: string;
}

const ListTask: React.FC<{tasks: TaskInterface[], onUpdateStatus: (id: string, status: string) => void}> = ({ tasks, onUpdateStatus }) => {
   return (
      <div className="container-list-task">
         <div className="box-task">
            {tasks.map((task) => {
               return (
                  <div key={task.id} className="box-item-task">
                     <Task onUpdateStatus={onUpdateStatus} task={task} />
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default ListTask;
