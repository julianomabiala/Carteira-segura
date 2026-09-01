import type { Request, Response } from "express";
import crypto from "crypto";
import { ethers } from "ethers";
import admin from "firebase-admin";

const nonces = new Map<string, number>();
const NONCE_TTL_MS = 5 * 60 * 1000;

function gerarNonce() {
  return crypto.randomBytes(8).toString("hex");
}

export async function obterNonce(_req: Request, res: Response) {
  const nonce = gerarNonce();
  nonces.set(nonce, Date.now());
  res.json({ nonce });
}

function initFirebaseAdminIfNeeded() {
  if (admin.apps.length > 0) return;
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    try {
      const parsed = JSON.parse(key);
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
      return;
    } catch (e) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY provided but invalid JSON.");
    }
  }

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    admin.initializeApp({ credential: admin.credential.cert(path as any) });
    return;
  }

  // If no service account available, admin features will throw later.
}

export async function verificarSiwe(req: Request, res: Response) {
  try {
    const { message, signature } = req.body as { message?: string; signature?: string };
    if (!message || !signature) {
      res.status(400).json({ codigo: "INVALIDO", mensagem: "Mensagem ou assinatura em falta." });
      return;
    }

    // check nonce within message
    const match = message.match(/Nonce:\s*([0-9a-fA-F]+)/i);
    const nonce = match ? match[1] : null;
    if (!nonce || !nonces.has(nonce)) {
      res.status(400).json({ codigo: "INVALID_NONCE", mensagem: "Nonce inválido ou expirado." });
      return;
    }

    // remove nonce to avoid replay
    nonces.delete(nonce);

    // recover address
    let recovered: string;
    try {
      recovered = ethers.verifyMessage(message, signature);
    } catch (e) {
      res.status(400).json({ codigo: "INVALID_SIGNATURE", mensagem: "Assinatura inválida." });
      return;
    }

    const uid = recovered.toLowerCase();

    // initialize admin if possible
    initFirebaseAdminIfNeeded();

    if (!admin.apps.length) {
      // no admin available: return basic success (frontend can continue but can't mint custom token)
      res.json({ uid, mensagem: "Autenticado (sem token server)." });
      return;
    }

    // create or get user and mint custom token
    try {
      const customToken = await admin.auth().createCustomToken(uid);
      res.json({ uid, token: customToken });
    } catch (e) {
      console.error(e);
      res.status(500).json({ codigo: "ADMIN_ERROR", mensagem: "Erro ao criar token de autenticação." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ codigo: "ERRO", mensagem: "Erro interno." });
  }
}
