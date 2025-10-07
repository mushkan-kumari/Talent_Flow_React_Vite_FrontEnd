import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'
import { makeServer } from "./api/server";

if (process.env.NODE_ENV === "development") {
  makeServer();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


