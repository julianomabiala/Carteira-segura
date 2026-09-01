import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./configuracao/wallet";
import { PaginaPrincipal } from "./paginas/PaginaPrincipal";
import "./estilos.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PaginaPrincipal />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
