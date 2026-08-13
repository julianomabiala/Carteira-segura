import { useState } from "react";
import { ExemplosWallet } from "../componentes/ExemplosWallet";
import { FormularioAnalise } from "../componentes/FormularioAnalise";
import { IndicadoresAnalise } from "../componentes/IndicadoresAnalise";
import { ResultadoVisual } from "../componentes/ResultadoVisual";
import { ResumoAnalise } from "../componentes/ResumoAnalise";
import { pedirAnalise } from "../servicos/apiAnalise";
import { validarEndereco } from "../servicos/validacao";
import type { RedeSuportada, ResultadoAnalise } from "../tipos/analise";

export function PaginaPrincipal() {
  const [endereco, setEndereco] = useState("");
  const [rede, setRede] = useState<RedeSuportada>("ethereum");
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function analisar(valorEndereco = endereco, valorRede = rede) {
    setErro("");
    setResultado(null);

    if (!validarEndereco(valorEndereco)) {
      setErro("O endereco introduzido nao parece valido. Verifique e tente novamente.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await pedirAnalise({ wallet: valorEndereco.trim(), network: valorRede });
      setResultado(resposta);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Nao foi possivel concluir a analise neste momento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function escolherExemplo(exemplo: { endereco: string; rede: RedeSuportada }) {
    setEndereco(exemplo.endereco);
    setRede(exemplo.rede);
    void analisar(exemplo.endereco, exemplo.rede);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="space-y-6">
          <header className="pt-2">
            <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">Carteira Segura</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              NZOChain Wallet Scanner
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Verifique o nivel de risco de uma carteira blockchain de forma simples.
            </p>
          </header>

          <FormularioAnalise
            endereco={endereco}
            rede={rede}
            carregando={carregando}
            aoAlterarEndereco={setEndereco}
            aoAlterarRede={setRede}
            aoSubmeter={() => void analisar()}
          />

          <ExemplosWallet aoEscolher={escolherExemplo} />
        </section>

        <section className="space-y-5">
          {erro ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 font-medium text-rose-900">{erro}</div>
          ) : null}

          {carregando ? (
            <div className="grid min-h-80 place-items-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div>
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                <p className="mt-5 font-semibold text-slate-800">A analisar carteira...</p>
              </div>
            </div>
          ) : null}

          {!resultado && !carregando && !erro ? (
            <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Introduza uma wallet para comecar a analise.
            </div>
          ) : null}

          {resultado ? (
            <>
              <ResultadoVisual resultado={resultado} />
              <ResumoAnalise resultado={resultado} />
              <IndicadoresAnalise razoes={resultado.razoes} nivelRisco={resultado.nivel} />
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
