import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
    CreditCard, Truck, Package, Zap, ShoppingCart,
    CheckCircle, Clock, Lock, Heart, Tag
} from 'lucide-react';
import api from '../api/axiosConfig';

// Mapping des symboles de devise
const currencySymbols = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    MGA: 'Ar',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'Fr',
    CNY: '¥'
};

export default function Cart() {
    const { items, removeItem, updateQty, getTotal, setItems } = useCartStore();
    const navigate = useNavigate();
    const [pendingOrder, setPendingOrder] = useState(null);
    const [loadingPending, setLoadingPending] = useState(false);
    const [currency, setCurrency] = useState('EUR');
    const [exchangeRate, setExchangeRate] = useState(1);

    // Charger la devise et le taux
    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'EUR';
        setCurrency(savedCurrency);
        const rates = { EUR: 1, USD: 1.09, GBP: 0.86, MGA: 4800, JPY: 164, CAD: 1.48, AUD: 1.62, CHF: 0.96, CNY: 7.85 };
        setExchangeRate(rates[savedCurrency] || 1);
        checkPendingOrder().catch(err => console.error('Failed to check pending order:', err));
    }, []);

    const checkPendingOrder = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        try {
            const res = await api.get(`/orders/user/${user.id}/pending`);
            if (res.data) setPendingOrder(res.data);
        } catch (err) {
            console.error('Error fetching pending order:', err);
        }
    };

    const restorePendingOrder = async () => {
        if (!pendingOrder) return;
        setLoadingPending(true);
        try {
            const restoredItems = pendingOrder.items.map(item => ({
                id: item.productId,
                name: item.productName,
                price: item.productPrice,
                qty: item.quantity,
                stock: item.stock || 0,
                imageUrl: item.imageUrl,
            }));
            setItems(restoredItems);
            await api.patch(`/orders/${pendingOrder.id}/status`, { status: 'CANCELLED' });
            setPendingOrder(null);
        } catch (err) {
            console.error('Failed to restore order:', err);
        } finally {
            setLoadingPending(false);
        }
    };

    const cancelPendingOrder = async () => {
        if (!pendingOrder) return;
        try {
            await api.patch(`/orders/${pendingOrder.id}/status`, { status: 'CANCELLED' });
            setPendingOrder(null);
        } catch (err) {
            console.error('Failed to cancel pending order:', err);
        }
    };

    const getConvertedPrice = (priceInEUR) => {
        const converted = priceInEUR * exchangeRate;
        return converted.toFixed(2);
    };

    const safeItems = items || [];
    const totalEUR = getTotal();
    const total = getConvertedPrice(totalEUR);

    if (safeItems.length === 0 && !pendingOrder) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-[90%] sm:max-w-md">
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="relative inline-block mb-6 sm:mb-8">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-sm border border-white/10 flex items-center justify-center mx-auto">
                            <ShoppingCart size={36} className="sm:w-12 sm:h-12 text-white/20" />
                        </div>
                    </motion.div>
                    <h2 className="font-display text-white text-2xl sm:text-3xl font-light mb-2 sm:mb-3">Your cart is empty</h2>
                    <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-6 sm:mb-8">Looks like you haven't added anything yet</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white text-black text-[9px] sm:text-[10px] font-body font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-white/90 transition"
                    >
                        Start Shopping
                    </button>
                </motion.div>
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

                {/* Background grid */}
                <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                {/* Ambient light */}
                <div className="fixed top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                {/* PENDING ORDER BANNER */}
                <AnimatePresence>
                    {pendingOrder && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-16 sm:top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-full sm:max-w-xl">
                            <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Clock size={14} className="text-white/50 shrink-0" />
                                        <div>
                                            <p className="text-white/80 text-[11px] sm:text-xs font-body tracking-wide">You have a pending order</p>
                                            <p className="text-white/40 text-[8px] sm:text-[10px]">Order #{pendingOrder.id} — {getConvertedPrice(pendingOrder.totalAmount)} {currencySymbols[currency] || currency}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={restorePendingOrder}
                                            disabled={loadingPending}
                                            className="flex-1 sm:flex-none bg-white text-black text-[8px] sm:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase px-3 sm:px-4 py-1.5 hover:bg-white/90 transition disabled:opacity-50"
                                        >
                                            {loadingPending ? 'Restoring...' : 'Restore'}
                                        </button>
                                        <button
                                            onClick={cancelPendingOrder}
                                            className="flex-1 sm:flex-none bg-white/5 text-white/60 text-[8px] sm:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase px-3 sm:px-4 py-1.5 border border-white/10 hover:bg-white/10 transition"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HEADER */}
                <div className="border-b border-white/8 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                            <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5 text-white/30" />
                            <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">Your Selection</span>
                        </div>
                        <h1 className="font-display text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
                            My Cart
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-2 sm:mt-3">
                            {safeItems.length} {safeItems.length === 1 ? 'item' : 'items'} · Total {total} {currencySymbols[currency] || currency}
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="flex flex-col gap-5 sm:gap-6">

                        {/* CART ITEMS */}
                        <div className="border border-white/8 bg-white/[0.02] rounded-sm overflow-hidden">
                            <AnimatePresence>
                                {safeItems.map((item, index) => {
                                    const itemTotal = getConvertedPrice(item.price * item.qty);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.08 }}
                                            className={`p-3 sm:p-4 md:p-5 ${index !== safeItems.length - 1 ? 'border-b border-white/8' : ''}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                <div className="flex gap-3 sm:gap-4 flex-1">
                                                    <div className="w-14 h-14 sm:w-16 sm:h-16 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={20} className="sm:w-6 sm:h-6 text-white/20" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white/80 text-xs sm:text-sm font-body font-medium truncate">{item.name}</h3>
                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                                            <span className="text-white/60 text-xs sm:text-sm">
                                                                {getConvertedPrice(item.price)} {currencySymbols[currency] || currency}
                                                            </span>
                                                            {item.stock > 0 && (
                                                                <span className="text-[7px] sm:text-[8px] text-white/30 border border-white/20 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1">
                                                                    <CheckCircle size={6} className="sm:w-2 sm:h-2" /> In stock
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-3 sm:mt-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <button
                                                            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                                                            className="w-6 h-6 sm:w-7 sm:h-7 border border-white/10 hover:bg-white/5 transition flex items-center justify-center"
                                                        >
                                                            <Minus size={10} className="sm:w-3 sm:h-3 text-white/50" />
                                                        </button>
                                                        <span className="text-white/80 text-xs sm:text-sm w-5 sm:w-6 text-center">{item.qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item.id, item.qty + 1)}
                                                            className="w-6 h-6 sm:w-7 sm:h-7 border border-white/10 hover:bg-white/5 transition flex items-center justify-center"
                                                        >
                                                            <Plus size={10} className="sm:w-3 sm:h-3 text-white/50" />
                                                        </button>
                                                    </div>

                                                    <div className="text-right min-w-[60px] sm:min-w-[70px]">
                                                        <p className="text-white/80 text-xs sm:text-sm font-body">
                                                            {itemTotal} {currencySymbols[currency] || currency}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-white/30 hover:text-white/60 transition p-1"
                                                    >
                                                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* ORDER SUMMARY */}
                        <div className="border border-white/8 bg-white/[0.02] rounded-sm p-4 sm:p-5 md:p-6">
                            <h3 className="text-white/70 text-[10px] sm:text-xs font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-4 sm:mb-5 flex items-center gap-2">
                                <Tag size={10} className="sm:w-3 sm:h-3 text-white/40" />
                                Order Summary
                            </h3>

                            <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-white/40 flex items-center gap-1.5 sm:gap-2">
                                        <Package size={10} className="sm:w-3 sm:h-3" /> Subtotal
                                    </span>
                                    <span className="text-white/70">{total} {currencySymbols[currency] || currency}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-white/40 flex items-center gap-1.5 sm:gap-2">
                                        <Truck size={10} className="sm:w-3 sm:h-3" /> Delivery
                                    </span>
                                    <span className="text-white/70">Free</span>
                                </div>
                            </div>

                            {totalEUR < 50 && (
                                <div className="mb-4 sm:mb-5 p-2.5 sm:p-3 border border-white/8 bg-white/[0.01]">
                                    <p className="text-[10px] sm:text-xs text-white/40 flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                        <Zap size={9} className="sm:w-2.5 sm:h-2.5" />
                                        Add {(50 - totalEUR).toFixed(2)} € more for free delivery
                                    </p>
                                    <div className="h-0.5 bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full bg-white/30 transition-all duration-300"
                                            style={{ width: `${Math.min(100, (totalEUR / 50) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-white/8 pt-3 sm:pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                                <span className="text-white/80 text-xs sm:text-sm font-body tracking-wide">Total</span>
                                <span className="font-display text-white text-xl sm:text-2xl font-light">
                                    {total} {currencySymbols[currency] || currency}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-white text-black py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-body font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-white/90 transition mb-2.5 sm:mb-3 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <CreditCard size={10} className="sm:w-3 sm:h-3" />
                                Proceed to Checkout
                                <ArrowRight size={10} className="sm:w-3 sm:h-3" />
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white/5 text-white/60 py-2.5 sm:py-3 text-[8px] sm:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-white/10 transition flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5"
                            >
                                <ArrowLeft size={10} className="sm:w-3 sm:h-3" />
                                Continue Shopping
                            </button>

                            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-5 text-white/20 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.1em] sm:tracking-[0.15em] uppercase">
                                <span className="flex items-center justify-center gap-1"><Lock size={8} className="sm:w-2.5 sm:h-2.5" /> Secure payment</span>
                                <span className="flex items-center justify-center gap-1"><Clock size={8} className="sm:w-2.5 sm:h-2.5" /> 24/7 support</span>
                                <span className="flex items-center justify-center gap-1"><Heart size={8} className="sm:w-2.5 sm:h-2.5" /> 30-day returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}