import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import BookingSlotPage from './pages/BookingSlotPage';
import BookingEquipmentPage from './pages/BookingEquipmentPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ProfilePage from './pages/ProfilePage';
import { useBookingStore } from './store/bookingStore';

export default function App() {
  const isAuth = useBookingStore((s) => s.isAuth);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* If user is already authenticated, redirect from login to court search */}
            <Route path="/" element={isAuth ? <Navigate to="/cautare" replace /> : <LoginPage />} />
            <Route path="/login" element={isAuth ? <Navigate to="/cautare" replace /> : <LoginPage />} />
            <Route path="/cautare" element={<SearchPage />} />
            <Route path="/rezervare/interval" element={<BookingSlotPage />} />
            <Route path="/rezervare/echipament" element={<BookingEquipmentPage />} />
            <Route path="/rezervare/plata" element={<BookingPaymentPage />} />
            <Route path="/rezervare/confirmare" element={<BookingConfirmationPage />} />
            <Route path="/rezervarile-mele" element={<MyBookingsPage />} />
            <Route path="/abonamente" element={<SubscriptionsPage />} />
            <Route path="/contul-meu" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to={isAuth ? "/cautare" : "/"} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}