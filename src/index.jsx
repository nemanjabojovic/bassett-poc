import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const addMetaTags = () => {
  const metaTags = [
    { name: "Cache-Control", content: "no-cache, no-store, must-revalidate" },
    { name: "Pragma", content: "no-cache" },
    { name: "Expires", content: "0" },
  ];

  metaTags.forEach(({ name, content }) => {
    const meta = document.createElement("meta");
    meta.setAttribute("http-equiv", name);
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
  });
};

addMetaTags();

window.addEventListener("load", () => {
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    localStorage.clear(); // Clear localStorage
    sessionStorage.clear(); // Clear sessionStorage
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
// If wrapped in strict, it will render twice on dev
// root.render(<App />);
root.render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Routes>
      <Route path='/' element={<App />} />
    </Routes>
  </BrowserRouter>,
);
