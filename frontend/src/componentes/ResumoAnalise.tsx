import { Copy } from "lucide-react";
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
    ["Rede", nomeRede(resultado.rede)],
    ["Endereco", encurtarEndereco(resultado.endereco)],
    ["Analise realizada", formatarDataAgora(resultado.analisadoEm)]
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">Detalhes da Verificação</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {itens.map(([nome, valor]) => (
          <div key={nome} className="rounded-md border border-slate-100 bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-500">{nome}</dt>
            <dd className="mt-1 flex min-h-7 items-center gap-2 break-all font-semibold text-slate-950">
              {valor}
              {nome === "Endereco" ? (
                <button
                  type="button"
                  onClick={copiarEndereco}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  title="Copiar endereco completo"
                  aria-label="Copiar endereco completo"
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
