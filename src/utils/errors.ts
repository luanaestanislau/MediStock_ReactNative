interface ApiErrorLike {
  code?: string;
  response?: {
    status?: number;
    data?: {
      campos?: Record<string, string>;
      mensagem?: string;
      message?: string;
    };
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  apiUrl?: string,
): string {
  const err = (error ?? {}) as ApiErrorLike;
  const data = err.response?.data;

  if (data?.campos) return Object.values(data.campos).join("\n");
  if (data?.mensagem || data?.message)
    return (data.mensagem ?? data.message) as string;

  if (err.code === "ECONNABORTED") {
    return "A API demorou demais para responder. Tente novamente em instantes.";
  }
  if (err.code === "ERR_NETWORK" || !err.response) {
    const where = apiUrl ? ` em ${apiUrl}` : "";
    return `Não foi possível conectar à API${where}. Confirme que o backend está em execução e que o celular está na mesma rede Wi-Fi.`;
  }
  return fallback;
}
