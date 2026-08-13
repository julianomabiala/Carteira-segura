export function encurtarEndereco(endereco: string): string {
  if (endereco.length <= 14) return endereco;
  return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
}

export function formatarDataAgora(valorIso: string): string {
  const data = new Date(valorIso);
  if (Number.isNaN(data.getTime())) return "Agora mesmo";
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(data);
}
