# 🚀 Slooze - Full Stack Application

A modern full-stack application built with React, TypeScript, Tailwind CSS, and Express.js.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Lightning-fast development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Fast web framework
- **TypeScript** - Type-safe backend development
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start both frontend and backend in development mode**:
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:5173 (Vite dev server)
   - Backend: http://localhost:3001 (Express server)

### Individual Commands

- **Start both services**: `npm run dev`
- **Backend only (dev)**: `npm run backend:dev`
- **Frontend only (dev)**: `npm run frontend:dev`
- **Build frontend**: `npm run build`

## 📁 Project Structure

```
slooze/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── index.css        # Tailwind CSS imports
│   │   └── main.tsx         # React entry point
│   ├── package.json         # Frontend dependencies
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── postcss.config.js    # PostCSS configuration
│   └── vite.config.ts       # Vite configuration
├── backend/                  # Express TypeScript backend
│   ├── src/
│   │   └── index.ts         # Express server
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript configuration
├── package.json             # Root package.json with scripts
└── README.md               # This file
```

## 🌟 Features

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support on both frontend and backend
- **Hot Reload**: Instant updates during development
- **API Integration**: Frontend communicates with backend API
- **Error Handling**: Proper error states and loading indicators
- **Security**: CORS, Helmet, and other security best practices
- **Concurrent Development**: Run both services with a single command

## 🔌 API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Sample data endpoint

## 🎨 UI Components

The frontend includes:
- Backend health status monitoring
- Interactive API data fetching
- Error handling with user feedback
- Responsive design for mobile and desktop
- Modern card-based layout with gradients and shadows

## 🧪 Development

### Adding New API Endpoints

1. Add routes to `backend/src/index.ts`
2. Update TypeScript interfaces in `frontend/src/App.tsx`
3. Create fetch functions and UI components

### Styling

This project uses Tailwind CSS for styling. You can:
- Use utility classes directly in JSX
- Extend the theme in `tailwind.config.js`
- Add custom styles in `src/index.css`

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run start` | Start both services in production mode |
| `npm run install:all` | Install dependencies for root, frontend, and backend |
| `npm run build` | Build the frontend for production |
| `npm run backend:dev` | Start only the backend in development mode |
| `npm run backend:start` | Start only the backend in production mode |
| `npm run frontend:dev` | Start only the frontend in development mode |
| `npm run frontend:start` | Build and preview the frontend |

## 🚀 Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The built files will be in `frontend/dist/`

3. Deploy the backend and serve the frontend static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Made with ❤️ using React, TypeScript, Tailwind CSS, and Express.js 