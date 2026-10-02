import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  ShieldAlert
} from "lucide-react";
import type {
  NivelRisco,
  ResultadoAnalise
} from "../tipos/analise";

type Propriedades = {
  resultado: ResultadoAnalise;
};

const estilos: Record<
  NivelRisco,
  {
    classe: string;
    badge: string;
    icone:
      | typeof CheckCircle2
      | typeof AlertTriangle
      | typeof ShieldAlert
      | typeof CircleHelp;
  }
> = {
  baixo: {
    classe:
      "border-emerald-200 bg-emerald-50 text-emerald-950",
    badge:
      "bg-emerald-100 text-emerald-800 border-emerald-200",
    icone: CheckCircle2
  },
  atencao: {
    classe:
      "border-amber-200 bg-amber-50 text-amber-950",
    badge:
      "bg-amber-100 text-amber-800 border-amber-200",
    icone: AlertTriangle
  },
  alto: {
    classe:
      "border-rose-200 bg-rose-50 text-rose-950",
    badge:
      "bg-rose-100 text-rose-800 border-rose-200",
    icone: ShieldAlert
  },
  critico: {
    classe:
      "border-red-300 bg-red-50 text-red-950",
    badge:
      "bg-red-100 text-red-900 border-red-300",
    icone: ShieldAlert
  },
  inconclusivo: {
    classe:
      "border-slate-200 bg-slate-50 text-slate-950",
    badge:
      "bg-slate-100 text-slate-700 border-slate-200",
    icone: CircleHelp
  }
};

const etiquetas: Record<NivelRisco, string> = {
  baixo: "Baixo risco",
  atencao: "Atenção",
  alto: "Alto risco",
  critico: "Risco crítico",
  inconclusivo: "Análise inconclusiva"
};

const contextos: Record<NivelRisco, string> = {
  baixo:
    "Não foram identificados sinais relevantes de risco nos dados analisados. Isto não constitui uma garantia de segurança.",
  atencao:
    "Foram identificados sinais que merecem verificação adicional antes de interagir.",
  alto:
    "Foram encontrados sinais associados a risco elevado. Evite interagir sem validação adicional.",
  critico:
    "Foram encontrados sinais críticos de risco. Não interaja sem uma verificação adicional e uma compreensão clara dos sinais identificados.",
  inconclusivo:
    "Não existem dados suficientes para determinar o nível de risco desta carteira."
};

export function ResultadoVisual({
  resultado
}: Propriedades) {
  const estilo = estilos[resultado.nivel];
  const Icone = estilo.icone;

  return (
    <section
      className={`rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8 ${estilo.classe}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <Icone
              className="h-8 w-8"
              strokeWidth={2}
              aria-hidden
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Resultado
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              {resultado.titulo}
            </h2>
          </div>
        </div>

        <div
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${estilo.badge}`}
        >
          {etiquetas[resultado.nivel]}
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700">
        {resultado.explicacao}
      </p>

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/60 p-4 text-sm leading-6 text-slate-800">
        <span className="font-semibold">Contexto:</span>{" "}
        {contextos[resultado.nivel]}
      </div>
    </section>
  );
}
