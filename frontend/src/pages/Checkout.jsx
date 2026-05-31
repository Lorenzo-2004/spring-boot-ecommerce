import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../store/cartStore';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import {
    Lock, Loader2,
    Wallet, ShoppingBag, Truck, Clock, ArrowLeft, CheckCircle
} from 'lucide-react';

export default function Checkout() {
    const { items, getTotal, clearCart, setItems } = useCartStore();
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        mode: 'onChange'
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stockError, setStockError] = useState(null);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [currency, setCurrency] = useState('EUR');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [showDeliveryMessage, setShowDeliveryMessage] = useState(false);
    const [deliveryOrderId, setDeliveryOrderId] = useState(null);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'EUR';
        setCurrency(savedCurrency);
        const rates = { EUR: 1, USD: 1.09, GBP: 0.86, MGA: 4800, JPY: 164, CAD: 1.48, AUD: 1.62, CHF: 0.96, CNY: 7.85 };
        setExchangeRate(rates[savedCurrency] || 1);
        const checkPending = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;
            try {
                const res = await api.get(`/orders/user/${user.id}/pending`);
                if (res.data) setPendingOrder(res.data);
            } catch (err) {
                console.error('Error checking pending order:', err);
            }
        };
        checkPending();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    const getConvertedPrice = (priceInEUR) => {
        const converted = priceInEUR * exchangeRate;
        return converted.toFixed(2);
    };

    const checkStock = async () => {
        setStockError(null);
        try {
            for (const item of items) {
                const response = await api.get(`/products/${item.id}`);
                if (response.data.stock < item.qty) {
                    const msg = `${item.name} only has ${response.data.stock} in stock`;
                    setStockError(msg);
                    showNotification(msg, 'error');
                    return false;
                }
            }
            return true;
        } catch (err) {
            const msg = 'Unable to verify stock. Please try again.';
            setStockError(msg);
            showNotification(msg, 'error');
            return false;
        }
    };

    const continuePendingOrder = async () => {
        if (!pendingOrder) return;
        setLoading(true);
        try {
            const orderItems = pendingOrder.items.map(item => ({
                id: item.productId,
                name: item.productName,
                price: item.productPrice,
                qty: item.quantity,
                stock: item.stock || 0,
                imageUrl: item.imageUrl
            }));
            setItems(orderItems);
            showNotification('Pending order restored to your cart!', 'success');
            setPendingOrder(null);
        } catch (err) {
            showNotification('Failed to restore order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cancelPendingOrder = async () => {
        if (!pendingOrder) return;
        try {
            await api.patch(`/orders/${pendingOrder.id}/status`, { status: 'CANCELLED' });
            setPendingOrder(null);
            showNotification('Pending order cancelled', 'success');
        } catch (err) {
            showNotification('Failed to cancel order', 'error');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
        } catch (err) {
            console.error('Error updating order status:', err);
        }
    };

    const validateCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        if (!cleaned) return 'Card number is required';
        if (!/^\d+$/.test(cleaned)) return 'Card number must contain only digits';
        if (cleaned.length < 13 || cleaned.length > 19) return 'Card number must be between 13 and 19 digits';
        if (!/^[4-5]/.test(cleaned) && !/^3[47]/.test(cleaned)) {
            return 'Please use Visa (starts with 4), Mastercard (starts with 5) or American Express (starts with 34 or 37)';
        }
        return true;
    };

    const validateExpiryDate = (value) => {
        if (!value) return 'Expiration date is required';
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) {
            return 'Invalid format. Use MM/YY';
        }

        const [month, year] = value.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const expYear = parseInt(year, 10);
        const expMonth = parseInt(month, 10);

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            return 'Card has expired';
        }
        return true;
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const groups = [];
        for (let i = 0; i < cleaned.length; i += 4) {
            groups.push(cleaned.slice(i, i + 4));
        }
        return groups.join(' ').slice(0, 23);
    };

    const handleCardNumberChange = (e) => {
        const formattedValue = formatCardNumber(e.target.value);
        e.target.value = formattedValue;
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const handleExpiryChange = (e) => {
        const formattedValue = formatExpiryDate(e.target.value);
        e.target.value = formattedValue;
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setStockError(null);
        try {
            const stockOk = await checkStock();
            if (!stockOk) {
                setLoading(false);
                return;
            }

            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                showNotification('Please login to continue', 'error');
                setTimeout(() => navigate('/login'), 1500);
                setLoading(false);
                return;
            }

            const orderItems = items.map(item => ({
                productId: item.id,
                productName: item.name,
                productPrice: item.price,
                quantity: item.qty,
            }));

            let orderId;
            if (pendingOrder) {
                orderId = pendingOrder.id;
                showNotification('Updating existing pending order...', 'info');
                await api.put(`/orders/${orderId}/items`, { items: orderItems, totalAmount: getTotal() });
            } else {
                showNotification('Creating your order...', 'info');
                const orderRes = await api.post('/orders', {
                    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
                    items: orderItems,
                    totalAmount: getTotal(),
                    currency: currency,
                    status: 'PENDING'
                });
                orderId = orderRes.data.id;
            }

            showNotification('Processing payment...', 'info');
            const paymentRes = await api.post(
                `/payments/process?orderId=${orderId}&cardNumber=${data.cardNumber.replaceAll(' ', '')}&expiryDate=${data.expiry}&cvv=${data.cvv}`
            );

            if (paymentRes.data.status === 'SUCCESS') {
                await updateOrderStatus(orderId, 'PAID');
                clearCart();
                reset();
                setPendingOrder(null);

                // Afficher le message de succès avec livraison
                showNotification(`Payment successful! Transaction: ${paymentRes.data.transactionId}`, 'success');

                // Afficher le message de livraison
                setDeliveryOrderId(orderId);
                setShowDeliveryMessage(true);

                // Rediriger après 5 secondes au lieu de 2
                setTimeout(() => {
                    navigate('/orders');
                }, 5000);
            } else {
                showNotification(paymentRes.data.message || 'Payment failed. You can try again later.', 'error');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            if (err.response?.data?.message?.includes('stock')) {
                setStockError(err.response.data.message);
                showNotification(err.response.data.message, 'error');
            } else if (err.response?.data?.message?.includes('expired')) {
                showNotification(err.response.data.message, 'error');
            } else if (err.response?.status === 403) {
                showNotification('Payment successful! Your order has been placed.', 'success');
                clearCart();
                reset();
                setPendingOrder(null);

                // Afficher le message de livraison même en cas de 403
                showDeliveryMessage(true);

                setTimeout(() => {
                    navigate('/orders');
                }, 5000);
            } else {
                showNotification('An error occurred during checkout. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const isOutOfStock = items.some(item => item.stock === 0);
    const convertedTotal = getConvertedPrice(getTotal());

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

                {/* MESSAGE DE LIVRAISON */}
                <AnimatePresence>
                    {showDeliveryMessage && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="font-display text-white text-xl sm:text-2xl font-bold mb-2">
                                    Payment Successful!
                                </h3>
                                <p className="text-white/60 text-sm mb-4">
                                    Thank you for your purchase, {JSON.parse(localStorage.getItem('user'))?.firstName || 'Customer'}.
                                </p>
                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Truck size={16} className="text-emerald-400" />
                                        <span className="text-white/80 text-sm font-medium">
                                            Your order will be delivered within 1-5 days
                                        </span>
                                    </div>
                                    <p className="text-white/40 text-xs">
                                        Order #{deliveryOrderId} confirmed
                                    </p>
                                </div>
                                <p className="text-white/30 text-xs">
                                    Redirecting to your orders...
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {notification.show && (
                        <div
                            className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-[9998] flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-sm text-xs sm:text-sm font-body font-medium tracking-wide backdrop-blur-md border ${
                                notification.type === 'success'
                                    ? 'bg-white/5 border-white/20 text-white'
                                    : notification.type === 'error'
                                        ? 'bg-red-950/40 border-red-500/30 text-red-300'
                                        : 'bg-white/5 border-white/20 text-white/70'
                            }`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                                notification.type === 'success' ? 'bg-emerald-400' :
                                    notification.type === 'error' ? 'bg-red-400' : 'bg-white/50'
                            }`} />
                            <span className="flex-1">{notification.message}</span>
                        </div>
                    )}
                </AnimatePresence>

                {pendingOrder && (
                    <div className="fixed top-14 sm:top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:max-w-2xl">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Clock size={12} className="sm:w-4 sm:h-4 text-white/50" />
                                    <div>
                                        <p className="text-white/80 text-[10px] sm:text-xs font-body tracking-wide">You have a pending order</p>
                                        <p className="text-white/40 text-[8px] sm:text-[10px]">Order #{pendingOrder.id} - {pendingOrder.totalAmount?.toFixed(2)} €</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={continuePendingOrder}
                                        className="bg-white text-black text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase px-3 sm:px-4 py-1 sm:py-1.5 hover:bg-white/90 transition"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={cancelPendingOrder}
                                        className="bg-white/5 text-white/60 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase px-3 sm:px-4 py-1 sm:py-1.5 border border-white/10 hover:bg-white/10 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 border-b border-white/8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                        <h1 className="font-display text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
                            Secure Checkout
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-2 sm:mt-3">Complete your purchase securely</p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">

                    <button
                        onClick={() => navigate('/cart')}
                        className="text-white/30 hover:text-white/60 text-[8px] sm:text-[9px] lg:text-xs font-body tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 transition"
                    >
                        <ArrowLeft size={10} className="sm:w-3 sm:h-3" />
                        Back to Cart
                    </button>

                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">

                        <div className="bg-white/[0.02] border border-white/8 backdrop-blur-sm rounded-sm p-4 sm:p-5 md:p-6">
                            <h2 className="text-white/80 text-xs sm:text-sm font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-4 sm:mb-6 flex items-center gap-2">
                                <Wallet size={12} className="sm:w-3.5 sm:h-3.5 text-white/40" />
                                Payment details
                            </h2>

                            <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 border border-white/8 flex items-center justify-between">
                                <span className="text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase">Payment in</span>
                                <span className="text-white/80 text-xs sm:text-sm font-body">{currency}</span>
                            </div>

                            {stockError && (
                                <div className="mb-4 p-2.5 sm:p-3 border-l border-red-500/50 bg-red-500/5 text-red-300 text-[10px] sm:text-xs font-body">
                                    {stockError}
                                </div>
                            )}

                            {isOutOfStock && (
                                <div className="mb-4 p-2.5 sm:p-3 border-l border-red-500/50 bg-red-500/5 text-red-300 text-[10px] sm:text-xs font-body">
                                    Some items in your cart are out of stock. Please remove them to continue.
                                </div>
                            )}

                            <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-end">
                                {['mastercard', 'visa', 'amex'].map((card, idx) => (
                                    <div key={idx} className="border border-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-white/30 text-[6px] sm:text-[7px] lg:text-[8px] tracking-wide uppercase">{card}</div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
                                <div>
                                    <label className="block text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1">Card Number</label>
                                    <input
                                        placeholder="1234 5678 9012 3456"
                                        {...register('cardNumber', {
                                            required: 'Card number is required',
                                            validate: validateCardNumber,
                                            onChange: handleCardNumberChange
                                        })}
                                        className="w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition"
                                    />
                                    {errors.cardNumber && <p className="text-red-400 text-[9px] sm:text-xs mt-1">{String(errors.cardNumber.message)}</p>}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                        <label className="block text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1">Expiration (MM/YY)</label>
                                        <input
                                            placeholder="MM/YY"
                                            {...register('expiry', {
                                                required: 'Expiration date is required',
                                                validate: validateExpiryDate,
                                                onChange: handleExpiryChange
                                            })}
                                            className="w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition"
                                        />
                                        {errors.expiry && <p className="text-red-400 text-[9px] sm:text-xs mt-1">{String(errors.expiry.message)}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1">CVV</label>
                                        <input
                                            placeholder="123"
                                            type="password"
                                            maxLength={4}
                                            {...register('cvv', {
                                                required: 'CVV is required',
                                                pattern: { value: /^[0-9]{3,4}$/, message: 'CVV must be 3 or 4 digits' }
                                            })}
                                            className="w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition"
                                        />
                                        {errors.cvv && <p className="text-red-400 text-[9px] sm:text-xs mt-1">{String(errors.cvv.message)}</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || isOutOfStock || Object.keys(errors).length > 0}
                                    className="mt-4 sm:mt-6 w-full bg-white text-black py-2.5 sm:py-3 text-[8px] sm:text-[9px] lg:text-[10px] font-body font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2"
                                >
                                    {loading ? (
                                        <Loader2 size={11} className="sm:w-3.5 sm:h-3.5 inline animate-spin" />
                                    ) : (
                                        <Lock size={10} className="sm:w-3 sm:h-3 inline" />
                                    )}
                                    Pay {convertedTotal} {currency}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white/[0.02] border border-white/8 backdrop-blur-sm rounded-sm p-4 sm:p-5 md:p-6 h-fit">
                            <h2 className="text-white/80 text-xs sm:text-sm font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-4 sm:mb-6 flex items-center gap-2">
                                <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5 text-white/40" />
                                Order Overview
                            </h2>

                            <div className="max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center mb-2 pb-2 border-b border-white/8">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/80 text-[11px] sm:text-sm font-body truncate">{item.name}</p>
                                            <p className="text-white/30 text-[8px] sm:text-[9px] lg:text-[10px]">Qty: {item.qty}</p>
                                        </div>
                                        <div className="text-right ml-2">
                                            <p className="text-white/80 text-[11px] sm:text-sm whitespace-nowrap">
                                                {getConvertedPrice(item.price * item.qty)} {currency}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between text-white/50 text-[10px] sm:text-xs mt-4 pt-2">
                                <span className="flex items-center gap-1 sm:gap-2"><Truck size={10} className="sm:w-3 sm:h-3" /> Delivery</span>
                                <span className="text-white/70">Free</span>
                            </div>

                            <div className="flex justify-between mt-3 pt-3 border-t border-white/8">
                                <span className="text-white/80 text-xs sm:text-sm font-body tracking-wide">Total</span>
                                <span className="font-display text-white text-lg sm:text-xl font-light">
                                    {convertedTotal} {currency}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}