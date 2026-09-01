import { Copy, Network, ShieldCheck, TimerReset } from "lucide-react";
import type { ResultadoAnalise } from "../tipos/analise";
import { encurtarEndereco, formatarDataAgora } from "../servicos/formatacao";
import { nomeRede } from "../servicos/redes";

type Propriedades = {
  resultado: ResultadoAnalise;
};

export function ResumoAnalise({ resultado }: Propriedades) {
  async function copiarEndereco() {
    await navigator.clipboard.writeText(resultado.endereco);
  }

  const itens = [
    { nome: "Rede", valor: nomeRede(resultado.rede), icone: Network },
    { nome: "Endereço", valor: encurtarEndereco(resultado.endereco), icone: ShieldCheck },
    { nome: "Análise realizada", valor: formatarDataAgora(resultado.analisadoEm), icone: TimerReset }
  ];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] sm:p-6">
      <h3 className="text-xl font-bold text-slate-950">Resumo da verificação</h3>
      <dl className="mt-5 grid gap-4 md:grid-cols-3">
        {itens.map(({ nome, valor, icone: Icone }) => (
          <div key={nome} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Icone className="h-4 w-4" aria-hidden />
              {nome}
            </dt>
            <dd className="mt-3 flex min-h-7 items-center gap-2 break-all text-base font-semibold text-slate-950">
              {valor}
              {nome === "Endereço" ? (
                <button
                  type="button"
                  onClick={copiarEndereco}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                  title="Copiar endereço completo"
                  aria-label="Copiar endereço completo"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
