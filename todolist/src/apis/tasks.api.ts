import { TaskInterface } from "@/types/tasks.type";
import http from "@/utils/http";

export const getTasks = (page?: number | string, limit?: number | string) =>
   http.get<TaskInterface[]>("/tasks", {
      params: {
         page: page,
         limit: limit,
      },
   });

export const getTask = (id: string | number) => http.get<TaskInterface>(`/tasks/${id}`);

export const getTaskByCotent = (content: string) => http.get<TaskInterface[]>(`/tasks?content=${content}`);

export const addTasks = (task: Omit<TaskInterface, "id">) => http.post<TaskInterface>("/tasks", task);

export const updateTask = (id: string | number, task: TaskInterface) => http.patch<TaskInterface>(`/tasks/${id}`, task);

export const updateStatusTask = (id: string | number, status: string) => http.patch<TaskInterface>(`/tasks/${id}`, { status });

export const deleteTask = (id: string | number) => http.delete(`tasks/${id}`);
