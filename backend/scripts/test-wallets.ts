import "dotenv/config";
import { analisarCarteira } from "../src/servicos/nzochain.js";

import { randomBytes } from "crypto";

// Gera endereços EVM aleatórios
function gerarEnderecoAleatorio(): string {
  return "0x" + randomBytes(20).toString("hex");
}

const candidatos: string[] = [
  // mantenho alguns exemplos conhecidos para começar
  "0x1234567890123456789012345678901234567890",
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dEaD",
  "0x66f820a414680b5bcda5eeca5dea238543f42054",
];

async function run() {
  const encontrados: Record<string, any> = { baixo: null, alto: null };

  for (const wallet of candidatos) {
    if (encontrados.baixo && encontrados.alto) break;
    try {
      console.info(`Testando ${wallet} ...`);
      const resultado = await analisarCarteira({ wallet, network: "ethereum" });
      // segurança extra: remover qualquer chave que contenha 'key' ou 'auth' no detalhes
      if (resultado.detalhesTecnicos && typeof resultado.detalhesTecnicos === "object") {
        const dt = JSON.parse(JSON.stringify(resultado.detalhesTecnicos));
        function cleanse(obj) {
          if (obj === null || typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) return obj.map(cleanse);
          const out = {};
          for (const [k,v] of Object.entries(obj)) {
            if (k.toLowerCase().includes('key') || k.toLowerCase().includes('auth') || k.toLowerCase().includes('token')) continue;
            out[k] = cleanse(v);
          }
          return out;
        }
        resultado.detalhesTecnicos = cleanse(dt);
      }

      console.log(JSON.stringify({ wallet, nivel: resultado.nivel, titulo: resultado.titulo, explicacao: resultado.explicacao, razoes: resultado.razoes }, null, 2));

      if (!encontrados[resultado.nivel]) encontrados[resultado.nivel] = { wallet, resultado };
    } catch (err) {
      console.error(`Erro ao analisar ${wallet}:`, err.message ?? err);
    }
  }

  // se ainda não encontramos 'alto', tente gerar aleatórios até um limite
  let tentativas = 0;
  const LIMITE = 200;
  while (!encontrados.alto && tentativas < LIMITE) {
    const wallet = gerarEnderecoAleatorio();
    tentativas += 1;
    try {
      console.info(`(aleatorio ${tentativas}) Testando ${wallet} ...`);
      const resultado = await analisarCarteira({ wallet, network: "ethereum" });

      if (resultado.detalhesTecnicos && typeof resultado.detalhesTecnicos === "object") {
        const dt = JSON.parse(JSON.stringify(resultado.detalhesTecnicos));
        function cleanse(obj) {
          if (obj === null || typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) return obj.map(cleanse);
          const out = {};
          for (const [k,v] of Object.entries(obj)) {
            if (k.toLowerCase().includes('key') || k.toLowerCase().includes('auth') || k.toLowerCase().includes('token')) continue;
            out[k] = cleanse(v);
          }
          return out;
        }
        resultado.detalhesTecnicos = cleanse(dt);
      }

      console.log(JSON.stringify({ wallet, nivel: resultado.nivel, titulo: resultado.titulo, explicacao: resultado.explicacao, razoes: resultado.razoes }, null, 2));

      if (!encontrados[resultado.nivel]) encontrados[resultado.nivel] = { wallet, resultado };
    } catch (err) {
      console.error(`Erro ao analisar ${wallet}:`, err.message ?? err);
    }
    // pequeno atraso para evitar throttling
    await new Promise((r) => setTimeout(r, 150));
  }

  console.info('Resultados encontrados:');
  console.info(JSON.stringify({ baixo: encontrados.baixo ? { wallet: encontrados.baixo.wallet, nivel: encontrados.baixo.resultado.nivel } : null, alto: encontrados.alto ? { wallet: encontrados.alto.wallet, nivel: encontrados.alto.resultado.nivel } : null }, null, 2));
}

run().catch((e) => { console.error(e); process.exit(1); });
