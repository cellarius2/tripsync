interface EmptyStateProps {
  icon?: string;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "✈️",
  title,
  text,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-burgundy-50 text-3xl">
        {icon}
      </div>

      <h3 className="font-display text-2xl font-semibold text-navy-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-navy-700">{text}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-burgundy-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}