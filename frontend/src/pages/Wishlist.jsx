import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import {
    Heart, ShoppingCart, Trash2, Package, Tag,
    Star, Sparkles, Gift, Clock, Shield, TrendingUp, ArrowRight
} from 'lucide-react';

const currencySymbols = {
    EUR: '€', USD: '$', GBP: '£', MGA: 'Ar', JPY: '¥',
    CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥'
};

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [currency, setCurrency] = useState('EUR');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [user, setUser] = useState(null);
    const addItem = useCartStore(state => state.addItem);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
    }, []);

    useEffect(() => {
        if (user === null) return;
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'EUR';
        setCurrency(savedCurrency);
        const rates = { EUR: 1, USD: 1.09, GBP: 0.86, MGA: 4800, JPY: 164, CAD: 1.48, AUD: 1.62, CHF: 0.96, CNY: 7.85 };
        setExchangeRate(rates[savedCurrency] || 1);
    }, []);

    useEffect(() => {
        if (user) {
            api.get(`/wishlist/user/${user.id}`).then(res => setWishlist(res.data));
        }
    }, [user]);

    const removeFromWishlist = async (productId) => {
        if (!user) return;
        await api.delete(`/wishlist/remove?userId=${user.id}&productId=${productId}`);
        setWishlist(prev => prev.filter(product => product.id !== productId));
    };

    const getConvertedPrice = (priceInEUR) => {
        if (!priceInEUR && priceInEUR !== 0) return '0.00';
        const converted = priceInEUR * exchangeRate;
        return converted.toFixed(2);
    };

    if (user === null) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 border border-white/10 rounded-full" />
                        <div className="absolute inset-0 w-10 h-10 border-t border-white/60 rounded-full animate-spin" />
                    </div>
                    <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Loading</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

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
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                            <Heart size={11} className="sm:w-3.5 sm:h-3.5 text-white/30" />
                            <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">Saved Items</span>
                        </div>
                        <h1 className="font-display text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
                            My Wishlist
                        </h1>
                        <p className="text-white/40 text-xs sm:text-sm mt-2 sm:mt-3">Your favorite items, saved for later</p>
                        <span className="inline-block mt-3 sm:mt-4 text-white/30 text-[9px] sm:text-xs border border-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
                    {wishlist.length === 0 ? (
                        <div className="border border-white/8 bg-white/[0.02] p-10 sm:p-12 lg:p-16 text-center">
                            <Heart size={40} className="sm:w-16 sm:h-16 text-white/10 mx-auto mb-3 sm:mb-4" />
                            <p className="text-white/60 text-base sm:text-lg font-body">Your wishlist is empty</p>
                            <p className="text-white/30 text-xs sm:text-sm mt-1 sm:mt-2">Save your favorite items here</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-5 sm:mt-6 bg-white text-black text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase px-5 sm:px-6 py-2 sm:py-2.5 hover:bg-white/90 transition"
                            >
                                Explore products
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                                <AnimatePresence>
                                    {wishlist.map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={{ y: -4 }}
                                            className="border border-white/8 bg-white/[0.02] hover:border-white/20 transition group"
                                        >
                                            <div className="relative h-32 sm:h-36 lg:h-40 overflow-hidden border-b border-white/8">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package size={24} className="sm:w-10 sm:h-10 text-white/20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                                                    <div className="bg-black/50 backdrop-blur-sm p-1 sm:p-1.5 rounded-full">
                                                        <Heart size={10} className="sm:w-3 sm:h-3 text-white fill-white/20" />
                                                    </div>
                                                </div>
                                                {product.stock > 0 && (
                                                    <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2">
                                                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] text-white/50 border border-white/20 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm">
                                                            <Sparkles size={6} className="sm:w-2 sm:h-2" /> In stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 sm:p-4">
                                                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                    <span className="text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase flex items-center gap-0.5 sm:gap-1">
                                                        <Tag size={7} className="sm:w-2 sm:h-2" />
                                                        {product.category || 'Uncategorized'}
                                                    </span>
                                                    {product.rating && (
                                                        <span className="text-white/30 text-[7px] sm:text-[8px] flex items-center gap-0.5 sm:gap-1">
                                                            <Star size={7} className="sm:w-2 sm:h-2 fill-white/30 text-white/30" />
                                                            {product.rating}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-white/80 text-xs sm:text-sm font-body font-medium line-clamp-1">{product.name}</h3>
                                                <p className="text-white/30 text-[9px] sm:text-xs mt-1 line-clamp-2">{product.description}</p>

                                                <p className="text-white/80 text-base sm:text-lg font-display font-light mt-2 sm:mt-3">
                                                    {getConvertedPrice(product.price)} {currencySymbols[currency] || currency}
                                                </p>

                                                <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                                                    <button
                                                        onClick={() => addItem(product)}
                                                        className="flex-1 bg-white text-black text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase py-1.5 sm:py-2 hover:bg-white/90 transition flex items-center justify-center gap-0.5 sm:gap-1"
                                                    >
                                                        <ShoppingCart size={8} className="sm:w-2.5 sm:h-2.5" />
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromWishlist(product.id)}
                                                        className="px-2 sm:px-3 py-1.5 sm:py-2 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 transition"
                                                    >
                                                        <Trash2 size={10} className="sm:w-3 sm:h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="mt-8 sm:mt-10 lg:mt-12 border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Gift size={18} className="sm:w-6 sm:h-6 text-white/30" />
                                        <div>
                                            <h3 className="text-white/80 text-xs sm:text-sm font-body tracking-wide">Love these items?</h3>
                                            <p className="text-white/40 text-[10px] sm:text-xs">Check out similar products you might like</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="text-white/70 hover:text-white text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 transition flex items-center justify-center gap-1"
                                    >
                                        <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                                        Discover more
                                        <ArrowRight size={8} className="sm:w-2.5 sm:h-2.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.1em] sm:tracking-[0.15em] uppercase">
                                <span className="flex items-center gap-0.5 sm:gap-1"><Shield size={8} className="sm:w-2.5 sm:h-2.5" /> Secure wishlist</span>
                                <span className="flex items-center gap-0.5 sm:gap-1"><Clock size={8} className="sm:w-2.5 sm:h-2.5" /> Save for later</span>
                                <span className="flex items-center gap-0.5 sm:gap-1"><Heart size={8} className="sm:w-2.5 sm:h-2.5" /> Never expires</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}