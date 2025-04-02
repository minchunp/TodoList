import Task from "./task";
import "../../assets/task.css";
import React from "react";
import { TaskInterface } from "@/types/tasks.type";

const ListTask: React.FC<{tasks: TaskInterface[] | undefined}> = ({ tasks }) => {
   return (
      <div className="container-list-task">
         <div className="box-task">
            {tasks?.map((task) => {
               return (
                  <div key={task.id} className="box-item-task">
                     <Task task={task} />
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default ListTask;
