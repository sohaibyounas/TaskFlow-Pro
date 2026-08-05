export function TaskCardSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="h-5 w-6 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="rounded-lg border bg-white p-3 shadow-sm animate-pulse">
        <div className="h-4 w-4/5 rounded bg-gray-200" />

        <div className="mt-2 h-3 w-3/5 rounded bg-gray-100" />

        <div className="mt-3 flex items-center">
          <div className="h-5 w-16 rounded-md bg-gray-200" />
        </div>
      </div>
    </>
  );
}
