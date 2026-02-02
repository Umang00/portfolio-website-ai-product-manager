# Portfolio Website with AI Companion

> A modern, fast, and interactive portfolio website featuring an AI-powered companion that answers questions about my professional background, projects, and journey using RAG (Retrieval-Augmented Generation).

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### Portfolio Website

- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🌓 **Dark/Light Mode** - System preference detection with manual override
- ⚡ **Fast Performance** - Lighthouse score ≥ 95, LCP ≤ 1.5s
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 📊 **Interactive Sections**:
  - Hero with AI Companion input
  - KPI metrics with count-up animations
  - Process wheel visualization
  - Projects showcase with carousel
  - Client logos marquee
  - Testimonials wall
  - Skills & tech stack
  - Career timeline
  - Contact form with Calendly integration

### AI Companion (RAG System)

- 🤖 **Intelligent Q&A** - Ask questions about my background, projects, and experience
- 💬 **Conversational** - Maintains conversation history across multiple turns
- 🎤 **Voice Input** - Speech-to-text support via Gladia API
- 📚 **RAG Architecture** - Retrieval-Augmented Generation with vector search
- 🔄 **Auto-Refresh** - Daily cron job to rebuild knowledge base

### 🎭 Polymorphic Architecture (3-in-1)

- **Single Codebase, Multiple Personas**: The site morphs based on `NEXT_PUBLIC_PERSONA`.
- **Supported Personas**:
  - `pm`: Product Manager focus (Strategy, Metrics)
  - `builder`: Engineer focus (Code, Architecture)
  - `consultant`: Solutions Architect focus (ROI, Automation)
- **Dynamic Content**: Hero copy, project descriptions, and skills change automatically.

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **Carousel**: Embla Carousel
- **Icons**: Lucide React

### Backend & AI

- **Vector Database**: MongoDB Atlas (Vector Search)
- **Embeddings**: OpenAI `text-embedding-3-small`
- **LLM**: OpenRouter (Llama 3.3 8B Instruct)
- **PDF Parsing**: pdf-parse-new
- **Voice**: Gladia API (optional)
- **TTS**: Google Cloud Text-to-Speech (optional)

### Infrastructure

- **Hosting**: Vercel
- **Email**: Resend
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Vercel Analytics
- **Image Optimization**: Cloudinary (optional)

## 📋 Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, pnpm, or yarn
- MongoDB Atlas account (free tier works)
- OpenAI API key
- OpenRouter API key

### Optional

- Supabase account (for contact form storage)
- Resend account (for email delivery)
- Cloudinary account (for image optimization)
- Gladia API key (for voice input)
- Google Cloud credentials (for TTS)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/portfolio-website-ai-product-manager.git
   cd portfolio-website-ai-product-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # MongoDB
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/"
   MONGODB_DB_NAME="portfolio_ai"

   # OpenAI (Embeddings)
   OPENAI_API_KEY="sk-..."
   EMBEDDING_MODEL="text-embedding-3-small"

   # OpenRouter (LLM)
   OPENROUTER_API_KEY="sk-or-v1-..."
   LLM_MODEL="meta-llama/llama-3.1-8b-instruct:free"
   LLM_MAX_TOKENS="2000"
   LLM_TEMPERATURE="0.7"

   # Admin
   ADMIN_SECRET="your-secret-key-here"
   CRON_SECRET="your-cron-secret-here"  # For Vercel cron job authentication

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:5000"

   # Email (Optional)
   RESEND_API_KEY="re_..."

   # Supabase (Optional)
   SUPABASE_URL="https://..."
   SUPABASE_ANON_KEY="..."

   # Cloudinary (Optional)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Voice & TTS (Optional)
   GLADIA_API_KEY="your-gladia-key"
   GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
   TTS_VOICE_NAME="en-US-Chirp3-HD-Achird"

   # Persona (Polymorphic Architecture)
   # Options: "pm" | "builder" | "consultant"
   NEXT_PUBLIC_PERSONA="pm"
   ```

4. **Add your documents**

   Place your PDF files in the `documents/` folder:
   - Resume/CV (e.g., `Umang_Thakkar_PM_Master_Resume.pdf`)
   - LinkedIn export (e.g., `LinkedIn.pdf`)
   - Journey documents (e.g., `journey_fy-2024-2025.pdf`)

5. **Set up MongoDB Vector Index**

   Follow the guide in `build docs/MONGODB_VECTOR_INDEX_SETUP.md` to create the vector search index.

6. **Build the knowledge base**

   ```bash
   # Start the development server
   npm run dev

   # In another terminal, trigger initial index build
   curl -X POST http://localhost:5000/api/ai/rebuild \
     -H "Content-Type: application/json" \
     -d '{"secret":"your-admin-secret"}'
   ```

## 🎯 Usage

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The app will be available at `http://localhost:5000`

### AI Companion API

#### Query Endpoint

```bash
POST /api/ai/query
Content-Type: application/json

{
  "query": "What did Umang work on at Hunch?",
  "conversationHistory": []
}
```

