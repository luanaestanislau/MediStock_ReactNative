import type { StatusLogistico } from "../types/ApiTypes";
import type { StatusLogisticoUi } from "../types/ui";

export interface StatusAction {
  label: string;
  to: StatusLogistico;
  destructive?: boolean;
}

export function nextStatusActions(status: StatusLogisticoUi): StatusAction[] {
  switch (status) {
    case "pendente":
      return [
        { label: "Iniciar rota", to: "EM_ROTA" },
        { label: "Cancelar", to: "CANCELADA", destructive: true },
      ];
    case "em_rota":
    case "atrasado":
      return [
        { label: "Concluir", to: "CONCLUIDA" },
        { label: "Cancelar", to: "CANCELADA", destructive: true },
      ];
    default:
      return [];
  }
}
