import { Router } from "express";
import {
  obterNonce,
  verificarSiwe,
  obterSessao,
  terminarSessao
} from "../controladores/controladorAuth.js";

export const rotasAuth = Router();

rotasAuth.get("/siwe/nonce", obterNonce);
rotasAuth.post("/siwe/verify", verificarSiwe);
rotasAuth.get("/siwe/session", obterSessao);
rotasAuth.post("/siwe/logout", terminarSessao);
