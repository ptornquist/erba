import { describe, expect, it } from "vitest";
import { answersMatch, normalizeAnswer, stripAccents } from "./normalize";

describe("stripAccents", () => {
  it("removes combining marks after NFD", () => {
    expect(stripAccents("Comăneci")).toBe("Comaneci");
    expect(stripAccents("Pelé")).toBe("Pele");
    expect(stripAccents("Señor")).toBe("Senor");
  });
});

describe("normalizeAnswer", () => {
  it("is case-insensitive and strips punctuation", () => {
    expect(normalizeAnswer("Miracle on Ice!")).toBe("miracle ice");
  });

  it("folds accents before comparison", () => {
    expect(normalizeAnswer("Nadia Comăneci")).toBe("nadia comaneci");
    expect(normalizeAnswer("PELÉ")).toBe("pele");
  });
});

describe("answersMatch", () => {
  const comaneci = ["nadia comaneci", "perfect 10", "comaneci montreal"];
  const pele = ["pele 1958", "pele sweden", "brazil 1958"];
  const owens = ["jesse owens", "owens berlin"];

  it("matches accented guesses to ASCII aliases", () => {
    expect(answersMatch("Nadia Comăneci", comaneci)).toBe(true);
    expect(answersMatch("Pelé", pele)).toBe(true);
  });

  it("matches case-insensitive full names", () => {
    expect(answersMatch("JESSE OWENS", owens)).toBe(true);
  });

  it("rejects a different event", () => {
    expect(answersMatch("Miracle on Ice", comaneci)).toBe(false);
  });

  it("rejects tiny fragments", () => {
    expect(answersMatch("on", owens)).toBe(false);
  });
});
