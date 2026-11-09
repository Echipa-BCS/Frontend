import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useBookingStore } from './store/bookingStore'

// Initialize auth from localStorage on app startup
const store = useBookingStore.getState();
store.initAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
