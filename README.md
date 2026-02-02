# Modern Web Design Portfolio

A high-performance, visually engaging personal portfolio website designed to showcase web development work with immersive 3D elements and smooth animations. Built with modern web technologies including Next.js, TypeScript, and WebGL.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D & WebGL**:
  - [React Three Fiber](https://docs.pmnd.rs/react-three-fiber): For the interactive 3D sphere.
  - [OGL](https://github.com/oframe/ogl): For the lightweight, high-performance Ripple Grid effect.
- **Animations**: [GSAP](https://greensock.com/gsap/) & native CSS animations.
- **Icons**: [Lucide React](https://lucide.dev/).
- **Utilities**: `clsx`, `tailwind-merge`.

## ✨ Key Features

- **Interactive 3D Sphere**: A dynamic, mouse-responsive 3D sphere rendered with React Three Fiber and customized shaders (`MeshDistortMaterial`, `MeshWobbleMaterial`).
- **Ripple Grid Background**: A mesmerizing, interactive background utilizing OGL for efficient WebGL rendering, reacting to mouse movements.
- **Particle System**: A subtle `ThreadsBackground` that connects nodes based on proximity, creating a "constellation" effect using HTML5 Canvas.
- **Vertical Text Rotator**: A stylish, vertically oriented text animation using `VerticalChangingText` to highlight key skills.
- **Responsive Navigation**: A clean, accessible navigation bar with a mobile-friendly menu system.
- **Performance Optimized**: Lazy loading for heavy WebGL components (`RippleGrid`) to ensure fast initial page loads.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18.0.0 or later recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Portfolio-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Development

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create an optimized production build:

```bash
npm run build
```

The output will be generated in the `.next` folder.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages (layout.tsx, page.tsx)
├── components/           # Reusable UI components
│   ├── animation/        # Complex animation components (InteractiveSphere, RippleGrid, Noise)
│   ├── icons/            # Custom SVG icons (TechIcons)
│   ├── ui/               # Standard UI elements (if any)
│   ├── HeroSection.tsx   # Main landing section
│   ├── AboutSection.tsx  # "About Me" and Skills section
│   ├── ProjectsList.tsx  # Portfolio work showcase
│   └── ...
└── ...
```

## 🎨 Clean Code & Best Practices

This project adheres to strict code quality standards:
- **Zero TypeScript Errors**: The codebase passes strict type checking (`tsc --noEmit`).
- **Linting**: Enforced with ESLint.
- **Optimization**: Unused dependencies (like `radix-ui` components not in use) and global React imports have been removed for a leaner bundle.

## 📄 License

[MIT](LICENSE)