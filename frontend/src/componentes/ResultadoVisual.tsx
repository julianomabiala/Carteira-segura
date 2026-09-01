import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { ResultadoAnalise } from "../tipos/analise";

type Propriedades = {
  resultado: ResultadoAnalise;
};

const estilos = {
  baixo: {
    classe: "border-emerald-200 bg-emerald-50 text-emerald-950",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icone: CheckCircle2
  },
  atencao: {
    classe: "border-amber-200 bg-amber-50 text-amber-950",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icone: AlertTriangle
  },
  alto: {
    classe: "border-rose-200 bg-rose-50 text-rose-950",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    icone: ShieldAlert
  }
} as const;

export function ResultadoVisual({ resultado }: Propriedades) {
  const Icone = estilos[resultado.nivel].icone;

  const recomendacao = {
    baixo: "Esta carteira aparenta um perfil de risco aceitável. Pode prosseguir com prudência habitual.",
    atencao: "Recomendamos que verifique a origem dos fundos e as interações recentes antes de confirmar qualquer ação.",
    alto: "Evite confirmar transferências ou interações sem validação extra. O risco detetado é material."
  }[resultado.nivel];

  return (
    <section className={`rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8 ${estilos[resultado.nivel].classe}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <Icone className="h-8 w-8" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Resultado</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{resultado.titulo}</h2>
          </div>
        </div>

        <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${estilos[resultado.nivel].badge}`}>
          {resultado.nivel === "baixo" ? "Baixo risco" : resultado.nivel === "atencao" ? "Atenção" : "Alto risco"}
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700">{resultado.explicacao}</p>

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/60 p-4 text-sm leading-6 text-slate-800">
        <span className="font-semibold">Recomendação:</span> {recomendacao}
      </div>
    </section>
  );
}
