export default function VideoSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-300 dark:bg-gray-700 w-[85%] max-w-3xl mx-auto overflow-hidden">
      <div className="animate-pulse aspect-video" />
    </div>
  );
}
