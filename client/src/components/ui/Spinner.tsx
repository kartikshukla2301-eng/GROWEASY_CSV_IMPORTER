interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        "inline-block rounded-full border-2 border-neutral-200 border-t-accent-600 animate-spin",
        sizeClasses[size],
        className,
      ].join(" ")}
    />
  );
}
