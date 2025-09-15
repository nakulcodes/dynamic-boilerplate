# {{projectName}}

A modern React admin dashboard built with shadcn/ui, featuring a clean and minimal design inspired by Vercel's aesthetic.

## Features

- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 18** - Latest React features with Strict Mode
- 🎨 **shadcn/ui** - Beautiful, accessible UI components with Radix UI
- 🧭 **TanStack Router** - Type-safe routing with file-based structure
- 🎯 **TypeScript** - Full type safety throughout the application
- 🌊 **TailwindCSS** - Utility-first CSS framework with custom design tokens
- 🌗 **Dark Mode** - Sophisticated theme system with system preference detection
- 📱 **Responsive** - Mobile-first design with collapsible sidebar
- 🔍 **Global Search** - Command palette with keyboard shortcuts (⌘K)
- 🗂️ **Sidebar Navigation** - Organized with groups and scroll areas
- 🏪 **Zustand** - Lightweight state management with persistence
- 📏 **ESLint & Prettier** - Code quality and consistent formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── lib/                # Utility functions
├── pages/              # Page components
├── stores/             # State management
└── types/              # TypeScript definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler

## Key Features

### Theme System
The project includes a sophisticated theming system with support for:
- Light/Dark mode toggle
- System preference detection
- Persistent theme selection with Zustand
- Smooth transitions and proper CSS variables

### Global Search (Command Palette)
- Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) to open
- Quick navigation and command execution
- Extensible for custom commands

### Responsive Sidebar
- Collapsible sidebar with icon mode
- Mobile-responsive with sheet overlay
- Organized navigation groups
- Smooth animations and transitions

### Routing
- File-based routing with TanStack Router
- Type-safe navigation
- Automatic route generation
- Built-in dev tools

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.