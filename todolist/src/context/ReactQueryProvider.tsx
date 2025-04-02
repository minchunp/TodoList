"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       refetchOnWindowFocus: false,
       retry: 0
     }
   }
 })
export const ReactQueryProvider = ({children} : {children: ReactNode}) => {
   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}