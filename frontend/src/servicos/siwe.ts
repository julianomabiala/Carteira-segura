import { signInWithCustomToken } from "firebase/auth";
import { auth } from "./firebase";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const API_PREFIX = API ? API : "";

export async function obterNonce(): Promise<string> {
  const resp = await fetch(`${API_PREFIX}/api/siwe/nonce`);
  const corpo = await resp.json();
  return corpo.nonce;
}

export async function verificarAssinatura(message: string, signature: string): Promise<{ uid: string; token?: string }>{
  const resp = await fetch(`${API_PREFIX}/api/siwe/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature })
  });

  const corpo = await resp.json();
  if (!resp.ok) throw new Error(corpo.mensagem ?? "Erro ao verificar assinatura");

  if (corpo.token) {
    // sign in to firebase with custom token
    await signInWithCustomToken(auth, corpo.token);
  }

  return { uid: corpo.uid, token: corpo.token };
}
