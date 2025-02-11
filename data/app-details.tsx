export const DATA = {
  name: "Jennings Fantini",
  title: "Jennings Fantini",
  description: "A Portfolio for Jennings Fantini, showcasing who is is and what he likes to build.",
  url: "https://jenningsfantini.com",
  // SEO & Metadata
  seo: {
    title: {
      default: "Jennings Fantini",
      template: "%s | Jennings Fantini"
    },
    description: "A modern, performant portfolio showcasing Next.js 15, TypeScript, and animation expertise.",
    keywords: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Portfolio",
      "Web Development"
    ],
    openGraph: {
      title: "Jennings Fantini",
      description: "A modern, performant portfolio showcasing Next.js 15, TypeScript, and animation expertise.",
      type: "website",
      locale: "en_US",
      url: "https://jenningsfantini.com",
      siteName: "Jennings Fantini",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Modern Portfolio Open Graph Image"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      site: "@yourusername", // Replace with your Twitter handle
      creator: "@yourusername"
    }
  },

  // Technical Details
  tech: {
    framework: "Next.js 15.1.3",
    language: "TypeScript 5",
    styling: "Tailwind CSS",
    animation: "Framer Motion",
    deployment: "Vercel",
    features: [
      "Server Components",
      "App Router",
      "Turbopack",
      "Dark Mode",
      "Responsive Design",
      "Performance Analytics"
    ]
  },

  // Navigation
  nav: {
    links: [
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: "Blog", path: "/blog" }
    ]
  }
} as const;
