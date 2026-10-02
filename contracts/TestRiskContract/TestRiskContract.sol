// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TestRiskContract
 *
 * Contrato controlado para o experimento E2E da Carteira Segura.
 *
 * IMPORTANTE:
 * - Não possui função de saque.
 * - Não possui lógica de drainer.
 * - Não movimenta fundos de terceiros.
 * - Não recebe ETH.
 * - As operações existem exclusivamente para gerar
 *   estados e eventos verificáveis na blockchain.
 */
contract TestRiskContract {
    address public immutable owner;

    address public immutable testToken;

    mapping(address => uint256) public interactionCount;

    event NormalAction(
        address indexed user,
        uint256 timestamp,
        uint256 interactionNumber
    );

    event SuspiciousAction(
        address indexed user,
        uint256 timestamp,
        bytes32 indexed marker
    );

    event HighImpactSimulation(
        address indexed user,
        uint256 timestamp,
        uint256 simulationLevel
    );

    event ApprovalObserved(
        address indexed user,
        address indexed token,
        address indexed spender,
        uint256 amount,
        uint256 timestamp
    );

    event ApprovalRevoked(
        address indexed user,
        address indexed token,
        address indexed spender,
        uint256 timestamp
    );

    constructor(address token) {
        owner = msg.sender;
        testToken = token;
    }

    /**
     * Interação normal.
     */
    function normalAction() external {
        interactionCount[msg.sender] += 1;

        emit NormalAction(
            msg.sender,
            block.timestamp,
            interactionCount[msg.sender]
        );
    }

    /**
     * Marcador explícito de interação suspeita.
     *
     * Nenhum fundo é movimentado.
     */
    function suspiciousAction() external {
        interactionCount[msg.sender] += 1;

        emit SuspiciousAction(
            msg.sender,
            block.timestamp,
            keccak256(
                "CARTEIRA_SEGURA_SUSPICIOUS_TEST"
            )
        );
    }

    /**
     * Simulação de operação de alto impacto.
     *
     * Nenhum fundo é movimentado.
     */
    function highImpactSimulation() external {
        interactionCount[msg.sender] += 1;

        emit HighImpactSimulation(
            msg.sender,
            block.timestamp,
            100
        );
    }

    /**
     * Regista no contrato que o utilizador observou
     * uma aprovação do token de teste.
     *
     * A aprovação real é criada diretamente no ERC-20
     * através de approve(TestRiskContract, amount).
     *
     * Esta função NÃO executa transferFrom.
     */
    function recordApprovalObservation(
        uint256 amount
    ) external {
        emit ApprovalObserved(
            msg.sender,
            testToken,
            address(this),
            amount,
            block.timestamp
        );
    }

    /**
     * Regista a remoção da aprovação.
     *
     * A revogação real é feita no ERC-20 através de:
     *
     * approve(TestRiskContract, 0)
     */
    function recordApprovalRevoked() external {
        emit ApprovalRevoked(
            msg.sender,
            testToken,
            address(this),
            block.timestamp
        );
    }

    function getUserState(
        address user
    )
        external
        view
        returns (
            uint256 interactions,
            uint256 tokenAllowance
        )
    {
        uint256 allowanceValue = 0;

        if (testToken != address(0)) {
            allowanceValue = _allowance(
                testToken,
                user,
                address(this)
            );
        }

        return (
            interactionCount[user],
            allowanceValue
        );
    }

    function _allowance(
        address token,
        address tokenOwner,
        address spender
    ) private view returns (uint256 value) {
        (bool success, bytes memory data) =
            token.staticcall(
                abi.encodeWithSignature(
                    "allowance(address,address)",
                    tokenOwner,
                    spender
                )
            );

        if (!success || data.length < 32) {
            return 0;
        }

        value = abi.decode(data, (uint256));
    }
}
