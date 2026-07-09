interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-neutral-200 bg-white shadow-card",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={["px-6 py-4 border-b border-neutral-200", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={["px-6 py-4", className].join(" ")}>{children}</div>;
}
