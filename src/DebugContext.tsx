import React, { createContext, useContext, useState } from 'react';

type DebugContextType = {
  debug: boolean;
  setDebug: (value: boolean) => void;
  messages: string[];
  addMessage: (message: string) => void;
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debug, setDebug] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <DebugContext.Provider value={{ debug, setDebug, messages, addMessage }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = (): DebugContextType => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
