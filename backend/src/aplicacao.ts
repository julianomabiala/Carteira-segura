import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rotasAnalise } from "./rotas/rotasAnalise.js";

export function criarApp() {
  const app = express();
  const origensPermitidas = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(cors({ origin: origensPermitidas }));
  app.use(express.json({ limit: "12kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ estado: "ok" });
  });

  app.use("/api", rotasAnalise);

  app.use((_req, res) => {
    res.status(404).json({ codigo: "NAO_ENCONTRADO", mensagem: "Rota não encontrada." });
  });

  return app;
}
