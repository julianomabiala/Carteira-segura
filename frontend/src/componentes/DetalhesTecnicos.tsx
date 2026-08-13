import type { ResultadoAnalise } from "../tipos/analise";

type Propriedades = {
  resultado: ResultadoAnalise;
};

export function DetalhesTecnicos({ resultado }: Propriedades) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer font-semibold text-slate-950">Ver detalhes tecnicos</summary>
      <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {JSON.stringify(resultado.detalhesTecnicos, null, 2)}
      </pre>
    </details>
  );
}
