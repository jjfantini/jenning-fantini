export interface VideoItem {
  id: string;
  title: string;
  description: string;
  slug: string;
  videoUrl: string;
  publishedAt: string;
  thumbnail: string;
}

// Sample video data - you would typically fetch this from an API or CMS
export const videos: VideoItem[] = [
  {
    id: '1',
    title: '🐎 Bronco Ventures Elevator Pitch',
    description: 'A quick 2 minute pitch for Bronco Ventures',
    slug: 'bronco-ventures-elevator-pitch',
    videoUrl: 'https://w34cwnffm5.ufs.sh/f/5USAzeJ8AgH4J35xfxsdC6blN4H3vywZEpOsnc9jg8Xxaqhi',
    publishedAt: 'February 28, 2025',
    thumbnail: 'https://2zzhd7n3m2.ufs.sh/f/Ev0wIwMYTjZfGhcR2B6St2I0LRFoOC1bTXqizsVMQw8flP6U',
  },
]; 