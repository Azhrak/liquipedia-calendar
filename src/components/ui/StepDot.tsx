type Props = {
  n: number | string;
  label: string;
  labelSize?: "sm" | "md" | "lg";
  active?: boolean;
};

export function StepDot({ n, label, labelSize = "sm", active = false }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
          active
            ? "bg-accent text-ink-950"
            : "bg-ink-800 text-ink-500 border border-ink-700",
        ].join(" ")}
      >
        {n}
      </div>
      <span
        className={[
          "text-xs font-medium",
          active ? "text-white" : "text-ink-500",
          labelSize === "md"
            ? "text-sm"
            : labelSize === "lg"
              ? "text-lg"
              : "text-xs",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}
