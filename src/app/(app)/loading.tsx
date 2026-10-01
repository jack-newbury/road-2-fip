export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy aria-label="Loading">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-md bg-line/80" />
        <div className="h-4 w-full max-w-md rounded-md bg-line/50" />
      </div>
      <div className="h-36 rounded-xl border border-line bg-surface/60" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl border border-line bg-surface/60" />
        <div className="h-28 rounded-xl border border-line bg-surface/60" />
      </div>
      <div className="h-48 rounded-xl border border-line bg-surface/60" />
    </div>
  );
}
