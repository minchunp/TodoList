import { addTasks, deleteTask, getTask, getTaskByCotent, getTasks, updateStatusTask, updateTask } from "@/apis/tasks.api";
import { TaskInterface } from "@/types/tasks.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/context/ReactQueryProvider";

// Fetch list task
export const useTasks = (page?: string | number) => {
   return useQuery({
      queryKey: ["tasks"],
      queryFn: () => getTasks(page),
   });
};

// Fetch task
export const useTask = (id: string) => {
   return useQuery({
      queryKey: ["task", id],
      queryFn: () => getTask(id),
      staleTime: 0,
   });
};

// Search task
export const useSearchTask = (content: string) => {
   return useQuery({
      queryKey: ["taskSearch", content],
      queryFn: () => getTaskByCotent(content),
   });
};

// Add new Task
export const useAddTask = () => {
   return useMutation({
      mutationFn: (newTask: Omit<TaskInterface, "id">) => {
         return addTasks(newTask);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
   });
};

// Update status task
export const useUpdateStatusTask = () => {
   return useMutation({
      mutationFn: ({ id, newStatus }: { id: string | number; newStatus: string }) => updateStatusTask(id, newStatus),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
   });
};

// Update task
export const useUpdateTask = (id: string | number, taskInput: TaskInterface) => {
   return useMutation({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mutationFn: (_) => updateTask(id, taskInput),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
   });
};

// Delete task
export const useDeleteTask = () => {
   return useMutation({
      mutationFn: (id: string) => deleteTask(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
   });
};
