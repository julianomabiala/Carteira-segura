import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Razao } from "../tipos/analise";

type Propriedades = {
  razoes: Razao[];
  nivelRisco: "segura" | "risco";
};

export function IndicadoresAnalise({ razoes, nivelRisco }: Propriedades) {
  if (razoes.length === 0) return null;

  const icone = nivelRisco === "segura" ? CheckCircle2 : AlertTriangle;
  const cor = nivelRisco === "segura" ? "text-green-600" : "text-amber-600";
  const fundo = nivelRisco === "segura" ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100";
  const Icone = icone;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">Por que esta classificação?</h3>
      <div className="mt-4 grid gap-3">
        {razoes.map((razao) => (
          <article key={razao.titulo} className={`flex gap-3 rounded-md border ${fundo} p-4`}>
            <Icone className={`mt-0.5 h-5 w-5 shrink-0 ${cor}`} aria-hidden />
            <div>
              <h4 className="font-semibold text-slate-950">{razao.titulo}</h4>
              <p className="mt-1 text-sm text-slate-600">{razao.descricao}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
