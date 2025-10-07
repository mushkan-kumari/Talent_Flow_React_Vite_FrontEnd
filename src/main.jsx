/*import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { App } from "./App";
import { worker } from "./api/msw";
import "./index.css";

// Start MSW (mock API)
worker.start();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);*/


/*
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ensureSeed } from "./db";
ensureSeed();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
  */

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


