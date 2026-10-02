import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import {
  obterNonce,
  obterSessao,
  terminarSessao,
  verificarAssinatura,
  type SessaoWallet
} from "../servicos/siwe";

type Props = {
  aoAutenticar?: (sessao: SessaoWallet | null) => void;
};

function abreviarEndereco(endereco: string): string {
  return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
}

export function BotaoConectarWallet({ aoAutenticar }: Props) {
  const { open } = useAppKit();
  const { isConnected, address, chain, chainId, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [sessao, setSessao] = useState<SessaoWallet | null>(null);
  const [assinando, setAssinando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function verificarSessaoAtual() {
      if (!address) {
        if (ativo) {
          setSessao(null);
          setErro(null);
          aoAutenticar?.(null);
        }
        return;
      }

      try {
        const sessaoAtual = await obterSessao();

        if (!ativo) return;

        if (
          sessaoAtual &&
          sessaoAtual.wallet.toLowerCase() === address.toLowerCase()
        ) {
          setSessao(sessaoAtual);
          aoAutenticar?.(sessaoAtual);
          return;
        }

        if (sessaoAtual) {
          await terminarSessao();
        }

        setSessao(null);
        aoAutenticar?.(null);
      } catch (e) {
        if (!ativo) return;

        setSessao(null);
        aoAutenticar?.(null);
        setErro(
          e instanceof Error
            ? e.message
            : "Não foi possível verificar a sessão."
        );
      }
    }

    void verificarSessaoAtual();

    return () => {
      ativo = false;
    };
  }, [address, aoAutenticar]);

  async function entrarComWallet() {
    if (!address) {
      setErro("Conecte uma wallet primeiro.");
      await open();
      return;
    }

    try {
      setErro(null);
      setAssinando(true);

      const nonce = await obterNonce();

      const issuedAt = new Date().toISOString();
      if (!chainId) {
        throw new Error("Não foi possível identificar a rede da carteira.");
      }

      const message = [
        "Carteira Segura wants you to sign in with your Ethereum account:",
        address,
        "",
        "Autenticação segura da Carteira Segura.",
        "",
        `URI: ${window.location.origin}`,
        "Version: 1",
        `Chain ID: ${chainId}`,
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`
      ].join("\n");

      const signature = await signMessageAsync({
        message
      });

      const resultado = await verificarAssinatura(
        message,
        signature
      );

      setSessao(resultado);
      aoAutenticar?.(resultado);
    } catch (e) {
      console.error(e);

      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível autenticar a wallet."
      );
    } finally {
      setAssinando(false);
    }
  }

  async function sair() {
    try {
      setErro(null);
      await terminarSessao();
    } catch (e) {
      console.error(e);

      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível terminar a sessão."
      );
    } finally {
      setSessao(null);
      aoAutenticar?.(null);
      disconnect();
    }
  }

  if (!isConnected || !address) {
    return (
      <main className="flex min-h-[calc(100vh-2rem)] items-center justify-center overflow-hidden rounded-[32px] bg-[#07100c] px-5 py-10 sm:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
            <section className="relative flex min-h-[620px] flex-col justify-between overflow-hidden bg-[#07100c] p-7 text-white sm:p-10 lg:p-12">
              <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#07100c]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black tracking-tight">
                      Carteira Segura
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Web3 Security
                    </p>
                  </div>
                </div>

                <div className="mt-20 max-w-lg">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Acesso protegido
                  </div>

                  <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                    Protege antes
                    <br />
                    <span className="text-emerald-300">de assinar.</span>
                  </h1>

                  <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                    Analisa sinais de risco da blockchain antes de
                    interagir com endereços e contratos Web3.
                  </p>
                </div>
              </div>

              <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
                {[
                  ["01", "Conectar", "Liga a tua wallet"],
                  ["02", "Verificar", "Confirma o controlo"],
                  ["03", "Analisar", "Consulta o risco"]
                ].map(([numero, titulo, descricao]) => (
                  <div
                    key={numero}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <span className="text-[10px] font-black text-emerald-300">
                      {numero}
                    </span>
                    <p className="mt-2 text-xs font-black text-white">
                      {titulo}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      {descricao}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex min-h-[620px] items-center bg-[#f8faf9] p-6 sm:p-10 lg:p-12">
              <div className="w-full max-w-md mx-auto">
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                    Passo 01 de 02
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    Conecta a tua wallet
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Começa por conectar uma carteira compatível.
                    Nenhuma transação será executada nesta etapa.
                  </p>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Wallet className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-950">
                    A tua wallet é a tua identidade
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    A Carteira Segura não precisa da tua chave privada.
                    Apenas precisamos do endereço público para iniciar
                    a sessão.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setErro(null);
                      void open();
                    }}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    <Wallet className="h-4 w-4" />
                    Conectar carteira
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                  <p className="text-[11px] leading-5 text-emerald-900/75">
                    <strong className="font-black text-emerald-900">
                      Segurança:
                    </strong>{" "}
                    conectar a wallet não autoriza qualquer transação
                    nem movimenta os teus fundos.
                  </p>
                </div>

                {erro && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-700">
                    {erro}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  const sessaoAtiva =
    sessao?.wallet.toLowerCase() === address.toLowerCase();

  if (sessaoAtiva) {
    return (
      <main className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-[32px] bg-[#07100c] px-5 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-[30px] border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                Autenticação concluída
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Wallet verificada
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                A tua sessão está autenticada e pronta para utilizar
                a Carteira Segura.
              </p>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Wallet className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Wallet autenticada
                  </p>

                  <p className="mt-1 truncate text-sm font-black text-slate-950">
                    {abreviarEndereco(address)}
                  </p>
                </div>

                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-500" />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs font-semibold text-slate-500">
                  Rede
                </span>
                <span className="text-xs font-black text-slate-900">
                  {chain?.name ?? (chainId ? `Chain ${chainId}` : "Rede desconhecida")}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Provider
                </span>
                <span className="text-xs font-black text-slate-900">
                  {connector?.name ?? "não identificado"}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[11px] leading-5 text-emerald-900/75">
                A assinatura utilizada para autenticar a sessão não é
                uma transação, não movimenta fundos e não consome gas.
              </p>
            </div>

            <button
              type="button"
              onClick={sair}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Desconectar wallet
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-2rem)] items-center justify-center overflow-hidden rounded-[32px] bg-[#07100c] px-5 py-10 sm:px-8">
      <div className="w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between bg-[#07100c] p-7 text-white sm:p-10 lg:p-12">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#07100c]">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black">
                    Carteira Segura
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Web3 Security
                  </p>
                </div>
              </div>

              <div className="mt-16">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  Passo 02 de 02
                </p>

                <h1 className="mt-4 text-4xl font-black tracking-tight">
                  Verifica a tua wallet.
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  A assinatura confirma que controlas o endereço
                  conectado antes de entrares na plataforma.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-emerald-300" />

                <div>
                  <p className="text-xs font-black text-white">
                    Assinatura segura
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Não é uma transação e não movimenta fundos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center bg-[#f8faf9] p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-7">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  Wallet conectada
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  Pronta para autenticar
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Assina uma mensagem para confirmar que tens controlo
                  sobre esta wallet.
                </p>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Endereço
                    </p>

                    <p className="mt-1 truncate text-base font-black text-slate-950">
                      {abreviarEndereco(address)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Estado
                    </p>
                    <p className="mt-2 text-xs font-black text-emerald-600">
                      Wallet conectada
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Rede
                    </p>
                    <p className="mt-2 truncate text-xs font-black text-slate-900">
                      {chain?.name ?? (chainId ? `Chain ${chainId}` : "Rede desconhecida")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Provider
                    </p>
                    <p className="mt-2 truncate text-xs font-black text-slate-900">
                      {connector?.name ?? "não identificado"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={entrarComWallet}
                  disabled={assinando}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assinando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      A verificar wallet...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Entrar com wallet
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={sair}
                  disabled={assinando}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Trocar / desconectar wallet
                </button>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                <p className="text-[11px] leading-5 text-slate-500">
                  Vais assinar apenas uma mensagem de autenticação.
                  <strong className="font-black text-slate-700">
                    {" "}
                    Nenhum fundo será movimentado.
                  </strong>
                </p>
              </div>

              {erro && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-700">
                  {erro}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
