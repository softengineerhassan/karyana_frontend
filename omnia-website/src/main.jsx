import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import setupAxios from "./Services/setupAxios";
import "./i18n";
import ToasterComponent from "./helpers/Toaster";
import { BrowserRouter } from "react-router-dom";

// Initialize axios interceptors (token injection + 401 refresh)
setupAxios(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ToasterComponent />
    </Provider>
  </StrictMode>
);
