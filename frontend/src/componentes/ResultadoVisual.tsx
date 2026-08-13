import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ResultadoAnalise } from "../tipos/analise";

type Propriedades = {
  resultado: ResultadoAnalise;
};

const estilos = {
  baixo: {
    classe: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icone: CheckCircle2
  },
  alto: {
    classe: "border-rose-200 bg-rose-50 text-rose-950",
    icone: AlertTriangle
  }
} as const;

export function ResultadoVisual({ resultado }: Propriedades) {
  const Icone = estilos[resultado.nivel].icone;

  return (
    <section className={`rounded-lg border p-8 text-center shadow-sm ${estilos[resultado.nivel].classe}`}>
      <Icone className="mx-auto h-16 w-16" strokeWidth={1.7} aria-hidden />
      <h2 className="mt-5 text-3xl font-bold uppercase tracking-normal">{resultado.titulo}</h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-7">{resultado.explicacao}</p>
    </section>
  );
}
