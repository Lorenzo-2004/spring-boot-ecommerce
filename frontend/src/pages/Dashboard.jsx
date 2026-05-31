import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    ShoppingBag, Users, Package, TrendingUp,
    DollarSign, Clock, CheckCircle, XCircle,
    Shield, ArrowRight, AlertCircle,
    Box, AlertTriangle, Loader2, ChevronDown, Menu, X, Truck
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCustomer, setExpandedCustomer] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ordersRes, productsRes, usersRes] = await Promise.all([
                    api.get('/admin/orders'),
                    api.get('/admin/products'),
                    api.get('/admin/users').catch(() => ({ data: [] })),
                ]);
                setOrders(ordersRes.data);
                setProducts(productsRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
                    .font-display { font-family: 'Space Grotesk', sans-serif; }
                    .font-body { font-family: 'Inter', sans-serif; }
                `}</style>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center border border-white/10 bg-white/[0.02] p-8 sm:p-12 max-w-[90%] sm:max-w-md">
                    <div className="w-px h-8 sm:h-16 bg-white/20 mx-auto mb-6 sm:mb-8" />
                    <Shield size={32} className="text-white/30 mx-auto mb-3 sm:mb-4" />
                    <h2 className="font-display text-white text-xl sm:text-2xl font-light italic mb-2">Access Denied</h2>
                    <p className="font-body text-white/30 text-[10px] sm:text-xs tracking-[0.2em] uppercase">Administrator privileges required</p>
                    <div className="w-px h-8 sm:h-16 bg-white/20 mx-auto mt-6 sm:mt-8" />
                </motion.div>
            </div>
        );
    }

    const customerOrders = users.map(customer => ({
        ...customer,
        orders: orders.filter(order => order.user?.id === customer.id),
        totalSpent: orders.filter(order => order.user?.id === customer.id &&
            (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED')).reduce((sum, order) => sum + order.totalAmount, 0),
        orderCount: orders.filter(order => order.user?.id === customer.id).length,
        lastOrderDate: orders.filter(order => order.user?.id === customer.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt
    })).filter(c => c.orderCount > 0);

    // Statistiques des commandes avec SHIPPED et DELIVERED
    const totalRevenue = orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0);
    const paidOrders = orders.filter(o => o.status === 'PAID').length;
    const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    const revenueByDay = orders
        .filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
        .reduce((acc, o) => {
            const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const existing = acc.find(a => a.date === date);
            if (existing) existing.revenue += o.totalAmount;
            else acc.push({ date, revenue: o.totalAmount });
            return acc;
        }, []).slice(-7);

    const pieData = [
        { name: 'Paid', value: paidOrders, color: '#f59e0b' },
        { name: 'Shipped', value: shippedOrders, color: '#3b82f6' },
        { name: 'Delivered', value: deliveredOrders, color: '#10b981' },
        { name: 'Pending', value: pendingOrders, color: '#8b5cf6' },
        { name: 'Cancelled', value: cancelledOrders, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const stats = [
        {
            label: 'Total Revenue', value: `${totalRevenue.toFixed(2)}`, unit: '€',
            icon: <DollarSign size={18} />, sub: `${paidOrders + shippedOrders + deliveredOrders} completed orders`,
            gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30',
            iconColor: 'text-emerald-400', glow: 'shadow-emerald-500/10'
        },
        {
            label: 'Total Orders', value: orders.length, unit: '',
            icon: <ShoppingBag size={18} />, sub: `${pendingOrders} pending`,
            gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30',
            iconColor: 'text-violet-400', glow: 'shadow-violet-500/10'
        },
        {
            label: 'Active Customers', value: customerOrders.length, unit: '',
            icon: <Users size={18} />, sub: `${users.length} registered`,
            gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30',
            iconColor: 'text-pink-400', glow: 'shadow-pink-500/10'
        },
        {
            label: 'Inventory Value', value: `${totalStockValue.toFixed(0)}`, unit: '€',
            icon: <Box size={18} />, sub: `${products.length} products`,
            gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30',
            iconColor: 'text-blue-400', glow: 'shadow-blue-500/10'
        },
    ];

    const getStatusCfg = (status) => ({
        PAID:      { dot: 'bg-amber-400', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        PENDING:   { dot: 'bg-violet-400', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
        SHIPPED:   { dot: 'bg-blue-400', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        DELIVERED: { dot: 'bg-emerald-400', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        CANCELLED: { dot: 'bg-red-400', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    }[status] || { dot: 'bg-white/20', color: 'text-white/30', bg: 'bg-white/5 border-white/10' });

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <div className="absolute inset-0 border border-white/10 rounded-full" />
                        <div className="absolute inset-0 border-t border-white/60 rounded-full animate-spin" />
                    </div>
                    <span className="text-white/30 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase font-body">Loading</span>
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
                .db-row { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
                .db-row:hover { background: rgba(139,92,246,0.04); }
                .db-row:last-child { border-bottom: none; }
                .db-card { border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); transition: border-color 0.2s, background 0.2s; }
                .db-card:hover { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.03); }
                .recharts-cartesian-grid line { stroke: rgba(255,255,255,0.04); }
                .recharts-text { fill: rgba(255,255,255,0.25) !important; font-family: 'Inter', sans-serif; font-size: 10px; }
                @media (max-width: 640px) {
                    .recharts-text { font-size: 8px !important; }
                }
            `}</style>

            <div className="db-body min-h-screen bg-black">

                {/* HEADER */}
                <div className="border-b border-white/8 sticky top-0 bg-black/95 backdrop-blur-sm z-20 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500" />
                    <div className="absolute top-0 left-1/3 w-96 h-20 pointer-events-none"
                         style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />

                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <p className="font-body text-violet-400/60 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-2 sm:mb-3">— Analytics</p>
                                    <h1 className="font-display text-white font-light italic text-[clamp(28px,6vw,60px)] leading-tight">
                                        Dashboard & Analytics
                                    </h1>
                                </div>

                                <div className="hidden sm:flex items-center gap-3">
                                    <button onClick={() => navigate('/admin/stock')}
                                            className="font-body flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 border border-white/10 hover:border-violet-500/40 text-white/40 hover:text-violet-300 transition text-[8px] lg:text-[9px] tracking-[0.25em] uppercase">
                                        <Package size={10} />
                                        <span className="hidden lg:inline">Stock</span>
                                        <ArrowRight size={9} />
                                    </button>
                                    <button onClick={() => navigate('/admin/orders')}
                                            className="font-body flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition text-[8px] lg:text-[9px] tracking-[0.25em] uppercase shadow-lg shadow-violet-500/20">
                                        <ShoppingBag size={10} />
                                        <span className="hidden lg:inline">All Orders</span>
                                        <ArrowRight size={9} />
                                    </button>
                                </div>

                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="sm:hidden flex items-center justify-between w-full border border-white/10 px-4 py-3 bg-white/5">
                                    <span className="font-body text-white/40 text-[10px] tracking-[0.3em] uppercase">Menu</span>
                                    {mobileMenuOpen ? <X size={16} className="text-white/40" /> : <Menu size={16} className="text-white/40" />}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Mobile menu dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="sm:hidden overflow-hidden border-b border-white/10 bg-[#0d0d14]">
                            <div className="px-4 py-4 space-y-3">
                                <button onClick={() => { navigate('/admin/stock'); setMobileMenuOpen(false); }}
                                        className="w-full flex items-center justify-between px-4 py-3 border border-violet-500/20 hover:border-violet-500/40 transition">
                                    <span className="font-body text-violet-300 text-xs">Manage Stock</span>
                                    <Package size={14} className="text-violet-400" />
                                </button>
                                <button onClick={() => { navigate('/admin/orders'); setMobileMenuOpen(false); }}
                                        className="w-full flex items-center justify-between px-4 py-3 border border-pink-500/20 hover:border-pink-500/40 transition">
                                    <span className="font-body text-pink-300 text-xs">All Orders</span>
                                    <ShoppingBag size={14} className="text-pink-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">

                    {/* STOCK ALERT */}
                    {(lowStockProducts > 0 || outOfStockProducts > 0) && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/8 px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                                <div>
                                    <p className="font-body text-amber-300 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-0.5">Stock Alert</p>
                                    <p className="font-body text-amber-400/60 text-[11px] sm:text-xs">
                                        {outOfStockProducts > 0 && `${outOfStockProducts} product(s) out of stock. `}
                                        {lowStockProducts > 0 && `${lowStockProducts} product(s) running low.`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/admin/stock')}
                                    className="font-body text-amber-400/60 hover:text-amber-300 transition text-[8px] sm:text-[9px] tracking-[0.2em] uppercase flex items-center gap-1.5">
                                Manage <ArrowRight size={8} />
                            </button>
                        </motion.div>
                    )}

                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {stats.map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className={`relative overflow-hidden border ${stat.border} bg-gradient-to-br ${stat.gradient} p-4 sm:p-5 lg:p-7 group cursor-pointer shadow-lg ${stat.glow}`}
                                        onClick={() => stat.label === 'Inventory Value' && navigate('/admin/stock')}>
                                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-30"
                                     style={{ background: `radial-gradient(circle, ${stat.iconColor.replace('text-', '').replace('-400', '')} 0%, transparent 70%)` }} />
                                <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                                    <span className="font-body text-white/30 text-[7px] sm:text-[8px] tracking-[0.25em] uppercase">{stat.label}</span>
                                    <span className={`${stat.iconColor} opacity-60 group-hover:opacity-100 transition`}>{stat.icon}</span>
                                </div>
                                <p className="font-display text-white font-light text-[clamp(24px,5vw,40px)] leading-tight">
                                    {stat.value}{stat.unit && <span className="text-white/30 text-base sm:text-lg ml-0.5">{stat.unit}</span>}
                                </p>
                                <p className={`font-body text-[9px] mt-1 sm:mt-2 ${stat.iconColor} opacity-60`}>{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CHARTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="lg:col-span-2 border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-7 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 lg:mb-7">
                                <div>
                                    <p className="font-body text-violet-400/50 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-1">Revenue</p>
                                    <p className="font-display text-white text-xl sm:text-2xl font-light italic">Last 7 Days</p>
                                </div>
                                <TrendingUp size={14} className="text-violet-400/40" />
                            </div>
                            {revenueByDay.length === 0 ? (
                                <div className="flex items-center justify-center h-40 sm:h-48">
                                    <p className="font-body text-white/15 text-[10px] sm:text-xs tracking-widest uppercase text-center px-4">No revenue data yet</p>
                                </div>
                            ) : (
                                <div className="w-full h-40 sm:h-48 lg:h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="rgba(139,92,246,0.3)" />
                                                    <stop offset="95%" stopColor="rgba(139,92,246,0)" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)', fontFamily: 'Inter', letterSpacing: '0.1em' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Inter' }} />
                                            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 0, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter', fontSize: 10 }} cursor={{ stroke: 'rgba(139,92,246,0.2)', strokeWidth: 1 }} formatter={(value) => [`${value.toFixed(2)} €`, 'Revenue']} />
                                            <Area type="monotone" dataKey="revenue" stroke="rgba(139,92,246,0.7)" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-7 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                            <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-7">
                                <div>
                                    <p className="font-body text-pink-400/50 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-1">Distribution</p>
                                    <p className="font-display text-white text-xl sm:text-2xl font-light italic">Order Status</p>
                                </div>
                            </div>
                            {pieData.length === 0 ? (
                                <div className="flex items-center justify-center h-40 sm:h-48">
                                    <p className="font-body text-white/15 text-[10px] sm:text-xs tracking-widest uppercase text-center px-4">No orders yet</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-full h-32 sm:h-36 lg:h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter', fontSize: 10 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 sm:mt-5 lg:mt-6 space-y-2 sm:space-y-3">
                                        {[
                                            { label: 'Paid', value: paidOrders, color: 'text-amber-400', dot: 'bg-amber-400' },
                                            { label: 'Shipped', value: shippedOrders, color: 'text-blue-400', dot: 'bg-blue-400' },
                                            { label: 'Delivered', value: deliveredOrders, color: 'text-emerald-400', dot: 'bg-emerald-400' },
                                            { label: 'Pending', value: pendingOrders, color: 'text-violet-400', dot: 'bg-violet-400' },
                                            { label: 'Cancelled', value: cancelledOrders, color: 'text-red-400', dot: 'bg-red-400' },
                                        ].filter(d => d.value > 0).map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <span className={`w-1 h-1 rounded-full ${item.dot}`} />
                                                    <span className="font-body text-white/40 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase">{item.label}</span>
                                                </div>
                                                <span className={`font-display text-lg sm:text-xl font-light ${item.color}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* CUSTOMER ORDERS */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 lg:mb-6 pb-3 sm:pb-4 border-b border-white/8">
                            <div>
                                <p className="font-body text-pink-400/50 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-1">— Customers</p>
                                <h2 className="font-display text-white text-xl sm:text-2xl font-light italic">Order History</h2>
                            </div>
                            <span className="font-body text-white/20 text-[10px] sm:text-xs">{customerOrders.length} active customers</span>
                        </div>
                        <div className="border border-white/8 overflow-x-auto">
                            <div className="hidden md:grid grid-cols-[1fr_120px_80px_120px_32px] gap-4 px-4 sm:px-6 py-3 border-b border-white/8 bg-white/[0.02]">
                                {['Customer', 'Total Spent', 'Orders', 'Last Order', ''].map((h, i) => (
                                    <span key={i} className="font-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">{h}</span>
                                ))}
                            </div>
                            {customerOrders.length === 0 ? (
                                <div className="py-12 sm:py-16 text-center">
                                    <p className="font-body text-white/15 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">No customers with orders yet</p>
                                </div>
                            ) : customerOrders.map((customer, idx) => (
                                <div key={customer.id}>
                                    {/* Mobile view */}
                                    <div className="md:hidden border-b border-white/8 p-4">
                                        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-violet-500/30 to-pink-500/30 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                    <span className="font-display italic text-violet-300 text-sm leading-none">
                                                        {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-body text-white/70 text-sm">{customer.firstName} {customer.lastName}</p>
                                                    <p className="font-body text-white/20 text-[10px]">{customer.email}</p>
                                                </div>
                                            </div>
                                            <motion.div animate={{ rotate: expandedCustomer === customer.id ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                                <ChevronDown size={14} className="text-white/20" />
                                            </motion.div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-body text-white/20 text-[8px] tracking-[0.3em] uppercase">Total spent</p>
                                                <p className="font-display text-emerald-400 text-lg font-light">{customer.totalSpent.toFixed(2)}€</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-body text-white/20 text-[8px] tracking-[0.3em] uppercase">Orders</p>
                                                <p className="font-body text-white/40 text-sm">{customer.orderCount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop row */}
                                    <div className="hidden md:block">
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                                                    className="db-row grid grid-cols-[1fr_120px_80px_120px_32px] gap-4 px-4 sm:px-6 py-3 sm:py-4 items-center cursor-pointer"
                                                    onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                    <span className="font-display italic text-violet-300 text-sm leading-none">
                                                        {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-body text-white/70 text-sm">{customer.firstName} {customer.lastName}</p>
                                                    <p className="font-body text-white/20 text-[10px]">{customer.email}</p>
                                                </div>
                                            </div>
                                            <span className="font-display text-emerald-400 text-base sm:text-lg font-light">
                                                {customer.totalSpent.toFixed(2)}<span className="text-emerald-400/40 text-[10px] ml-0.5">€</span>
                                            </span>
                                            <span className="font-body text-white/40 text-sm">{customer.orderCount}</span>
                                            <span className="font-body text-white/20 text-[10px] sm:text-xs">
                                                {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('en-US') : '—'}
                                            </span>
                                            <motion.div animate={{ rotate: expandedCustomer === customer.id ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                                <ChevronDown size={13} className="text-white/20" />
                                            </motion.div>
                                        </motion.div>
                                    </div>

                                    {/* Expanded orders */}
                                    <AnimatePresence>
                                        {expandedCustomer === customer.id && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                                        className="overflow-hidden border-t border-violet-500/10 bg-violet-500/3">
                                                <div className="px-3 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
                                                    <p className="font-body text-violet-400/50 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-2 sm:mb-4">
                                                        Order History — {customer.orderCount} orders
                                                    </p>
                                                    {customer.orders.map((order) => {
                                                        const cfg = getStatusCfg(order.status);
                                                        return (
                                                            <div key={order.id} className="border border-white/7 bg-white/[0.01] p-3 sm:p-5">
                                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 sm:mb-4">
                                                                    <div>
                                                                        <p className="font-body text-white/50 text-xs sm:text-sm">Order #{order.id}</p>
                                                                        <p className="font-body text-white/20 text-[8px] sm:text-[10px] mt-1">
                                                                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-left sm:text-right">
                                                                        <p className="font-display text-white/70 text-xl sm:text-2xl font-light">
                                                                            {order.totalAmount?.toFixed(2)}<span className="text-white/25 text-xs sm:text-sm ml-0.5">€</span>
                                                                        </p>
                                                                        <span className={`font-body inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase mt-1 ${cfg.color} ${cfg.bg} border px-2 py-0.5`}>
                                                                            <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />{order.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {order.items && order.items.length > 0 && (
                                                                    <div className="border-t border-white/5 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                                                                        <p className="font-body text-white/15 text-[7px] sm:text-[8px] tracking-[0.25em] uppercase mb-2 sm:mb-3">Items</p>
                                                                        {order.items.map((item, j) => (
                                                                            <div key={j} className="flex justify-between">
                                                                                <span className="font-body text-white/35 text-[10px] sm:text-xs">
                                                                                    {item.productName} <span className="text-white/20">×{item.quantity}</span>
                                                                                </span>
                                                                                <span className="font-body text-white/40 text-[10px] sm:text-xs">
                                                                                    {(item.productPrice * item.quantity).toFixed(2)} €
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="border-t border-white/5 pt-3 sm:pt-4 mt-3 sm:mt-4 flex justify-end">
                                                                    <button onClick={() => navigate('/admin/orders')}
                                                                            className="font-body text-white/20 hover:text-violet-300 transition text-[8px] sm:text-[9px] tracking-[0.2em] uppercase flex items-center gap-1">
                                                                        View Details <ArrowRight size={8} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PRODUCTS OVERVIEW */}
                    <div className="pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 lg:mb-6 pb-3 sm:pb-4 border-b border-white/8">
                            <div>
                                <p className="font-body text-blue-400/50 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-1">— Catalogue</p>
                                <h2 className="font-display text-white text-xl sm:text-2xl font-light italic">Products Overview</h2>
                            </div>
                            <button onClick={() => navigate('/admin/stock')}
                                    className="font-body text-white/25 hover:text-blue-300 transition text-[8px] sm:text-[9px] tracking-[0.2em] uppercase flex items-center gap-1">
                                Manage Stock <ArrowRight size={8} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {products.slice(0, 4).map((product, i) => {
                                const stockCfg = product.stock > 10
                                    ? { dot: 'bg-emerald-400', color: 'text-emerald-400', text: `${product.stock} in stock`, border: 'border-emerald-500/20', bg: 'bg-emerald-500/8' }
                                    : product.stock > 0
                                        ? { dot: 'bg-amber-400', color: 'text-amber-400', text: `Low: ${product.stock}`, border: 'border-amber-500/20', bg: 'bg-amber-500/8' }
                                        : { dot: 'bg-red-400', color: 'text-red-400', text: 'Out of stock', border: 'border-red-500/20', bg: 'bg-red-500/8' };
                                return (
                                    <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                                                className="border border-white/8 bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/3 transition cursor-pointer group"
                                                onClick={() => navigate('/admin/stock')}>
                                        <div className="aspect-video overflow-hidden border-b border-white/5 bg-white/[0.01] flex items-center justify-center">
                                            {product.imageUrl
                                                ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                : <Package size={20} className="text-white/10" />
                                            }
                                        </div>
                                        <div className="p-3 sm:p-4 lg:p-5">
                                            <p className="font-body text-white/60 text-xs sm:text-sm font-medium truncate mb-2 group-hover:text-white/80 transition">{product.name}</p>
                                            <div className="flex items-center justify-between mt-2 sm:mt-3">
                                                <span className="font-display text-white/70 text-base sm:text-xl font-light">
                                                    {product.price}<span className="text-white/25 text-[10px] sm:text-xs ml-0.5">€</span>
                                                </span>
                                                <span className={`font-body flex items-center gap-1.5 text-[7px] sm:text-[8px] tracking-[0.15em] uppercase border px-2 py-0.5 ${stockCfg.color} ${stockCfg.border} ${stockCfg.bg}`}>
                                                    <span className={`w-1 h-1 rounded-full ${stockCfg.dot}`} />
                                                    <span className="hidden xs:inline">{stockCfg.text}</span>
                                                    <span className="xs:hidden">{stockCfg.text === 'Out of stock' ? 'Out' : stockCfg.text === `${product.stock} in stock` ? `${product.stock}` : stockCfg.text}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}