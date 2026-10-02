// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TestRiskToken
 *
 * ERC-20 exclusivamente para o laboratório E2E da Carteira Segura.
 *
 * Este token não representa qualquer ativo real.
 * Não possui valor económico e existe apenas para testar:
 *
 * Wallet -> approve -> contract -> revoke
 *
 * Não existe função de saque, resgate ou conversão para
 * qualquer ativo de valor.
 */
contract TestRiskToken {
    string public constant name = "Carteira Segura Test Token";
    string public constant symbol = "CSTT";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;

        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(
        address to,
        uint256 value
    ) external returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);

        return true;
    }

    function approve(
        address spender,
        uint256 value
    ) external returns (bool) {
        require(spender != address(0), "Invalid spender");

        allowance[msg.sender][spender] = value;

        emit Approval(
            msg.sender,
            spender,
            value
        );

        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(
            allowance[from][msg.sender] >= value,
            "Insufficient allowance"
        );

        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;

        emit Transfer(from, to, value);

        return true;
    }
}
