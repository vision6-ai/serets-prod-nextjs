# 🎬 SERETS.CO.IL - Israeli Movie Database

A modern, feature-rich platform for discovering and exploring Israeli cinema. Built with cutting-edge technologies and designed for optimal user experience.

Demo: https://serets-co-il-prod.vercel.app

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router for optimal performance
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality UI components
- **Framer Motion** - Smooth animations and transitions

### Backend & Database
- **Supabase**
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication
  - Edge Functions

### Performance & Analytics
- **Vercel Analytics** - Real-time performance monitoring
- **Vercel Speed Insights** - Performance optimization
- **Next.js Image Optimization** - Automatic image optimization
- **Dynamic Imports** - Code splitting for faster page loads

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality

## ✨ Features

### 🎯 Core Features
- **Dynamic Movie Categories**
  - Latest Releases
  - Top Rated
  - Award Winners
  - Genre-based browsing

### 🔍 Advanced Search & Filters
- **Smart Filtering System**
  - Genre-based filtering
  - Year selection
  - Rating filters
  - Multiple sort options

### 🎨 User Experience
- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interactions

- **Smart Loading**
  - Progressive image loading
  - Skeleton loading states
  - Smooth transitions

### 🌐 Multilingual Support
- English interface
- Hebrew content support
- RTL text handling

### 🔐 User Features
- Authentication system
- Watchlist functionality
- Movie ratings and reviews

## 🛠 Project Structure

```
serets.co.il/
├── app/                    # Next.js app directory
│   ├── movies/            # Movie-related pages
│   ├── genres/            # Genre-specific pages
│   └── actors/            # Actor profiles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── movies/           # Movie-specific components
├── lib/                   # Utility functions
└── supabase/             # Database migrations
```

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/vision6-ai/serets.co.il.git
```

2. Install dependencies:
```bash
cd serets.co.il
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

## 🚀 Deployment

The project is deployed on Railway with automatic deployments from the main branch.

## 📈 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: All metrics in the green
- **First Contentful Paint**: < 1.0s
- **Time to Interactive**: < 2.0s

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Israeli Film Industry
- Open Source Community
- All Contributors

---

Built with ❤️ by [Vision6 AI](https://github.com/vision6-ai)
