import React from "react";
import ReactDOM from "react-dom/client";
import { PaginaPrincipal } from "./paginas/PaginaPrincipal";
import "./estilos.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PaginaPrincipal />
  </React.StrictMode>
);