#### Rebuild Index (Admin)

```bash
POST /api/ai/rebuild
Content-Type: application/json

{
  "secret": "your-admin-secret"
}
```

### Test Endpoints

All test endpoints require `ADMIN_SECRET` authentication:

- `/api/ai/test-pdfs` - Test PDF loading and parsing
- `/api/ai/test-pdf-parsing` - Test PDF parsing with section detection
- `/api/ai/test-chunking` - Test document chunking strategies
- `/api/ai/test-vector-search` - Test vector search without LLM

## 📁 Project Structure

```
portfolio-website-ai-product-manager/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── ai/               # AI Companion endpoints
│   │   ├── contact/           # Contact form endpoint
│   │   └── test-db/           # Database test endpoint
│   ├── api-test/              # API testing interface
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── ai/                    # AI Companion components
│   ├── animations/            # Animation components
│   ├── projects/              # Project showcase components
│   └── ui/                    # shadcn/ui components
├── lib/                       # Utility libraries
│   ├── ai/                    # AI/RAG system
│   │   ├── chunking/          # Document chunking strategies
│   │   ├── loaders/           # Document loaders (PDF, GitHub)
│   │   ├── embeddings.ts      # Embedding generation
│   │   ├── llm.ts             # LLM integration
│   │   ├── service.ts         # Main AI service
│   │   └── vector-store.ts    # Vector database operations
│   ├── db/                    # Database utilities
│   └── utils/                 # General utilities
├── hooks/                     # Custom React hooks
├── documents/                 # PDF documents for RAG
├── public/                    # Static assets
├── build docs/                # Documentation
│   ├── Architecture.md        # System architecture
│   ├── PRD.md                 # Product requirements
│   ├── RAG_SYSTEM_DOCUMENTATION.md  # RAG implementation details
│   └── MONGODB_VECTOR_INDEX_SETUP.md  # MongoDB setup guide
└── vercel.json                # Vercel configuration (cron jobs)
```

## 🔧 Configuration

### MongoDB Vector Index

The vector search index must be created in MongoDB Atlas. See `build docs/MONGODB_VECTOR_INDEX_SETUP.md` for detailed instructions.

### Cron Jobs

The `vercel.json` file configures automatic daily rebuilds of the AI knowledge base at 2 AM UTC.

### Environment Variables

See the [Installation](#-installation) section for required environment variables. All variables are documented in `build docs/Architecture.md`.

## 📚 Documentation

- **[Architecture](build%20docs/Architecture.md)** - Complete system architecture
- **[PRD](build%20docs/PRD.md)** - Product requirements document
- **[Personal Branding Strategy](build%20docs/Personal_Branding_Strategy.md)** - 3-Persona Strategy (PM, Consultant, Builder)
- **[Case Study Research](build%20docs/AI_Portfolio_Case_Study_Research.md)** - Research on effective AI case studies
- **[Job Search Playbook](<build%20docs/AI_Job_Search_Complete_Playbook%20(Final).md>)** - AI-focused job search strategy
- **[RAG System](build%20docs/RAG_SYSTEM_DOCUMENTATION.md)** - Detailed RAG implementation
- **[MongoDB Setup](build%20docs/MONGODB_VECTOR_INDEX_SETUP.md)** - Vector index setup guide
- **[Responsive Design](build%20docs/RESPONSIVE_DESIGN_REPORT.md)** - Responsive design analysis

## 🧪 Testing

### Manual Testing

1. **Portfolio Sections**: Navigate through all sections on mobile, tablet, and desktop
2. **Dark Mode**: Toggle between light/dark modes
3. **AI Companion**: Ask various questions about background, projects, skills
4. **Contact Form**: Submit test messages
5. **Responsive Design**: Test on various screen sizes

### API Testing

Visit `/api-test` for an interactive API testing interface (requires admin authentication).

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` file is already configured for cron jobs.

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

Make sure to configure environment variables and set up MongoDB Atlas connection.

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Umang Thakkar**

- Portfolio: https://v0-portfolio-website-one-swart.vercel.app/
- LinkedIn: https://www.linkedin.com/in/umang-thakkar-90a4a5164/
- Email: umangthakkar005@gmail.com

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Next.js](https://nextjs.org/) for the incredible framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [MongoDB Atlas](https://www.mongodb.com/atlas) for vector search
- [OpenAI](https://openai.com/) for embeddings
- [OpenRouter](https://openrouter.ai/) for LLM access

## 📊 Performance

- **Lighthouse Performance**: ≥ 95
- **LCP (Largest Contentful Paint)**: ≤ 1.5s
- **Bundle Size**: ≤ 150 kB gzipped
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security

- Admin endpoints protected with `ADMIN_SECRET`
- API keys stored in environment variables (never committed)
- Input validation and sanitization
- Rate limiting on public endpoints
- CORS restrictions

---

**Built with ❤️ using Next.js, TypeScript, and AI**
