import "dotenv/config";
import { criarApp } from "./aplicacao.js";
import { inicializarBanco } from "./infraestrutura/banco.js";

const porta = Number(process.env.PORT ?? 3001);

async function iniciar(): Promise<void> {
  try {
    await inicializarBanco();
    console.info("Banco PostgreSQL inicializado com sucesso.");

    criarApp().listen(porta, () => {
      console.info(`Backend iniciado na porta ${porta}`);
    });
  } catch (erro) {
    console.error("Falha ao inicializar o banco PostgreSQL:", erro);
    process.exit(1);
  }
}

void iniciar();
