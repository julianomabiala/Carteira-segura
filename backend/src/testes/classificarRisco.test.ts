import { describe, expect, it } from "vitest";
import { classificarRisco } from "../servicos/classificarRisco.js";

describe("classificacao de risco", () => {
  it("classifica como alto risco quando há indicadores maliciosos", () => {
    const resultado = classificarRisco({
      risk_level: "high",
      malicious: true
    });

    expect(resultado.nivel).toBe("alto");
    expect(resultado.titulo.toLowerCase()).toContain("alto");
    expect(resultado.razoes.length).toBeGreaterThan(0);
  });

  it("classifica como baixo risco quando o score é baixo", () => {
    expect(
      classificarRisco({ risk_score: 20 }).nivel
    ).toBe("baixo");

    expect(
      classificarRisco({ risk_score: 10 }).nivel
    ).toBe("baixo");
  });

  it("classifica como atencao quando o score é moderado", () => {
    expect(
      classificarRisco({ risk_score: 35 }).nivel
    ).toBe("atencao");

    expect(
      classificarRisco({ risk_score: 45 }).nivel
    ).toBe("atencao");

    expect(
      classificarRisco({ risk_score: 60 }).nivel
    ).toBe("atencao");
  });

  it("classifica como alto risco quando o score é elevado", () => {
    expect(
      classificarRisco({ risk_score: 61 }).nivel
    ).toBe("alto");

    expect(
      classificarRisco({ risk_score: 80 }).nivel
    ).toBe("alto");
  });

  it("classifica score crítico", () => {
    expect(
      classificarRisco({ risk_score: 86 }).nivel
    ).toBe("critico");

    expect(
      classificarRisco({ risk_score: 100 }).nivel
    ).toBe("critico");
  });

  it("classifica status low como baixo risco", () => {
    expect(
      classificarRisco({
        risk_level: "low",
        malicious: false
      }).nivel
    ).toBe("baixo");
  });

  it("reconhece a estrutura real da NZOChain", () => {
    const resultado = classificarRisco({
      success: true,
      data: {
        riskScore: 0,
        riskLevel: "SAFE",
        decision: "ALLOW",
        reasons: [
          "Nenhuma ameaça material detectada nesta carteira."
        ]
      }
    });

    expect(resultado.nivel).toBe("baixo");
    expect(resultado.razoes.length).toBeGreaterThan(0);
  });

  it("preserva a classificacao recebida pela NZOChain", () => {
    const resultado = classificarRisco({
      riskScore: 30,
      riskLevel: "HIGH",
      decision: "BLOCK"
    });

    expect(resultado.nivel).toBe("alto");
  });

  it("classifica dados vazios como inconclusivos", () => {
    const resultado = classificarRisco({});

    expect(resultado.nivel).toBe("inconclusivo");
    expect(resultado.titulo).toBe("Análise inconclusiva");
  });

  it("nao assume baixo risco quando os dados sao desconhecidos", () => {
    expect(
      classificarRisco({
        dados: "sem estrutura de risco conhecida"
      }).nivel
    ).toBe("inconclusivo");
  });

  it("prioriza indicador malicioso sobre score moderado", () => {
    expect(
      classificarRisco({
        risk_score: 35,
        malicious: true
      }).nivel
    ).toBe("alto");
  });
});
