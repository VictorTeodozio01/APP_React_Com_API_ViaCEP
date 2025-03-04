import { useState } from "react";


export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Erro ao acessar o localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
      window.sessionStorage.setItem(key, JSON.stringify(value)); 
    } catch (error) {
      console.error("Erro ao salvar no localStorage/sessionStorage:", error);
    }
  };

  return [storedValue, setValue] as const;
}