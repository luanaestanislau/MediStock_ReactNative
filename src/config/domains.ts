export const institutionalDomains = {
  "fiap.com.br": "FIAP",
  "hc.unicamp.br": "Hospital das Clínicas — Unicamp",
  "hc.usp.br": "Hospital das Clínicas — USP",
  "einstein.br": "Hospital Albert Einstein",
  "hospital.gov.br": "Hospital Federal",
  "saude.sp.gov.br": "Secretaria de Saúde — SP",
} as const;

export type InstitutionalDomain = keyof typeof institutionalDomains;

export function resolveDomain(
  email: string,
): { valid: boolean; label: string | null } | null {
  const value = email.trim().toLowerCase();
  if (!value.includes("@")) return null;
  const suffix = value.split("@").pop() ?? "";
  const label = (institutionalDomains as Record<string, string>)[suffix];
  return label ? { valid: true, label } : { valid: false, label: null };
}
