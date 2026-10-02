import type { Request, Response } from "express";
import {
  guardarExperimento,
  listarExperimentos
} from "../repositorios/repositorioExperimentos.js";

function obterSessao(res: Response) {
  return res.locals.sessao as {
    walletId: string;
    wallet: string;
  };
}

export async function listarEvidencias(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const sessao = obterSessao(res);

    res.json(
      await listarExperimentos(sessao.walletId)
    );
  } catch (erro) {
    console.error(
      "Erro ao listar experimentos:",
      erro
    );

    res.status(500).json({
      codigo: "ERRO_EXPERIMENTO",
      mensagem:
        "Não foi possível carregar as evidências."
    });
  }
}

export async function guardarEvidencia(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const sessao = obterSessao(res);
    const corpo = req.body;

    if (
      !corpo ||
      typeof corpo.id !== "string" ||
      typeof corpo.titulo !== "string" ||
      typeof corpo.descricao !== "string" ||
      typeof corpo.estado !== "string"
    ) {
      res.status(400).json({
        codigo: "PEDIDO_INVALIDO",
        mensagem:
          "Dados da evidência incompletos."
      });
      return;
    }

    const before =
      corpo.before &&
      typeof corpo.before === "object"
        ? corpo.before
        : null;

    const after =
      corpo.after &&
      typeof corpo.after === "object"
        ? corpo.after
        : null;

    const action =
      corpo.action &&
      typeof corpo.action === "object"
        ? {
            functionName: String(
              corpo.action.functionName
            ),
            timestamp: String(
              corpo.action.timestamp
            ),
            transactionHash:
              typeof corpo.action.transactionHash ===
              "string"
                ? corpo.action.transactionHash
                : null,
            blockNumber:
              typeof corpo.action.blockNumber ===
              "number"
                ? corpo.action.blockNumber
                : null
          }
        : null;

    const beforeAnalysisId =
      before &&
      typeof before.analysisId === "string"
        ? before.analysisId
        : null;

    const afterAnalysisId =
      after &&
      typeof after.analysisId === "string"
        ? after.analysisId
        : null;

    await guardarExperimento(
      sessao.walletId,
      {
        caseId: corpo.id,
        title: corpo.titulo,
        description: corpo.descricao,
        walletAddress:
          sessao.wallet.toLowerCase(),
        contractAddress:
          typeof corpo.contract === "string"
            ? corpo.contract.toLowerCase()
            : null,
        network:
          typeof corpo.network === "string"
            ? corpo.network
            : null,
        state: corpo.estado,
        observation:
          typeof corpo.observacao === "string"
            ? corpo.observacao
            : "",
        beforeAnalysisId,
        afterAnalysisId,
        comparison: {
          before,
          after
        },
        action
      },
      corpo.diferencas ?? []
    );

    res.json({
      sucesso: true,
      id: corpo.id,
      beforeAnalysisId,
      afterAnalysisId
    });
  } catch (erro) {
    console.error(
      "Erro ao guardar experimento:",
      erro
    );

    res.status(500).json({
      codigo: "ERRO_EXPERIMENTO",
      mensagem:
        "Não foi possível guardar a evidência."
    });
  }
}
