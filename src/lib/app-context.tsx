import { createContext, useContext } from "react";

type AppContextType = {
  session: { user: { name?: string; image?: string } } | null;
  handleLogout: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppLayout");
  }
  return context;
};

export const AppContextProvider = AppContext.Provider;

