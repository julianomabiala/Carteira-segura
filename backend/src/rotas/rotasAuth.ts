import { Router } from "express";
import { obterNonce, verificarSiwe } from "../controladores/controladorAuth.js";

export const rotasAuth = Router();

rotasAuth.get("/siwe/nonce", obterNonce);
rotasAuth.post("/siwe/verify", verificarSiwe);
