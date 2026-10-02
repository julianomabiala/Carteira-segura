import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FlaskConical,
  Loader2,
  Play,
  ShieldCheck,
  XCircle
} from "lucide-react";
import type { AcaoExperimento, EvidenciaCasoTeste } from "./tipos";
import { CASOS_TESTE } from "./casosTeste";
import { exportarEvidencias } from "./armazenamento";
import { nomeRede } from "../servicos/redes";

type PainelExperimentoProps = {
  wallet: string | null;
  network: EvidenciaCasoTeste["network"];
  casoSelecionado: string;
  acaoSelecionada: AcaoExperimento;
  evidencias: EvidenciaCasoTeste[];
  resultado: EvidenciaCasoTeste | null;
  erro: string;
  executando: boolean;
  onCasoChange: (caso: string) => void;
  onAcaoChange: (acao: AcaoExperimento) => void;
  onExecutar: () => void;
};

const ACOES: Array<{
  value: AcaoExperimento;
  label: string;
}> = [
  {
    value: "analyzeOnly",
    label: "Somente analisar (sem transação)"
  },
  {
    value: "normalAction",
    label: "Interação normal"
  },
  {
    value: "approveToken",
    label: "Criar aprovação controlada"
  },
  {
    value: "revokeApproval",
    label: "Remover aprovação"
  },
  {
    value: "suspiciousAction",
    label: "Simular ação suspeita"
  },
  {
    value: "highImpactSimulation",
    label: "Simular ação de alto impacto"
  }
];

function abreviarEndereco(endereco: string | null): string {
  if (!endereco) return "—";

  return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
}

function abreviarHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function valorSnapshot(
  valor: string | number | boolean | null
): string {
  if (valor === null) return "—";
  return String(valor);
}

