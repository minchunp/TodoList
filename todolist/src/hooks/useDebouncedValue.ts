import { useEffect, useState } from "react";

export const useDebouncedValue = (value: string, delay: number) => {
   const [debounceValue, setDebounceValue] = useState(value);

   useEffect(() => {
      const hander = setTimeout(() => {
         setDebounceValue(value);
      }, delay);

      return () => clearTimeout(hander);
   }, [value, delay]);

   return debounceValue;
};
