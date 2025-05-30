import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export const fetchGeminiRespone = async (prompt: string) => {
   try { 
      const respone = await axios.post(GEMINI_API_URL, {
         contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      console.log("Call API Chat Gemini thành công:", respone.data);
      return respone.data.candidates[0].content.parts[0].text;
   } catch (error) {
      console.log('Lỗi khi call API Chat Gemini', error);
   }
}


