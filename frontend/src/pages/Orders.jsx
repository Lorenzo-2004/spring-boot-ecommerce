import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock, Package, ChevronDown } from 'lucide-react';
import api from '../api/axiosConfig';

const currencySymbols = {
    EUR: '€', USD: '$', GBP: '£', MGA: 'Ar', JPY: '¥',
    CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥'
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currency, setCurrency] = useState('EUR');
    const [exchangeRate, setExchangeRate] = useState(1);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'EUR';
        setCurrency(savedCurrency);
        const rates = { EUR: 1, USD: 1.09, GBP: 0.86, MGA: 4800, JPY: 164, CAD: 1.48, AUD: 1.62, CHF: 0.96, CNY: 7.85 };
        setExchangeRate(rates[savedCurrency] || 1);
    }, []);

    useEffect(() => {
        if (user) {
            api.get(`/orders/user/${user.id}`)
                .then(res => setOrders(res.data))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
            navigate('/login');
        }
    }, [user, navigate]);

    const getConvertedPrice = (priceInEUR) => {
        if (!priceInEUR && priceInEUR !== 0) return '0.00';
        const converted = priceInEUR * exchangeRate;
        return converted.toFixed(2);
    };

    if (!user) return null;

    const getStatusColor = (status) => {
        switch(status) {
            case 'PAID': return 'border-emerald-500/40 text-emerald-400';
            case 'PENDING': return 'border-amber-500/40 text-amber-400';
            case 'SHIPPED': return 'border-blue-500/40 text-blue-400';
            default: return 'border-white/20 text-white/40';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="relative">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 border border-white/10 rounded-full" />
                    <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-t border-white/60 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                .font-body    { font-family: 'Inter', sans-serif; }
                .grain::before {
                    content: '';
                    position: fixed;
                    top: -50%; left: -50%;
                    width: 200%; height: 200%;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 9999;
                    opacity: 0.035;
                }
            `}</style>

            <div className="grain font-body min-h-screen bg-[#080808]">

                <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                <div className="fixed top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                <div className="border-b border-white/8 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                            <ShoppingBag size={11} className="sm:w-3.5 sm:h-3.5 text-white/30" />
                            <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">Order History</span>
                        </div>
                        <h1 className="font-display text-white text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight">
                            My Orders
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-2 sm:mt-3">Track and manage your purchases</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-white/30 hover:text-white/60 text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.3em] uppercase flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 transition"
                    >
                        <ArrowLeft size={10} className="sm:w-3 sm:h-3" />
                        Back to Profile
                    </button>

                    {orders.length === 0 ? (
                        <div className="border border-white/8 bg-white/[0.02] p-8 sm:p-10 lg:p-12 text-center">
                            <ShoppingBag size={36} className="sm:w-12 sm:h-12 text-white/10 mx-auto mb-3 sm:mb-4" />
                            <p className="text-white/60 text-base sm:text-lg font-body">No orders yet</p>
                            <p className="text-white/30 text-xs sm:text-sm mt-1">Start shopping to see your orders here</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-5 sm:mt-6 bg-white text-black text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase px-5 sm:px-6 py-2 sm:py-2.5 hover:bg-white/90 transition"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {orders.map((order, i) => {
                                const isExpanded = expandedOrder === order.id;
                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="border border-white/8 bg-white/[0.02] hover:border-white/20 transition"
                                    >
                                        <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 sm:mb-4">
                                                <div>
                                                    <p className="text-white/70 text-xs sm:text-sm font-body">Order #{order.id}</p>
                                                    <p className="text-white/30 text-[8px] sm:text-[9px] lg:text-[10px] flex items-center gap-1 mt-1">
                                                        <Clock size={8} className="sm:w-2.5 sm:h-2.5" />
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                                                    <span className="font-display text-white text-lg sm:text-xl font-light">
                                                        {getConvertedPrice(order.totalAmount)} {currencySymbols[currency] || currency}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[7px] sm:text-[8px] lg:text-[9px] font-body uppercase tracking-wider border px-1.5 sm:px-2 py-0.5 ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    <ChevronDown
                                                        size={14}
                                                        className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </div>

                                            {!isExpanded && (
                                                <div className="border-t border-white/8 pt-3 mt-1">
                                                    <p className="text-white/40 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase">
                                                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-white/30 text-[8px]">Tap to view details</p>
                                                        <Package size={10} className="text-white/20" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-white/8 bg-white/[0.01]"
                                            >
                                                <div className="p-4 sm:p-5">
                                                    <p className="text-white/25 text-[7px] sm:text-[8px] tracking-[0.3em] uppercase mb-3">Order Items</p>
                                                    <div className="space-y-2">
                                                        {order.items?.map((item, j) => (
                                                            <div key={j} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-white/5 last:border-0">
                                                                <div className="flex-1">
                                                                    <p className="text-white/60 text-[11px] sm:text-xs font-medium">{item.productName}</p>
                                                                    <p className="text-white/30 text-[8px] sm:text-[9px]">Quantity: {item.quantity}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-white/70 text-xs sm:text-sm font-body">
                                                                        {getConvertedPrice(item.productPrice * item.quantity)} {currencySymbols[currency] || currency}
                                                                    </p>
                                                                    <p className="text-white/25 text-[7px] sm:text-[8px]">
                                                                        {getConvertedPrice(item.productPrice)} {currencySymbols[currency] || currency} / unit
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-white/8">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white/40 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase">Total</span>
                                                            <span className="font-display text-white text-base sm:text-lg font-light">
                                                                {getConvertedPrice(order.totalAmount)} {currencySymbols[currency] || currency}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-white/30 text-[7px] sm:text-[8px]">Order date</span>
                                                            <span className="text-white/40 text-[7px] sm:text-[8px]">
                                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}