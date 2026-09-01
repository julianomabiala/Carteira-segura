import { ArrowRight, BadgeCheck, FileText, LockKeyhole, Plus, ShieldCheck, ShieldEllipsis, Sparkles, WalletCards } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { BotaoConectarWallet } from "../componentes/BotaoConectarWallet";
import { ExemplosWallet } from "../componentes/ExemplosWallet";
import { FormularioAnalise } from "../componentes/FormularioAnalise";
import { IndicadoresAnalise } from "../componentes/IndicadoresAnalise";
import { ResultadoVisual } from "../componentes/ResultadoVisual";
import { ResumoAnalise } from "../componentes/ResumoAnalise";
import { redePorChainId } from "../configuracao/wallet";
import { pedirAnalise } from "../servicos/apiAnalise";
import { auth, criarContaEmail, entrarEmail, entrarGoogle, recuperarSenhaEmail, sairUsuario } from "../servicos/firebase";
import {
  guardarAnaliseUsuario,
  listarCarteirasUsuario,
  listarUltimasAnalisesUsuario,
  removerCarteiraUsuario,
  salvarCarteiraUsuario,
  type AnaliseHistorico,
  type WalletFirestore
} from "../servicos/firestore";
import { validarEndereco } from "../servicos/validacao";
import type { RedeSuportada, ResultadoAnalise } from "../tipos/analise";

