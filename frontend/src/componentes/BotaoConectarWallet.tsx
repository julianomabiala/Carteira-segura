import { LogOut, Wallet } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import { useSignMessage } from "wagmi";
import { obterNonce, verificarAssinatura } from "../servicos/siwe";
import { useState } from "react";

export function BotaoConectarWallet() {
  const { open } = useAppKit();
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [assinando, setAssinando] = useState(false);

  if (isConnected && address) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Carteira conectada</p>
            <p className="mt-2 font-semibold text-slate-950">{address.slice(0, 6)}...{address.slice(-4)}</p>
            <p className="text-sm text-slate-600">{chain?.name ?? "Rede desconhecida"}</p>
          </div>
          <button
            type="button"
            onClick={() => disconnect()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => open()}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-700"
      >
        <Wallet className="h-5 w-5" aria-hidden />
        Conectar carteira
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            setAssinando(true);
            const nonce = await obterNonce();
            const message = `Sign-in to Carteira Segura\n\nNonce: ${nonce}`;
            const signature = await signMessageAsync({ message });
            await verificarAssinatura(message, signature);
            // on success, page will reflect auth via Firebase
          } catch (e) {
            console.error(e);
            alert(e instanceof Error ? e.message : String(e));
          } finally {
            setAssinando(false);
          }
        }}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50"
      >
        {assinando ? "A assinar..." : "Entrar com wallet"}
      </button>
    </div>
  );
}
