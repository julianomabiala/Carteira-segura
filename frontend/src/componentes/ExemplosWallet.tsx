import type { RedeSuportada } from "../tipos/analise";

type Exemplo = {
  nome: string;
  endereco: string;
  rede: RedeSuportada;
};

const exemplos: Exemplo[] = [
  {
    nome: "Carteira Ethereum conhecida",
    endereco: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    rede: "ethereum"
  },
  {
    nome: "Carteira Polygon conhecida",
    endereco: "0x0000000000000000000000000000000000001010",
    rede: "polygon"
  }
];

type Propriedades = {
  aoEscolher: (exemplo: Exemplo) => void;
};

export function ExemplosWallet({ aoEscolher }: Propriedades) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-normal text-slate-500">Experimentar um exemplo</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {exemplos.map((exemplo) => (
          <button
            key={exemplo.endereco}
            type="button"
            onClick={() => aoEscolher(exemplo)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {exemplo.nome}
          </button>
        ))}
      </div>
    </section>
  );
}
