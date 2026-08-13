# NZOChain Wallet Risk Scanner

Este projecto usa a API pública da NZOChain através de um backend que protege a API Key, e de uma interface simples que apresenta ao utilizador final uma conclusão clara em segundos.

Principais pontos 
- A aplicação suporta as redes: Ethereum, BNB Chain, Polygon e Arbitrum.
- O utilizador introduz um endereço de wallet e escolhe a rede; o frontend envia um pedido ao backend (`POST /api/scan`).
- O backend chama a NZOChain com a API Key guardada em `backend/.env` e sem Expor ao browser.
- O resultado apresenta apenas dois estados simples : "Baixo risco" ou "Alto risco", acompanhados de uma explicação curta sobre o porquê.

Design de interface e regra de usabilidade
- A conclusão ("Baixo risco" / "Alto risco") é sempre o elemento mais visível e legível.
- A explicação usa linguagem não técnica e indica por que a carteira foi considerada de risco (ex.: listada, sinalizações atípicas, atividade suspeita). Exemplos e detalhes técnicos ficam disponíveis apenas como informação adicional.

Segurança da API
Como anteriormente descrito.
- A chave `NZOCHAIN_API_KEY` esta em `backend/.env` e NÃO deve ser comitada.
- O backend adiciona a chave ao cabeçalho `X-API-Key` quando contacta a NZOChain.
- Antes de devolver os detalhes técnicos ao frontend, o backend sanitiza a resposta, removendo campos sensíveis (tokens, auth, apikey, credentials) para evitar exposições.

Instalação e execução
1. Instalar dependências (na raiz do workspace):

```bash
npm install
```

2. Criar `backend/.env` com a sua API Key (obtida em developers.nzochain.com):

```env
NZOCHAIN_API_KEY=pk_live_...
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Endpoint principal: `POST /api/scan`

Exemplo de pedido (JSON):

```json
{ "wallet": "0x...", "network": "ethereum" }
```

Resposta (exemplo resumido):

```json
{
	"nivel": "alto", // ou "baixo"
	"titulo": "Alto risco",
	"explicacao": "Foram encontrados sinais que sugerem risco. Evite interagir sem verificação adicional.",
	"razoes": [ { "titulo": "Carteira listada...", "descricao": "..." } ]
}
```

Testes

```bash
cd backend
npm test
```

Notas sobre testes manuais
- Teste com pelo menos duas wallets diferentes para mostrar ambos os resultados (um caso claramente limpo e um com sinais de alerta).
- Sem uma API Key real, o backend não conseguirá contactar a NZOChain.

Decisões de UX (parágrafo curto para entrega)
Escolhi apresentar apenas dois estados (baixo/alto) porque é a forma mais direta de comunicar segurança a um utilizador sem conhecimento técnico: o rótulo grande e a explicação curta permitem entender em cinco segundos se é seguro prosseguir. Os detalhes técnicos e razões aparecem apenas como suporte para quem quiser investigar mais.

Privacidade e segurança técnica
- A API Key é sempre mantida no servidor. O frontend nunca vê a chave.
- O backend sanitiza respostas antes de as devolver, removendo campos sensíveis.

Dificuldades 
-Estou com dificuldades de encontrar uma Wallet de alto risco.# Carteira-segura
# Carteira-segura
