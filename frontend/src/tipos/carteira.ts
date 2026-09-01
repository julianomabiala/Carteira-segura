import type { RedeSuportada } from "./analise";

export type CarteiraUsuario = {
  id: string;
  address: string;
  network: RedeSuportada;
  chainId: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
};

export type UsuarioAutenticado = {
  uid: string;
  email: string | null;
};
