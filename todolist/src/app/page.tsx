"use client";
import React, { useCallback, useEffect, useState } from "react";
import ListTask from "../components/task/listTask";
import ModalError from "../components/modalError/page";
import ModalDetailTask from "../components/modalDetailTask/page";
import { fetchGeminiRespone } from "../utils/geminiRespone";
import ReactMarkdown from "react-markdown";
import { BarLoader, PuffLoader } from "react-spinners";
import { ReactQueryProvider } from "@/context/ReactQueryProvider";
import { useAddTask, useSearchTask, useTasks } from "@/hooks/useTodo";
import { TaskInterface } from "@/types/tasks.type";
import { toast, ToastContainer } from "react-toastify";
import { queryClient } from "@/context/ReactQueryProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type TaskInputType = Omit<TaskInterface, "id">;
const initialTaskInput: TaskInputType = {
   content: "",
   description: "",
   startTime: "",
   deadline: "",
   status: "incomplete",
};

enum Modal {
   NONE,
   ERROR,
   UPDATE,
}

enum Loading {
   NONE,
   INPUT_ADD,
   CHATBOX_AI,
}

export default function Home() {
   const [taskInput, setTaskInput] = useState<TaskInputType>(initialTaskInput);
   const [isOpenModal, setIsOpenModal] = useState<Modal>(Modal.NONE);
   const [complete, setComplete] = useState(false);
   const [incomplete, setIncomplete] = useState(false);
   const [all, setAll] = useState(true);
   const [isLoadingInput, setIsLoadingInput] = useState<Loading>(Loading.NONE);
   const [inputChatBox, setInputChatBox] = useState("");
   const [responeChatBox, setResponeChatBox] = useState("");
   const [searchInput, setSearchInput] = useState("");
   const [filteredSearchTask, setFilteredSearchTask] = useState<TaskInterface[] | undefined>([]);
   const [isInputSearch, setIsInputSearch] = useState(false);
   const addNewTask = useAddTask();
   const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTaskInput({ ...taskInput, [e.target.name]: e.target.value });
   };

   // Func điều chỉnh hiệu ứng active Filter title
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

   //  Fetch data tasks
   const { data: tasks, isLoading } = useTasks();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoadingInput == Loading.INPUT_ADD) return;
      setIsLoadingInput(Loading.INPUT_ADD);

      // Check trùng content trong list task
      const isContentExist = tasks?.data.some((t: TaskInterface) => t.content.toLowerCase() === taskInput.content.toLowerCase());
      if (isContentExist) {
         openModal(Modal.ERROR);
         setIsLoadingInput(Loading.NONE);
         return;
      }

      try {
         if (taskInput) {
            addNewTask.mutate(taskInput, {
               onSuccess: (dataTask) => {
                  toast.success("The task has been added successfully!");
                  console.log("Thêm data task thành công!", dataTask.data);
                  queryClient.invalidateQueries({ queryKey: ["tasks"] });
               },
               onError: () => {
                  toast.error("The task has been added failed!");
               },
            });
         }
      } catch (error) {
         console.log("Thêm task thất bại!", error);
      } finally {
         setIsLoadingInput(Loading.NONE);
         setTaskInput({
            content: "",
            description: "",
            startTime: "",
            deadline: "",
            status: "incomplete",
         });
      }
   };

   // Hàm Filter các task dựa trên status
   const filterTaskByStatus = useCallback(
      (status: string) => {
         if (!tasks?.data) return []; // Nếu chưa có dữ liệu, trả về mảng rỗng
         return status === "all" ? tasks.data : tasks.data.filter((t) => t.status === status);
      },
      [tasks?.data]
   );

   useEffect(() => {
      if (tasks?.data) {
         if (complete) {
            filterTaskByStatus("complete");
         } else if (incomplete) {
            filterTaskByStatus("incomplete");
         } else {
            filterTaskByStatus("all");
         }
      }
   }, [tasks?.data, complete, incomplete, filterTaskByStatus]);

   // Func open/close Modal ở trang Home
   const openModal = (statusModal: Modal) => setIsOpenModal(statusModal);
   const closeModal = () => setIsOpenModal(Modal.NONE);

   //  Handle chatbox Gemini
   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputChatBox.trim() || isLoadingInput == Loading.CHATBOX_AI) return;
      setIsLoadingInput(Loading.CHATBOX_AI);

      try {
         const result = await fetchGeminiRespone(inputChatBox);
         setResponeChatBox(result);
      } catch (error) {
         console.log("Có lỗi xảy ra trong quá trình xuất kết quả Gemini!", error);
      } finally {
         setIsLoadingInput(Loading.NONE);
      }
   };

   // Định dạng cho kết quả từ Gemini
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const GeminiResponse = (response: any) => {
      return <ReactMarkdown>{response}</ReactMarkdown>;
   };

   // Tìm kiếm tên task
   const removeVNTones = (string: string) => {
      return string
         .normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "")
         .toLowerCase();
   };

   const debounceSearch = useDebouncedValue(searchInput, 500);
   const itemSearch = useSearchTask(debounceSearch);
   console.log(decodeURI('Task%20detail%20num1'));
   useEffect(() => {
      if (debounceSearch.trim() === "") {
         setFilteredSearchTask([]);
         return;
      }

      const normalizedSearch = removeVNTones(debounceSearch);
      const filterd = itemSearch.data?.data.filter((task) => removeVNTones(task.content).includes(normalizedSearch));
      setFilteredSearchTask(filterd);
   }, [debounceSearch, itemSearch.data?.data]);

   const openInputSearch = () => setIsInputSearch(true);
   const closeInputSearch = () => {
      setFilteredSearchTask([]);
      setSearchInput("");
      setIsInputSearch(false);
   };

   return (
      <>
         <ToastContainer />
         <ReactQueryProvider>
            <ModalDetailTask isOpen={isOpenModal === Modal.UPDATE} onClose={closeModal} tasks={tasks?.data} />
            <ModalError contentError="This task already exists!" isOpen={isOpenModal === Modal.ERROR} onClose={closeModal} />
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
                                 <i onClick={() => openModal(Modal.UPDATE)} className="bi bi-exclamation-circle"></i>
                                 <div className="container-btn-add-task">
                                    <i className="bi bi-plus"></i>
                                    <button disabled={isLoadingInput === Loading.INPUT_ADD} className="btn-add-task" type="submit">
                                       {isLoadingInput === Loading.INPUT_ADD ? "Add..." : "Add task"}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </form>

                     {/* Container input search */}
                     <div className="container-input-search-task">
                        <i className="bi bi-search"></i>
                        <p onClick={() => openInputSearch()}>Search name task</p>
                     </div>

                     <div className={`main-search-task ${isInputSearch ? "active" : ""}`}>
                        <form onSubmit={handleSubmit}>
                           <div className="box-add-task box-search-task">
                              <div className="input-add-task">
                                 <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    name="content"
                                    type="text"
                                    placeholder="Enter the task you want to search for here"
                                    required
                                 />

                                 <div className="func-submit-input-task">
                                    <div className="container-btn-add-task">
                                       <i className="bi bi-search"></i>
                                       <button disabled={isLoadingInput === Loading.INPUT_ADD} className="btn-add-task" type="submit">
                                          {isLoadingInput === Loading.INPUT_ADD ? "Add..." : "Search"}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </form>

                        <div onClick={() => closeInputSearch()} className="func-cancel-search">
                           <i className="bi bi-x"></i>
                        </div>
                     </div>

                     <div className="container-title-list-task">
                        <div className="title-list-task">
                           <p>Total task: {tasks?.data ? tasks.data.length : 0}</p>
                        </div>
                        <div className="func-list-task">
                           <p
                              onClick={() => {
                                 openSectionAll();
                                 filterTaskByStatus("all");
                              }}
                              className={all ? "check" : ""}
                           >
                              All
                           </p>
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
                        </div>
                     </div>
                     {isLoading && <BarLoader color="#fff" loading={true} width={"100%"} />}
                     {!isLoading && (
                        <ListTask
                           tasks={
                              filteredSearchTask?.length == 0
                                 ? filterTaskByStatus(all ? "all" : complete ? "complete" : "incomplete")
                                 : filteredSearchTask
                           }
                        />
                     )}
                  </div>
               </div>
               <div className="chat-gemini">
                  <h2 className="title-chat-gemini">Don&apos;t know how to plan your idea? I can help!</h2>
                  <form onSubmit={handleSend}>
                     <div className="container-chatbox">
                        <input
                           value={inputChatBox}
                           onChange={(e) => setInputChatBox(e.target.value)}
                           type="text"
                           className="chat-box-gemini"
                           placeholder="Enter your question here..."
                        />
                        <button disabled={isLoadingInput === Loading.CHATBOX_AI} className="btn-chatbox">
                           <i className="bi bi-send-fill"></i>
                        </button>
                     </div>
                  </form>

                  {isLoadingInput === Loading.CHATBOX_AI && (
                     <div className="container-loading">
                        <PuffLoader color="#000" loading={true} size={50} />
                     </div>
                  )}

                  <div className="respone-chatbox">
                     {responeChatBox && <p className="tiltle-result-chatbox">Result: </p>}
                     <div className="container-resul-chatbox">{GeminiResponse(responeChatBox)}</div>
                  </div>
               </div>
            </div>
         </ReactQueryProvider>
      </>
   );
}
