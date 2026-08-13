import { Loader2, Search } from "lucide-react";
import type { FormEvent } from "react";
import type { RedeSuportada } from "../tipos/analise";
import { redes } from "../servicos/redes";

type Propriedades = {
  endereco: string;
  rede: RedeSuportada;
  carregando: boolean;
  aoAlterarEndereco: (valor: string) => void;
  aoAlterarRede: (valor: RedeSuportada) => void;
  aoSubmeter: () => void;
};

export function FormularioAnalise({
  endereco,
  rede,
  carregando,
  aoAlterarEndereco,
  aoAlterarRede,
  aoSubmeter
}: Propriedades) {
  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aoSubmeter();
  }

  return (
    <form onSubmit={submeter} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="wallet">
          Endereco da wallet
        </label>
        <input
          id="wallet"
          value={endereco}
          onChange={(evento) => aoAlterarEndereco(evento.target.value)}
          placeholder="Ex.: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          autoComplete="off"
          inputMode="text"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="rede">
          Rede
        </label>
        <select
          id="rede"
          value={rede}
          onChange={(evento) => aoAlterarRede(evento.target.value as RedeSuportada)}
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        >
          {redes.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {carregando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
        {carregando ? "A analisar carteira..." : "Verificar carteira"}
      </button>
    </form>
  );
}
