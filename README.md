# NZOChain Wallet Risk Scanner

Aplicação web para conexão de carteiras blockchain e análise de risco através da API pública da NZOChain.

O utilizador pode criar uma conta, conectar uma wallet compatível através do Reown/WalletConnect e analisar o endereço público da carteira em redes suportadas.

A aplicação não tem custódia de fundos e nunca solicita ou armazena private keys ou seed phrases.

## Fluxo da aplicação

1. O utilizador cria uma conta ou inicia sessão.
2. Acede ao dashboard.
3. Conecta uma wallet através do Reown/WalletConnect.
4. A aplicação obtém apenas o endereço público e a rede conectada.
5. A wallet é associada à conta do utilizador no Firebase/Firestore.
6. O utilizador solicita uma análise de risco.
7. O frontend envia o pedido para o backend.
8. O backend comunica com a API da NZOChain utilizando a API Key protegida.
9. O resultado é convertido numa conclusão simples:
   - 🟢 Baixo risco
   - 🔴 Alto risco
10. O resultado da análise é guardado no histórico do utilizador.

## Redes suportadas

- Ethereum
- BNB Chain
- Polygon
- Arbitrum

## Arquitetura

```text
Utilizador
    │
    ▼
React + Vite
    │
    ├── Firebase Authentication
    │
    ├── Reown / WalletConnect
    │
    └── Firestore
    │
    ▼
Express Backend
    │
    ▼
NZOChain Risk API