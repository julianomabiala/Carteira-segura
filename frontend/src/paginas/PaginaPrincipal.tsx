import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileSearch,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
  WalletCards,
  X,
  XCircle
} from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConfig, useDisconnect } from "wagmi";
import { BotaoConectarWallet } from "../componentes/BotaoConectarWallet";
import { FormularioAnalise } from "../componentes/FormularioAnalise";
import { IndicadoresAnalise } from "../componentes/IndicadoresAnalise";
import { ResultadoVisual } from "../componentes/ResultadoVisual";
import { ResumoAnalise } from "../componentes/ResumoAnalise";
import { redePorChainId } from "../configuracao/wallet";
import {
  chainIdsPorRede,
  nomeRede as obterNomeRede,
  redes,
  redeSelecionadaCompativel
} from "../servicos/redes";
import {
  pedirAnalise,
  pedirAnaliseContrato
} from "../servicos/apiAnalise";
import {
  obterSessao,
  terminarSessao,
  type SessaoWallet
} from "../servicos/siwe";
import { validarEndereco } from "../servicos/validacao";
import { executarExperimento } from "../experimento/experimento";
import { CASOS_TESTE } from "../experimento/casosTeste";
import { carregarEvidencias } from "../experimento/armazenamento";
import {
  listarEvidenciasRemotas,
  guardarEvidenciaRemota
} from "../servicos/apiExperimentos";
import type {
  AcaoExperimento,
  EvidenciaCasoTeste
} from "../experimento/tipos";
import { PainelExperimento } from "../experimento/PainelExperimento";
import { obterEnderecoContrato } from "../contrato/configuracao";
import type {
  NivelRisco,
  RedeSuportada,
  ResultadoAnalise,
  RespostaAnaliseContrato
} from "../tipos/analise";

type Aba =
  | "inicio"
  | "carteiras"
  | "analisar"
  | "historico"
  | "seguranca";

type Carteira = {
  id: string;
  address: string;
  network: RedeSuportada;
  chainId: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
};

type ItemHistorico = {
  id: string;
  walletId: string;
  nivel: NivelRisco;
  titulo: string;
  explicacao: string;
  razoes: Array<{ titulo: string; descricao: string }>;
  rede: RedeSuportada;
  endereco: string;
  analisadoEm: string;
};

const menuPrincipal: Array<{
  key: Aba;
  label: string;
  descricao: string;
  icone: typeof LayoutDashboard;
}> = [
  {
    key: "inicio",
    label: "Visão geral",
    descricao: "Estado da proteção",
    icone: LayoutDashboard
  },
  {
    key: "carteiras",
    label: "Carteiras",
    descricao: "Carteiras acompanhadas",
    icone: WalletCards
  },
  {
    key: "analisar",
    label: "Analisar",
    descricao: "Verificar risco",
    icone: FileSearch
  },
  {
    key: "historico",
    label: "Histórico",
    descricao: "Análises realizadas",
    icone: History
  },
  {
    key: "seguranca",
    label: "Segurança",
    descricao: "Proteção e sessão",
    icone: ShieldCheck
  }
];

const nomesRede: Record<RedeSuportada, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  bnb: "BNB Smart Chain",
  arbitrum: "Arbitrum"
};

function abreviarEndereco(endereco?: string | null, inicio = 7, fim = 5) {
  if (!endereco) return "—";
  if (endereco.length <= inicio + fim + 3) return endereco;
  return `${endereco.slice(0, inicio)}...${endereco.slice(-fim)}`;
}

function nomeRede(rede: RedeSuportada) {
  return nomesRede[rede] ?? rede;
}

function nivelLabel(nivel: NivelRisco) {
  if (nivel === "baixo") return "Baixo risco";
  if (nivel === "atencao") return "Atenção";
  if (nivel === "alto") return "Alto risco";
  return "Análise inconclusiva";
}

function nivelClasses(nivel: NivelRisco) {
  if (nivel === "baixo") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      icon: "text-emerald-600"
    };
  }

  if (nivel === "atencao") {
    return {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
      icon: "text-amber-600"
    };
  }

  if (nivel === "alto") {
    return {
      badge: "border-rose-200 bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
      icon: "text-rose-600"
    };
  }

  return {
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-400",
    icon: "text-slate-500"
  };
}

