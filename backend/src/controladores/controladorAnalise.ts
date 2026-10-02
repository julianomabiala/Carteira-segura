import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
  analisarCarteira,
  analisarContrato,
  ErroServicoNZOChain
} from "../servicos/nzochain.js";
import {
  validarPedidoAnalise,
  validarPedidoAnaliseContrato
} from "../utilitarios/validacao.js";
import { guardarAnalise } from "../repositorios/repositorioAnalises.js";
import { obterOuCriarWallet } from "../repositorios/repositorioAuth.js";

function obterMetadadosNZOChain(resultado: unknown) {
  const corpo = resultado as {
    detalhesTecnicos?: {
      data?: {
        riskScore?: unknown;
        riskLevel?: unknown;
        decision?: unknown;
        meta?: {
          scan?: {
            dataQuality?: unknown;
            degraded?: unknown;
          };
        };
      };
    };
  };

  const dados = corpo.detalhesTecnicos?.data;
  const scan = dados?.meta?.scan;

  return {
    riskScore:
      typeof dados?.riskScore === "number"
        ? dados.riskScore
        : null,
    riskLevel:
      typeof dados?.riskLevel === "string"
        ? dados.riskLevel
        : null,
    decision:
      typeof dados?.decision === "string"
        ? dados.decision
        : null,
    dataQuality:
      typeof scan?.dataQuality === "string"
        ? scan.dataQuality
        : null,
    degraded:
      typeof scan?.degraded === "boolean"
        ? scan.degraded
        : null
  };
}

function responderErro(res: Response, erro: unknown): void {
  if (erro instanceof ZodError) {
    res.status(400).json({
      codigo: "PEDIDO_INVALIDO",
      mensagem:
        "O endereço introduzido não parece válido. Verifique e tente novamente."
    });
    return;
  }

  if (erro instanceof ErroServicoNZOChain) {
    const mensagem =
      erro.statusHttp === 504
        ? "Não foi possível contactar o serviço. Verifique a sua ligação e tente novamente."
        : erro.statusHttp === 403
          ? "Esta funcionalidade não está disponível no plano atual."
          : "Não foi possível concluir a análise neste momento. Tente novamente.";

    res.status(erro.statusHttp).json({
      codigo: "ERRO_NZOCHAIN",
      mensagem
    });
    return;
  }

  console.error("Erro na análise:", erro);

  res.status(500).json({
    codigo: "ERRO_INTERNO",
    mensagem:
      "Não foi possível concluir a análise neste momento. Tente novamente."
  });
}

export async function criarAnalise(
  req: Request,
  res: Response
): Promise<void> {
  const inicio = new Date();

  try {
    const pedido = validarPedidoAnalise(req.body);

    console.info(
      `A analisar carteira na rede ${pedido.network}`
    );

    const resultado = await analisarCarteira(pedido);
    const fim = new Date();
    const metadados = obterMetadadosNZOChain(resultado);
    const walletPersistida = await obterOuCriarWallet(
      pedido.wallet,
      pedido.network
    );

    try {
      const analysisId = await guardarAnalise({
        walletId: walletPersistida.id,
        address: pedido.wallet,
        network: pedido.network,
        type: "wallet",
        endpoint: "/api/v1/wallets/risk",
        httpStatus: 200,
        success: true,
        ...metadados,
        response: resultado,
        requestedAt: inicio,
        completedAt: fim
      });

      res.setHeader("X-Analysis-Id", analysisId);
    } catch (erro) {
      console.error(
        "Falha ao persistir análise da carteira:",
        erro
      );
    }

    res.json(resultado);
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function criarAnaliseContrato(
  req: Request,
  res: Response
): Promise<void> {
  const inicio = new Date();

  try {
    const pedido = validarPedidoAnaliseContrato(req.body);

    console.info(
      `A analisar contrato ${pedido.address} na rede ${pedido.network}`
    );

    const resultado = await analisarContrato(pedido);
    const fim = new Date();
    const metadados = obterMetadadosNZOChain(resultado);

    try {
      const analysisId = await guardarAnalise({
        walletId: null,
        address: pedido.address,
        network: pedido.network,
        type: "contract",
        endpoint: "/api/v1/contracts/risk",
        httpStatus: 200,
        success: true,
        ...metadados,
        response: resultado,
        requestedAt: inicio,
        completedAt: fim
      });

      res.setHeader("X-Analysis-Id", analysisId);
    } catch (erro) {
      console.error(
        "Falha ao persistir análise do contrato:",
        erro
      );
    }

    res.json(resultado);
  } catch (erro) {
    responderErro(res, erro);
  }
}