function baixarEvidencias() {
  const arquivo = new Blob([exportarEvidencias()], {
    type: "application/json"
  });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nzochain-evidencias.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function PainelExperimento({
  wallet,
  network,
  casoSelecionado,
  acaoSelecionada,
  evidencias,
  resultado,
  erro,
  executando,
  onCasoChange,
  onAcaoChange,
  onExecutar
}: PainelExperimentoProps) {
  const caso = CASOS_TESTE.find(
    (item) => item.id === casoSelecionado
  );

  return (
    <section className="experiment-panel">
      <div className="experiment-header">
        <div>
          <div className="experiment-kicker">
            <FlaskConical size={16} />
            Laboratório E2E
          </div>

          <h2>Experimento de segurança Web3</h2>

          <p>
            Fluxo reproduzível para observar o estado da wallet
            antes e depois de uma ação on-chain e comparar a
            resposta do NZOChain.
          </p>
        </div>

        <div className="experiment-status">
          <span className="experiment-status-dot" />
          Ambiente de análise
        </div>
      </div>

      <div className="experiment-grid">
        <div className="experiment-card experiment-controls">
          <div className="experiment-card-title">
            <div>
              <span>Executar caso de teste</span>
              <small>Uma ação explícita por execução</small>
            </div>
          </div>

          <label>
            Caso de teste
            <select
              value={casoSelecionado}
              onChange={(event) =>
                onCasoChange(event.target.value)
              }
              disabled={executando}
            >
              {CASOS_TESTE.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} — {item.titulo}
                </option>
              ))}
            </select>
          </label>

          {caso && (
            <div className="experiment-case-description">
              <strong>{caso.titulo}</strong>
              <span>{caso.descricao}</span>
            </div>
          )}

          <label>
            Ação on-chain
            <select
              value={acaoSelecionada}
              onChange={(event) =>
                onAcaoChange(
                  event.target.value as AcaoExperimento
                )
              }
              disabled={executando}
            >
              {ACOES.map((acao) => (
                <option key={acao.value} value={acao.value}>
                  {acao.label}
                </option>
              ))}
            </select>
          </label>

          <div className="experiment-wallet">
            <div>
              <span>Wallet</span>
              <strong>{abreviarEndereco(wallet)}</strong>
            </div>

            <div>
              <span>Rede</span>
              <strong>
                {network ? nomeRede(network) : "—"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="experiment-run-button"
            onClick={onExecutar}
            disabled={executando || !wallet}
          >
            {executando ? (
              <>
                <Loader2 size={17} className="spin" />
                Executando experimento...
              </>
            ) : (
              <>
                <Play size={17} />
                Executar teste
              </>
            )}
          </button>

          {!wallet && (
            <div className="experiment-warning">
              <AlertTriangle size={16} />
              Conecte uma wallet para executar um caso.
            </div>
          )}

          {erro && (
            <div className="experiment-error">
              <XCircle size={16} />
              <span>{erro}</span>
            </div>
          )}
        </div>

        <div className="experiment-card experiment-flow">
          <div className="experiment-card-title">
            <div>
              <span>Fluxo da execução</span>
              <small>Evidence pipeline</small>
            </div>
          </div>

          <div className="experiment-steps">
            <div className="experiment-step">
              <span>01</span>
              <div>
                <strong>BEFORE</strong>
                <small>Análise NZOChain</small>
              </div>
              <ChevronRight size={16} />
            </div>

            <div className="experiment-step">
              <span>02</span>
              <div>
                <strong>AÇÃO</strong>
                <small>Transação on-chain</small>
              </div>
              <ChevronRight size={16} />
            </div>

            <div className="experiment-step">
              <span>03</span>
              <div>
                <strong>CONFIRMAÇÃO</strong>
                <small>Hash + block</small>
              </div>
              <ChevronRight size={16} />
            </div>

            <div className="experiment-step">
              <span>04</span>
              <div>
                <strong>AFTER</strong>
                <small>Nova análise NZOChain</small>
              </div>
              <ChevronRight size={16} />
            </div>

            <div className="experiment-step">
              <span>05</span>
              <div>
                <strong>COMPARAÇÃO</strong>
                <small>Antes vs. depois</small>
              </div>
            </div>
          </div>

          <div className="experiment-note">
            <ShieldCheck size={17} />
            <span>
              A aplicação regista os dados recebidos e não
              altera artificialmente a classificação do NZOChain.
            </span>
          </div>
        </div>
      </div>

      {resultado && (
        <div className="experiment-result">
          <div className="experiment-result-header">
            <div>
              <span>Resultado do experimento</span>
              <strong>{resultado.id} — {resultado.titulo}</strong>
            </div>

            {resultado.estado === "passou" ? (
              <div className="experiment-result-success">
                <CheckCircle2 size={17} />
                Evidência registada
              </div>
            ) : (
              <div className="experiment-result-failed">
                <XCircle size={17} />
                Execução falhou
              </div>
            )}
          </div>

          <div className="experiment-snapshots">
            <SnapshotCard
              title="BEFORE"
              snapshot={resultado.before}
            />

            <div className="experiment-action-card">
              <div className="experiment-action-label">
                AÇÃO ON-CHAIN
              </div>

              <strong>
                {resultado.action?.functionName ?? "—"}
              </strong>

              {resultado.action?.transactionHash && (
                <div className="experiment-tx">
                  <span>
                    TX {abreviarHash(
                      resultado.action.transactionHash
                    )}
                  </span>

                  <a
                    href={`https://etherscan.io/tx/${resultado.action.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir transação"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {resultado.action?.blockNumber !== null &&
                resultado.action?.blockNumber !== undefined && (
                  <div className="experiment-block">
                    <Clock3 size={14} />
                    Block {resultado.action.blockNumber}
                  </div>
                )}
            </div>

            <SnapshotCard
              title="AFTER"
              snapshot={resultado.after}
            />
          </div>

          <div className="experiment-observation">
            <strong>Observação</strong>
            <span>{resultado.observacao}</span>
          </div>
        </div>
      )}

      <div className="experiment-history">
        <div className="experiment-card-title">
          <div>
            <span>Casos registados</span>
            <small>
              {evidencias.length} evidência
              {evidencias.length === 1 ? "" : "s"}
            </small>
          </div>
          <button
            type="button"
            className="experiment-run-button"
            onClick={baixarEvidencias}
            disabled={evidencias.length === 0}
            title="Exportar evidências JSON"
          >
            <Download size={16} />
            Exportar JSON
          </button>
        </div>

        <div className="experiment-table">
          <div className="experiment-table-row experiment-table-head">
            <span>Caso</span>
            <span>Wallet</span>
            <span>Estado</span>
            <span>Ação</span>
          </div>

          {evidencias.length === 0 ? (
            <div className="experiment-empty">
              <FlaskConical size={20} />
              <span>
                Ainda não existem execuções registadas.
              </span>
            </div>
          ) : (
            evidencias.map((item) => (
              <div
                className="experiment-table-row"
                key={item.runId ?? `${item.id}-${item.createdAt}`}
              >
                <span>
                  <strong>{item.id}</strong>
                  <small>{item.titulo}</small>
                </span>

                <span>
                  {abreviarEndereco(item.wallet)}
                </span>

                <span>
                  {item.estado === "passou" && (
                    <em className="experiment-state success">
                      <CheckCircle2 size={14} />
                      Passou
                    </em>
                  )}

                  {item.estado === "falhou" && (
                    <em className="experiment-state failed">
                      <XCircle size={14} />
                      Falhou
                    </em>
                  )}

                  {item.estado === "em_execucao" && (
                    <em className="experiment-state running">
                      <Loader2 size={14} className="spin" />
                      Em execução
                    </em>
                  )}

                  {item.estado === "pendente" && (
                    <em className="experiment-state pending">
                      Pendente
                    </em>
                  )}

                  {item.estado === "investigar" && (
                    <em className="experiment-state failed">
                      <AlertTriangle size={14} />
                      Investigar
                    </em>
                  )}
                </span>

                <span>
                  {item.action?.functionName ?? "—"}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}

type SnapshotCardProps = {
  title: string;
  snapshot: EvidenciaCasoTeste["before"];
};

function SnapshotCard({
  title,
  snapshot
}: SnapshotCardProps) {
  if (!snapshot) {
    return (
      <div className="experiment-snapshot">
        <div className="experiment-snapshot-title">
          {title}
        </div>

        <div className="experiment-snapshot-empty">
          Sem dados
        </div>
      </div>
    );
  }

  return (
    <div className="experiment-snapshot">
      <div className="experiment-snapshot-title">
        {title}
      </div>

      <div className="experiment-metrics">
        <div>
          <span>Risk Score</span>
          <strong>{valorSnapshot(snapshot.riskScore)}</strong>
        </div>

        <div>
          <span>Risk Level</span>
          <strong>{valorSnapshot(snapshot.riskLevel)}</strong>
        </div>

        <div>
          <span>Decision</span>
          <strong>{valorSnapshot(snapshot.decision)}</strong>
        </div>

        <div>
          <span>Transactions</span>
          <strong>
            {valorSnapshot(snapshot.transactionsAnalyzed)}
          </strong>
        </div>

        <div>
          <span>Approvals</span>
          <strong>
            {valorSnapshot(snapshot.activeApprovals)}
          </strong>
        </div>

        <div>
          <span>Data Quality</span>
          <strong>
            {valorSnapshot(snapshot.dataQuality)}
          </strong>
        </div>

        <div>
          <span>HTTP</span>
          <strong>{valorSnapshot(snapshot.httpStatus)}</strong>
        </div>

        <div>
          <span>Analysis ID</span>
          <strong title={snapshot.analysisId ?? undefined}>
            {snapshot.analysisId
              ? abreviarHash(snapshot.analysisId)
              : "—"}
          </strong>
        </div>

        <div>
          <span>Timestamp</span>
          <strong>{new Date(snapshot.timestamp).toLocaleString()}</strong>
        </div>

        <div className="col-span-2 min-w-0">
          <span>Endpoint</span>
          <strong className="block truncate" title={snapshot.endpoint}>
            {snapshot.endpoint || "—"}
          </strong>
        </div>
      </div>
    </div>
  );
}