export function PaginaPrincipal() {
  const [sessao, setSessao] = useState<SessaoWallet | null>(null);
  const [endereco, setEndereco] = useState("");
  const [rede, setRede] = useState<RedeSuportada>("ethereum");
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [enderecoContrato, setEnderecoContrato] = useState("");
  const [redeContrato, setRedeContrato] =
    useState<RedeSuportada>("ethereum");
  const [resultadoContrato, setResultadoContrato] =
    useState<RespostaAnaliseContrato | null>(null);
  const [erroContrato, setErroContrato] = useState("");
  const [carregandoContrato, setCarregandoContrato] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [carteiras, setCarteiras] = useState<Carteira[]>([]);
  const [novaCarteira, setNovaCarteira] = useState("");
  const [novaRedeCarteira, setNovaRedeCarteira] =
    useState<RedeSuportada>("ethereum");
  const [adicionandoCarteira, setAdicionandoCarteira] = useState(false);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [abaAtual, setAbaAtual] = useState<Aba>("inicio");
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const [casoExperimento, setCasoExperimento] = useState("TC-01");
  const [acaoExperimento, setAcaoExperimento] =
    useState<AcaoExperimento>("normalAction");
  const [evidenciasExperimento, setEvidenciasExperimento] =
    useState<EvidenciaCasoTeste[]>([]);
  const [executandoExperimento, setExecutandoExperimento] = useState(false);
  const [erroExperimento, setErroExperimento] = useState("");
  const [resultadoExperimento, setResultadoExperimento] =
    useState<EvidenciaCasoTeste | null>(null);

  const { address, isConnected, chain, chainId, connector } = useAccount();
  const wagmiConfig = useConfig();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const analiseRequestIdRef = useRef(0);

  useEffect(() => {
    let ativo = true;

    async function carregarHistoricoExperimento() {
      const locais = carregarEvidencias();

      if (ativo) {
        setEvidenciasExperimento(locais);
      }

      try {
        const remotas = await listarEvidenciasRemotas();

        if (ativo && remotas.length > 0) {
          setEvidenciasExperimento(remotas);
        }
      } catch {
        // Sem sessão SIWE ou backend indisponível:
        // mantém o histórico local como fallback.
      }
    }

    void carregarHistoricoExperimento();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const sessaoAtual = await obterSessao();

        if (ativo) {
          setSessao(sessaoAtual);
        }
      } catch {
        if (ativo) {
          setSessao(null);
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!perfilAberto) return;

    function fecharMenuAoClicarFora(evento: MouseEvent) {
      const alvo = evento.target as HTMLElement | null;

      if (
        !alvo ||
        !alvo.closest("[aria-label='Abrir menu do utilizador']")
      ) {
        setPerfilAberto(false);
      }
    }

    window.addEventListener("click", fecharMenuAoClicarFora);

    return () =>
      window.removeEventListener("click", fecharMenuAoClicarFora);
  }, [perfilAberto]);

  useEffect(() => {
    if (isConnected && address && !endereco) {
      setEndereco(address);
    }
  }, [address, endereco, isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    const redeDetectada = redePorChainId(chainId);

    if (redeDetectada) {
      setRede(redeDetectada);
      setRedeContrato(redeDetectada);
    }
  }, [chainId, isConnected]);

  function navegar(aba: Aba) {
    setAbaAtual(aba);
    setMenuMobileAberto(false);
  }

  async function sair() {
    try {
      await terminarSessao();
    } finally {
      setSessao(null);
      setCarteiras([]);
      setHistorico([]);
      setResultado(null);
      setWalletId(null);
      setPerfilAberto(false);
      disconnect();
    }
  }

  async function executarCasoExperimento() {
    if (!address || !isConnected) {
      setErroExperimento(
        "Conecte uma wallet antes de executar o experimento."
      );
      return;
    }

    const caso = CASOS_TESTE.find(
      (item) => item.id === casoExperimento
    );

    if (!caso) {
      setErroExperimento(
        "O caso de teste selecionado não foi encontrado."
      );
      return;
    }

    const redeAtual = redePorChainId(chainId);

    if (!redeAtual) {
      setErroExperimento(
        "A rede da wallet conectada não é suportada pelo experimento."
      );
      return;
    }

    const contrato = obterEnderecoContrato(redeAtual);

    if (!contrato) {
      setErroExperimento(
        `O contrato de teste ainda não foi configurado na rede ${redeAtual}.`
      );
      return;
    }

    setErroExperimento("");
    setResultadoExperimento(null);
    setExecutandoExperimento(true);

    try {
      const resultado = await executarExperimento({
        config: wagmiConfig,
        casoId: caso.id,
        titulo: caso.titulo,
        descricao: caso.descricao,
        wallet: address,
        rede: redeAtual,
        contract: contrato,
        acao: acaoExperimento
      });

      setResultadoExperimento(resultado.evidencia);

      const evidenciasLocais = carregarEvidencias();
      setEvidenciasExperimento(evidenciasLocais);

      try {
        await guardarEvidenciaRemota(
          resultado.evidencia,
          resultado.diferencas
        );

        const remotas = await listarEvidenciasRemotas();

        if (remotas.length > 0) {
          setEvidenciasExperimento(remotas);
        }
      } catch {
        // A execução on-chain continua válida.
        // Se a sessão/backend não estiver disponível,
        // a evidência permanece guardada localmente.
      }
    } catch (falha) {
      const evidenciaFalhou = carregarEvidencias()
        .filter((item) => item.id === caso.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

      setErroExperimento(
        falha instanceof Error
          ? falha.message
          : "Não foi possível executar o experimento."
      );

      setEvidenciasExperimento(carregarEvidencias());

      if (evidenciaFalhou) {
        try {
          await guardarEvidenciaRemota(evidenciaFalhou);
        } catch {
          // A evidência local permanece disponível para exportação.
        }
      }
    } finally {
      setExecutandoExperimento(false);
    }
  }

  async function analisar(
    valorEndereco = endereco,
    valorRede = rede
  ) {
    const enderecoFinal = (valorEndereco ?? "").trim();

    if (carregando) return;

    const erroRedeAtual = obterErroRedeSelecionada(valorRede);

    if (erroRedeAtual) {
      setErro(erroRedeAtual);
      return;
    }

    if (
      resultado &&
      resultado.endereco.toLowerCase() === enderecoFinal.toLowerCase() &&
      resultado.rede === valorRede
    ) {
      return;
    }

    if (!validarEndereco(enderecoFinal)) {
      setErro(
        "O endereço introduzido não parece válido. Verifique e tente novamente."
      );
      return;
    }

    const requestId = ++analiseRequestIdRef.current;

    setErro("");
    setResultado(null);
    setCarregando(true);

    try {
      const resposta = await pedirAnalise({
        wallet: enderecoFinal,
        network: valorRede
      });

      if (requestId !== analiseRequestIdRef.current) return;

      setResultado(resposta);

      const idCarteira =
        walletId ?? `${enderecoFinal.toLowerCase()}-${valorRede}`;

      if (!walletId) {
        setWalletId(idCarteira);
      }

      setCarteiras((atuais) => {
        const jaExiste = atuais.some(
          (wallet) =>
            wallet.address.toLowerCase() === enderecoFinal.toLowerCase() &&
            wallet.network === valorRede
        );

        if (jaExiste) return atuais;

        const agora = new Date().toISOString();

        return [
          ...atuais,
          {
            id: idCarteira,
            address: enderecoFinal.toLowerCase(),
            network: valorRede,
            chainId: chainId ?? chainIdsPorRede[valorRede],
            label: "Carteira analisada",
            createdAt: agora,
            updatedAt: agora
          }
        ];
      });

      setHistorico((atuais) => [
        {
          id: `${Date.now()}`,
          walletId: idCarteira,
          nivel: resposta.nivel,
          titulo: resposta.titulo,
          explicacao: resposta.explicacao,
          razoes: resposta.razoes,
          rede: resposta.rede as RedeSuportada,
          endereco: resposta.endereco,
          analisadoEm: resposta.analisadoEm
        },
        ...atuais
      ].slice(0, 20));
    } catch (falha) {
      if (requestId !== analiseRequestIdRef.current) return;

      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível concluir a análise neste momento. Tente novamente."
      );
    } finally {
      if (requestId === analiseRequestIdRef.current) {
        setCarregando(false);
      }
    }
  }

  async function analisarContrato() {
    const enderecoFinal = enderecoContrato.trim();

    if (carregandoContrato) return;

    const erroRedeAtual = obterErroRedeSelecionada(redeContrato);

    if (erroRedeAtual) {
      setErroContrato(erroRedeAtual);
      return;
    }

    if (!validarEndereco(enderecoFinal)) {
      setErroContrato(
        "O endereço do contrato não parece válido. Verifique e tente novamente."
      );
      return;
    }

    setErroContrato("");
    setResultadoContrato(null);
    setCarregandoContrato(true);

    try {
      const resposta = await pedirAnaliseContrato({
        address: enderecoFinal,
        network: redeContrato
      });

      setResultadoContrato(resposta);
    } catch (falha) {
      setErroContrato(
        falha instanceof Error
          ? falha.message
          : "Não foi possível concluir a análise do contrato."
      );
    } finally {
      setCarregandoContrato(false);
    }
  }

  async function adicionarCarteiraManual() {
    const enderecoFinal = novaCarteira.trim();

    if (!validarEndereco(enderecoFinal)) {
      setErro(
        "O endereço da carteira a adicionar não parece válido."
      );
      return;
    }

    setAdicionandoCarteira(true);
    setErro("");

    try {
      const id = `${enderecoFinal.toLowerCase()}-${novaRedeCarteira}`;
      const agora = new Date().toISOString();

      setCarteiras((atuais) => {
        const jaExiste = atuais.some(
          (wallet) =>
            wallet.address.toLowerCase() === enderecoFinal.toLowerCase() &&
            wallet.network === novaRedeCarteira
        );

        if (jaExiste) return atuais;

        return [
          ...atuais,
          {
            id,
            address: enderecoFinal.toLowerCase(),
            network: novaRedeCarteira,
            chainId: chainIdsPorRede[novaRedeCarteira],
            label: "Carteira adicionada",
            createdAt: agora,
            updatedAt: agora
          }
        ];
      });

      setWalletId(id);
      setNovaCarteira("");
      setEndereco(enderecoFinal);
      setRede(novaRedeCarteira);
      navegar("analisar");
    } finally {
      setAdicionandoCarteira(false);
    }
  }

  function removerCarteira(id: string) {
    setCarteiras((atuais) =>
      atuais.filter((wallet) => wallet.id !== id)
    );

    if (walletId === id) {
      setWalletId(null);
    }
  }

  function usarCarteiraConectada() {
    if (!address) return;

    setEndereco(address);
    const redeDetectada = redePorChainId(chainId);
    if (redeDetectada) setRede(redeDetectada);
  }

  function obterErroRedeSelecionada(
    redeSelecionada: RedeSuportada
  ): string {
    if (!isConnected || !address) {
      return "Conecte uma carteira compatível antes de iniciar a análise.";
    }

    const redeDetectada = redePorChainId(chainId);

    if (!redeDetectada) {
      return chainId
        ? `A chainId ${chainId} não é suportada. Mude a rede na sua carteira para Ethereum, BNB Chain, Polygon ou Arbitrum.`
        : "Não foi possível identificar a rede da carteira conectada.";
    }

    if (!redeSelecionadaCompativel(chainId, redeSelecionada)) {
      return `A carteira está em ${obterNomeRede(
        redeDetectada
      )} (chainId ${chainId}), mas foi selecionada ${obterNomeRede(
        redeSelecionada
      )}. Mude a rede na carteira ou escolha a rede atual.`;
    }

    return "";
  }

  const redeDaWallet = redePorChainId(chainId);
  const erroRedeWallet = obterErroRedeSelecionada(rede);
  const erroRedeContrato = obterErroRedeSelecionada(redeContrato);

  const perfilNome = sessao?.wallet
    ? abreviarEndereco(sessao.wallet, 6, 4)
    : "Utilizador";

  const perfilInicial = perfilNome.charAt(0).toUpperCase();

  const baixoRisco = historico.filter(
    (item) => item.nivel === "baixo"
  ).length;

  const alertas = historico.filter(
    (item) =>
      item.nivel === "atencao" ||
      item.nivel === "alto"
  ).length;

  const estadoGeral = resultado?.nivel ?? "inconclusivo";

  const estadoGeralTexto = resultado
    ? nivelLabel(resultado.nivel)
    : "Sem análise recente";

  const paginaTitulo =
    menuPrincipal.find((item) => item.key === abaAtual)?.label ??
    "Visão geral";

  const paginaDescricao =
    menuPrincipal.find((item) => item.key === abaAtual)?.descricao ??
    "Estado da proteção";

  const paginaAutenticada = sessao ? (
    <div className="min-h-screen overflow-hidden rounded-[30px] border border-slate-200 bg-[#f7f9f8] shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-r border-slate-200 bg-[#0a0f0d] text-white lg:flex lg:flex-col">
          <div className="flex h-[86px] items-center border-b border-white/10 px-6">
            <button
              type="button"
              onClick={() => navegar("inicio")}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">
                  Carteira Segura
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Web3 Security
                </p>
              </div>
            </button>
          </div>

          <div className="px-4 py-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Plataforma
            </p>

            <nav className="mt-3 space-y-1.5">
              {menuPrincipal.map((item) => {
                const Icone = item.icone;
                const ativo = abaAtual === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navegar(item.key)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                      ativo
                        ? "bg-white text-slate-950"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    ].join(" ")}
                  >
                    <Icone
                      className={[
                        "h-[18px] w-[18px]",
                        ativo
                          ? "text-emerald-600"
                          : "text-slate-500 group-hover:text-slate-300"
                      ].join(" ")}
                    />

                    <span className="flex-1">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span
                        className={[
                          "mt-0.5 block text-[10px]",
                          ativo
                            ? "text-slate-500"
                            : "text-slate-600"
                        ].join(" ")}
                      >
                        {item.descricao}
                      </span>
                    </span>

                    {ativo ? (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Proteção ativa
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    A Carteira Segura analisa riscos antes da tua interação.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950">
                {perfilInicial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {perfilNome}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  Wallet + SIWE
                </p>
              </div>

              <button
                type="button"
                onClick={() => void sair()}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {menuMobileAberto ? (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/50"
              onClick={() => setMenuMobileAberto(false)}
              aria-label="Fechar menu"
            />

            <aside className="relative flex h-full w-[290px] flex-col bg-[#0a0f0d] p-4 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-2 pb-5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">
                      Carteira Segura
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                      Web3 Security
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuMobileAberto(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5">
                {menuPrincipal.map((item) => {
                  const Icone = item.icone;
                  const ativo = abaAtual === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navegar(item.key)}
                      className={[
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left",
                        ativo
                          ? "bg-white text-slate-950"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      ].join(" ")}
                    >
                      <Icone className="h-[18px] w-[18px]" />
                      <span className="text-sm font-semibold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-bold">Proteção ativa</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Análise de risco antes da interação Web3.
                </p>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuMobileAberto(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Carteira Segura
                </p>
                <h1 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                  {paginaTitulo}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={[
                  "hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold sm:flex",
                  estadoGeral === "baixo"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : estadoGeral === "atencao"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    estadoGeral === "baixo"
                      ? "bg-emerald-500"
                      : estadoGeral === "atencao"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  ].join(" ")}
                />
                {estadoGeralTexto}
              </div>

              <button
                type="button"
                onClick={() => navegar("historico")}
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                title="Histórico"
              >
                <Bell className="h-4 w-4" />

                {alertas > 0 ? (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                ) : null}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setPerfilAberto((valor) => !valor)
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 transition hover:bg-slate-50"
                  aria-expanded={perfilAberto}
                  aria-label="Abrir menu do utilizador"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">
                    {perfilInicial}
                  </div>
                  <span className="hidden max-w-[110px] truncate text-xs font-bold text-slate-700 sm:block">
                    {perfilNome}
                  </span>
                </button>

                {perfilAberto ? (
                  <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-900">
                        Carteira autenticada
                      </p>
                      <p className="mt-1 break-all text-[10px] leading-4 text-slate-500">
                        {sessao?.wallet ?? "Sem wallet"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPerfilAberto(false);
                        navegar("seguranca");
                      }}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Settings2 className="h-4 w-4" />
                      Segurança e sessão
                    </button>

                    <button
                      type="button"
                      onClick={() => void sair()}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Terminar sessão
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1350px]">
              <div className="mb-6">
                <p className="text-sm text-slate-500">
                  {paginaDescricao}
                </p>
              </div>

              {abaAtual === "inicio" ? (
                <div className="space-y-6">
                  <section className="relative overflow-hidden rounded-[30px] bg-[#0a0f0d] p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />

                    <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Proteção Web3 ativa
                        </div>

                        <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.03em] sm:text-5xl">
                          Antes de interagir,
                          <span className="block text-emerald-300">
                            conhece o risco.
                          </span>
                        </h2>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                          A Carteira Segura cria uma camada de análise entre
                          a tua wallet e as operações Web3. Verifica
                          endereços, identifica sinais de risco e apresenta
                          os dados necessários para tomares uma decisão
                          informada.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => navegar("analisar")}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                          >
                            <Search className="h-4 w-4" />
                            Analisar uma wallet
                            <ArrowRight className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navegar("carteiras")}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                          >
                            <WalletCards className="h-4 w-4" />
                            Ver carteiras
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Estado atual
                          </span>
                          <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
                            {estadoGeral === "baixo" ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            ) : (
                              <ShieldAlert className="h-6 w-6 text-amber-400" />
                            )}
                          </div>

                          <div>
                            <p className="text-lg font-black">
                              {estadoGeralTexto}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Baseado na última análise
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-white/10 pt-4">
                          <p className="text-xs leading-5 text-slate-500">
                            A análise informa o risco. A decisão de
                            continuar ou não continua a ser tua.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Carteiras",
                        value: String(carteiras.length),
                        detail: isConnected
                          ? "Wallet conectada"
                          : "Nenhuma conectada",
                        icon: Wallet,
                        iconClass: "text-cyan-600 bg-cyan-50"
                      },
                      {
                        label: "Análises",
                        value: String(historico.length),
                        detail:
                          historico.length > 0
                            ? "Registadas nesta sessão"
                            : "Ainda sem análises",
                        icon: BarChart3,
                        iconClass: "text-violet-600 bg-violet-50"
                      },
                      {
                        label: "Alertas",
                        value: String(alertas),
                        detail:
                          alertas > 0
                            ? "Requerem atenção"
                            : "Nenhum alerta",
                        icon: AlertTriangle,
                        iconClass:
                          alertas > 0
                            ? "text-amber-600 bg-amber-50"
                            : "text-emerald-600 bg-emerald-50"
                      },
                      {
                        label: "Baixo risco",
                        value: String(baixoRisco),
                        detail: "Análises classificadas",
                        icon: ShieldCheck,
                        iconClass: "text-emerald-600 bg-emerald-50"
                      }
                    ].map((item) => {
                      const Icone = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.035)]"
                        >
                          <div className="flex items-start justify-between">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClass}`}
                            >
                              <Icone className="h-5 w-5" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Live
                            </span>
                          </div>

                          <p className="mt-5 text-sm font-medium text-slate-500">
                            {item.label}
                          </p>
                          <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                            {item.value}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {item.detail}
                          </p>
                        </div>
                      );
                    })}
                  </section>

                  <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.035)]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                            Análise rápida
                          </p>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                            Verifica uma carteira antes de interagir
                          </h3>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Introduz um endereço e obtém uma análise de
                            risco através do scanner.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navegar("analisar")}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                        >
                          Abrir scanner
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                            <Search className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-500">
                              {isConnected && address
                                ? "Wallet conectada"
                                : "Endereço da wallet"}
                            </p>
                            <p className="mt-1 truncate text-sm font-bold text-slate-900">
                              {isConnected && address
                                ? abreviarEndereco(address, 12, 10)
                                : "Nenhum endereço selecionado"}
                            </p>
                          </div>

                          {isConnected && address ? (
                            <button
                              type="button"
                              onClick={() => {
                                usarCarteiraConectada();
                                navegar("analisar");
                              }}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                              Usar
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.035)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Wallet atual
                          </p>
                          <h3 className="mt-2 text-lg font-black text-slate-950">
                            {isConnected
                              ? "Conectada"
                              : "Não conectada"}
                          </h3>
                        </div>

                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            isConnected
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          ].join(" ")}
                        >
                          <Wallet className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Endereço
                        </p>
                        <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-700">
                          {address ?? "Nenhuma wallet conectada"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => open()}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                        {isConnected
                          ? "Conectar outra wallet"
                          : "Conectar wallet"}
                      </button>
                    </div>
                  </section>

                  <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.035)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Atividade
                        </p>
                        <h3 className="mt-2 text-xl font-black text-slate-950">
                          Últimas análises
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => navegar("historico")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-950"
                      >
                        Ver histórico
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {historico.length > 0 ? (
                      <div className="mt-5 divide-y divide-slate-100">
                        {historico.slice(0, 5).map((item) => {
                          const classes = nivelClasses(item.nivel);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setEndereco(item.endereco);
                                setRede(item.rede);
                                navegar("analisar");
                              }}
                              className="flex w-full items-center gap-3 py-4 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                                <FileSearch
                                  className={`h-4 w-4 ${classes.icon}`}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900">
                                    {nomeRede(item.rede)}
                                  </p>
                                  <span className="text-[10px] text-slate-400">
                                    •
                                  </span>
                                  <span className="font-mono text-xs text-slate-500">
                                    {abreviarEndereco(item.endereco)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">
                                  {new Date(
                                    item.analisadoEm
                                  ).toLocaleString("pt-PT")}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${classes.badge}`}
                              >
                                {nivelLabel(item.nivel)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <Clock3 className="mx-auto h-7 w-7 text-slate-300" />
                        <p className="mt-3 text-sm font-bold text-slate-700">
                          Ainda não há atividade
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          A tua primeira análise aparecerá aqui.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              ) : null}

              {abaAtual === "carteiras" ? (
                <section className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.035)] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                        Gestão de carteiras
                      </p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                        As tuas carteiras
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Acompanha endereços e envia-os diretamente para análise.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => open()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4" />
                      Conectar wallet
                    </button>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[26px] border border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-950">
                          Carteiras guardadas
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                          {carteiras.length}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        {carteiras.length > 0 ? (
                          carteiras.map((wallet) => {
                            const ultimo = historico.find(
                              (item) =>
                                item.walletId === wallet.id
                            );

                            return (
                              <div
                                key={wallet.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                                      <Wallet className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-black text-slate-900">
                                          {wallet.label ?? "Carteira"}
                                        </p>
                                        {ultimo ? (
                                          <span
                                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${nivelClasses(ultimo.nivel).badge}`}
                                          >
                                            {nivelLabel(ultimo.nivel)}
                                          </span>
                                        ) : null}
                                      </div>

                                      <p className="mt-1 break-all font-mono text-xs text-slate-500">
                                        {wallet.address}
                                      </p>

                                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                                        {nomeRede(wallet.network)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEndereco(wallet.address);
                                        setRede(wallet.network);
                                        navegar("analisar");
                                      }}
                                      className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                                    >
                                      Analisar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removerCarteira(wallet.id)
                                      }
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                            <WalletCards className="mx-auto h-8 w-8 text-slate-300" />
                            <p className="mt-3 text-sm font-bold text-slate-700">
                              Nenhuma carteira acompanhada
                            </p>
                            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                              Conecta uma wallet ou adiciona um endereço
                              manualmente para começar.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-white p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Adicionar manualmente
                      </p>

                      <h3 className="mt-2 text-xl font-black text-slate-950">
                        Guardar um endereço
                      </h3>

                      <div className="mt-5 space-y-3">
                        <input
                          type="text"
                          value={novaCarteira}
                          onChange={(evento) =>
                            setNovaCarteira(evento.target.value)
                          }
                          placeholder="0x..."
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        />

                        <select
                          value={novaRedeCarteira}
                          onChange={(evento) =>
                            setNovaRedeCarteira(
                              evento.target.value as RedeSuportada
                            )
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-900 focus:bg-white"
                        >
                          <option value="ethereum">Ethereum</option>
                          <option value="polygon">Polygon</option>
                          <option value="bnb">BNB Smart Chain</option>
                          <option value="arbitrum">Arbitrum</option>
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            void adicionarCarteiraManual()
                          }
                          disabled={adicionandoCarteira}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          <Plus className="h-4 w-4" />
                          {adicionandoCarteira
                            ? "A guardar..."
                            : "Adicionar carteira"}
                        </button>
                      </div>

                      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                        <div className="flex gap-2">
                          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <p className="text-[11px] leading-5 text-emerald-800">
                            Guardar uma carteira nesta interface não
                            significa que a plataforma tenha acesso aos
                            fundos ou às chaves privadas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {erro ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                      {erro}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {abaAtual === "analisar" ? (
                <section className="space-y-6">
                  <div className="rounded-[28px] bg-[#0a0f0d] p-6 text-white sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                          <Sparkles className="h-3.5 w-3.5" />
                          Scanner de risco
                        </div>

                        <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                          Analisa antes de interagir.
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                          Introduz um endereço, escolhe a rede e consulta os
                          indicadores disponíveis para perceber o nível de
                          risco.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-300">
                          Análise informativa
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.035)] sm:p-7">
                    <FormularioAnalise
                      endereco={endereco}
                      rede={rede}
                      carregando={carregando}
                      redeDaWallet={
                        redeDaWallet ? obterNomeRede(redeDaWallet) : null
                      }
                      chainIdCarteira={chainId}
                      providerCarteira={connector?.name}
                      erroRede={erroRedeWallet}
                      carteiraConectada={address ?? undefined}
                      aoAlterarEndereco={setEndereco}
                      aoAlterarRede={(novaRede) => {
                        setRede(novaRede);
                        setResultado(null);
                        setErro("");
                      }}
                      aoSubmeter={() => void analisar()}
                      aoUsarCarteiraConectada={() => {
                        usarCarteiraConectada();
                      }}
                    />
                  </div>

                  {erro ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                      <span>{erro}</span>
                    </div>
                  ) : null}

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.035)] sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                          Smart contract
                        </p>
                        <h3 className="mt-2 text-xl font-black text-slate-950">
                          Analisar contrato
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          Consulta a análise de risco do contrato através da
                          API da NZOChain antes de interagir com ele.
                        </p>
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        NZOChain
                      </div>
                    </div>

                    <div
                      className={[
                        "mt-6 grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-3",
                        erroRedeContrato
                          ? "border-amber-200 bg-amber-50 text-amber-950"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      ].join(" ")}
                      role={erroRedeContrato ? "alert" : "status"}
                    >
                      <span>
                        Wallet: <strong>
                          {redeDaWallet
                            ? obterNomeRede(redeDaWallet)
                            : "Rede não suportada"}
                        </strong>
                      </span>
                      <span>
                        Chain ID: <strong>{chainId ?? "—"}</strong>
                      </span>
                      <span>
                        Provider: <strong>{connector?.name ?? "não identificado"}</strong>
                      </span>
                      {erroRedeContrato ? (
                        <span className="font-semibold sm:col-span-3">
                          {erroRedeContrato}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_190px_auto]">
                      <input
                        type="text"
                        value={enderecoContrato}
                        onChange={(evento) => {
                          setEnderecoContrato(evento.target.value);
                          setResultadoContrato(null);
                          setErroContrato("");
                        }}
                        placeholder="Endereço do contrato: 0x..."
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      />

                      <select
                        value={redeContrato}
                        onChange={(evento) => {
                          setRedeContrato(
                            evento.target.value as RedeSuportada
                          );
                          setResultadoContrato(null);
                          setErroContrato("");
                        }}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-slate-900 focus:bg-white"
                      >
                        {redes.map((item) => (
                          <option key={item.valor} value={item.valor}>
                            {item.nome}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => void analisarContrato()}
                        disabled={carregandoContrato || Boolean(erroRedeContrato)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {carregandoContrato ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
                            A analisar...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4" />
                            Analisar contrato
                          </>
                        )}
                      </button>
                    </div>

                    {erroContrato ? (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                        <span>{erroContrato}</span>
                      </div>
                    ) : null}

                    {resultadoContrato ? (
                      <div className="mt-6 space-y-4">
                        <div
                          className={[
                            "rounded-2xl border p-5",
                            resultadoContrato.nivel === "baixo"
                              ? "border-emerald-200 bg-emerald-50"
                              : resultadoContrato.nivel === "atencao"
                                ? "border-amber-200 bg-amber-50"
                                : resultadoContrato.nivel === "alto"
                                  ? "border-rose-200 bg-rose-50"
                                  : "border-slate-200 bg-slate-50"
                          ].join(" ")}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                {resultadoContrato.nivel === "baixo" ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : resultadoContrato.nivel === "alto" ? (
                                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                                )}

                                <span className="text-sm font-black text-slate-950">
                                  {resultadoContrato.titulo}
                                </span>
                              </div>

                              <p className="mt-2 text-xs leading-5 text-slate-600">
                                {resultadoContrato.explicacao}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${nivelClasses(resultadoContrato.nivel).badge}`}
                            >
                              {nivelLabel(resultadoContrato.nivel)}
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const detalhes = resultadoContrato.detalhesTecnicos;

                          if (
                            !detalhes ||
                            typeof detalhes !== "object" ||
                            !("data" in detalhes) ||
                            !detalhes.data ||
                            typeof detalhes.data !== "object"
                          ) {
                            return null;
                          }

                          const dados = detalhes.data as Record<string, unknown>;
                          const meta =
                            dados.meta &&
                            typeof dados.meta === "object"
                              ? (dados.meta as Record<string, unknown>)
                              : null;

                          const metadata =
                            meta?.metadata &&
                            typeof meta.metadata === "object"
                              ? (meta.metadata as Record<string, unknown>)
                              : null;

                          const providers =
                            metadata &&
                            Array.isArray(metadata.providers)
                              ? (metadata.providers as unknown[])
                              : [];

                          return (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Risk Score
                                </p>
                                <p className="mt-2 text-2xl font-black text-slate-950">
                                  {typeof dados.riskScore === "number"
                                    ? dados.riskScore
                                    : "—"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Decisão
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-950">
                                  {typeof dados.decision === "string"
                                    ? dados.decision
                                    : "—"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Contrato verificado
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-950">
                                  {metadata?.isVerified === true
                                    ? "Sim"
                                    : metadata?.isVerified === false
                                      ? "Não"
                                      : "—"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Rug Risk
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-950">
                                  {typeof meta?.rugRisk === "number"
                                    ? meta.rugRisk
                                    : "—"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 xl:col-span-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Nome do contrato
                                    </p>
                                    <p className="mt-2 text-sm font-black text-slate-950">
                                      {typeof metadata?.contractName === "string"
                                        ? metadata.contractName
                                        : "Não disponível"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Compiler
                                    </p>
                                    <p className="mt-2 break-all font-mono text-xs font-bold text-slate-700">
                                      {typeof metadata?.compiler === "string"
                                        ? metadata.compiler
                                        : "Não disponível"}
                                    </p>
                                  </div>
                                </div>

                                {providers.length > 0 ? (
                                  <div className="mt-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Providers utilizados
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {providers.map((provider) => (
                                        <span
                                          key={String(provider)}
                                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600"
                                        >
                                          {String(provider)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })()}

                        {resultadoContrato.razoes.length > 0 ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                              Sinais recebidos
                            </p>

                            <div className="mt-3 space-y-2">
                              {resultadoContrato.razoes.map((razao, indice) => (
                                <div
                                  key={`${razao.titulo}-${indice}`}
                                  className="rounded-xl bg-white p-3 ring-1 ring-slate-100"
                                >
                                  <p className="text-xs font-black text-slate-900">
                                    {razao.titulo}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {razao.descricao}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex gap-3">
                            <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                            <p className="text-xs leading-5 text-slate-600">
                              A análise de contrato é heurística e não constitui
                              uma auditoria formal nem uma garantia absoluta de
                              segurança.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {carregando ? (
                    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_15px_45px_rgba(15,23,42,0.08)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
                        </div>

                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                            Scanner ativo
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-950">
                            A analisar a carteira...
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Estamos a consultar os dados de risco disponíveis.
                          </p>
                        </div>

                        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">
                          Live
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {resultado ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Resultado da análise
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <ResultadoVisual resultado={resultado} />
                      <ResumoAnalise resultado={resultado} />
                      <IndicadoresAnalise
                        razoes={resultado.razoes}
                        nivelRisco={resultado.nivel}
                      />

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex gap-3">
                          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <p className="text-xs leading-5 text-slate-600">
                            O resultado é uma avaliação de risco baseada
                            nos dados disponíveis ao scanner. Não representa
                            uma garantia absoluta de segurança e não bloqueia
                            uma transação nesta fase.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>
              ) : null}

              {abaAtual === "historico" ? (
                <section className="space-y-6">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Registo
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                          Histórico de análises
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                          Consulta os endereços analisados nesta sessão.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Total
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-950">
                          {historico.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 sm:p-6">
                    {historico.length > 0 ? (
                      <div className="space-y-2">
                        {historico.map((item) => {
                          const classes = nivelClasses(item.nivel);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setEndereco(item.endereco);
                                setRede(item.rede);
                                setResultado(null);
                                navegar("analisar");
                              }}
                              className="flex w-full flex-col gap-4 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50 sm:flex-row sm:items-center"
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                  <FileSearch
                                    className={`h-5 w-5 ${classes.icon}`}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-black text-slate-900">
                                      {nomeRede(item.rede)}
                                    </span>

                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                      {item.rede}
                                    </span>
                                  </div>

                                  <p className="mt-1 break-all font-mono text-xs text-slate-500">
                                    {item.endereco}
                                  </p>

                                  <p className="mt-2 text-xs text-slate-400">
                                    {new Date(
                                      item.analisadoEm
                                    ).toLocaleString("pt-PT")}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-3">
                                <span
                                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${classes.badge}`}
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${classes.dot}`}
                                    />
                                    {nivelLabel(item.nivel)}
                                  </span>
                                </span>

                                <ChevronRight className="h-4 w-4 text-slate-300" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                        <History className="mx-auto h-9 w-9 text-slate-300" />
                        <p className="mt-4 text-sm font-bold text-slate-700">
                          Histórico vazio
                        </p>
                        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                          Quando fizeres uma análise, o resultado ficará
                          disponível aqui durante a sessão.
                        </p>
                        <button
                          type="button"
                          onClick={() => navegar("analisar")}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          Fazer primeira análise
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {abaAtual === "seguranca" ? (
                <section className="space-y-6">
                  <div className="rounded-[28px] bg-[#0a0f0d] p-6 text-white sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Segurança da conta
                        </div>

                        <h2 className="mt-4 text-3xl font-black tracking-tight">
                          A tua sessão está autenticada.
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                          A autenticação da Carteira Segura utiliza a wallet
                          conectada e SIWE. A aplicação não precisa da tua
                          chave privada.
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                          <Check className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            SIWE ativo
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            Sessão autenticada
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      {
                        titulo: "Wallet + SIWE",
                        descricao:
                          "A identidade da sessão é associada à wallet através de Sign-In with Ethereum.",
                        ativo: true,
                        icone: Wallet
                      },
                      {
                        titulo: "Scanner de risco",
                        descricao:
                          "O endereço pode ser analisado antes de uma interação Web3.",
                        ativo: true,
                        icone: Shield
                      },
                      {
                        titulo: "Análise multi-rede",
                        descricao:
                          "A plataforma suporta as redes configuradas pelo scanner.",
                        ativo: true,
                        icone: BarChart3
                      },
                      {
                        titulo: "Histórico",
                        descricao:
                          "As análises realizadas ficam disponíveis na sessão atual.",
                        ativo: true,
                        icone: History
                      },
                      {
                        titulo: "Bloqueio pré-assinatura",
                        descricao:
                          "A interceção automática antes da assinatura ainda está em desenvolvimento.",
                        ativo: false,
                        icone: LockKeyhole
                      },
                      {
                        titulo: "Proteção de fundos",
                        descricao:
                          "A plataforma não guarda chaves privadas nem movimenta os teus fundos.",
                        ativo: true,
                        icone: ShieldCheck
                      }
                    ].map((item) => {
                      const Icone = item.icone;

                      return (
                        <div
                          key={item.titulo}
                          className="rounded-[24px] border border-slate-200 bg-white p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={[
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                item.ativo
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              ].join(" ")}
                            >
                              <Icone className="h-5 w-5" />
                            </div>

                            {item.ativo ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                                <Check className="h-3 w-3" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                Em desenvolvimento
                              </span>
                            )}
                          </div>

                          <h3 className="mt-5 text-base font-black text-slate-950">
                            {item.titulo}
                          </h3>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {item.descricao}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                    <div className="rounded-[26px] border border-slate-200 bg-white p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Wallet autenticada
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-950">
                            {sessao.wallet}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Ligação
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {isConnected
                              ? "Wallet conectada"
                              : "Wallet desconectada"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Rede atual
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {chain?.name ?? (chainId ? `Chain ${chainId}` : "Não identificada")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-amber-200 bg-amber-50 p-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <AlertTriangle className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-black text-amber-950">
                            O que a Carteira Segura faz hoje
                          </p>

                          <p className="mt-2 text-xs leading-5 text-amber-900/75">
                            A plataforma analisa endereços e apresenta
                            indicadores de risco. Nesta fase, ela não
                            bloqueia automaticamente uma transação antes da
                            assinatura.
                          </p>

                          <button
                            type="button"
                            onClick={() => navegar("analisar")}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-950 px-3 py-2 text-xs font-bold text-white hover:bg-amber-900"
                          >
                            Fazer uma análise
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <LockKeyhole className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-950">
                          Princípio de segurança
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          A plataforma deve informar antes de interferir.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {[
                        {
                          numero: "01",
                          titulo: "Analisar",
                          descricao:
                            "Consultar sinais de risco disponíveis."
                        },
                        {
                          numero: "02",
                          titulo: "Informar",
                          descricao:
                            "Explicar o resultado em linguagem clara."
                        },
                        {
                          numero: "03",
                          titulo: "Decidir",
                          descricao:
                            "O utilizador decide se continua."
                        }
                      ].map((item) => (
                        <div
                          key={item.numero}
                          className="rounded-2xl bg-slate-50 p-4"
                        >
                          <span className="text-[10px] font-black text-emerald-600">
                            {item.numero}
                          </span>
                          <p className="mt-2 text-sm font-black text-slate-900">
                            {item.titulo}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.descricao}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <PainelExperimento
                    wallet={address ?? null}
                    network={rede}
                    casoSelecionado={casoExperimento}
                    acaoSelecionada={acaoExperimento}
                    evidencias={evidenciasExperimento}
                    resultado={resultadoExperimento}
                    erro={erroExperimento}
                    executando={executandoExperimento}
                    onCasoChange={(caso) => {
                      setCasoExperimento(caso);
                      setResultadoExperimento(null);
                      setErroExperimento("");
                    }}
                    onAcaoChange={(acao) => {
                      setAcaoExperimento(acao);
                      setResultadoExperimento(null);
                      setErroExperimento("");
                    }}
                    onExecutar={executarCasoExperimento}
                  />
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-[#eef2ef] px-3 py-3 text-slate-950 sm:px-5 sm:py-5 lg:px-7">
      <div className="mx-auto max-w-[1600px]">
        {sessao ? (
          paginaAutenticada
        ) : (
          <BotaoConectarWallet aoAutenticar={setSessao} />
        )}
      </div>
    </main>
  );
}
