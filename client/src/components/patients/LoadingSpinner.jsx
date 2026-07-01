export default function LoadingSpinner({ label = "Carregando..." }) {
  return (
    <div
      data-testid="loading-spinner"
      className="flex flex-col items-center justify-center py-16 min-h-[240px]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="w-10 h-10 border-4 border-surgical-blue/20 border-t-surgical-blue rounded-full animate-spin" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
    </div>
  );
}
