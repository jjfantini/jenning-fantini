import { Icons } from "@/components/ui/icons";
import { HomeIcon, FolderIcon, BookOpenIcon, GlobeIcon, CodeIcon, DatabaseIcon } from "lucide-react";

export const DATA = {
  name: "Jennings Fantini",
  initials: "JF",
  url: "https://jenningsfantini.me",
  location: "New York, NY",
  locationLink: "https://www.google.com/maps/place/newyork",
  about: "Software Engineer turned Entrepreneur. I love building things and helping people. Very active on Twitter.",
  description:
    "Software Engineer turned Entrepreneur. I love building things and helping people. Very active on Twitter.",
  summary:
    "At the end of 2022, I quit my job as a software engineer to go fulltime into building and scaling my own SaaS businesses. In the past, [I pursued a double degree in computer science and business](/#education), [interned at big tech companies in Silicon Valley](https://www.youtube.com/watch?v=d-LJ2e5qKdE), and [competed in over 21 hackathons for fun](/#hackathons). I also had the pleasure of being a part of the first ever in-person cohort of buildspace called [buildspace sf1](https://buildspace.so/sf1).",
  avatarUrl: "/me.png",
  skills: [
    "React",
    "Next.js",
    "Typescript",
    "Node.js",
    "Python",
    "Go",
    "Postgres",
    "Docker",
    "Kubernetes",
    "Java",
    "R",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/projects", icon: FolderIcon, label: "Projects" },
    { href: "/blog", icon: BookOpenIcon, label: "Blog" },
  ],
  contact: {
    email: "hello@example.com",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/jjfantini",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/jennings-f-910195aa/",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/fractalFinance_",
        icon: Icons.x,

        navbar: true,
      },
      // Youtube: {
      //   name: "Youtube",
      //   url: "https://dub.sh/dillion-youtube",
      //   icon: Icons.youtube,
      //   navbar: true,
      // },
      Email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "humblFINANCE",
      href: "https://humblfinance.io",
      badges: [],
      location: "Remote",
      title: "Founder & CEO",
      logoUrl: "/atomic.png",
      start: "Oct 2022",
      end: "Present",
      description:
        "Built a comprehensive financial platform offering multiple tools and services through a modular architecture. Features include humblCHANNEL (financial content/education), humblPORTFOLIO (portfolio management), and humblCOMPASS (financial guidance/analytics).",
    },
  ],
  education: [
    {
      school: "Santa Clara University",
      href: "https://scu.edu",
      degree: "Bachelor's Degree of Molecular Biology",
      logoUrl: "/scu.png",
      start: "2016",
      end: "2020",
    },
    {
      school: "Northfield Mount Hermon",
      href: "https://www.nmhschool.org",
      degree: "High School Diploma",
      logoUrl: "/northfield.png",
      start: "2013",
      end: "2016",
    },
    {
      school: "Solihull School",
      href: "https://www.solsch.org.uk",
      degree: "High School Diploma",
      logoUrl: "/solihull.png",
      start: "2008",
      end: "2013",
    },
  ],
  projects: [
    {
      title: "humblFINANCE",
      icon: <GlobeIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://humblfinance.io",
      dates: "Oct 2022 - Present",
      active: true,
      private: true,
      description:
        "A modern, comprehensive financial platform offering multiple tools and services through a modular architecture. Features include humblCHANNEL (financial content/education), humblPORTFOLIO (portfolio management), and humblCOMPASS (financial guidance/analytics).",
      technologies: [
        "Next.js",
        "TypeScript", 
        "Supabase",
        "Tailwind CSS",
        "Shadcn UI",
        "React Query",
        "React Hook Form",
        "Zod",
        "Stripe",
        "Nodemailer"
      ],
      links: [
        {
          type: "Website",
          href: "https://humblfinance.io",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/chat-collect.mp4",
    },
    {
      title: "humblDATA",
      icon: <CodeIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://humblfinance.github.io/humblDATA/",
      dates: "March 2024 - Present",
      active: true,
      private: false,
      description:
        "Built a Python library that connects humblFINANCE to financial data sources and provides institutional-grade analysis tools. Features include Mandelbrot price channels and high-performance volatility estimators powered by Rust.",
      technologies: [
        "Python",
        "Poetry",
        "Rust",
        "Ruff",
        "pre-commit",
        "GitHub Actions",
        "semantic-release",
        "Polars",
        "NumPy",
        "Custom Built Algorithms"
      ],
      links: [
        {
          type: "Source", 
          href: "https://github.com/humblfinance/humbldata",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: "",
    },
    {
      title: "humblAPI",
      icon: <DatabaseIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://github.com/humblfinance/humblapi",
      dates: "March 2024 - Present", 
      active: true,
      private: false,
      description:
        "Built a FastAPI-based backend service for the humblFINANCE web app, providing API endpoints and data processing capabilities to support financial operations.",
      technologies: [
        "Python",
        "FastAPI",
        "SQLModel",
        "Alembic",
        "Poetry",
        "Docker",
        "PostgreSQL"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/humblfinance/humblapi",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: "https://cdn.llm.report/openai-demo.mp4",
    },
    {
      title: "Python Package Template",
      icon: <CodeIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://github.com/humblFINANCE/cookiecutter-python",
      dates: "March 2024 - Present",
      active: true,
      private: false,
      description: 
        "Created a modern Cookiecutter template for scaffolding Python packages and apps with features like Dev Containers, Poetry dependency management, Micromamba environments, and automated CI/CD pipelines.",
      technologies: [
        "Python",
        "Poetry", 
        "Docker",
        "GitHub Actions",
        "Micromamba",
        "Ruff",
        "Mypy",
        "pre-commit",
        "Cookiecutter"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/humblFINANCE/cookiecutter-python",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: ""
    },
    {
      title: "Social AI Bot",
      icon: <CodeIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://github.com/humblFINANCE/social-orghi",
      dates: "March 2024 - Present",
      active: true,
      private: true,
      description: 
        "Built an AI agent framework to manage social media accounts autonomously. Features AI-powered content management, local Supabase PostgreSQL database, and standardized development practices.",
      technologies: [
        "Python 3.12",
        "Pydantic-AI",
        "FastAPI",
        "Supabase",
        "PostgreSQL",
        "Poetry",
        "Docker",
        "Commitizen",
        "AI Agents",
        "OpenAI",
        "Anthropic",
        "Google AI"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/humblFINANCE/social-orghi",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: ""
    },
    {
      title: "OpenBB ORATS Extension",
      icon: <DatabaseIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://github.com/jjfantini/openbb-orats",
      dates: "March 2024 - Present",
      active: true,
      private: false,
      description: 
        "Built a specialized extension for the OpenBB Platform that integrates options data and analytics from ORATS. Features include options data retrieval (pricing, Greeks, implied volatility), advanced analytics, and historical data access with customizable queries.",
      technologies: [
        "Python",
        "Poetry",
        "FastAPI",
        "Pydantic",
        "SQLModel",
        "OpenBB SDK",
        "ORATS API",
        "Options Analytics",
        "GitHub Actions",
        "pre-commit"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/humblFINANCE/openbb-orats",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: ""
    },
    {
      title: "AutobookAPI",
      icon: <DatabaseIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://github.com/jenningsfantini/autobookapi",
      dates: "March 2024 - Present", 
      active: true,
      private: false,
      description:
        "Built a FastAPI-based backend service for automated bookkeeping and financial data processing. Features include RESTful API endpoints, asynchronous operations, and configurable multi-environment support.",
      technologies: [
        "Python 3.12",
        "FastAPI",
        "SQLModel",
        "Alembic",
        "Poetry",
        "Docker",
        "PostgreSQL"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/jenningsfantini/autobookapi",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: ""
    },
    {
      title: "Autobook",
      icon: <GlobeIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://autobook.finance",
      dates: "March 2024 - Present",
      active: true,
      private: true,
      description:
        "Built an automated bookkeeping SaaS platform that streamlines financial record-keeping for small businesses. Features include automated transaction categorization, real-time financial insights, and seamless integration with major accounting software.",
      technologies: [
        "Next.js",
        "TypeScript",
        "Supabase",
        "Tailwind CSS",
        "Shadcn UI",
        "React Query",
        "React Hook Form",
        "Zod",
        "Stripe",
        "tRPC"
      ],
      links: [
        {
          type: "Website",
          href: "https://autobook.finance",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "",
      video: ""
    },
    {
      title: "Splashcap",
      icon: <GlobeIcon className="h-4 w-4 text-black dark:text-neutral-400" />,
      href: "https://splashcap.us",
      dates: "March 2024 - Present",
      active: true,
      private: false,
      description:
        "Built a landing page for a patented pre-loaded dynamically mixing beverage vessel. Features include product showcase, interactive demonstrations, and a contact form for bespoke orders. The site highlights the world's first portable splashing vessel innovation.",
      technologies: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
        "React Hook Form",
        "Video Integration",
        "Responsive Design",
        "SEO Optimization"
      ],
      links: [
        {
          type: "Website",
          href: "https://splashcap.us",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "",
      video: ""
    },
  ],
  hackathons: [],
} as const;
