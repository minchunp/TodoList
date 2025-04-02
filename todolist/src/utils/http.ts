import { baseURL } from "@/contants/config";
import axios, { AxiosInstance } from "axios";

const Http = (): AxiosInstance => {
   return axios.create({
      baseURL: baseURL.baseLocalURL,
      timeout: 10000,
      headers: {
         "Content-Type": "application/json",
      },
   });
};

const http = Http();

export default http;