export function PaginaPrincipal() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [mensagemAuth, setMensagemAuth] = useState("");
  const [carregandoAuth, setCarregandoAuth] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [rede, setRede] = useState<RedeSuportada>("ethereum");
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [carteiras, setCarteiras] = useState<WalletFirestore[]>([]);
  const [novaCarteira, setNovaCarteira] = useState("");
  const [novaRedeCarteira, setNovaRedeCarteira] = useState<RedeSuportada>("ethereum");
  const [adicionandoCarteira, setAdicionandoCarteira] = useState(false);
  const [historico, setHistorico] = useState<AnaliseHistorico[]>([]);
  const [abaAtual, setAbaAtual] = useState<"inicio" | "carteiras" | "analisar" | "historico" | "seguranca">("inicio");
  const [perfilAberto, setPerfilAberto] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const analiseRequestIdRef = useRef(0);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuarioAtual) => {
      setUsuario(usuarioAtual);
    });

    return () => cancelar();
  }, []);

  useEffect(() => {
    if (!perfilAberto) return;

    function fecharMenuAoClicarFora(evento: MouseEvent) {
      const alvo = evento.target as HTMLElement | null;
      if (!alvo || !alvo.closest("[aria-label='Abrir menu do utilizador']")) {
        setPerfilAberto(false);
      }
    }

    window.addEventListener("click", fecharMenuAoClicarFora);
    return () => window.removeEventListener("click", fecharMenuAoClicarFora);
  }, [perfilAberto]);

  useEffect(() => {
    if (!usuario) {
      setHistorico([]);
      setCarteiras([]);
      return;
    }

    (async () => {
      try {
        const [ultimas, listaCarteiras] = await Promise.all([
          listarUltimasAnalisesUsuario(usuario.uid),
          listarCarteirasUsuario(usuario.uid)
        ]);
        setHistorico(ultimas);
        setCarteiras(listaCarteiras);
      } catch {
        setHistorico([]);
        setCarteiras([]);
      }
    })();
  }, [usuario, resultado]);

  useEffect(() => {
    if (!usuario || !isConnected || !address) return;
    const redeConectada = redePorChainId(chain?.id) ?? "ethereum";

    (async () => {
      try {
        const id = await salvarCarteiraUsuario(usuario.uid, {
          address,
          network: redeConectada,
          chainId: chain?.id ?? 1,
          label: "Carteira conectada"
        });
        setWalletId(id);
        const listaAtualizada = await listarCarteirasUsuario(usuario.uid);
        setCarteiras(listaAtualizada);
      } catch {
        setErro("Nao foi possivel guardar a wallet no perfil. Tente novamente.");
      }
    })();
  }, [address, chain?.id, isConnected, usuario]);

  useEffect(() => {
    if (isConnected && address && !endereco) {
      setEndereco(address);
      setRede(redePorChainId(chain?.id) ?? "ethereum");
    }
  }, [address, chain?.id, endereco, isConnected]);

  async function autenticar() {
    if (!email || !senha) {
      setMensagemAuth("Informe email e password para continuar.");
      return;
    }

    if (modoCadastro) {
      if (!nome.trim()) {
        setMensagemAuth("Introduza o nome para criar a conta.");
        return;
      }

      if (senha !== confirmarSenha) {
        setMensagemAuth("As passwords nao coincidem.");
        return;
      }
    }

    setCarregandoAuth(true);
    setMensagemAuth("");

    try {
      if (modoCadastro) {
        await criarContaEmail(email, senha, nome.trim());
        setMensagemAuth("Conta criada com sucesso.");
      } else {
        await entrarEmail(email, senha);
      }
    } catch (falha) {
      setMensagemAuth(falha instanceof Error ? falha.message : "Nao foi possivel concluir a autenticacao.");
    } finally {
      setCarregandoAuth(false);
    }
  }

  async function entrarComGoogle() {
    setCarregandoAuth(true);
    setMensagemAuth("");

    try {
      await entrarGoogle();
      setMensagemAuth("Entrou com Google com sucesso.");
    } catch (falha) {
      setMensagemAuth(falha instanceof Error ? falha.message : "Nao foi possivel entrar com Google.");
    } finally {
      setCarregandoAuth(false);
    }
  }

  async function recuperar() {
    if (!email) {
      setMensagemAuth("Introduza o email para recuperar a password.");
      return;
    }

    try {
      await recuperarSenhaEmail(email);
      setMensagemAuth("Email de recuperacao enviado. Verifique a sua caixa de entrada.");
    } catch (falha) {
      setMensagemAuth(falha instanceof Error ? falha.message : "Nao foi possivel enviar o email.");
    }
  }

  async function analisar(valorEndereco = endereco, valorRede = rede) {
    const enderecoFinal = (valorEndereco ?? "").trim();

    if (carregando) {
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
      setErro("O endereco introduzido nao parece valido. Verifique e tente novamente.");
      return;
    }

    const requestId = ++analiseRequestIdRef.current;
    setErro("");
    setResultado(null);
    setCarregando(true);

    try {
      let idToken: string | undefined;
      if (usuario) {
        try {
          idToken = await usuario.getIdToken();
        } catch {
          // ignore token retrieval error, proceed without token
        }
      }

      const resposta = await pedirAnalise({ wallet: enderecoFinal, network: valorRede }, idToken);

      if (requestId !== analiseRequestIdRef.current) {
        return;
      }

      setResultado(resposta);

      try {
        if (usuario) {
          let wid = walletId;
          if (!wid) {
            wid = await salvarCarteiraUsuario(usuario.uid, {
              address: enderecoFinal,
              network: valorRede,
              chainId: chain?.id ?? 1,
              label: "Carteira"
            });
            setWalletId(wid);
          }

          await guardarAnaliseUsuario(usuario.uid, wid, {
            nivel: resposta.nivel,
            titulo: resposta.titulo,
            explicacao: resposta.explicacao,
            razoes: resposta.razoes,
            rede: resposta.rede as RedeSuportada,
            endereco: resposta.endereco,
            analisadoEm: resposta.analisadoEm
          });
        }
      } catch (e) {
        console.warn("Falha ao guardar analise no Firestore:", e);
      }
    } catch (falha) {
      if (requestId !== analiseRequestIdRef.current) {
        return;
      }

      setErro(falha instanceof Error ? falha.message : "Nao foi possivel concluir a analise neste momento. Tente novamente.");
    } finally {
      if (requestId === analiseRequestIdRef.current) {
        setCarregando(false);
      }
    }
  }

  async function adicionarCarteiraManual() {
    if (!usuario) {
      return;
    }

    const enderecoFinal = novaCarteira.trim();
    if (!validarEndereco(enderecoFinal)) {
      setErro("O endereco da carteira a adicionar nao parece valido.");
      return;
    }

    setAdicionandoCarteira(true);
    setErro("");

    try {
      await salvarCarteiraUsuario(usuario.uid, {
        address: enderecoFinal,
        network: novaRedeCarteira,
        chainId: 1,
        label: "Carteira adicionada"
      });

      const listaAtualizada = await listarCarteirasUsuario(usuario.uid);
      setCarteiras(listaAtualizada);
      setNovaCarteira("");
      setEndereco(enderecoFinal);
      setRede(novaRedeCarteira);
      setAbaAtual("analisar");
    } catch {
      setErro("Nao foi possivel adicionar esta carteira ao perfil.");
    } finally {
      setAdicionandoCarteira(false);
    }
  }

  async function removerCarteira(walletIdParaRemover: string) {
    if (!usuario) {
      return;
    }

    try {
      await removerCarteiraUsuario(usuario.uid, walletIdParaRemover);
      const listaAtualizada = await listarCarteirasUsuario(usuario.uid);
      setCarteiras(listaAtualizada);

      if (walletId === walletIdParaRemover) {
        setWalletId(null);
      }
    } catch {
      setErro("Nao foi possivel remover a carteira selecionada.");
    }
  }

  function escolherExemplo(exemplo: { endereco: string; rede: RedeSuportada }) {
    setEndereco(exemplo.endereco);
    setRede(exemplo.rede);
    void analisar(exemplo.endereco, exemplo.rede);
  }

  const perfilNome = usuario?.displayName?.trim() || usuario?.email?.trim() || "Utilizador";
  const perfilInicial = perfilNome.charAt(0).toUpperCase();

  const passos = [
    {
      titulo: "Conecte a carteira",
      descricao: "Autentique-se com a conta e associe a wallet ao perfil ou use a carteira conectada no momento.",
      icone: WalletCards
    },
    {
      titulo: "Escolha a rede",
      descricao: "Selecione a rede correta para a análise no scanner antes de verificar o endereço informado.",
      icone: ShieldEllipsis
    },
    {
      titulo: "Analise em tempo real",
      descricao: "O backend valida o endereço e classifica o risco com base nos dados retornados pela API da NZOChain.",
      icone: LockKeyhole
    },
    {
      titulo: "Decida com confiança",
      descricao: "Veja o risco, os indicadores e a recomendação em linguagem simples antes de assinar qualquer transação.",
      icone: ShieldCheck
    }
  ];

  const menuTabs = [
    { key: "inicio", label: "Início" },
    { key: "carteiras", label: "Carteiras" },
    { key: "analisar", label: "Analisar" },
    { key: "historico", label: "Histórico" },
    { key: "seguranca", label: "Segurança" }
  ] as const;

  const paginaAutenticada = usuario ? (
    <div className="space-y-6">
      <header className="rounded-[28px] border border-slate-200 bg-[#0f172a] px-4 py-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.2)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-white ring-1 ring-white/10">
              N
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">NZOChain</p>
              <h2 className="text-2xl font-bold leading-tight">Carteira segura</h2>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {menuTabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setAbaAtual(item.key)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  abaAtual === item.key
                    ? "border-slate-700 bg-white text-slate-900 shadow-sm"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:text-white"
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="relative ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAbaAtual("carteiras");
                open();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar carteira
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
              <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Sem wallet"}</span>
              {isConnected ? (
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="ml-2 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  Desconectar
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setPerfilAberto((valor) => !valor)}
              className="flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 p-2.5 text-left transition hover:border-slate-500"
              aria-expanded={perfilAberto}
              aria-label="Abrir menu do utilizador"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900">
                {perfilInicial}
              </div>
            </button>

            {perfilAberto ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] w-60 rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                <div className="mb-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {perfilInicial}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{perfilNome}</p>
                      <p className="truncate text-xs text-slate-600">{usuario.email ?? "Sem email"}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPerfilAberto(false);
                    setAbaAtual("carteiras");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Definições
                </button>
                <button
                  type="button"
                  onClick={() => void sairUsuario()}
                  className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-left text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {abaAtual === "inicio" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { rotulo: "Carteiras conectadas", valor: isConnected ? "1" : "0", estado: "Ativa" },
              { rotulo: "Análises realizadas", valor: resultado ? "1" : "0", estado: "Última" },
              { rotulo: "Última análise", valor: resultado ? "Hoje" : "Sem dados", estado: "Status" },
              { rotulo: "Estado geral", valor: resultado ? resultado.titulo : "Sem risco", estado: "Resumo" }
            ].map((item) => (
              <div key={item.rotulo} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <p className="text-sm text-slate-500">{item.rotulo}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.valor}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{item.estado}</p>
              </div>
            ))}
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Proteção proativa
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Proteja sua carteira antes de assinar.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Verifique o risco antes de confirmar qualquer transação, validar um contrato ou interagir com uma carteira desconhecida.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Conectar outra carteira
              </button>
              <button
                type="button"
                onClick={() => setAbaAtual("carteiras")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Ver carteiras
              </button>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                {isConnected && address ? "Wallet conectada" : "Wallet não conectada"}
              </div>
            </div>
          </section>

          {resultado ? (
            <>
              <ResultadoVisual resultado={resultado} />
              <ResumoAnalise resultado={resultado} />
              <IndicadoresAnalise razoes={resultado.razoes} nivelRisco={resultado.nivel} />
            </>
          ) : null}
        </div>
      ) : null}

      {abaAtual === "carteiras" ? (
        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Carteiras ativas</h2>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {chain?.name ?? "Ethereum"}
              </span>
            </div>

            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5">
              {isConnected && address ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Endereço</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{address.slice(0, 8)}...{address.slice(-6)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEndereco(address);
                        setRede(redePorChainId(chain?.id) ?? "ethereum");
                        setAbaAtual("analisar");
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                    >
                      Usar na análise
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Configurar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-bold text-slate-900">Nenhuma carteira conectada</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Conecte uma wallet para ver o estado da carteira, gerir a rede e preparar a análise de risco.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">Carteiras guardadas</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAbaAtual("analisar");
                    open();
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                >
                  Conectar outra carteira
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAtual("analisar")}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                >
                  Ver scanner
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {carteiras.length > 0 ? (
                carteiras.map((wallet) => (
                  <div key={wallet.id} className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{wallet.label ?? "Carteira"}</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</p>
                      <p className="mt-1 text-xs text-slate-500">{wallet.network}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEndereco(wallet.address);
                          setRede(wallet.network);
                          setAbaAtual("analisar");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Analisar
                      </button>
                      <button
                        type="button"
                        onClick={() => void removerCarteira(wallet.id)}
                        className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Ainda não há carteiras guardadas neste perfil.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">Adicionar carteira</h3>
              <button
                type="button"
                onClick={() => open()}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700"
              >
                Connect wallet
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr_auto]">
              <input
                type="text"
                value={novaCarteira}
                onChange={(evento) => setNovaCarteira(evento.target.value)}
                placeholder="0x..."
                className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
              <select
                value={novaRedeCarteira}
                onChange={(evento) => setNovaRedeCarteira(evento.target.value as RedeSuportada)}
                className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
              >
                {[
                  { valor: "ethereum", nome: "Ethereum" },
                  { valor: "polygon", nome: "Polygon" },
                  { valor: "bsc", nome: "BNB Smart Chain" }
                ].map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void adicionarCarteiraManual()}
                disabled={adicionandoCarteira}
                className="h-12 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {adicionandoCarteira ? "A guardar..." : "Adicionar"}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <h3 className="text-2xl font-black tracking-tight text-slate-950">Configurações</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                { nome: "Rede principal", valor: chain?.name ?? "Ethereum" },
                { nome: "Autenticação", valor: "Wallet + Firebase" },
                { nome: "Alertas", valor: "Ativos" }
              ].map((item) => (
                <div key={item.nome} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{item.nome}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{item.valor}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {abaAtual === "analisar" ? (
        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <FormularioAnalise
              endereco={endereco}
              rede={rede}
              carregando={carregando}
              carteiraConectada={address ?? undefined}
              aoAlterarEndereco={setEndereco}
              aoAlterarRede={setRede}
              aoSubmeter={() => void analisar()}
              aoUsarCarteiraConectada={() => {
                if (address) {
                  setEndereco(address);
                  setRede(redePorChainId(chain?.id) ?? "ethereum");
                }
              }}
            />
          </div>

          {erro ? (
            <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">{erro}</div>
          ) : null}

          {carregando ? (
            <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-[min(560px,calc(100%-2rem))] rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scanner</p>
                    <p className="text-lg font-bold text-slate-950">A analisar a carteira...</p>
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Live
                </span>
              </div>
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
      ) : null}

      {abaAtual === "historico" ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Histórico</h2>
          {historico.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {historico.map((item) => (
                <article key={item.id} className="flex items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.rede}</p>
                    <p className="mt-1 text-base font-semibold text-slate-950">{item.endereco.slice(0, 10)}...{item.endereco.slice(-6)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {item.nivel === "baixo" ? "Baixo risco" : item.nivel === "atencao" ? "Atenção" : "Alto risco"}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{new Date(item.analisadoEm).toLocaleDateString("pt-PT")}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
              Ainda não há análises guardadas no histórico.
            </div>
          )}
        </section>
      ) : null}

      {abaAtual === "seguranca" ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-7">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Como funciona?</h2>
          <div className="mt-5 grid gap-4">
            {passos.map((passo, indice) => {
              const Icone = passo.icone;
              return (
                <div key={passo.titulo} className="flex gap-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                    0{indice + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icone className="h-4 w-4 text-slate-700" aria-hidden />
                      <h3 className="text-lg font-bold text-slate-950">{passo.titulo}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{passo.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-[#f2f5f3] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {!usuario ? (
          <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  NZOChain
                </div>
                <h1 className="mt-6 max-w-lg text-4xl font-black tracking-tight sm:text-5xl">
                  Proteja sua carteira antes de assinar.
                </h1>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => open()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Conectar outra carteira
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoCadastro(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Ver wallets suportadas
                  </button>
                </div>
                <p className="mt-4 max-w-lg text-lg leading-8 text-slate-300">
                  Uma plataforma de segurança para avaliar risco blockchain com clareza, velocidade e confiança antes da próxima transação.
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    "Análise de risco em tempo real",
                    "Carteiras mobile e desktop",
                    "Histórico e monitorização centralizada"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                        <BadgeCheck className="h-4 w-4" aria-hidden />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Acesso</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-950">{modoCadastro ? "Criar conta" : "Entrar"}</h2>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Security
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {modoCadastro ? (
                    <input
                      type="text"
                      value={nome}
                      onChange={(evento) => setNome(evento.target.value)}
                      placeholder="Nome completo"
                      className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  ) : null}
                  <input
                    type="email"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    placeholder="email@exemplo.com"
                    className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    type="password"
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    placeholder="Password"
                    className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                  {modoCadastro ? (
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={(evento) => setConfirmarSenha(evento.target.value)}
                      placeholder="Confirmar password"
                      className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void autenticar()}
                    disabled={carregandoAuth}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {carregandoAuth ? "A processar..." : modoCadastro ? "Criar conta" : "Entrar"}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={() => void entrarComGoogle()}
                    disabled={carregandoAuth}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {carregandoAuth ? "A processar..." : "Continuar com Google"}
                  </button>

                  <div className="flex flex-col items-start gap-2 pt-2 text-sm">
                    <button
                      type="button"
                      onClick={() => void recuperar()}
                      className="font-medium text-slate-600 underline underline-offset-2"
                    >
                      Esqueci a minha palavra-passe
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoCadastro((valor) => !valor)}
                      className="font-medium text-slate-800 underline underline-offset-2"
                    >
                      {modoCadastro ? "Voltar ao login" : "Criar conta"}
                    </button>
                  </div>

                  {mensagemAuth ? <p className="rounded-xl bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200">{mensagemAuth}</p> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {usuario ? paginaAutenticada : null}
      </div>
    </main>
  );
}
