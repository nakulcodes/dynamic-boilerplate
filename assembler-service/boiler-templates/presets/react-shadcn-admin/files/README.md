# {{projectName}}

A modern React admin dashboard built with **Shadcn/ui**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Latest React with modern patterns
- 🎨 **Shadcn/ui** - Beautiful and accessible UI components
- 🔷 **TypeScript** - Full type safety
- 🎯 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first approach
- 🧭 **React Router** - Client-side routing
- 📦 **Component-based Architecture** - Modular and reusable
- 🎪 **Lucide Icons** - Beautiful icon library

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

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
├── components/
│   └── ui/              # Shadcn/ui components
├── layouts/
│   └── AdminLayout.tsx  # Main admin layout
├── lib/
│   └── utils.ts         # Utility functions
├── pages/
│   └── Dashboard.tsx    # Dashboard page
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Adding New Components

This project uses [Shadcn/ui](https://ui.shadcn.com/) components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Customization

- **Colors**: Modify CSS variables in `src/index.css`
- **Components**: Extend existing components or create new ones
- **Layout**: Customize the sidebar and layout in `AdminLayout.tsx`
- **Routes**: Add new routes in `App.tsx`

## Built With

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Router](https://reactrouter.com/) - Routing
- [Lucide React](https://lucide.dev/) - Icons

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created by **{{author}}** with ❤️