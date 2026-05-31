import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, ChevronLeft, ChevronRight, Truck,
    Package, DollarSign, Clock, CheckCircle,
    XCircle, ArrowRight, Loader2, AlertCircle
} from 'lucide-react';
import api from '../api/axiosConfig';

export default function AdminDeliveryCalendar() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    // Helper function
    const formatDateKey = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Get delivery date from order
    const getDeliveryDateFromOrder = (order) => {
        if (!order.deliveryDate) return null;
        return new Date(order.deliveryDate);
    };

    // Group orders by delivery date
    const getCalendarData = () => {
        const calendar = {};
        orders.forEach(order => {
            // Afficher les commandes avec une date de livraison
            if (order.deliveryDate && (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED')) {
                const deliveryDate = new Date(order.deliveryDate);
                const dateKey = formatDateKey(deliveryDate);
                if (!calendar[dateKey]) calendar[dateKey] = [];
                calendar[dateKey].push({
                    id: order.id,
                    customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Guest',
                    email: order.user?.email || 'N/A',
                    amount: order.totalAmount,
                    items: order.items?.length || 0,
                    status: order.status,
                    createdAt: order.createdAt,
                    deliveryDate: order.deliveryDate
                });
            }
        });
        return calendar;
    };

    const [calendarData, setCalendarData] = useState({});

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                const ordersRes = await api.get('/admin/orders');
                setOrders(ordersRes.data);
            } catch (error) {
                console.error('Error loading orders:', error);
                if (error.response?.status === 403) {
                    setErrorMessage('Access denied. Please re-login as ADMIN.');
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                    }, 3000);
                } else {
                    setErrorMessage('Failed to load orders');
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    // Update calendar data when orders change
    useEffect(() => {
        if (orders.length > 0) {
            setCalendarData(getCalendarData());
        }
    }, [orders]);

    const updateDeliveryStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        setErrorMessage(null);

        try {
            // Utiliser le bon endpoint du backend: /admin/orders/{orderId}/delivery-status
            const response = await api.patch(`/admin/orders/${orderId}/delivery-status`, { status: newStatus });

            if (response.data) {
                // Recharger toutes les commandes
                const ordersRes = await api.get('/admin/orders');
                setOrders(ordersRes.data);

                // Mettre à jour la sélection courante si le modal est ouvert
                if (selectedOrders.length > 0) {
                    const updatedOrders = selectedOrders.map(order =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    );
                    setSelectedOrders(updatedOrders);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);

            if (error.response?.status === 404) {
                setErrorMessage(`Order #${orderId} not found`);
            } else if (error.response?.status === 400) {
                setErrorMessage(`Invalid status: ${newStatus}. Allowed: SHIPPED, DELIVERED`);
            } else if (error.response?.status === 403) {
                setErrorMessage(`Access denied. Admin privileges required.`);
            } else {
                setErrorMessage(error.response?.data?.message || `Failed to update order #${orderId}`);
            }

            setTimeout(() => setErrorMessage(null), 4000);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleDateClick = (date) => {
        if (!date) return;
        const dateKey = formatDateKey(date);
        setSelectedDate(date);
        setSelectedOrders(calendarData[dateKey] || []);
        setShowOrderModal(true);
        setErrorMessage(null);
    };

    const getStatusBadge = (status) => {
        const config = {
            PAID: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'PAID', icon: <Clock size={10} /> },
            SHIPPED: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'SHIPPED', icon: <Truck size={10} /> },
            DELIVERED: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'DELIVERED', icon: <CheckCircle size={10} /> },
            PENDING: { color: 'text-violet-400', bg: 'bg-violet-500/20', label: 'PENDING', icon: <Clock size={10} /> },
            CANCELLED: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'CANCELLED', icon: <XCircle size={10} /> }
        };
        const cfg = config[status] || config.PENDING;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase rounded ${cfg.color} ${cfg.bg}`}>
                {cfg.icon}
                {cfg.label}
            </span>
        );
    };

    const getStatusActions = (order) => {
        if (order.status === 'PAID') {
            return (
                <button
                    onClick={() => updateDeliveryStatus(order.id, 'SHIPPED')}
                    disabled={updatingOrderId === order.id}
                    className="text-[9px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition disabled:opacity-50 flex items-center gap-1"
                >
                    {updatingOrderId === order.id ? (
                        <Loader2 size={10} className="animate-spin" />
                    ) : (
                        <Truck size={10} />
                    )}
                    Mark as Shipped
                </button>
            );
        }
        if (order.status === 'SHIPPED') {
            return (
                <button
                    onClick={() => updateDeliveryStatus(order.id, 'DELIVERED')}
                    disabled={updatingOrderId === order.id}
                    className="text-[9px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition disabled:opacity-50 flex items-center gap-1"
                >
                    {updatingOrderId === order.id ? (
                        <Loader2 size={10} className="animate-spin" />
                    ) : (
                        <CheckCircle size={10} />
                    )}
                    Mark as Delivered
                </button>
            );
        }
        if (order.status === 'DELIVERED') {
            return (
                <span className="text-[9px] px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded flex items-center gap-1">
                    <CheckCircle size={10} /> Delivered
                </span>
            );
        }
        return null;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const days = getDaysInMonth(currentMonth);

    // Calculate statistics
    const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const paidOrders = orders.filter(o => o.status === 'PAID').length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const totalRevenue = orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 border border-white/10 rounded-full" />
                        <div className="absolute inset-0 w-10 h-10 border-t border-white/60 rounded-full animate-spin" />
                    </div>
                    <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase font-body">Loading calendar...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                .font-body { font-family: 'Inter', sans-serif; }
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
                .calendar-day {
                    transition: all 0.2s ease;
                }
                .calendar-day:hover {
                    background-color: rgba(255,255,255,0.03);
                    transform: translateY(-2px);
                }
            `}</style>

            <div className="grain font-body min-h-screen bg-black">

                {/* Error Message Toast */}
                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-body backdrop-blur-sm flex items-center gap-2"
                        >
                            <AlertCircle size={12} />
                            {errorMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="border-b border-white/8 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-white/40 hover:text-white/70 transition p-1"
                            >
                                ← Back to Dashboard
                            </button>
                            <div className="inline-flex items-center gap-2">
                                <Calendar size={16} className="sm:w-5 sm:h-5 text-white/30" />
                                <span className="text-white/30 text-[7px] sm:text-[8px] font-body tracking-[0.3em] uppercase">Delivery</span>
                            </div>
                        </div>
                        <h1 className="font-display text-white text-3xl sm:text-4xl font-light tracking-tight">
                            Delivery Calendar
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.15em] uppercase mt-2 font-body">
                            Orders delivery schedule
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
                        <div className="border border-white/8 bg-white/[0.02] p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Package size={12} className="text-white/40" />
                                <span className="text-white/40 text-[7px] sm:text-[8px] font-body uppercase tracking-wider">Total Orders</span>
                            </div>
                            <p className="font-display text-white text-xl sm:text-2xl font-bold">{orders.length}</p>
                        </div>
                        <div className="border border-white/8 bg-white/[0.02] p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={12} className="text-violet-400" />
                                <span className="text-white/40 text-[7px] sm:text-[8px] font-body uppercase tracking-wider">Paid</span>
                            </div>
                            <p className="font-display text-violet-400 text-xl sm:text-2xl font-bold">{paidOrders}</p>
                        </div>
                        <div className="border border-white/8 bg-white/[0.02] p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Truck size={12} className="text-blue-400" />
                                <span className="text-white/40 text-[7px] sm:text-[8px] font-body uppercase tracking-wider">Shipped</span>
                            </div>
                            <p className="font-display text-blue-400 text-xl sm:text-2xl font-bold">{shippedOrders}</p>
                        </div>
                        <div className="border border-white/8 bg-white/[0.02] p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle size={12} className="text-emerald-400" />
                                <span className="text-white/40 text-[7px] sm:text-[8px] font-body uppercase tracking-wider">Delivered</span>
                            </div>
                            <p className="font-display text-emerald-400 text-xl sm:text-2xl font-bold">{deliveredOrders}</p>
                        </div>
                        <div className="border border-white/8 bg-white/[0.02] p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign size={12} className="text-emerald-400" />
                                <span className="text-white/40 text-[7px] sm:text-[8px] font-body uppercase tracking-wider">Revenue</span>
                            </div>
                            <p className="font-display text-emerald-400 text-xl sm:text-2xl font-bold">{totalRevenue.toFixed(0)} €</p>
                        </div>
                    </div>

                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <button onClick={previousMonth} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition">
                            <ChevronLeft size={18} className="text-white/60" />
                        </button>
                        <h2 className="font-display text-white text-xl sm:text-2xl font-light">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition">
                            <ChevronRight size={18} className="text-white/60" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="border border-white/8 bg-white/[0.02] overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-white/8">
                            {weekDays.map((day, i) => (
                                <div key={i} className="py-3 text-center">
                                    <span className="text-white/30 text-[8px] sm:text-[9px] font-body font-bold uppercase tracking-wider">{day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {days.map((date, i) => {
                                if (!date) {
                                    return <div key={i} className="min-h-[100px] sm:min-h-[120px] border border-white/5 bg-white/[0.01]" />;
                                }
                                const dateKey = formatDateKey(date);
                                const deliveries = calendarData[dateKey] || [];
                                const isToday = formatDateKey(date) === formatDateKey(new Date());
                                const hasDeliveries = deliveries.length > 0;
                                return (
                                    <motion.div
                                        key={i}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                        onClick={() => handleDateClick(date)}
                                        className={`calendar-day min-h-[100px] sm:min-h-[120px] border border-white/5 p-2 cursor-pointer transition-all ${isToday ? 'bg-white/5 border-white/20' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] sm:text-xs font-body font-bold ${isToday ? 'text-white' : 'text-white/40'}`}>{date.getDate()}</span>
                                            {hasDeliveries && <span className="text-[8px] font-body bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{deliveries.length}</span>}
                                        </div>
                                        {hasDeliveries && (
                                            <div className="space-y-1">
                                                {deliveries.slice(0, 2).map((order, idx) => (
                                                    <div key={idx} className="text-[8px] font-body text-white/50 truncate flex items-center gap-1">
                                                        <span className="text-white/30">#{order.id}</span>
                                                        <span>{order.customer?.split(' ')[0]}</span>
                                                    </div>
                                                ))}
                                                {deliveries.length > 2 && <div className="text-[7px] font-body text-white/30">+{deliveries.length - 2} more</div>}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 flex gap-3 justify-center">
                        <button onClick={() => navigate('/admin/orders')} className="font-body flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-violet-500/40 text-white/40 hover:text-violet-300 transition text-[8px] tracking-[0.25em] uppercase">
                            <Package size={10} /> Manage All Orders <ArrowRight size={9} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {showOrderModal && selectedOrders.length > 0 && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderModal(false)} className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto bg-black border border-white/10 rounded-2xl shadow-2xl">
                            <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2"><Truck size={18} className="text-emerald-400" /><h3 className="font-display text-white text-base font-bold">Deliveries for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3></div>
                                <button onClick={() => setShowOrderModal(false)} className="text-white/40 hover:text-white/80 transition"><XCircle size={18} /></button>
                            </div>
                            <div className="p-4 space-y-3">
                                {selectedOrders.map((order) => (
                                    <div key={order.id} className="border border-white/8 bg-white/[0.02] p-4 rounded-lg">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                            <div><p className="text-white/80 text-sm font-display font-bold">Order #{order.id}</p><p className="text-white/30 text-[10px] font-body">{order.customer}</p><p className="text-white/20 text-[8px] font-body mt-0.5">{order.email}</p></div>
                                            <div className="flex items-center gap-2">{getStatusBadge(order.status)}<span className="text-white/50 text-[10px] font-body">{order.amount?.toFixed(2)} €</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center justify-between">
                                            <div className="flex items-center gap-2 text-white/30 text-[9px] font-body"><Package size={10} /><span>{order.items} items</span></div>
                                            {getStatusActions(order)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Modal when no orders */}
            <AnimatePresence>
                {showOrderModal && selectedOrders.length === 0 && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderModal(false)} className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-black border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
                            <Package size={32} className="text-white/20 mx-auto mb-3" />
                            <h3 className="font-display text-white text-lg mb-1">No Deliveries</h3>
                            <p className="text-white/30 text-[10px] font-body">No deliveries scheduled for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <button onClick={() => setShowOrderModal(false)} className="mt-4 px-4 py-2 border border-white/20 text-white/40 hover:text-white/60 transition text-[8px] tracking-[0.2em] uppercase">Close</button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}