import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc } from "firebase/firestore";
import type { RedeSuportada } from "../tipos/analise";
import { db } from "./firebase";

export type WalletFirestore = {
  id: string;
  address: string;
  network: RedeSuportada;
  chainId: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnaliseFirestore = {
  nivel: "baixo" | "atencao" | "alto";
  titulo: string;
  explicacao: string;
  razoes: Array<{ titulo: string; descricao: string }>;
  rede: RedeSuportada;
  endereco: string;
  analisadoEm: string;
};

export type AnaliseHistorico = AnaliseFirestore & {
  id: string;
  walletId: string;
};

function normalizarEndereco(address: string): string {
  return address.trim().toLowerCase();
}

export async function salvarCarteiraUsuario(
  uid: string,
  dados: { address: string; network: RedeSuportada; chainId: number; label?: string }
): Promise<string> {
  const normalizedAddress = normalizarEndereco(dados.address);
  const colecao = collection(db, "users", uid, "wallets");
  const snapshot = await getDocs(colecao);
  const existente = snapshot.docs.find(
    (item) =>
      normalizarEndereco(String(item.data().address ?? "")) === normalizedAddress &&
      String(item.data().network ?? "") === dados.network
  );

  if (existente) {
    return existente.id;
  }

  const ref = doc(colecao);
  const agora = new Date().toISOString();

  await setDoc(ref, {
    address: normalizedAddress,
    network: dados.network,
    chainId: dados.chainId,
    label: dados.label ?? "",
    createdAt: agora,
    updatedAt: agora,
    createdAtServer: serverTimestamp()
  });

  return ref.id;
}

export async function listarCarteirasUsuario(uid: string): Promise<WalletFirestore[]> {
  const colecao = collection(db, "users", uid, "wallets");
  const snapshot = await getDocs(query(colecao));

  return snapshot.docs.map((item) => {
    const dados = item.data() as Partial<WalletFirestore>;
    return {
      id: item.id,
      address: String(dados.address ?? ""),
      network: String(dados.network ?? "ethereum") as RedeSuportada,
      chainId: Number(dados.chainId ?? 1),
      label: typeof dados.label === "string" ? dados.label : undefined,
      createdAt: typeof dados.createdAt === "string" ? dados.createdAt : new Date().toISOString(),
      updatedAt: typeof dados.updatedAt === "string" ? dados.updatedAt : new Date().toISOString()
    };
  });
}

export async function removerCarteiraUsuario(uid: string, walletId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "wallets", walletId));
}

export async function listarAnalisesUsuario(uid: string, walletId: string): Promise<AnaliseHistorico[]> {
  const colecao = collection(db, "users", uid, "wallets", walletId, "analyses");
  const snapshot = await getDocs(query(colecao));

  return snapshot.docs.map((item) => ({
    id: item.id,
    walletId,
    ...(item.data() as AnaliseFirestore)
  }));
}

export async function listarUltimasAnalisesUsuario(uid: string): Promise<AnaliseHistorico[]> {
  const carteiras = await listarCarteirasUsuario(uid);

  const analises: AnaliseHistorico[] = [];
  for (const wallet of carteiras) {
    const itens = await listarAnalisesUsuario(uid, wallet.id);
    analises.push(...itens);
  }

  return analises
    .sort((a, b) => new Date(b.analisadoEm).getTime() - new Date(a.analisadoEm).getTime())
    .slice(0, 4);
}

export async function guardarAnaliseUsuario(
  uid: string,
  walletId: string,
  dados: AnaliseFirestore
): Promise<void> {
  const colecao = collection(db, "users", uid, "wallets", walletId, "analyses");
  const ref = doc(colecao);

  await setDoc(ref, {
    ...dados,
    analysisId: ref.id,
    criadoEm: new Date().toISOString(),
    createdAtServer: serverTimestamp()
  });
}
