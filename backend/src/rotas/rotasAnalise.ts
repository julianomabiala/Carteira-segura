import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  criarAnalise,
  criarAnaliseContrato
} from "../controladores/controladorAnalise.js";
import { exigirSessao } from "../middleware/autenticacaoSessao.js";

export const rotasAnalise = Router();

const limiteAnalise = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    codigo: "MUITOS_PEDIDOS",
    mensagem:
      "Foram feitos muitos pedidos. Aguarde um momento e tente novamente."
  }
});

rotasAnalise.post(
  "/scan",
  limiteAnalise,
  exigirSessao,
  criarAnalise
);

rotasAnalise.post(
  "/contract-scan",
  limiteAnalise,
  exigirSessao,
  criarAnaliseContrato
);
