import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useBookingStore } from './store/bookingStore'
import { useThemeStore } from './store/themeStore'

// Initialize auth and theme from localStorage on app startup
useBookingStore.getState().initAuth();
useThemeStore.getState().initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
