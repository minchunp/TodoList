"use client";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import ListTask from "./components/task/listTask";
import ModalError from "./components/modalError/page";
import ModalDetailTask from "./components/modalDetailTask/page";
import { fetchGeminiRespone } from "./components/geminiRespone";
import ReactMarkdown from "react-markdown";
import useSWR from "swr";

interface TaskInterface {
   id: string;
   content: string;
   description: string;
   startTime: string;
   deadline: string;
   status: string;
}

export default function Home() {
   const [task, setTask] = useState<TaskInterface[]>([]);
   const [taskInput, setTaskInput] = useState({
      content: "",
      description: "",
      startTime: "",
      deadline: "",
      status: "incomplete",
   });
   //  const [error, setError] = useState(false);
   const [isOpenModal, setIsOpenModal] = useState(false);
   const [isOpenModalTaskDetail, setIsOpenModalTaskDetail] = useState(false);
   const [complete, setComplete] = useState(false);
   const [incomplete, setIncomplete] = useState(false);
   const [all, setAll] = useState(true);
   const [filterTask, setFilterTask] = useState<TaskInterface[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [inputChatBox, setInputChatBox] = useState("");
   const [responeChatBox, setResponeChatBox] = useState("");

   const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTaskInput({ ...taskInput, [e.target.name]: e.target.value });
   };

   const openSectionComplete = () => {
      setComplete(true);
      setIncomplete(false);
      setAll(false);
   };

   const openSectionIncomplete = () => {
      setComplete(false);
      setIncomplete(true);
      setAll(false);
   };

   const openSectionAll = () => {
      setComplete(false);
      setIncomplete(false);
      setAll(true);
   };

   //  useEffect(() => {
   //     fetch("http://localhost:5500/tasks")
   //        .then((res) => res.json())
   //        .then((data) => setTask(data));
   //  }, []);

   const fetcher = (url: string) => fetch(url).then((res) => res.json());
   const { data } = useSWR("http://localhost:5500/tasks", fetcher);
   useEffect(() => {
      if (data) {
         setTask(data);
      }
   }, [data]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      setIsLoading(true);

      const isContentExist = task.some((t: TaskInterface) => t.content.toLowerCase() === taskInput.content.toLowerCase());
      if (isContentExist) {
         //  setError(true);
         openModal();
         return;
      }

      try {
         const respone = await axios.post("http://localhost:5500/tasks", taskInput);
         const dataTask = await respone.data;
         console.log("Thêm data task mới thành công", dataTask);

         setTask((prevTask) => [...prevTask, dataTask]);
      } catch (error) {
         console.log("Thêm task thất bại!", error);
      } finally {
         setIsLoading(false);
         setTaskInput({
            content: "",
            description: "",
            startTime: "",
            deadline: "",
            status: "incomplete",
         });
      }
   };

   const openModal = () => setIsOpenModal(true);
   const closeModal = () => setIsOpenModal(false);

   const openModalTaskDetail = () => setIsOpenModalTaskDetail(true);
   const closeModalTaskDetail = () => setIsOpenModalTaskDetail(false);

   const filterTaskByStatus = useCallback(
      (status: string) => {
         return status === "all" ? setFilterTask(task) : setFilterTask(task.filter((t) => t.status === status));
      },
      [task]
   );

   useEffect(() => {
      if (task.length > 0) {
         filterTaskByStatus("all");
         openSectionAll();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [task]);

   const updateTaskStatus = (taskId: string, newStatus: string) => {
      setTask((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      filterTaskByStatus(newStatus);
   };

   //  Handle chatbox Gemini
   const handleSend = async () => {
      if (!inputChatBox.trim() || isLoading) return;
      setIsLoading(true);

      try {
         const result = await fetchGeminiRespone(inputChatBox);
         setResponeChatBox(result);
      } catch (error) {
         console.log("Có lỗi xảy ra trong quá trình xuất kết quả Gemini!", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Định dạng cho kết quả từ Gemini
   const GeminiResponse = (response: any) => {
      return <ReactMarkdown>{response}</ReactMarkdown>;
   };

   return (
      <>
         <ModalDetailTask isOpen={isOpenModalTaskDetail} onClose={closeModalTaskDetail} tasks={task} />
         <ModalError contentError="This task already exists!" isOpen={isOpenModal} onClose={closeModal} />
         <div className="container-body">
            <div className="body-container">
               <div className="main-container">
                  <div className="title-todoList">
                     <h1>To-Do List</h1>
                  </div>
                  <form onSubmit={handleSubmit}>
                     <div className="box-add-task">
                        <div className="input-add-task">
                           <input
                              value={taskInput.content}
                              onChange={handleChangeInput}
                              name="content"
                              type="text"
                              placeholder="Enter new task here"
                              required
                           />

                           <div className="func-submit-input-task">
                              <i onClick={() => openModalTaskDetail()} className="bi bi-exclamation-circle"></i>
                              <div className="container-btn-add-task">
                                 <i className="bi bi-plus"></i>
                                 <button disabled={isLoading} className="btn-add-task" type="submit">
                                    {isLoading ? "Add..." : "Add task"}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </form>

                  <div className="container-title-list-task">
                     <div className="title-list-task">
                        <p>Total task: {task ? task.length : 0}</p>
                     </div>
                     <div className="func-list-task">
                        <p
                           onClick={() => {
                              openSectionIncomplete();
                              filterTaskByStatus("incomplete");
                           }}
                           className={incomplete ? "check" : ""}
                        >
                           Incomplete
                        </p>
                        <p
                           onClick={() => {
                              openSectionComplete();
                              filterTaskByStatus("complete");
                           }}
                           className={complete ? "check" : ""}
                        >
                           Complete
                        </p>
                        <p
                           onClick={() => {
                              openSectionAll();
                              filterTaskByStatus("all");
                           }}
                           className={all ? "check" : ""}
                        >
                           All
                        </p>
                     </div>
                  </div>
                  <ListTask onUpdateStatus={updateTaskStatus} tasks={filterTask} />
               </div>
            </div>
            <div className="chat-gemini">
               <h2 className="title-chat-gemini">Don&apos;t know how to plan your idea? I can help!</h2>
               <div className="container-chatbox">
                  <input
                     value={inputChatBox}
                     onChange={(e) => setInputChatBox(e.target.value)}
                     type="text"
                     className="chat-box-gemini"
                     placeholder="Enter your question here..."
                  />
                  <button onClick={handleSend} className="btn-chatbox">
                     <i className="bi bi-send-fill"></i>
                  </button>
               </div>
               <div className="respone-chatbox">
                  {responeChatBox && <p className="tiltle-result-chatbox">Result: </p>}
                  <div className="container-resul-chatbox">{GeminiResponse(responeChatBox)}</div>
               </div>
            </div>
         </div>
      </>
   );
}
