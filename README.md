# Nuclear - Your AI-Powered Learning Companion

<p align="center">
  <img alt="Nuclear - AI-Powered Learning" src="public/nuclear-logo.png">
  <h1 align="center">Nuclear</h1>
</p>

<p align="center">
  Transform your learning experience with AI-powered note-taking and knowledge organization
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#study-modes"><strong>Study Modes</strong></a> ·
  <a href="#development"><strong>Development</strong></a>
</p>
<br/>

## Features

- 🤖 **AI-Powered Learning**
  - Smart note-taking assistance
  - Automatic content summarization
  - Intelligent knowledge organization

- 📚 **Multiple Study Modes**
  - Deathmarch: Quick note-taking for immediate ideas
  - Story & Sword: Structured learning with resources
  - Just the Story: Automated content processing

- 📁 **Smart Organization**
  - Hierarchical block and crate system
  - Easy file management
  - Seamless content organization

- 🔄 **Real-time Processing**
  - OCR for images and PDFs
  - Audio transcription
  - Instant content analysis

## Study Modes

### Deathmarch
Perfect for when you have ideas in mind and want to start notetaking immediately. Jump right in and capture your thoughts with AI assistance.

### Story & Sword
Ideal for structured learning. Upload your resources and let Nuclear help you understand and organize them effectively.

### Just the Story
Simply dump your content and let Nuclear handle the rest. Get automatic summaries and insights from your materials.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nuclear.git
   cd nuclear
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the following variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

Nuclear is built with:
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend and authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://prisma.io) - Database ORM

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
