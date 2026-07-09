interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 text-neutral-300" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
