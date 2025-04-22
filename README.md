# AI Career Coach

A modern, AI-powered career guidance platform built with Next.js and Google's Generative AI.

![Project Banner](public/banner.png)

## 🌟 Features

- 🤖 **AI-Powered Career Guidance**
  - Personalized career advice using Google's Generative AI
  - Interactive chat interface for real-time counseling
  - Intelligent response generation

- 🔐 **Secure Authentication**
  - User authentication with Clerk
  - Profile management
  - Role-based access control

- 📊 **Interactive Dashboard**
  - Real-time data visualization
  - Progress tracking
  - Career development metrics

- 📝 **Document Generation**
  - PDF resume and cover letter generation
  - Customizable templates
  - Professional document formatting

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/Light mode
  - Accessible components
  - Smooth animations

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: Google Generative AI
- **UI Components**: Radix UI, Shadcn UI
- **Form Handling**: React Hook Form with Zod
- **PDF Generation**: html2pdf.js
- **Data Visualization**: Recharts
- **Markdown Support**: React Markdown
- **State Management**: Inngest

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud API key for AI features
- Clerk account for authentication

### Installation

1. Clone the repository
```bash
git clone https://github.com/udai7/Cian-Ai.git
cd Cian-Ai
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
DATABASE_URL=your_database_url
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 📚 Documentation

For detailed documentation, please refer to the [Documentation](docs/) directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **Email**: [udaid347@gmail.com](mailto:udaid347@gmail.com)
- **GitHub**: [@udai7](https://github.com/udai7)
- **Website**: [portfolio-website-udai.vercel.app]([https://udaidas.com](https://portfolio-website-udai.vercel.app/))

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Google AI](https://ai.google.dev/)
- [Clerk](https://clerk.com/)
- [Prisma](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
