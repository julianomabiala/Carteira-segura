export type RedeSuportada = "ethereum" | "bnb" | "polygon" | "arbitrum";

export type NivelRisco = "baixo" | "alto";

export type Razao = {
  titulo: string;
  descricao: string;
};

export type ResultadoAnalise = {
  nivel: NivelRisco;
  titulo: string;
  explicacao: string;
  razoes: Razao[];
  rede: RedeSuportada;
  endereco: string;
  analisadoEm: string;
  detalhesTecnicos: unknown;
};

export type PedidoAnalise = {
  wallet: string;
  network: RedeSuportada;
};
