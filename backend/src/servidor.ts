import "dotenv/config";
import { criarApp } from "./aplicacao.js";

const porta = Number(process.env.PORT ?? 3001);

criarApp().listen(porta, () => {
  console.info(`Backend iniciado na porta ${porta}`);
});
