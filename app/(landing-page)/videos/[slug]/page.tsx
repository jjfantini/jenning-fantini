import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { videos } from '../_data/videos';
import { Suspense } from 'react';
import VideoSkeleton from '../_components/VideoSkeleton';

interface VideoPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = videos.find((v) => v.slug === slug);
  
  if (!video) {
    return {
      title: 'Video Not Found',
      description: 'The requested video could not be found',
    };
  }
  
  return {
    title: video.title,
    description: video.description,
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = videos.find((v) => v.slug === slug);
  
  if (!video) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/videos" 
          className="inline-flex items-center mb-6 text-sm font-medium text-primary hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Video Gallery
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{video.title}</h1>
        
        <div className="text-sm text-muted-foreground mb-6">
          Published on {video.publishedAt}
        </div>
        
        <Suspense fallback={<VideoSkeleton />}>
          <div className="rounded-2xl overflow-hidden w-[85%] max-w-3xl mx-auto">
            <div className="aspect-video">
              <video
                className="w-full h-full object-cover"
                controls
                autoPlay={false}
              >
                <source
                  src={video.videoUrl}
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </Suspense>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">About this video</h2>
          <p className="text-lg">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
