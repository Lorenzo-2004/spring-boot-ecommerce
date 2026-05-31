import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, ArrowLeft, DollarSign, CheckCircle,
    Clock, XCircle, Users, Package, Shield, ChevronDown,
    FileText, Download, Printer, TrendingUp, Truck
} from 'lucide-react';
import api from '../api/axiosConfig';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const ordersRes = await api.get('/admin/orders');
                setOrders(ordersRes.data);
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    const downloadInvoice = async (orderId) => {
        setDownloadingInvoice(orderId);
        try {
            const response = await api.get(`/admin/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `INVOICE_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice');
        } finally {
            setDownloadingInvoice(null);
        }
    };

    const printInvoice = async (orderId) => {
        setDownloadingInvoice(orderId);
        try {
            const response = await api.get(`/admin/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error printing invoice:', error);
            alert('Failed to print invoice');
        } finally {
            setDownloadingInvoice(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="border border-white/10 bg-white/[0.02] p-6 sm:p-8 text-center max-w-[90%] sm:max-w-md">
                    <Shield size={36} className="sm:w-12 sm:h-12 text-white/20 mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-white/70 text-xs sm:text-sm font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase">Access Denied</h2>
                    <p className="text-white/30 text-[10px] sm:text-xs mt-2">Administrator privileges required</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'PAID': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
            case 'PENDING': return 'border-amber-500/30 text-amber-400 bg-amber-500/5';
            case 'SHIPPED': return 'border-blue-500/30 text-blue-400 bg-blue-500/5';
            case 'DELIVERED': return 'border-purple-500/30 text-purple-400 bg-purple-500/5';
            case 'CANCELLED': return 'border-rose-500/30 text-rose-400 bg-rose-500/5';
            default: return 'border-white/20 text-white/40 bg-white/5';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'PAID': return <CheckCircle size={10} />;
            case 'PENDING': return <Clock size={10} />;
            case 'SHIPPED': return <Truck size={10} />;
            case 'DELIVERED': return <CheckCircle size={10} />;
            case 'CANCELLED': return <XCircle size={10} />;
            default: return null;
        }
    };

    const statusList = ['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    const statusCounts = {
        ALL: orders.length,
        PENDING: orders.filter(o => o.status === 'PENDING').length,
        PAID: orders.filter(o => o.status === 'PAID').length,
        SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
    };

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
                @media (max-width: 768px) {
                    .order-desktop-table { display: none; }
                    .order-mobile-card { display: block; }
                }
                @media (min-width: 769px) {
                    .order-desktop-table { display: table; }
                    .order-mobile-card { display: none; }
                }
            `}</style>

            <div className="grain font-body min-h-screen bg-black">

                <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                <div className="fixed top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                <div className="border-b border-white/8 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-white/30 hover:text-white/60 transition p-1"
                                >
                                    <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                                </button>
                                <div>
                                    <div className="inline-flex items-center gap-2 mb-1 sm:mb-2">
                                        <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">Orders</span>
                                    </div>
                                    <h1 className="font-display text-white text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight">
                                        All Orders
                                    </h1>
                                </div>
                            </div>

                            <div className="hidden sm:flex gap-2 flex-wrap">
                                {statusList.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 lg:px-4 py-1.5 text-[8px] lg:text-[9px] font-body font-medium tracking-[0.15em] lg:tracking-[0.2em] uppercase transition ${
                                            filter === status
                                                ? 'bg-white text-black'
                                                : 'text-white/40 hover:text-white/70 border border-white/10'
                                        }`}
                                    >
                                        {status}
                                        <span className="ml-1 text-[7px] lg:text-[8px] opacity-60">({statusCounts[status]})</span>
                                    </button>
                                ))}
                            </div>

                            <div className="sm:hidden relative">
                                <button
                                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                    className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-white/10 text-white/60 text-[9px] font-body tracking-[0.2em] uppercase"
                                >
                                    Filter: {filter}
                                    <ChevronDown size={12} className={`transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileFilterOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white/10 z-10">
                                        {statusList.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setFilter(status);
                                                    setMobileFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-[9px] font-body transition ${
                                                    filter === status
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-white/40 hover:bg-white/5'
                                                }`}
                                            >
                                                {status} ({statusCounts[status]})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
                    {loading ? (
                        <div className="flex justify-center items-center h-48 sm:h-64">
                            <div className="relative">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 border border-white/10 rounded-full" />
                                <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-t border-white/60 rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : (
                        <div className="border border-white/8 overflow-x-auto">

                            {/* DESKTOP TABLE */}
                            <table className="order-desktop-table w-full">
                                <thead className="bg-white/[0.02] border-b border-white/8">
                                <tr>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Items</th>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Status</th>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Date</th>
                                    <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Invoice</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredOrders.map((order, i) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-b border-white/8 hover:bg-white/[0.02] transition"
                                    >
                                        <td className="px-4 lg:px-5 py-3 sm:py-4 text-white/50 text-xs sm:text-sm font-body">#{order.id}</td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4 text-white/70 text-xs sm:text-sm font-body flex items-center gap-1.5 sm:gap-2">
                                            <Users size={10} className="sm:w-3 sm:h-3 text-white/30" />
                                            {order.user?.firstName} {order.user?.lastName}
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4 text-white/50 text-xs sm:text-sm">{order.items?.length || 0} products</td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4 text-white/80 text-xs sm:text-sm font-body">
                                            <DollarSign size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                                            {order.totalAmount?.toFixed(2)} €
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4">
                                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] lg:text-[10px] font-body uppercase tracking-wider border px-1.5 sm:px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4 text-white/40 text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
                                            <Clock size={8} className="sm:w-2.5 sm:h-2.5" />
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4">
                                            {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => downloadInvoice(order.id)}
                                                        disabled={downloadingInvoice === order.id}
                                                        className="p-1.5 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 transition disabled:opacity-50 rounded"
                                                        title="Download Invoice"
                                                    >
                                                        {downloadingInvoice === order.id ? (
                                                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <Download size={12} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => printInvoice(order.id)}
                                                        disabled={downloadingInvoice === order.id}
                                                        className="p-1.5 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 transition disabled:opacity-50 rounded"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer size={12} />
                                                    </button>
                                                </div>
                                            )}
                                            {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                                                <span className="text-white/20 text-[8px] uppercase">Not available</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                                </tbody>
                            </table>

                            {/* MOBILE CARDS */}
                            <div className="order-mobile-card">
                                {filteredOrders.map((order, i) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-b border-white/8 p-4"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <span className="text-white/50 text-xs font-body">Order #{order.id}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Users size={10} className="text-white/30" />
                                                    <span className="text-white/60 text-xs">
                                                        {order.user?.firstName} {order.user?.lastName}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 text-[8px] font-body uppercase tracking-wider border px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t border-white/8">
                                            <div>
                                                <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase mb-1">Items</p>
                                                <p className="text-white/50 text-xs">{order.items?.length || 0} products</p>
                                            </div>
                                            <div>
                                                <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase mb-1">Amount</p>
                                                <p className="text-white/70 text-xs font-body">
                                                    <DollarSign size={10} className="inline mr-0.5" />
                                                    {order.totalAmount?.toFixed(2)} €
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/8">
                                            <div className="flex items-center gap-1 text-white/30 text-[8px]">
                                                <Clock size={8} />
                                                {formatDate(order.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                                    <>
                                                        <button
                                                            onClick={() => downloadInvoice(order.id)}
                                                            disabled={downloadingInvoice === order.id}
                                                            className="p-1.5 text-white/40 hover:text-white/80 transition disabled:opacity-50"
                                                            title="Download Invoice"
                                                        >
                                                            {downloadingInvoice === order.id ? (
                                                                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : (
                                                                <Download size={12} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => printInvoice(order.id)}
                                                            disabled={downloadingInvoice === order.id}
                                                            className="p-1.5 text-white/40 hover:text-white/80 transition disabled:opacity-50"
                                                            title="Print Invoice"
                                                        >
                                                            <Printer size={12} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    className="text-white/30 text-[8px] tracking-[0.2em] uppercase flex items-center gap-1"
                                                >
                                                    {expandedOrder === order.id ? 'Show Less' : 'View Items'}
                                                    <ChevronDown size={10} className={`transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedOrder === order.id && order.items && order.items.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 pt-3 border-t border-white/8"
                                            >
                                                <p className="text-white/30 text-[7px] tracking-[0.3em] uppercase mb-2">Order Items</p>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center py-1.5 text-[10px]">
                                                        <span className="text-white/50">
                                                            {item.productName} <span className="text-white/30">×{item.quantity}</span>
                                                        </span>
                                                        <span className="text-white/60">
                                                            {(item.productPrice * item.quantity).toFixed(2)} €
                                                        </span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {filteredOrders.length === 0 && (
                                <div className="text-center py-12 sm:py-16">
                                    <ShoppingBag size={24} className="sm:w-8 sm:h-8 text-white/10 mx-auto mb-2 sm:mb-3" />
                                    <p className="text-white/30 text-[10px] sm:text-xs">No orders found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}