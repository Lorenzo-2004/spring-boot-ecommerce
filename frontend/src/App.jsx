import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Navbar from './components/Navbar';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import AdminOrders from './pages/AdminOrders';
import AdminStock from './pages/AdminStock';
import AdminDeliveryCalendar from './pages/AdminDeliveryCalendar';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
import CurrencySelector from './components/CurrencySelector.jsx';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/stock" element={<AdminStock />} />
                <Route path="/admin/delivery-calendar" element={<AdminDeliveryCalendar />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/currency/selector" element={<CurrencySelector />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;