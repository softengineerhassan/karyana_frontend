import { createContext, useContext, useState } from "react";

const NavbarTitleContext = createContext();

export function NavbarTitleProvider({ children }) {
  const [title, setTitle] = useState("");

  return (
    <NavbarTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </NavbarTitleContext.Provider>
  );
}

export function useNavbarTitle() {
  const context = useContext(NavbarTitleContext);
  if (!context) {
    throw new Error("useNavbarTitle must be used within a NavbarTitleProvider");
  }
  return context;
}
