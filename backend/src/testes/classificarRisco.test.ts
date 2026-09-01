import { describe, expect, it } from "vitest";
import { classificarRisco } from "../servicos/classificarRisco.js";

describe("classificacao de risco", () => {
  it("classifica como risco quando há indicadores maliciosos", () => {
    const resultado = classificarRisco({ risk_level: "high", malicious: true });

    expect(resultado.nivel).toBe("alto");
    expect(resultado.titulo.toLowerCase()).toContain("alto")
    expect(resultado.razoes.length).toBeGreaterThan(0);
  });

  it("classifica como segura quando o score é baixo", () => {
    expect(classificarRisco({ risk_score: 20 }).nivel).toBe("baixo");
    expect(classificarRisco({ risk_score: 10 }).nivel).toBe("baixo");
  });

  it("classifica como atencao quando o score é moderado", () => {
    expect(classificarRisco({ risk_score: 35 }).nivel).toBe("atencao");
    expect(classificarRisco({ risk_score: 45 }).nivel).toBe("atencao");
  });

  it("classifica como risco quando o score é elevado", () => {
    expect(classificarRisco({ risk_score: 60 }).nivel).toBe("alto");
    expect(classificarRisco({ risk_score: 80 }).nivel).toBe("alto");
  });
});
