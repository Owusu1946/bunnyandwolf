# Sinosply Stores Frontend

A modern, responsive e-commerce platform built with React, Vite, and Tailwind CSS. This frontend application provides a seamless shopping experience with real-time product search, AI-powered product recommendations, user authentication, and a robust admin dashboard.

## 🚀 Features

- **Modern UI/UX**: Responsive design that works on all devices
- **Real-time Product Search**: Blazingly fast, keyboard-navigable search experience
- **AI-Powered Recommendations**: Using Google's Gemini API for smart product recommendations
- **User Authentication**: Complete login/registration flow with password reset
- **Shopping Cart & Checkout**: Seamless purchasing experience with shipping options
- **Admin Dashboard**: Comprehensive product, order, and customer management
- **Real-time Notifications**: Order updates and system notifications
- **Wishlist**: Save products for later
- **Recently Viewed Products**: Track and display products the user has viewed

## 🛠️ Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Router v6** - Routing
- **React Icons** - Icon library
- **Socket.IO** - Real-time notifications

## 📦 Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the frontend directory
cd Sinosply/frontend

# Install dependencies
npm install

# Create .env file (see .env.example for required variables)
cp .env.example .env

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 📄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint codebase

## 📁 Project Structure

```
frontend/
├─ src/
│  ├─ components/ - Reusable UI components
│  ├─ context/ - React context providers
│  ├─ pages/ - Page components
│  ├─ services/ - API service layers
│  ├─ store/ - Zustand store definitions
│  ├─ styles/ - Global and component styles
│  ├─ utils/ - Utility functions
│  ├─ App.jsx - Main application component
│  └─ main.jsx - Application entry point
├─ public/ - Static assets
└─ dist/ - Build output
```

## 🌐 Core Features Explained

### Product Search
Real-time search with debounced input processing, keyboard navigation, and beautiful dropdown UI. See `ProductSearchDropdown.jsx` and `ProductSearchPage.jsx`.

### AI-Powered Recommendations
"You May Also Like" recommendations powered by Google's Gemini API with user preference tracking. See `recommendationService.js` and `ProductDetailsPage.jsx`.

### Admin Dashboard
Comprehensive management interface for products, orders, customers, and settings. Located in `src/pages/admin/`.

### Checkout Flow
Multi-step checkout process with shipping options, payment integration, and order confirmation. See `CheckoutPage.jsx`.

## 🧪 Development Guidelines

- Follow the existing code style and component patterns
- Use Zustand stores for global state management
- Create reusable components in the `components` directory
- Keep pages focused on layout and composition, not logic
- Use services for API interactions

## 📱 Mobile Responsiveness

The application is fully responsive with specific optimizations for:
- Mobile navigation (hamburger menu)
- Touch-friendly product cards
- Optimized checkout flow for small screens
- Adaptive layouts using Tailwind breakpoints

## 🚀 Deployment

The frontend is configured for deployment on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.
