import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { NivelRisco, Razao } from "../tipos/analise";

type Propriedades = {
  razoes: Razao[];
  nivelRisco: NivelRisco;
};

export function IndicadoresAnalise({ razoes, nivelRisco }: Propriedades) {
  if (razoes.length === 0) return null;

  const mapa = {
    baixo: {
      icone: CheckCircle2,
      borda: "border-emerald-200 bg-emerald-50 text-emerald-800",
      badge: "bg-emerald-100 text-emerald-800"
    },
    atencao: {
      icone: AlertTriangle,
      borda: "border-amber-200 bg-amber-50 text-amber-800",
      badge: "bg-amber-100 text-amber-800"
    },
    alto: {
      icone: ShieldAlert,
      borda: "border-rose-200 bg-rose-50 text-rose-800",
      badge: "bg-rose-100 text-rose-800"
    }
  } as const;

  const estilo = mapa[nivelRisco];
  const Icone = estilo.icone;

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${estilo.badge}`}>
          <Icone className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sinais</p>
          <h3 className="text-xl font-bold text-slate-950">Por que esta carteira recebeu esta classificação?</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {razoes.map((razao) => (
          <article key={razao.titulo} className={`flex gap-4 rounded-2xl border p-4 ${estilo.borda}`}>
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80">
              <Icone className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-950">{razao.titulo}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-700">{razao.descricao}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
