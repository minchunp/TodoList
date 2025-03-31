import { useEffect, useState } from "react"

const useDeadlineWarning = (deadlineTime: string) => {
   const [showWarning, setShowWarning] = useState(false);

   useEffect(() => {
      if (!deadlineTime) return;

      const checkDateWarming = () => {
         const dateNow = new Date();
         const dateDeadline = new Date(deadlineTime);
         const timeDiff = dateDeadline.getTime() - dateNow.getTime();

         setShowWarning(timeDiff <= 10 * 60 * 1000 && timeDiff > 0);
      };

      checkDateWarming();
      const interval = setInterval(checkDateWarming, 60 * 1000);
      return () => clearInterval(interval);
   }, [deadlineTime]);

   return showWarning;
}

export default useDeadlineWarning;