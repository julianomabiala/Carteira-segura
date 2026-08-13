import type { Request, Response } from "express";
import { ZodError } from "zod";
import { analisarCarteira, ErroServicoNZOChain } from "../servicos/nzochain.js";
import { validarPedidoAnalise } from "../utilitarios/validacao.js";

export async function criarAnalise(req: Request, res: Response): Promise<void> {
  try {
    const pedido = validarPedidoAnalise(req.body);
    console.info(`A analisar carteira na rede ${pedido.network}`);
    const resultado = await analisarCarteira(pedido);
    res.json(resultado);
  } catch (erro) {
    if (erro instanceof ZodError) {
      res.status(400).json({
        codigo: "PEDIDO_INVALIDO",
        mensagem: "O endereco introduzido nao parece valido. Verifique e tente novamente."
      });
      return;
    }

    if (erro instanceof ErroServicoNZOChain) {
      const mensagem =
        erro.statusHttp === 504
          ? "Nao foi possivel contactar o servico. Verifique a sua ligacao e tente novamente."
          : "Nao foi possivel concluir a analise neste momento. Tente novamente.";
      res.status(erro.statusHttp).json({ codigo: "ERRO_NZOCHAIN", mensagem });
      return;
    }

    res.status(500).json({
      codigo: "ERRO_INTERNO",
      mensagem: "Nao foi possivel concluir a analise neste momento. Tente novamente."
    });
  }
}
