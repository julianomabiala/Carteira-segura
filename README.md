# NZOChain E2E Security Experiment

DApp para analisar wallets e contratos via NZOChain, autenticar por SIWE e registar execuções/auditorias. O contrato de laboratório é controlado: emite eventos e altera apenas estado próprio de teste, sem função de saque nem transferência de fundos de terceiros. O token CSTT não tem valor económico.

A chave NZOChain fica exclusivamente no backend. A aplicação não pede nem guarda chaves privadas ou seed phrases.

## Fluxo E2E

1. Conectar uma wallet e autenticar a sessão por SIWE.
2. Analisar wallet ou contrato numa rede suportada pela NZOChain.
3. Guardar timestamp, endpoint, status HTTP, Analysis ID, classificação e resposta recebida.
4. Executar uma ação de teste apenas quando existir deployment aprovado numa rede suportada; também é possível executar somente análise.
5. Atualizar a análise, comparar os snapshots e registar hash/bloco, se houver transação.
6. Consultar o histórico e exportar evidências JSON.

## Requisitos e execução

- Node.js 20+, npm e PostgreSQL.
- Chave de API NZOChain e Project ID Reown configurados localmente.
- Uma wallet descartável financiada apenas com ativos de teste na rede aprovada pela NZOChain.

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Definir `NZOCHAIN_API_KEY` e `DATABASE_URL` em `backend/.env`, além de `VITE_REOWN_PROJECT_ID` em `frontend/.env`. Nunca colocar a chave NZOChain numa variável `VITE_*`.

```bash
docker compose -f database/docker-compose.yml up -d
npm run check
npm test
npm run build
npm run dev
```

Abrir `http://localhost:5173`; o backend inicia em `http://localhost:3001`. O PostgreSQL aplica a migration na primeira criação do volume.

## Rede e deployment

A lista de redes do DApp corresponde às redes reconhecidas atualmente pelo produto: Ethereum, BNB Chain, Polygon e Arbitrum. A rede de teste configurada anteriormente não é analisada pela NZOChain, por isso foi removida e não há deployment de contrato de teste ligado ao frontend.

As análises nessas redes só consultam dados. Os endereços de contrato de teste permanecem vazios, impedindo ações on-chain acidentais em redes com ativos reais. Não executar transações de teste em mainnet.

Para habilitar o laboratório E2E, a equipa NZOChain precisa indicar uma testnet que suporte, o identificador exato da rede aceito pela API e um RPC/explorer compatível. Depois disso, a equipa do projeto pode configurar a chain no wallet connector, fazer um novo deployment do token/contrato nessa rede, adicionar os endereços e validar scans de wallet/contrato antes e depois das ações. O script `scripts/deployTestnet.mjs` pode ser usado com RPC e chave de deployer de teste fornecidos fora do repositório; nunca usar uma carteira com fundos reais.

## Casos e evidências

Os casos TC-01 a TC-10 continuam listados no laboratório. W1/W2/W3/W4 devem ser carteiras descartáveis escolhidas pela equipa; o sistema não guarda nem distribui chaves. TC-03 é uma análise sem transação para manter a treasury inativa. TC-06/TC-07 exigem criação e revogação de approval na mesma wallet e só devem ser executados após existir deployment numa testnet aprovada.

Cada execução conserva a resposta da API, os snapshots antes/depois, a wallet pública, timestamp, endpoint/status HTTP e os dados da transação quando houver. O botão **Exportar JSON** descarrega `nzochain-evidencias.json`. Screenshots, respostas e hashes de demonstração devem vir de uma execução real e ser guardados em `evidence/screenshots/`, `evidence/api-responses/` e `evidence/tx-hashes/`.

Roteiro de vídeo: contexto; conectar W3; análise inicial; interação controlada; dashboard; refresh/comparação; hash on-chain e resposta da API. Gravar apenas depois de a NZOChain confirmar a rede de teste suportada.

## Segurança

- `TestRiskContract` não recebe ETH nem movimenta fundos de terceiros.
- `TestRiskToken` é apenas um ERC-20 de laboratório.
- Cada transação deve ser assinada numa wallet descartável e numa testnet aprovada.
- `.env`, `.segredo/` e chaves privadas não devem ser commitados.