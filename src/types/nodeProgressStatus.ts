export type NodeProgressStatus =
  | "ожидает"
  | "в процессе"
  | "завершено"
  | "пропущено";

export const progressMeta: Record<
  NodeProgressStatus,
  {
    label: string;
    chipColor: "default" | "primary" | "success" | "warning";
    glow: string;
  }
> = {
  ожидает: {
    label: "Ожидает",
    chipColor: "default",
    glow: "rgba(255,255,255,0.10)",
  },
  "в процессе": {
    label: "В процессе",
    chipColor: "primary",
    glow: "rgba(126,87,255,0.35)",
  },
  завершено: {
    label: "Завершено",
    chipColor: "success",
    glow: "rgba(0,200,120,0.35)",
  },
  пропущено: {
    label: "Пропущено",
    chipColor: "warning",
    glow: "rgba(255,180,0,0.35)",
  },
};
