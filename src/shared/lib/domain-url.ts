import type { Domain } from "../../entities/chart/model/types";

export const parseDomain = (value: string | null): Domain | null => {
  if (!value) return null;

  const parts = value.split(",").map(Number);
  if (parts.length !== 2) return null;
  if (parts.some((n) => Number.isNaN(n))) return null;

  return [parts[0], parts[1]];
};

export const serializeDomain = (domain: Domain) =>
  domain.map((n) => Number(n.toFixed(3))).join(",");
