import { ArrowRight, Loader2, Search, ShieldCheck, Wallet } from "lucide-react";
import type { FormEvent } from "react";
import type { RedeSuportada } from "../tipos/analise";
import { redes } from "../servicos/redes";

type Propriedades = {
  endereco: string;
  rede: RedeSuportada;
  carregando: boolean;
  redeDaWallet: string | null;
  chainIdCarteira?: number;
  providerCarteira?: string;
  erroRede: string;
  carteiraConectada?: string;
  aoAlterarEndereco: (valor: string) => void;
  aoAlterarRede: (valor: RedeSuportada) => void;
  aoSubmeter: () => void;
  aoUsarCarteiraConectada?: () => void;
};

export function FormularioAnalise({
  endereco,
  rede,
  carregando,
  redeDaWallet,
  chainIdCarteira,
  providerCarteira,
  erroRede,
  carteiraConectada,
  aoAlterarEndereco,
  aoAlterarRede,
  aoSubmeter,
  aoUsarCarteiraConectada
}: Propriedades) {
  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aoSubmeter();
  }

  return (
    <form onSubmit={submeter} className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scanner</p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">Análise de risco</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Live security check
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="wallet">
            Endereço da wallet
          </label>
          <input
            id="wallet"
            value={endereco}
            onChange={(evento) => aoAlterarEndereco(evento.target.value)}
            placeholder="Ex.: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
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
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
          >
            {redes.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={[
          "grid gap-2 rounded-xl border px-4 py-3 text-sm sm:grid-cols-3",
          erroRede
            ? "border-amber-200 bg-amber-50 text-amber-950"
            : "border-slate-200 bg-slate-50 text-slate-700"
        ].join(" ")}
        role={erroRede ? "alert" : "status"}
      >
        <span>
          Wallet: <strong>{redeDaWallet ?? "Rede não suportada"}</strong>
        </span>
        <span>
          Chain ID: <strong>{chainIdCarteira ?? "—"}</strong>
        </span>
        <span>
          Provider: <strong>{providerCarteira ?? "não identificado"}</strong>
        </span>
        {erroRede ? (
          <span className="font-semibold sm:col-span-3">{erroRede}</span>
        ) : null}
      </div>

      {carteiraConectada ? (
        <button
          type="button"
          onClick={aoUsarCarteiraConectada}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
        >
          <Wallet className="h-4 w-4" aria-hidden />
          Usar wallet conectada: {carteiraConectada.slice(0, 6)}...{carteiraConectada.slice(-4)}
        </button>
      ) : null}

      <button
        type="submit"
        disabled={carregando || Boolean(erroRede)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {carregando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
        {carregando ? "A analisar carteira..." : "Verificar carteira"}
        {!carregando ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
      </button>
    </form>
  );
}
