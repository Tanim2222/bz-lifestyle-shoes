import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import OrderConfirmation from './pages/OrderConfirmation.tsx';
import AccountApp from './pages/account/AccountApp.tsx';
import { CustomerAuthProvider } from './context/CustomerAuthContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CustomerAuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/account/*" element={<AccountApp />} />
              <Route path="/*" element={<App />} />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </CustomerAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
