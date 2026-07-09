interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, label, className = "" }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={className} role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs text-neutral-500">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-accent-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
