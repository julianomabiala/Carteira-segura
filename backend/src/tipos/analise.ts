export type RedeSuportada = "ethereum" | "bnb" | "polygon" | "arbitrum";

export type NivelRisco = "baixo" | "atencao" | "alto";

export type Razao = {
  titulo: string;
  descricao: string;
};

export type PedidoAnalise = {
  wallet: string;
  network: RedeSuportada;
};

export type ClassificacaoRisco = {
  nivel: NivelRisco;
  titulo: string;
  explicacao: string;
  razoes: Razao[];
};

export type RespostaAnalise = ClassificacaoRisco & {
  rede: RedeSuportada;
  endereco: string;
  analisadoEm: string;
  detalhesTecnicos: unknown;
};
