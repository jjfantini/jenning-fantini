import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { videos } from './_data/videos';

export const metadata: Metadata = {
  title: 'Video Gallery',
  description: 'Explore our collection of videos',
};

export default function VideosPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Video Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <Link 
            href={`/videos/${video.slug}`} 
            key={video.id}
            className="group bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="aspect-video relative">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2">{video.title}</h2>
              <p className="text-muted-foreground">{video.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 