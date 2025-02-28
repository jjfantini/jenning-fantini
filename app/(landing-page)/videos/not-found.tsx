import Link from 'next/link';

export default function VideoNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-5xl font-bold mb-6 text-center">Video Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-xl">
        Sorry, we couldn&apos;t find the video you&apos;re looking for. It may have been removed or the URL might be incorrect.
      </p>
      <Link 
        href="/videos" 
        className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Return to Video Gallery
      </Link>
    </div>
  );
} 