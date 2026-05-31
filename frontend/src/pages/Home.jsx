import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import { useCartStore } from '../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, AlertCircle, CheckCircle, Loader2, Package, Zap, ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';
import CurrencySelector from '../components/CurrencySelector';

const currencySymbols = {
    EUR: '€', USD: '$', GBP: '£', MGA: 'Ar',
    JPY: '¥', CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥'
};

/* ─── Reusable entrance variants ─── */
const fadeUp = (delay = 0, duration = 0.6) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
});

const fadeIn = (delay = 0) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, delay }
});

const slideLeft = (delay = 0) => ({
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }
});

const slideRight = (delay = 0) => ({
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }
});

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { search } = useSearchStore();
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState('EUR');
    const addItem = useCartStore(state => state.addItem);
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);
    const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) { try { setUser(JSON.parse(userStr)); } catch (e) {} }
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const loadProducts = useCallback(async (selectedCurrency) => {
        setLoading(true);
        try {
            const res = await api.get(`/products?currency=${selectedCurrency}`);
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setProducts([]);
            showNotification('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'EUR';
        setCurrency(savedCurrency);
        loadProducts(savedCurrency);
    }, [loadProducts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target))
                setMobileMenuOpen(false);
        };
        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [mobileMenuOpen]);

    const handleCurrencyChange = (newCurrency) => {
        if (newCurrency === currency) return;
        setCurrency(newCurrency);
        loadProducts(newCurrency);
    };

    const categories = products.length > 0 ? [...new Set(products.map(p => p.category))] : [];

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category ? p.category === category : true;
        return matchSearch && matchCategory;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Sold Out', color: 'text-red-400', dot: 'bg-red-500', fullText: 'Out of Stock' };
        if (stock <= 5) return { text: `${stock} left`, color: 'text-amber-400', dot: 'bg-amber-400', fullText: `${stock} items remaining` };
        return { text: 'In Stock', color: 'text-emerald-400', dot: 'bg-emerald-400', fullText: 'In Stock - Ready to ship' };
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        if (product.stock === 0) { showNotification(`${product.name} is out of stock!`, 'error'); return; }
        addItem({ ...product, price: product.priceOriginal || product.price, currency: 'EUR' });
        showNotification(`${product.name} added to cart!`, 'success');
    };

    const handleAddToWishlist = async (e, product) => {
        e.stopPropagation();
        if (!user) { showNotification('Please login to add to wishlist', 'error'); setTimeout(() => navigate('/login'), 1500); return; }
        try {
            await api.post(`/wishlist/add?userId=${user.id}&productId=${product.id}`);
            showNotification(`${product.name} added to wishlist!`, 'success');
        } catch (error) {
            if (error.response?.status === 400) showNotification(`${product.name} is already in your wishlist`, 'error');
            else showNotification('Failed to add to wishlist', 'error');
        }
    };

    const handleWishlistClick = (e) => { e.preventDefault(); e.stopPropagation(); navigate('/wishlist'); };
    const handleMobileMenuToggle = (e) => { e.preventDefault(); e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center gap-4 px-4">
                    <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10 rounded-full" />
                        <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-t border-white/60 rounded-full animate-spin" />
                    </div>
                    <motion.span
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/30 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-light">
                        Loading
                    </motion.span>
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
                    content:''; position:fixed; top:-50%; left:-50%; width:200%; height:200%;
                    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events:none; z-index:9999; opacity:0.035;
                }
                .ticker-wrap { overflow:hidden; white-space:nowrap; }
                .ticker-inner { display:inline-block; animation:ticker 30s linear infinite; }
                @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

                .card-line::after {
                    content:''; position:absolute; bottom:0; left:0;
                    width:0; height:1px; background:rgba(255,255,255,0.15); transition:width 0.5s ease;
                }
                .card-line:hover::after { width:100%; }

                .shimmer-text {
                    background:linear-gradient(90deg,#fff 0%,#fff 40%,rgba(255,255,255,0.4) 50%,#fff 60%,#fff 100%);
                    background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    animation:shimmer 4s linear infinite;
                }
                @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

                .tag-pill { transition:all 0.2s ease; cursor:pointer; }
                .tag-pill:hover { letter-spacing:0.1em; }
                @media (max-width:640px) { .tag-pill{letter-spacing:0.15em} .tag-pill:hover{letter-spacing:0.2em} }

                .product-reveal { clip-path:inset(0 100% 0 0); animation:reveal 0.6s ease forwards; }
                @keyframes reveal { to{clip-path:inset(0 0% 0 0)} }

                /* Hero image entrance */
                @keyframes heroImgEnter {
                    0%  { opacity:0; transform:rotate(-10deg) scale(0.82) translateY(40px); filter:blur(14px) brightness(0.4); }
                    35% { opacity:0.75; transform:rotate(4deg) scale(0.97) translateY(-8px); filter:blur(4px) brightness(0.75); }
                    60% { transform:rotate(-2deg) scale(1.02) translateY(4px); filter:blur(1.5px) brightness(0.9); }
                    78% { transform:rotate(0.8deg) scale(0.994) translateY(-2px); filter:blur(0px) brightness(0.95); }
                    90% { transform:rotate(-0.3deg) scale(1.002); }
                    100%{ opacity:1; transform:rotate(0deg) scale(1) translateY(0); filter:blur(0) brightness(0.9); }
                }
                .hero-img-wrapper { overflow:hidden; border-radius:2px; }
                .hero-img-enter { animation:heroImgEnter 1.5s cubic-bezier(0.16,1,0.3,1) 0.35s both; transform-origin:center center; will-change:transform,opacity,filter; }

                @keyframes cornerPop { 0%{opacity:0;transform:scale(0.5) rotate(5deg)} 70%{transform:scale(1.15) rotate(-1deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
                .corner-mark { animation:cornerPop 0.35s cubic-bezier(0.16,1,0.3,1) 1.65s both; }

                @keyframes labelUp { 0%{opacity:0;transform:translate(6px,12px)} 60%{transform:translate(-1px,-2px)} 100%{opacity:1;transform:translate(0,0)} }
                .hero-label-enter { animation:labelUp 0.45s cubic-bezier(0.16,1,0.3,1) 1.75s both; }

                @keyframes ringReveal { 0%{opacity:0;transform:scale(1.12)} 100%{opacity:1;transform:scale(1)} }
                .ring-inner { animation:ringReveal 0.7s ease 1.5s both; }
                .ring-outer { animation:ringReveal 0.7s ease 1.62s both; }

                /* Ticker entrance */
                @keyframes tickerSlide { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
                .ticker-enter { animation:tickerSlide 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
            `}</style>

            <div className="grain font-body min-h-screen bg-[#080808]">

                {/* ─── NOTIFICATION ─── */}
                <AnimatePresence>
                    {notification.show && (
                        <motion.div
                            initial={{ opacity:0, x: 60, scale: 0.95 }}
                            animate={{ opacity:1, x: 0,  scale: 1    }}
                            exit ={{ opacity:0, x: 60, scale: 0.95 }}
                            transition={{ type:'spring', stiffness:350, damping:28 }}
                            className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-[9998] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-sm text-xs sm:text-sm font-body font-medium tracking-wide backdrop-blur-md border ${
                                notification.type === 'success'
                                    ? 'bg-white/5 border-white/20 text-white'
                                    : 'bg-red-950/40 border-red-500/30 text-red-300'
                            }`}>
                            <motion.span
                                initial={{ scale:0 }} animate={{ scale:1 }}
                                transition={{ type:'spring', delay:0.1 }}
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="flex-1">{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── TICKER ─── */}
                <div className="ticker-enter bg-white text-black py-2 sm:py-2.5 ticker-wrap overflow-hidden">
                    <div className="ticker-inner font-body text-[8px] sm:text-[10px] font-medium tracking-[0.2em] sm:tracking-[0.35em] uppercase whitespace-nowrap">
                        {Array(6).fill('FREE SHIPPING OVER 50€ · FLAGSHIP DEVICES · LATEST TECH · PREMIUM QUALITY · FAST DELIVERY · ').join('')}
                    </div>
                </div>

                {/* ─── HERO ─── */}
                <div className="relative min-h-[80vh] sm:min-h-[92vh] bg-[#080808] flex flex-col overflow-hidden">

                    <div className="absolute inset-0 opacity-[0.025]"
                         style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'40px 40px sm:80px 80px' }} />
                    <div className="absolute top-0 left-1/4 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full"
                         style={{ background:'radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%)' }} />
                    <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full"
                         style={{ background:'radial-gradient(circle,rgba(200,180,255,0.04) 0%,transparent 70%)' }} />

                    {/* Top bar — staggered fade-in */}
                    <motion.div
                        {...fadeIn(0.15)}
                        className="relative z-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8 flex items-center justify-between">

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                            transition={{ duration:0.6, delay:0.2, ease:[0.16,1,0.3,1] }}
                            className="flex items-center gap-2">
                            <motion.div
                                initial={{ scaleY:0 }} animate={{ scaleY:1 }}
                                transition={{ duration:0.4, delay:0.35 }}
                                className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
                            <span className="font-display text-white text-[10px] sm:text-sm tracking-widest italic">E-Tech Zone</span>
                        </motion.div>

                        <div className="hidden md:flex items-center gap-4 lg:gap-6">
                            <motion.div {...fadeIn(0.4)}><CurrencySelector onCurrencyChange={handleCurrencyChange} /></motion.div>
                            <motion.button {...fadeIn(0.5)} onClick={handleWishlistClick}
                                           whileTap={{ scale:0.95 }}
                                           className="text-white/40 hover:text-white transition text-[10px] lg:text-xs tracking-[0.2em] uppercase font-body cursor-pointer">
                                Wishlist
                            </motion.button>
                        </div>

                        <motion.button {...fadeIn(0.4)}
                                       whileTap={{ scale:0.9, rotate:5 }}
                                       onClick={handleMobileMenuToggle}
                                       className="md:hidden text-white/60 hover:text-white transition cursor-pointer">
                            <AnimatePresence mode="wait">
                                {mobileMenuOpen
                                    ? <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.2}}><X size={20} /></motion.div>
                                    : <motion.div key="m" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.2}}><Menu size={20} /></motion.div>
                                }
                            </AnimatePresence>
                        </motion.button>
                    </motion.div>

                    {/* Mobile dropdown */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                ref={mobileMenuRef}
                                initial={{ opacity:0, y:-16, scaleY:0.9 }}
                                animate={{ opacity:1, y:0, scaleY:1 }}
                                exit ={{ opacity:0, y:-16, scaleY:0.9 }}
                                style={{ originY:0 }}
                                transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
                                className="md:hidden absolute top-16 left-0 right-0 z-20 bg-[#080808] border-b border-white/10 py-4 px-4 shadow-xl">
                                <div className="flex flex-col gap-3">
                                    <motion.div initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.05}} className="py-2">
                                        <CurrencySelector onCurrencyChange={(c) => { handleCurrencyChange(c); setMobileMenuOpen(false); }} />
                                    </motion.div>
                                    <motion.button initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
                                                   whileTap={{ x: 4 }}
                                                   onClick={() => { navigate('/wishlist'); setMobileMenuOpen(false); }}
                                                   className="text-white/60 hover:text-white transition text-sm py-2 text-left cursor-pointer">
                                        Wishlist
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hero Content */}
                    <div className="relative z-10 flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 flex items-center py-8 sm:py-12 lg:py-0">
                        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                            {/* LEFT */}
                            <div className="lg:col-span-7 text-center lg:text-left">
                                <motion.p {...fadeIn(0.3)}
                                          className="font-body text-white/30 text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-4 sm:mb-6 lg:mb-8">
                                    Est. 2026 · Premium Tech Retail
                                </motion.p>

                                <div className="overflow-hidden mb-1 sm:mb-2">
                                    <motion.h1
                                        initial={{ y:120 }} animate={{ y:0 }}
                                        transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
                                        className="font-display text-white font-light leading-[0.9] sm:leading-[0.95]"
                                        style={{ fontSize:'clamp(36px,10vw,100px)' }}>
                                        GEAR UP.
                                    </motion.h1>
                                </div>
                                <div className="overflow-hidden mb-4 sm:mb-6">
                                    <motion.h1
                                        initial={{ y:120 }} animate={{ y:0 }}
                                        transition={{ duration:0.9, delay:0.08, ease:[0.16,1,0.3,1] }}
                                        className="font-display italic text-white/20 font-light leading-[0.9] sm:leading-[0.95]"
                                        style={{ fontSize:'clamp(32px,8vw,85px)' }}>
                                        PLAY HARD
                                    </motion.h1>
                                </div>

                                {/* Stats strip — staggered */}
                                <motion.div
                                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                                    className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-10 mt-6 sm:mt-8 lg:mt-10">
                                    {[
                                        { label:'Products',  value:'500+' },
                                        { label:'Customers', value:'10k+' },
                                        { label:'Rating',    value:'4.9'  },
                                    ].map((s,i) => (
                                        <div key={i} className="flex items-center gap-4 sm:gap-6 lg:gap-10">
                                            {i > 0 && <div className="w-px h-6 sm:h-8 lg:h-10 bg-white/10" />}
                                            <motion.div
                                                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                                                transition={{ delay:0.55 + i*0.1, ease:[0.16,1,0.3,1] }}>
                                                <p className="font-body text-white/20 text-[7px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-1">{s.label}</p>
                                                <p className="font-display text-white text-1xl sm:text-1xl lg:text-1xl font-light">{s.value}</p>
                                            </motion.div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* CTA buttons */}
                                <motion.div
                                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
                                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 lg:mt-10">
                                    <motion.button
                                        whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                                        onClick={() => document.getElementById('products').scrollIntoView({ behavior:'smooth' })}
                                        className="group flex items-center justify-center gap-2 sm:gap-3 bg-white text-black px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 text-[10px] sm:text-xs font-body font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-white/90 transition w-full sm:w-auto">
                                        Shop Now
                                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ x:4 }} whileTap={{ scale:0.95 }}
                                        onClick={handleWishlistClick}
                                        className="text-white/40 hover:text-white transition text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-body flex items-center gap-2 cursor-pointer">
                                        <Heart size={12} /> Saved items
                                    </motion.button>
                                </motion.div>
                            </div>

                            {/* RIGHT — hero image with entrance animation */}
                            <motion.div
                                initial={{ opacity:0, scale:0.8, rotateY:90 }}
                                animate={{ opacity:1, scale:1, rotateY:0 }}
                                transition={{ duration:0.8, delay:0.3, ease:[0.16,1,0.3,1] }}
                                onAnimationComplete={() => setHeroAnimationComplete(true)}
                                className="lg:col-span-5 relative mt-8 lg:mt-0">
                                <motion.div
                                    className="relative aspect-square max-w-[280px] sm:max-w-sm mx-auto"
                                    animate={heroAnimationComplete ? {} : { rotateX:[0,10,0], rotateY:[0,15,0] }}
                                    transition={{ duration:0.6, delay:0.5 }}>

                                    <div className="ring-outer absolute -inset-2 sm:-inset-4 border border-white/5 rounded-sm" />
                                    <div className="ring-inner absolute -inset-4 sm:-inset-8 border border-white/[0.02] rounded-sm" />

                                    <div className="hero-img-wrapper w-full h-full">
                                        <motion.img
                                            src="images/hero.png"
                                            alt="Hero"
                                            className="hero-img-enter w-full h-full object-cover grayscale-[20%] contrast-105"
                                            style={{ filter:'brightness(0.9)' }}
                                            whileHover={{ scale:1.03, filter:'brightness(1)' }}
                                            transition={{ duration:0.5 }}
                                        />
                                    </div>

                                    <div className="corner-mark absolute top-0 left-0 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 border-t border-l border-white/30" />
                                    <div className="corner-mark absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 border-t border-r border-white/30" />
                                    <div className="corner-mark absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 border-b border-l border-white/30" />
                                    <div className="corner-mark absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 border-b border-r border-white/30" />

                                    <motion.div
                                        className="hero-label-enter absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-white text-black px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2"
                                        whileHover={{ scale:1.05, y:-2 }}>
                                        <p className="font-display text-[8px] sm:text-[10px] lg:text-xs italic">New Arrivals ↗</p>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom divider */}
                    <motion.div {...fadeIn(0.9)} className="relative z-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 pb-4 sm:pb-6 lg:pb-8">
                        <motion.div
                            initial={{ scaleX:0 }} animate={{ scaleX:1 }}
                            transition={{ duration:1, delay:1, ease:[0.16,1,0.3,1] }}
                            style={{ originX:0 }}
                            className="h-px bg-white/8 w-full" />
                    </motion.div>
                </div>

                {/* ─── PRODUCTS SECTION ─── */}
                <div id="products" className="bg-[#080808] pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">

                        {/* Section header */}
                        <motion.div
                            initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
                            className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 lg:mb-12 border-b border-white/8 pb-4 sm:pb-5 lg:pb-6">
                            <div>
                                <p className="font-body text-white/25 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-2 sm:mb-3">
                                    — Catalogue
                                </p>
                                <h2 className="font-display text-white font-light text-2xl sm:text-3xl lg:text-4xl"
                                    style={{ fontSize:'clamp(24px,6vw,42px)' }}>
                                    {category ? category : 'All Products'}
                                </h2>
                            </div>
                            <p className="font-body text-white/30 text-[10px] sm:text-xs mt-2 sm:mt-0">
                                {search
                                    ? <>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for <em className="text-white/60 not-italic">"{search}"</em></>
                                    : <>{filtered.length} items</>
                                }
                            </p>
                        </motion.div>

                        {/* Category filters — stagger each pill */}
                        <motion.div
                            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
                            transition={{ duration:0.4 }}
                            className="flex gap-1 mb-6 sm:mb-8 lg:mb-10 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            {['All', ...categories].map((cat, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity:0, y:10 }}
                                    whileInView={{ opacity:1, y:0 }}
                                    viewport={{ once:true }}
                                    transition={{ delay: i * 0.04, ease:[0.16,1,0.3,1] }}
                                    whileHover={{ y:-2 }}
                                    whileTap={{ scale:0.93 }}
                                    onClick={() => setCategory(cat === 'All' ? '' : cat)}
                                    className={`tag-pill px-3 sm:px-4 py-1 sm:py-1.5 text-[7px] sm:text-[8px] lg:text-[9px] font-body font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase border transition-all duration-300 whitespace-nowrap ${
                                        (cat === 'All' && category === '') || category === cat
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-white/40 border-white/10 hover:text-white hover:border-white/30'
                                    }`}>
                                    {cat}
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Empty state */}
                        {filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                                transition={{ duration:0.4 }}
                                className="text-center py-20 sm:py-24 lg:py-32 border border-white/5">
                                <motion.div initial={{ y:10 }} animate={{ y:0 }} transition={{ delay:0.1 }}>
                                    <Package size={24} className="text-white/15 mx-auto mb-3" />
                                    <p className="font-display text-white/30 text-lg sm:text-xl font-light">No products found</p>
                                    <p className="font-body text-white/15 text-[10px] sm:text-xs tracking-widest uppercase mt-2 px-4">Adjust your search or category</p>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                                {filtered.map((product, i) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    const isOutOfStock = product.stock === 0;
                                    const isHovered = hoveredProduct === product.id;

                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity:0, y:24 }}
                                            whileInView={{ opacity:1, y:0 }}
                                            viewport={{ once:true, margin:'-40px' }}
                                            transition={{ delay: (i % 5) * 0.07, duration:0.5, ease:[0.16,1,0.3,1] }}
                                            whileHover={{ y:-5 }}
                                            whileTap={{ scale:0.98 }}
                                            onMouseEnter={() => setHoveredProduct(product.id)}
                                            onMouseLeave={() => setHoveredProduct(null)}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="card-line relative bg-[#080808] cursor-pointer group">

                                            <div className="relative overflow-hidden bg-[#0f0f0f] h-28 xs:h-32 sm:h-36 lg:h-40">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name}
                                                         className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-105 grayscale-0' : 'grayscale-[30%]'}`} />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center">
                                                        <Package size={20} className="text-white/10" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 via-transparent to-transparent" />

                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <span className="font-body text-white/50 text-[6px] sm:text-[7px] lg:text-[8px] tracking-[0.3em] sm:tracking-[0.5em] uppercase border border-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1">Sold Out</span>
                                                    </div>
                                                )}

                                                <div className={`absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                                    {!isOutOfStock && (
                                                        <motion.button
                                                            whileHover={{ scale:1.06 }} whileTap={{ scale:0.93 }}
                                                            onClick={(e) => handleAddToCart(e, product)}
                                                            className="bg-white text-black text-[7px] sm:text-[8px] font-body font-medium tracking-[0.15em] sm:tracking-[0.25em] uppercase px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-white/90 transition flex items-center gap-0.5 sm:gap-1">
                                                            <ShoppingCart size={8} />
                                                            <span className="xs:inline">Add to cart</span>
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
                                                        onClick={(e) => handleAddToWishlist(e, product)}
                                                        className="bg-white/10 backdrop-blur-sm border border-white/20 p-1 sm:p-1.5 hover:bg-white/20 transition">
                                                        <Heart size={10} className="text-white" />
                                                    </motion.button>
                                                </div>

                                                <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                                                    <span className="font-body text-white/40 text-[6px] sm:text-[7px] tracking-[0.25em] sm:tracking-[0.35em] uppercase">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-2 sm:p-3">
                                                <div className="flex items-start justify-between gap-1 mb-0.5 sm:mb-1">
                                                    <h3 className="font-body text-white/80 text-[10px] sm:text-xs font-medium leading-tight line-clamp-1 group-hover:text-white transition">
                                                        {product.name}
                                                    </h3>
                                                    <ArrowUpRight size={8} className={`text-white/20 flex-shrink-0 mt-0.5 transition-all duration-300 ${isHovered ? 'text-white/60 -translate-y-0.5 translate-x-0.5' : ''}`} />
                                                </div>
                                                <p className="font-body text-white/25 text-[8px] sm:text-[10px] leading-relaxed line-clamp-1 mb-1 sm:mb-2">{product.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-display text-white text-sm sm:text-base font-light">
                                                        {product.price}<span className="text-white/30 text-[8px] sm:text-[10px] ml-0.5">{currencySymbols[currency] || currency}</span>
                                                    </span>
                                                    <div className="relative group/stock">
                                                        <span className={`flex items-center gap-0.5 sm:gap-1 text-[6px] sm:text-[7px] lg:text-[8px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase ${stockStatus.color}`}>
                                                            <span className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${stockStatus.dot} ${product.stock > 0 && product.stock > 5 ? 'animate-pulse' : ''}`} />
                                                            <span className="hidden xs:inline">{stockStatus.text}</span>
                                                            <span className="xs:hidden">{stockStatus.text === 'In Stock' ? 'In' : stockStatus.text === 'Sold Out' ? 'Out' : stockStatus.text}</span>
                                                        </span>
                                                        <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-black border border-white/10 text-white/60 text-[8px] whitespace-nowrap opacity-0 group-hover/stock:opacity-100 transition-opacity pointer-events-none z-10">
                                                            {stockStatus.fullText}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* CTA Strip */}
                        {filtered.length > 0 && (
                            <motion.div
                                initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                                viewport={{ once:true }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
                                whileHover={{ scale:1.005 }}
                                whileTap={{ scale:0.995 }}
                                className="mt-8 sm:mt-10 lg:mt-12 bg-white flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 group cursor-pointer gap-3 sm:gap-0"
                                onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>
                                <div className="text-center sm:text-left">
                                    <p className="font-body text-black/40 text-[7px] sm:text-[8px] tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-1">Upgrade Your Setup</p>
                                    <h3 className="font-display text-black text-lg sm:text-xl lg:text-2xl font-light">Ready to explore more?</h3>
                                </div>
                                <div className="flex items-center gap-2 text-black font-body text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] uppercase">
                                    <span>Back to top</span>
                                    <motion.div
                                        whileHover={{ rotate:15, scale:1.1 }}
                                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                                        <Zap size={10} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {/* Footer */}
                <motion.div
                    initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
                    className="border-t border-white/8 bg-[#080808]">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                        <span className="font-display italic text-white/20 text-xs sm:text-sm order-2 sm:order-1">E-Tech Zone</span>
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 order-1 sm:order-2">
                            <span className="font-body text-white/15 text-[7px] sm:text-[8px] tracking-[0.25em] sm:tracking-[0.4em] uppercase">© 2026 · Premium Tech Retail</span>
                            <span className="w-px h-3 bg-white/15 hidden sm:block" />
                            <Link
                                to="/privacy-policy"
                                className="font-body text-white/15 hover:text-white/40 transition text-[7px] sm:text-[8px] tracking-[0.2em] sm:tracking-[0.3em] uppercase"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                        <span className="font-body text-white/15 text-[7px] sm:text-[8px] tracking-[0.2em] sm:tracking-[0.3em] uppercase order-3">All rights reserved</span>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
