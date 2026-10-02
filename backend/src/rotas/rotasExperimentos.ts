import { Router } from "express";
import {
  guardarEvidencia,
  listarEvidencias
} from "../controladores/controladorExperimentos.js";
import { exigirSessao } from "../middleware/autenticacaoSessao.js";

export const rotasExperimentos = Router();

rotasExperimentos.use(exigirSessao);

rotasExperimentos.get(
  "/experimentos/evidencias",
  listarEvidencias
);

rotasExperimentos.post(
  "/experimentos/evidencias",
  guardarEvidencia
);
