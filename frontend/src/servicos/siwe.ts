const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

const API_PREFIX = API || "";

export type SessaoWallet = {
  autenticado: true;
  wallet: string;
  expiresAt: string;
};

async function obterCorpo(resp: Response): Promise<any> {
  const tipo = resp.headers.get("content-type") ?? "";

  if (tipo.includes("application/json")) {
    return resp.json();
  }

  return {};
}

export async function obterNonce(): Promise<string> {
  const resp = await fetch(`${API_PREFIX}/api/siwe/nonce`, {
    credentials: "include"
  });

  const corpo = await obterCorpo(resp);

  if (!resp.ok || !corpo.nonce) {
    throw new Error(
      corpo.mensagem ?? "Não foi possível obter o nonce."
    );
  }

  return corpo.nonce;
}

export async function verificarAssinatura(
  message: string,
  signature: string
): Promise<SessaoWallet> {
  const resp = await fetch(`${API_PREFIX}/api/siwe/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      message,
      signature
    })
  });

  const corpo = await obterCorpo(resp);

  if (!resp.ok) {
    throw new Error(
      corpo.mensagem ?? "Erro ao verificar assinatura."
    );
  }

  return corpo as SessaoWallet;
}

export async function obterSessao(): Promise<SessaoWallet | null> {
  const resp = await fetch(`${API_PREFIX}/api/siwe/session`, {
    credentials: "include"
  });

  if (resp.status === 401) {
    return null;
  }

  const corpo = await obterCorpo(resp);

  if (!resp.ok) {
    throw new Error(
      corpo.mensagem ?? "Não foi possível verificar a sessão."
    );
  }

  return corpo as SessaoWallet;
}

export async function terminarSessao(): Promise<void> {
  const resp = await fetch(`${API_PREFIX}/api/siwe/logout`, {
    method: "POST",
    credentials: "include"
  });

  if (!resp.ok) {
    const corpo = await obterCorpo(resp);

    throw new Error(
      corpo.mensagem ?? "Não foi possível terminar a sessão."
    );
  }
}
