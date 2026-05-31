import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Package, ArrowLeft, Search, AlertCircle, CheckCircle,
    TrendingUp, Edit, Save, X, Plus, Minus, Trash2, Shield, ChevronDown
} from 'lucide-react';
import api from '../api/axiosConfig';

export default function AdminStock() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState(null);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            setError('Failed to load products: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async (id, newStock) => {
        if (newStock < 0) return;
        setError(null);
        try {
            await api.patch(`/admin/products/${id}/stock`, { stock: newStock });
            await loadProducts();
            setEditingId(null);
        } catch (error) {
            setError('Failed to update stock: ' + (error.response?.data?.message || error.message));
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setError(null);
        try {
            await api.delete(`/admin/products/${id}`);
            await loadProducts();
        } catch (error) {
            setError('Failed to delete product: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = products.filter(p => p.stock <= 10 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
                <div className="border border-white/10 bg-white/[0.02] p-6 sm:p-8 text-center max-w-[90%] sm:max-w-md">
                    <Shield size={36} className="text-white/20 mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-white/70 text-xs sm:text-sm font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase">Access Denied</h2>
                    <p className="text-white/30 text-[10px] sm:text-xs mt-2">Administrator privileges required</p>
                </div>
            </div>
        );
    }

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
                @media (max-width: 768px) {
                    .stock-desktop-table { display: none; }
                    .stock-mobile-card { display: block; }
                }
                @media (min-width: 769px) {
                    .stock-desktop-table { display: table; }
                    .stock-mobile-card { display: none; }
                }
                .full-width-table {
                    width: 100%;
                    min-width: 800px;
                }
                .full-width-table th,
                .full-width-table td {
                    white-space: nowrap;
                }
                .table-container {
                    overflow-x: auto;
                    width: 100%;
                }
            `}</style>

            <div className="grain font-body min-h-screen bg-[#080808]">

                <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                <div className="fixed top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                {/* Header - Pleine largeur */}
                <div className="border-b border-white/8 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="w-full px-4 sm:px-6 lg:px-10">
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
                                        <Package size={12} className="text-white/30" />
                                        <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">Inventory</span>
                                    </div>
                                    <h1 className="font-display text-white text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight">
                                        Stock Management
                                    </h1>
                                </div>
                            </div>
                            <button
                                onClick={loadProducts}
                                className="text-white/40 hover:text-white/70 text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 transition flex items-center gap-1.5 sm:gap-2 self-start sm:self-center"
                            >
                                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">

                    {error && (
                        <div className="mb-5 sm:mb-6 p-2.5 sm:p-3 border-l border-red-500/50 bg-red-500/5 text-red-300 text-[10px] sm:text-xs font-body">
                            {error}
                        </div>
                    )}

                    {(lowStockCount > 0 || outOfStockCount > 0) && (
                        <div className="mb-5 sm:mb-6 p-2.5 sm:p-3 border-l border-amber-500/50 bg-amber-500/5 text-amber-300 text-[10px] sm:text-xs font-body flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5 text-amber-400" />
                                <span>
                                    {outOfStockCount > 0 && `${outOfStockCount} product(s) out of stock. `}
                                    {lowStockCount > 0 && `${lowStockCount} product(s) running low.`}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards - Pleine largeur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8 w-full">
                        <div className="border border-white/8 bg-white/[0.02] p-4 sm:p-5">
                            <p className="text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1">Total Products</p>
                            <p className="font-display text-white text-2xl sm:text-3xl font-light">{products.length}</p>
                        </div>
                        <div className="border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
                            <p className="text-amber-400/80 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1 flex items-center gap-0.5 sm:gap-1">
                                <AlertCircle size={8} className="sm:w-2.5 sm:h-2.5" /> Low Stock (≤10)
                            </p>
                            <p className="font-display text-amber-400 text-2xl sm:text-3xl font-light">{lowStockCount}</p>
                        </div>
                        <div className="border border-red-500/20 bg-red-500/5 p-4 sm:p-5">
                            <p className="text-red-400/80 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1 flex items-center gap-0.5 sm:gap-1">
                                <X size={8} className="sm:w-2.5 sm:h-2.5" /> Out of Stock
                            </p>
                            <p className="font-display text-red-400 text-2xl sm:text-3xl font-light">{outOfStockCount}</p>
                        </div>
                    </div>

                    {/* Search - Pleine largeur */}
                    <div className="relative mb-5 sm:mb-6 w-full">
                        <Search size={12} className="sm:w-3.5 sm:h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 text-white/80 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition"
                        />
                    </div>

                    {/* Products Table - Desktop Pleine largeur */}
                    <div className="stock-desktop-table border border-white/8 w-full table-container">
                        <table className="full-width-table w-full">
                            <thead className="bg-white/[0.02] border-b border-white/8">
                            <tr>
                                <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Product</th>
                                <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Price</th>
                                <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Stock</th>
                                <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Status</th>
                                <th className="px-4 lg:px-5 py-3 text-left text-[8px] lg:text-[9px] font-body font-medium text-white/40 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredProducts.map((product, index) => {
                                const isLowStock = product.stock <= 10 && product.stock > 0;
                                const isOutOfStock = product.stock === 0;
                                return (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b border-white/8 hover:bg-white/[0.02] transition"
                                    >
                                        <td className="px-4 lg:px-5 py-3 sm:py-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 border border-white/10 flex items-center justify-center overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={10} className="sm:w-3.5 sm:h-3.5 text-white/20" />
                                                    )}
                                                </div>
                                                <span className="text-white/80 text-xs sm:text-sm font-body truncate">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4 text-white/60 text-xs sm:text-sm">{product.price} €</td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4">
                                            {editingId === product.id ? (
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-16 sm:w-20 bg-transparent border border-white/10 px-1.5 sm:px-2 py-1 text-white/80 text-xs sm:text-sm focus:border-white/30 outline-none"
                                                    />
                                                    <button onClick={() => updateStock(product.id, parseInt(editValue))} className="text-white/40 hover:text-white/80">
                                                        <Save size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white/80">
                                                        <X size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`text-xs sm:text-sm font-body ${
                                                    isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-white/60'
                                                }`}>
                                                        {product.stock}
                                                    </span>
                                            )}
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4">
                                            {isOutOfStock ? (
                                                <span className="text-red-400/70 text-[8px] sm:text-[9px] lg:text-[10px] flex items-center gap-0.5 sm:gap-1">
                                                        <X size={8} className="sm:w-2.5 sm:h-2.5" /> Out of stock
                                                    </span>
                                            ) : isLowStock ? (
                                                <span className="text-amber-400/70 text-[8px] sm:text-[9px] lg:text-[10px] flex items-center gap-0.5 sm:gap-1">
                                                        <AlertCircle size={8} className="sm:w-2.5 sm:h-2.5" /> Low stock
                                                    </span>
                                            ) : (
                                                <span className="text-emerald-400/70 text-[8px] sm:text-[9px] lg:text-[10px] flex items-center gap-0.5 sm:gap-1">
                                                        <CheckCircle size={8} className="sm:w-2.5 sm:h-2.5" /> In stock
                                                    </span>
                                            )}
                                        </td>
                                        <td className="px-4 lg:px-5 py-3 sm:py-4">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <button onClick={() => { setEditingId(product.id); setEditValue(product.stock.toString()); }} className="text-white/40 hover:text-white/80" title="Edit">
                                                    <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                                <button onClick={() => updateStock(product.id, product.stock + 1)} className="text-white/40 hover:text-white/80" title="+">
                                                    <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                                <button onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))} className="text-white/40 hover:text-white/80" title="-">
                                                    <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                                <button onClick={() => deleteProduct(product.id)} className="text-white/40 hover:text-red-400 transition" title="Delete">
                                                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-10 sm:py-12">
                                <Package size={24} className="sm:w-8 sm:h-8 text-white/10 mx-auto mb-2 sm:mb-3" />
                                <p className="text-white/30 text-[10px] sm:text-xs">No products found</p>
                            </div>
                        )}
                    </div>

                    {/* Products Cards - Mobile */}
                    <div className="stock-mobile-card space-y-3">
                        {filteredProducts.map((product, index) => {
                            const isLowStock = product.stock <= 10 && product.stock > 0;
                            const isOutOfStock = product.stock === 0;
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="border border-white/8 p-4"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={16} className="text-white/20" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white/80 text-sm font-body font-medium">{product.name}</h3>
                                            <p className="text-white/60 text-xs mt-0.5">{product.price} €</p>
                                            {isOutOfStock ? (
                                                <span className="text-red-400/70 text-[8px] flex items-center gap-1 mt-1">
                                                    <X size={8} /> Out of stock
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="text-amber-400/70 text-[8px] flex items-center gap-1 mt-1">
                                                    <AlertCircle size={8} /> Low stock
                                                </span>
                                            ) : (
                                                <span className="text-emerald-400/70 text-[8px] flex items-center gap-1 mt-1">
                                                    <CheckCircle size={8} /> In stock
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/8 pt-3 mt-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-white/40 text-[8px] tracking-[0.2em] uppercase">Stock</span>
                                            {editingId === product.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-20 bg-transparent border border-white/10 px-2 py-1 text-white/80 text-xs focus:border-white/30 outline-none"
                                                    />
                                                    <button onClick={() => updateStock(product.id, parseInt(editValue))} className="text-white/40 hover:text-white/80">
                                                        <Save size={12} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white/80">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))} className="text-white/40 hover:text-white/80">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className={`text-sm font-body ${
                                                        isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-white/60'
                                                    }`}>
                                                        {product.stock}
                                                    </span>
                                                    <button onClick={() => updateStock(product.id, product.stock + 1)} className="text-white/40 hover:text-white/80">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/8">
                                            <button
                                                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                                                className="text-white/30 text-[8px] tracking-[0.2em] uppercase flex items-center gap-1"
                                            >
                                                {expandedProduct === product.id ? 'Less options' : 'More options'}
                                                <ChevronDown size={10} className={`transition-transform ${expandedProduct === product.id ? 'rotate-180' : ''}`} />
                                            </button>
                                            <button onClick={() => deleteProduct(product.id)} className="text-white/40 hover:text-red-400 transition flex items-center gap-1 text-[8px]">
                                                <Trash2 size={10} /> Delete
                                            </button>
                                        </div>

                                        {expandedProduct === product.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 pt-3 border-t border-white/8"
                                            >
                                                <button
                                                    onClick={() => { setEditingId(product.id); setEditValue(product.stock.toString()); setExpandedProduct(null); }}
                                                    className="w-full flex items-center justify-between py-2 text-white/50 hover:text-white/80 transition text-[9px]"
                                                >
                                                    <span>Edit stock value</span>
                                                    <Edit size={10} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-10">
                                <Package size={24} className="text-white/10 mx-auto mb-2" />
                                <p className="text-white/30 text-[10px]">No products found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}