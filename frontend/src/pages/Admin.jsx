import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import {
    Plus, X, Package, ShoppingBag,
    Edit, Trash2, CheckCircle, AlertCircle,
    Shield, Users, Clock,
    Truck, Crown, Menu, Download, Printer, ChevronDown
} from 'lucide-react';
import { Minus, Plus as PlusIcon, AlertTriangle, XCircle } from 'lucide-react';

export default function Admin() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '', description: '', price: '', stock: '', imageUrl: '', category: ''
    });
    const [additionalImages, setAdditionalImages] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(null);

    // État pour suivre le nombre de commandes et détecter les nouvelles
    const [lastOrderCount, setLastOrderCount] = useState(0);
    const pollingInterval = useRef(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/admin/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Failed to load products', 'error');
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            const newOrdersCount = res.data.length;

            // Détecter les nouvelles commandes
            if (lastOrderCount > 0 && newOrdersCount > lastOrderCount) {
                const diff = newOrdersCount - lastOrderCount;
                showNotification(`📦 ${diff} nouvelle${diff > 1 ? 's' : ''} commande${diff > 1 ? 's' : ''} reçue${diff > 1 ? 's' : ''} !`, 'info');
            }

            setOrders(res.data);
            setLastOrderCount(newOrdersCount);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // Chargement initial et mise en place du polling
    useEffect(() => {
        const loadData = async () => {
            await fetchProducts();
            await fetchOrders();
        };
        loadData();

        // Polling toutes les 30 secondes pour vérifier les nouvelles commandes
        pollingInterval.current = setInterval(() => {
            fetchOrders();
        }, 30000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    const updateProductStock = async (productId, newStock) => {
        if (newStock < 0) return;
        try {
            await api.patch(`/admin/products/${productId}/stock`, { stock: newStock });
            await fetchProducts();
            showNotification(`Stock updated to ${newStock} units`, 'success');
        } catch (error) {
            console.error('Error updating stock:', error);
            showNotification('Failed to update stock', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
        try {
            let savedProduct;
            if (editProduct) {
                await api.put(`/admin/products/${editProduct.id}`, data);
                savedProduct = editProduct;
                showNotification(`Product "${form.name}" updated successfully!`, 'success');
            } else {
                const res = await api.post('/admin/products', data);
                savedProduct = res.data;
                showNotification(`Product "${form.name}" created successfully!`, 'success');
            }
            if (additionalImages.length > 0) {
                for (let i = 0; i < additionalImages.length; i++) {
                    await api.post(`/admin/products/${savedProduct.id}/images`, null, {
                        params: { imageUrl: additionalImages[i], orderIndex: i }
                    });
                }
                showNotification(`${additionalImages.length} additional image(s) uploaded!`, 'success');
            }
            setShowForm(false);
            setEditProduct(null);
            setForm({ name: '', description: '', price: '', stock: '', imageUrl: '', category: '' });
            setAdditionalImages([]);
            await fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            const errorMsg = error.response?.data?.error || error.message;
            showNotification(`Failed to save product: ${errorMsg}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (product) => {
        setEditProduct(product);
        setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            imageUrl: product.imageUrl || '',
            category: product.category || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification(`Editing product: ${product.name}`, 'info');
    };

    const handleDelete = async (id) => {
        const productName = products.find(p => p.id === id)?.name;
        if (window.confirm(`WARNING\n\nYou are about to delete "${productName}".\nThis action cannot be undone.\n\nAre you sure?`)) {
            try {
                await api.delete(`/admin/products/${id}`);
                await fetchProducts();
                showNotification(`Product "${productName}" deleted successfully!`, 'success');
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification(`Failed to delete product: ${error.response?.data?.error || error.message}`, 'error');
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showNotification('File is too large. Maximum size is 5MB.', 'error'); return; }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:8080/api/files/upload', { method: 'POST', body: formData });
            const data = await response.json();
            setForm(prev => ({ ...prev, imageUrl: data.url }));
            showNotification('Main image uploaded successfully!', 'success');
        } catch (err) {
            showNotification('Upload failed. Please try again.', 'error');
        }
    };

    const handleAdditionalImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        let successCount = 0, failCount = 0;
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch('http://localhost:8080/api/files/upload', { method: 'POST', body: formData });
                const data = await response.json();
                setAdditionalImages(prev => [...prev, data.url]);
                successCount++;
            } catch (err) { failCount++; }
        }
        if (successCount > 0) showNotification(`${successCount} image(s) uploaded successfully!`, 'success');
        if (failCount > 0) showNotification(`${failCount} image(s) failed to upload.`, 'error');
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        showNotification('Image removed from upload list', 'info');
    };

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
            showNotification('Invoice downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            showNotification('Failed to download invoice', 'error');
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
            showNotification('Failed to print invoice', 'error');
        } finally {
            setDownloadingInvoice(null);
        }
    };

    // ✅ CORRECTION ICI - Utiliser le bon endpoint /delivery-status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/admin/orders/${orderId}/delivery-status`, { status: newStatus });
            await fetchOrders();
            showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Failed to update order status', 'error');
        }
    };

    const getStockBadge = (stock) => {
        if (stock === 0) return { dot: 'bg-red-500', color: 'text-red-400', text: 'Out of stock' };
        if (stock <= 5) return { dot: 'bg-amber-400', color: 'text-amber-400', text: `${stock} left` };
        return { dot: 'bg-emerald-400', color: 'text-emerald-400', text: `${stock} units` };
    };

    const getStatusConfig = (status) => {
        switch(status) {
            case 'PAID':
                return { dot: 'bg-emerald-400', color: 'text-emerald-400', label: 'PAID', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle size={10} /> };
            case 'PENDING':
                return { dot: 'bg-amber-400', color: 'text-amber-400', label: 'PENDING', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Clock size={10} /> };
            case 'SHIPPED':
                return { dot: 'bg-blue-400', color: 'text-blue-400', label: 'SHIPPED', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Truck size={10} /> };
            case 'DELIVERED':
                return { dot: 'bg-purple-400', color: 'text-purple-400', label: 'DELIVERED', bg: 'bg-purple-500/10 border-purple-500/20', icon: <CheckCircle size={10} /> };
            case 'CANCELLED':
                return { dot: 'bg-rose-400', color: 'text-rose-400', label: 'CANCELLED', bg: 'bg-rose-500/10 border-rose-500/20', icon: <XCircle size={10} /> };
            default:
                return { dot: 'bg-white/20', color: 'text-white/30', label: status, bg: 'bg-white/5 border-white/10', icon: null };
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

    const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
                `}</style>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center border border-violet-500/20 bg-violet-500/5 p-8 sm:p-16 max-w-[90%] sm:max-w-md">
                    <div className="w-px h-8 sm:h-16 bg-violet-500/30 mx-auto mb-6 sm:mb-8" />
                    <Shield size={28} className="text-violet-400 mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-white text-xl sm:text-2xl mb-2" style={{ fontFamily: 'Space Grotesk', fontStyle: 'italic', fontWeight: 300 }}>Access Denied</h2>
                    <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase">Administrator privileges required</p>
                    <div className="w-px h-8 sm:h-16 bg-violet-500/30 mx-auto mt-6 sm:mt-8" />
                </motion.div>
            </div>
        );
    }

    const inputClass = "w-full px-0 py-2 sm:py-2.5 bg-transparent border-b border-white/12 outline-none focus:border-violet-500/50 text-white/70 placeholder-white/18 text-xs sm:text-sm transition-all duration-300";
    const labelClass = "text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.4em] uppercase text-violet-400/60 mb-2 block";

    const statusList = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <>
            <style>{`
             @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
             .font-display { font-family: 'Space Grotesk', sans-serif; }
             .font-body    { font-family: 'Inter', sans-serif; }
            .adm-row { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
            .adm-row:hover { background: rgba(139,92,246,0.04); }
            .adm-row:last-child { border-bottom: none; }
            @media (max-width: 768px) {
                .adm-table-header { display: none; }
                .adm-mobile-card { display: block; }
                .adm-desktop-row { display: none; }
            }
            @media (min-width: 769px) {
                .adm-mobile-card { display: none; }
                .adm-desktop-row { display: block; }
            }
            `}</style>

            <div className="adm-body min-h-screen bg-[#080808]">

                {/* NOTIFICATION */}
                <AnimatePresence>
                    {notification.show && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-[9998] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-medium border backdrop-blur-md ${
                                notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : notification.type === 'error' ? 'bg-red-950/40 border-red-500/30 text-red-300'
                                        : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                            }`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : notification.type === 'error' ? 'bg-red-400' : 'bg-violet-400'}`} />
                            <span className="flex-1">{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HEADER */}
                <div className="border-b border-white/8 bg-[#080808] sticky top-0 z-20 bg-[#080808]/95 backdrop-blur-sm overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500" />
                    <div className="absolute top-0 left-1/3 w-96 h-20 pointer-events-none"
                         style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
                    <div className="h-px w-full bg-white/10" />
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <p className="adm-body text-violet-400/60 text-[8px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-2 sm:mb-3">— Administration</p>
                                    <h1 className="adm-display text-white font-light italic" style={{ fontSize: 'clamp(28px, 6vw, 60px)', lineHeight: 1.2 }}>
                                        Admin Panel
                                    </h1>
                                </div>
                                <div className="hidden sm:flex items-center gap-6 pb-1">
                                    <div className="text-right">
                                        <p className="adm-body text-white/20 text-[8px] lg:text-[9px] tracking-[0.3em] lg:tracking-[0.4em] uppercase">Products</p>
                                        <p className="adm-display text-white text-2xl lg:text-3xl font-light">{products.length}</p>
                                    </div>
                                    <div className="w-px h-6 lg:h-8 bg-white/10" />
                                    <div className="text-right">
                                        <p className="adm-body text-white/20 text-[8px] lg:text-[9px] tracking-[0.3em] lg:tracking-[0.4em] uppercase">Orders</p>
                                        <p className="adm-display text-white text-2xl lg:text-3xl font-light">{orders.length}</p>
                                    </div>
                                </div>
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="sm:hidden flex items-center justify-between w-full border border-white/10 px-4 py-3 bg-white/5">
                                    <span className="adm-body text-white/40 text-[10px] tracking-[0.3em] uppercase">Menu</span>
                                    <Menu size={16} className="text-white/40" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="sm:hidden overflow-hidden border-b border-white/10 bg-[#0d0d14]">
                            <div className="px-4 py-4 flex justify-around">
                                <div className="text-center">
                                    <p className="adm-body text-white/20 text-[8px] tracking-[0.3em] uppercase">Products</p>
                                    <p className="adm-display text-white text-2xl font-light">{products.length}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <p className="adm-body text-white/20 text-[8px] tracking-[0.3em] uppercase">Orders</p>
                                    <p className="adm-display text-white text-2xl font-light">{orders.length}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">

                    {/* STOCK ALERT */}
                    {(lowStockCount > 0 || outOfStockCount > 0) && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border border-amber-500/30 bg-amber-500/8 px-4 sm:px-6 py-3 sm:py-4">
                            <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                            <div>
                                <p className="adm-body text-amber-300 text-[8px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-0.5">Stock Alert</p>
                                <p className="adm-body text-amber-400/60 text-[11px] sm:text-xs">
                                    {outOfStockCount > 0 && `${outOfStockCount} product(s) out of stock. `}
                                    {lowStockCount > 0 && `${lowStockCount} product(s) running low.`}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* TABS */}
                    <div className="flex gap-1 mb-6 sm:mb-8 lg:mb-10 border-b border-white/8 pb-0 overflow-x-auto scrollbar-hide">
                        {[
                            { key: 'products', label: 'Products', count: products.length, icon: <Package size={12} />, color: 'violet' },
                            { key: 'orders', label: 'Orders', count: orders.length, icon: <ShoppingBag size={12} />, color: 'pink' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`adm-body flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-all border-b-[1px] -mb-px whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? `text-${tab.color}-400 border-${tab.color}-400`
                                        : 'text-white/25 border-transparent hover:text-white/50'
                                }`}>
                                {tab.icon}
                                {tab.label}
                                <span className={`text-[7px] sm:text-[8px] lg:text-[9px] ${activeTab === tab.key ? `text-${tab.color}-400/60` : 'text-white/15'}`}>({tab.count})</span>
                            </button>
                        ))}
                    </div>

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                                <p className="adm-body text-white/30 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                                    {products.length} items in catalogue
                                </p>
                                <button
                                    onClick={() => {
                                        setShowForm(!showForm);
                                        setEditProduct(null);
                                        setForm({ name: '', description: '', price: '', stock: '', imageUrl: '', category: '' });
                                        setAdditionalImages([]);
                                        if (!showForm) showNotification('New product form opened', 'info');
                                    }}
                                    className={`adm-body flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase border transition-all ${
                                        showForm
                                            ? 'bg-white/5 border-white/20 text-white/50'
                                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                                    }`}>
                                    {showForm ? <X size={10} /> : <Plus size={10} />}
                                    {showForm ? 'Close Form' : 'Add Product'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showForm && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden mb-6 sm:mb-8 lg:mb-10">
                                        <div className="border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-4 sm:p-6 lg:p-8">
                                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8 pb-4 sm:pb-6 border-b border-white/8">
                                                <div className="w-px h-4 sm:h-5 bg-violet-400/30" />
                                                <p className="adm-display italic text-violet-400 text-sm sm:text-base lg:text-lg font-light">
                                                    {editProduct ? `Edit — ${editProduct.name}` : 'New Product'}
                                                </p>
                                            </div>
                                            <form onSubmit={handleSubmit}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-x-10 lg:gap-y-7 mb-4 sm:mb-6 lg:mb-7">
                                                    <div><label className={labelClass}>Product Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inputClass} placeholder="e.g. Sony WH-1000XM5" /></div>
                                                    <div><label className={labelClass}>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required className={inputClass} placeholder="e.g. Audio" /></div>
                                                    <div><label className={labelClass}>Price (€)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className={inputClass} placeholder="0.00" /></div>
                                                    <div><label className={labelClass}>Stock Units</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required className={inputClass} placeholder="0" /></div>
                                                </div>
                                                <div className="mb-4 sm:mb-6 lg:mb-7"><label className={labelClass}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass + ' resize-none'} placeholder="Product description..." /></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-x-10 lg:gap-y-7 mb-6 sm:mb-8">
                                                    <div>
                                                        <label className={labelClass}>Main Image</label>
                                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="adm-body w-full text-white/30 text-[10px] sm:text-xs py-2 border-b border-white/12 cursor-pointer file:mr-3 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:border file:border-white/15 file:text-white/40 file:bg-transparent file:text-[7px] sm:file:text-[8px] lg:file:text-[9px] file:tracking-widest file:uppercase file:cursor-pointer hover:file:border-violet-500/30 hover:file:text-violet-400 transition" />
                                                        {form.imageUrl && <div className="mt-3 relative w-12 h-12 sm:w-14 sm:h-14 border border-violet-500/20"><img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" /></div>}
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Additional Images</label>
                                                        <input type="file" accept="image/*" multiple onChange={handleAdditionalImageUpload} className="adm-body w-full text-white/30 text-[10px] sm:text-xs py-2 border-b border-white/12 cursor-pointer file:mr-3 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:border file:border-white/15 file:text-white/40 file:bg-transparent file:text-[7px] sm:file:text-[8px] lg:file:text-[9px] file:tracking-widest file:uppercase file:cursor-pointer hover:file:border-violet-500/30 hover:file:text-violet-400 transition" />
                                                        {additionalImages.length > 0 && (<div className="flex gap-2 flex-wrap mt-3">{additionalImages.map((img, idx) => (<div key={idx} className="relative"><div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 border border-violet-500/20 overflow-hidden"><img src={img} alt="additional" className="w-full h-full object-cover" /></div><button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute -top-1.5 -right-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-white text-black flex items-center justify-center"><X size={6} className="sm:w-2 sm:h-2" /></button></div>))}</div>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/8">
                                                    <button type="submit" disabled={submitting} className="adm-body bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase font-medium hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-40 flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-violet-500/20">
                                                        {submitting ? (<><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : (editProduct ? 'Save Changes' : 'Create Product')}
                                                    </button>
                                                    <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); }} className="adm-body text-white/30 hover:text-white/50 transition text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase w-full sm:w-auto">Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="border border-white/8">
                                <div className="hidden md:grid grid-cols-[48px_64px_1fr_100px_160px_120px_100px] gap-4 px-4 sm:px-6 py-3 border-b border-white/8 bg-white/[0.02]">
                                    {['ID', 'Img', 'Name', 'Price', 'Stock', 'Category', 'Actions'].map((h, i) => (<span key={i} className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.35em] uppercase">{h}</span>))}
                                </div>
                                {products.map((product, index) => {
                                    const stockBadge = getStockBadge(product.stock);
                                    return (
                                        <div key={product.id}>
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hidden md:grid adm-row grid-cols-[48px_64px_1fr_100px_160px_120px_100px] gap-4 px-4 sm:px-6 py-4 items-center">
                                                <span className="adm-body text-white/20 text-xs">#{product.id}</span>
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 border border-white/8 overflow-hidden shrink-0">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale-[20%]" /> : <div className="w-full h-full flex items-center justify-center bg-white/3"><Package size={12} className="text-white/15" /></div>}</div>
                                                <div><p className="adm-body text-white/70 text-xs sm:text-sm font-medium leading-tight">{product.name}</p><p className="adm-body text-white/20 text-[10px] sm:text-xs mt-0.5 line-clamp-1">{product.description}</p></div>
                                                <span className="adm-display text-white/60 text-sm sm:text-base font-light">{product.price}<span className="text-white/20 text-[10px] sm:text-xs ml-0.5">€</span></span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateProductStock(product.id, product.stock - 1)} className="w-5 h-5 sm:w-6 sm:h-6 border border-white/10 hover:border-violet-500/40 flex items-center justify-center text-white/30 hover:text-violet-400 transition"><Minus size={8} className="sm:w-2.5 sm:h-2.5" /></button>
                                                    <span className={`adm-body flex items-center gap-1 sm:gap-1.5 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase ${stockBadge.color}`}><span className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${stockBadge.dot}`} /><span className="hidden xs:inline">{stockBadge.text}</span><span className="xs:hidden">{stockBadge.text === `${product.stock} units` ? product.stock : stockBadge.text === 'Out of stock' ? 'Out' : stockBadge.text}</span></span>
                                                    <button onClick={() => updateProductStock(product.id, product.stock + 1)} className="w-5 h-5 sm:w-6 sm:h-6 border border-white/10 hover:border-violet-500/40 flex items-center justify-center text-white/30 hover:text-violet-400 transition"><PlusIcon size={8} className="sm:w-2.5 sm:h-2.5" /></button>
                                                </div>
                                                <span className="adm-body text-white/25 text-[10px] sm:text-xs tracking-wide">{product.category}</span>
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <button onClick={() => handleEdit(product)} className="w-7 h-7 sm:w-8 sm:h-8 border border-white/10 hover:border-violet-500/40 flex items-center justify-center text-white/25 hover:text-violet-400 transition"><Edit size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                                                    <button onClick={() => handleDelete(product.id)} className="w-7 h-7 sm:w-8 sm:h-8 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white/25 hover:text-red-400 transition"><Trash2 size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                                                </div>
                                            </motion.div>
                                            <div className="md:hidden border-b border-white/8 p-4">
                                                <div className="flex gap-3 mb-3"><div className="w-16 h-16 border border-white/8 overflow-hidden shrink-0">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-white/15" /></div>}</div><div className="flex-1"><p className="adm-body text-white/70 text-sm font-medium">{product.name}</p><p className="adm-body text-white/25 text-[10px] mt-0.5 line-clamp-2">{product.description}</p><div className="flex items-center justify-between mt-2"><span className="adm-display text-white/60 text-lg font-light">{product.price}<span className="text-white/20 text-[10px] ml-0.5">€</span></span><span className={`adm-body flex items-center gap-1 text-[7px] tracking-[0.2em] uppercase ${stockBadge.color}`}><span className={`w-0.5 h-0.5 rounded-full ${stockBadge.dot}`} />{stockBadge.text}</span></div></div></div>
                                                <div className="flex items-center justify-between pt-3 border-t border-white/8"><div className="flex items-center gap-2"><button onClick={() => updateProductStock(product.id, product.stock - 1)} className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/30"><Minus size={10} /></button><span className="adm-body text-white/40 text-xs">Stock: {product.stock}</span><button onClick={() => updateProductStock(product.id, product.stock + 1)} className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/30"><PlusIcon size={10} /></button></div><div className="flex items-center gap-2"><button onClick={() => handleEdit(product)} className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/25"><Edit size={10} /></button><button onClick={() => handleDelete(product.id)} className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/25"><Trash2 size={10} /></button></div></div>
                                                <div className="mt-2"><span className="adm-body text-white/25 text-[9px] tracking-wide">Category: {product.category}</span></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <p className="adm-body text-white/30 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase">{orders.length} orders total</p>
                            </div>

                            <div className="border border-white/8">
                                {/* Desktop table header */}
                                <div className="hidden md:grid grid-cols-[64px_1fr_120px_180px_130px_160px] gap-4 px-4 sm:px-6 py-3 border-b border-white/8 bg-white/[0.02]">
                                    <span className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">ID</span>
                                    <span className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">Customer</span>
                                    <span className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">Total</span>
                                    <span className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">Status</span>
                                    <span className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">Date</span>
                                    <span className="adm-body text-white/20 text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">Actions</span>
                                </div>

                                {orders.map((order, index) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    const orderDate = formatDate(order.createdAt);

                                    return (
                                        <div key={`order-${order.id}`}>
                                            {/* Desktop row */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="hidden md:grid adm-row grid-cols-[64px_1fr_120px_180px_130px_160px] gap-4 px-4 sm:px-6 py-4 items-center"
                                            >
                                                <span className="adm-body text-white/20 text-xs">#{order.id}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-white/10 flex items-center justify-center shrink-0">
                                                        <span className="adm-display italic text-white/30 text-[10px] sm:text-xs leading-none">
                                                            {order.user?.firstName?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <span className="adm-body text-white/60 text-xs sm:text-sm">
                                                        {order.user?.firstName} {order.user?.lastName}
                                                    </span>
                                                </div>
                                                <span className="adm-display text-white/60 text-sm sm:text-base font-light">
                                                    {order.totalAmount}<span className="text-white/20 text-[10px] sm:text-xs ml-0.5">€</span>
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`adm-body inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase border px-2 py-1 ${statusConfig.color} ${statusConfig.bg}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className="bg-transparent border border-white/10 text-white/40 text-[8px] sm:text-[9px] uppercase tracking-wider px-2 py-1 rounded hover:border-violet-500/40 focus:outline-none cursor-pointer"
                                                    >
                                                        {statusList.map(status => (
                                                            <option key={`status-${order.id}-${status}`} value={status} className="bg-black text-white/80">
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <span className="adm-body text-white/30 text-[10px] sm:text-xs flex items-center gap-1">
                                                    <Clock size={10} className="text-white/20" />
                                                    {orderDate}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                                        <>
                                                            <button onClick={() => downloadInvoice(order.id)} disabled={downloadingInvoice === order.id} className="p-1.5 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 transition disabled:opacity-50 rounded" title="Download Invoice">
                                                                {downloadingInvoice === order.id ? (<div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />) : (<Download size={10} />)}
                                                            </button>
                                                            <button onClick={() => printInvoice(order.id)} disabled={downloadingInvoice === order.id} className="p-1.5 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 transition disabled:opacity-50 rounded" title="Print Invoice">
                                                                <Printer size={10} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="text-white/30 text-[7px] uppercase tracking-wider hover:text-white/50 transition px-2 py-1">
                                                        {expandedOrderId === order.id ? 'Hide' : 'Details'}
                                                    </button>
                                                </div>
                                            </motion.div>

                                            {/* Mobile card view */}
                                            <div className="md:hidden border-b border-white/8 p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className="text-white/40 text-xs">Order #{order.id}</span>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Users size={10} className="text-white/30" />
                                                            <span className="text-white/60 text-xs">{order.user?.firstName} {order.user?.lastName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`inline-flex items-center gap-1 text-[7px] font-body uppercase tracking-wider border px-1.5 py-0.5 rounded ${statusConfig.color} ${statusConfig.bg}`}>
                                                            {statusConfig.icon}
                                                            {statusConfig.label}
                                                        </span>
                                                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="bg-transparent border border-white/10 text-white/40 text-[7px] uppercase tracking-wider px-1 py-0.5 rounded hover:border-violet-500/40">
                                                            {statusList.map(status => (<option key={`mobile-status-${order.id}-${status}`} value={status} className="bg-black">{status}</option>))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t border-white/8">
                                                    <div>
                                                        <p className="text-white/30 text-[7px] tracking-[0.2em] uppercase mb-1">Total</p>
                                                        <p className="adm-display text-white/60 text-base font-light">{order.totalAmount}<span className="text-white/20 text-[9px] ml-0.5">€</span></p>
                                                    </div>
                                                    <div>
                                                        <p className="text-white/30 text-[7px] tracking-[0.2em] uppercase mb-1">Date</p>
                                                        <p className="text-white/40 text-[10px] flex items-center gap-0.5"><Clock size={8} />{orderDate}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-white/8">
                                                    <div className="flex items-center gap-2">
                                                        {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                                            <>
                                                                <button onClick={() => downloadInvoice(order.id)} disabled={downloadingInvoice === order.id} className="p-1 text-white/40 hover:text-white/80 transition disabled:opacity-50">
                                                                    {downloadingInvoice === order.id ? (<div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />) : (<Download size={9} />)}
                                                                </button>
                                                                <button onClick={() => printInvoice(order.id)} disabled={downloadingInvoice === order.id} className="p-1 text-white/40 hover:text-white/80 transition disabled:opacity-50">
                                                                    <Printer size={9} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="text-white/30 text-[7px] uppercase tracking-wider flex items-center gap-1">
                                                        {expandedOrderId === order.id ? 'Hide Items' : 'View Items'}
                                                        <ChevronDown size={8} className={`transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </div>

                                                {expandedOrderId === order.id && order.items && order.items.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-white/8">
                                                        <p className="text-white/30 text-[6px] tracking-[0.3em] uppercase mb-2">Order Items</p>
                                                        {order.items.map((item, idx) => (
                                                            <div key={`item-${order.id}-${idx}`} className="flex justify-between items-center py-1.5 text-[9px]">
                                                                <span className="text-white/50">{item.productName} <span className="text-white/30">×{item.quantity}</span></span>
                                                                <span className="text-white/60">{(item.productPrice * item.quantity).toFixed(2)} €</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {orders.length === 0 && (
                                <div className="text-center py-12 sm:py-16 border border-white/8">
                                    <ShoppingBag size={24} className="sm:w-8 sm:h-8 text-white/10 mx-auto mb-2 sm:mb-3" />
                                    <p className="text-white/30 text-[10px] sm:text-xs">No orders found</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}