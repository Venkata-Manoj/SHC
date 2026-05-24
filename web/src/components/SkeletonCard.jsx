export default function SkeletonCard() {
  return (
    <div className="glass rounded-xl overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-40 bg-elevated" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-elevated rounded w-3/4" />
        <div className="h-3 bg-elevated rounded w-1/2" />
        <div className="h-3 bg-elevated rounded w-full" />
        <div className="h-3 bg-elevated rounded w-2/3" />
      </div>
    </div>
  );
}
