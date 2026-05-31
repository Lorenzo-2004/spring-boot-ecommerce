import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import { useCartStore } from '../store/cartStore';
import {
    ChevronLeft, ChevronRight, ZoomIn, X, ShoppingCart, Heart,
    Star, StarHalf, User, Calendar, MessageCircle, Loader2,
    ArrowLeft, Package, CheckCircle, AlertCircle
} from 'lucide-react';

const currencySymbols = {
    EUR: '€', USD: '$', GBP: '£', MGA: 'Ar', JPY: '¥',
    CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥'
};

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState(0);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [currency, setCurrency] = useState('EUR');
    const [exchangeRate, setExchangeRate] = useState(1);
    const addItem = useCartStore(state => state.addItem);
    const [user, setUser] = useState(null);

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
        const savedCurrency = localStorage.getItem('currency') || 'EUR';
        setCurrency(savedCurrency);
        const rates = { EUR: 1, USD: 1.09, GBP: 0.86, MGA: 4800, JPY: 164, CAD: 1.48, AUD: 1.62, CHF: 0.96, CNY: 7.85 };
        setExchangeRate(rates[savedCurrency] || 1);
    }, []);

    const getConvertedPrice = (priceInEUR) => {
        const converted = priceInEUR * exchangeRate;
        return converted.toFixed(2);
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                // Remplacer par l'API simple qui fonctionne
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);

                // Gérer les images correctement
                if (res.data.images && res.data.images.length > 0) {
                    setProductImages(res.data.images);
                } else if (res.data.imageUrl) {
                    setProductImages([{ imageUrl: res.data.imageUrl }]);
                } else {
                    setProductImages([]);
                }
            } catch (err) {
                console.error('Error loading product:', err);
                showNotification('Product not found', 'error');
                navigate('/');
            }

            try {
                const reviewsRes = await api.get(`/reviews/product/${id}`);
                setReviews(reviewsRes.data);
                const avgRes = await api.get(`/reviews/product/${id}/average`);
                setAverage(avgRes.data.average);
            } catch (err) {
                console.error('Error loading reviews:', err);
            }
            setLoading(false);
        };
        loadProduct();
    }, [id, navigate]);

    const nextImage = () => {
        const totalImages = images.length;
        if (totalImages === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };

    const prevImage = () => {
        const totalImages = images.length;
        if (totalImages === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    // Construction correcte du tableau d'images
    const images = [];
    if (productImages.length > 0) {
        for (const img of productImages) {
            if (typeof img === 'string') {
                images.push(img);
            } else if (img.imageUrl) {
                images.push(img.imageUrl);
            }
        }
    }
    if (images.length === 0 && product?.imageUrl) {
        images.push(product.imageUrl);
    }

    const submitReview = async () => {
        if (!user) {
            showNotification('Please login to submit a review', 'error');
            return;
        }
        if (!comment.trim()) {
            showNotification('Please write a comment', 'error');
            return;
        }
        try {
            await api.post('/reviews', {
                user: { id: user.id },
                product: { id: parseInt(id) },
                rating,
                comment
            });
            const res = await api.get(`/reviews/product/${id}`);
            setReviews(res.data);
            const avg = await api.get(`/reviews/product/${id}/average`);
            setAverage(avg.data.average);
            setComment('');
            setRating(5);
            showNotification('Review submitted successfully!', 'success');
        } catch (err) {
            showNotification('You have already reviewed this product', 'error');
        }
    };

    const handleAddToCart = () => {
        if (product.stock === 0) {
            showNotification(`${product.name} is out of stock!`, 'error');
            return;
        }
        addItem(product);
        showNotification(`${product.name} added to cart!`, 'success');
    };

    const handleAddToWishlist = async () => {
        if (!user) {
            showNotification('Please login to add to wishlist', 'error');
            return;
        }
        try {
            await api.post(`/wishlist/add?userId=${user.id}&productId=${product.id}`);
            showNotification(`${product.name} added to wishlist!`, 'success');
        } catch {
            showNotification(`${product.name} is already in your wishlist`, 'error');
        }
    };

    const renderStars = (ratingValue) => {
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={14} className="sm:w-4 sm:h-4 fill-white/70 text-white/70" />
                ))}
                {hasHalfStar && <StarHalf size={14} className="sm:w-4 sm:h-4 fill-white/70 text-white/70" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={14} className="sm:w-4 sm:h-4 text-white/20" />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 px-4">
                    <div className="relative">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 border border-white/10 rounded-full" />
                        <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-t border-white/60 rounded-full animate-spin" />
                    </div>
                    <span className="text-white/30 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-light">Loading</span>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const convertedPrice = getConvertedPrice(product.price);

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

                <AnimatePresence>
                    {notification.show && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-[9998] flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-sm text-xs sm:text-sm font-body font-medium tracking-wide backdrop-blur-md border ${
                                notification.type === 'success'
                                    ? 'bg-white/5 border-white/20 text-white'
                                    : 'bg-red-950/40 border-red-500/30 text-red-300'
                            }`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="flex-1">{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 border-b border-white/8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                                <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">{product.category}</span>
                            </div>
                            <h1 className="font-display text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3 sm:mb-4 px-2">
                                {product.name}
                            </h1>
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-2">
                                    {renderStars(average)}
                                    <span className="text-white/40 text-[10px] sm:text-xs">
                                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                    </span>
                                    <span className="text-white/40 text-[10px] sm:text-xs">{average.toFixed(1)}/5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/30 hover:text-white/60 text-[8px] sm:text-[9px] lg:text-xs font-body tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 transition"
                    >
                        <ArrowLeft size={10} className="sm:w-3 sm:h-3" />
                        Back to Home
                    </button>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
                        {/* Image Gallery - responsive */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="relative rounded-sm overflow-hidden border border-white/8 bg-white/[0.02]">
                                <div
                                    className="aspect-square cursor-pointer relative group"
                                    onClick={() => images.length > 0 && setIsZoomed(true)}
                                >
                                    {images.length > 0 && images[currentImageIndex] ? (
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-4 sm:p-6"
                                            onError={(e) => {
                                                e.target.src = '';
                                                e.target.parentElement.innerHTML = '<div class="h-full flex items-center justify-center"><svg class="w-12 h-12 sm:w-20 sm:h-20 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <Package size={48} className="sm:w-20 sm:h-20 text-white/10" />
                                        </div>
                                    )}

                                    {images.length > 0 && (
                                        <button
                                            className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsZoomed(true);
                                            }}
                                        >
                                            <ZoomIn size={12} className="sm:w-4 sm:h-4 text-white/70" />
                                        </button>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1.5 sm:p-2 rounded-full transition hover:bg-black/70"
                                        >
                                            <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-white/70" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1.5 sm:p-2 rounded-full transition hover:bg-black/70"
                                        >
                                            <ChevronRight size={16} className="sm:w-5 sm:h-5 text-white/70" />
                                        </button>
                                    </>
                                )}

                                {images.length > 1 && (
                                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition ${
                                                    currentImageIndex === index
                                                        ? 'bg-white w-2 sm:w-3'
                                                        : 'bg-white/30'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails - responsive */}
                            {images.length > 1 && (
                                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 justify-center">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-10 h-10 sm:w-12 sm:h-14 rounded-sm overflow-hidden border transition ${
                                                currentImageIndex === index
                                                    ? 'border-white'
                                                    : 'border-white/20 hover:border-white/50'
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info - responsive avec devise */}
                        <div>
                            <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">{product.description}</p>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <span className="font-display text-white text-3xl sm:text-4xl font-light">
                                    {convertedPrice}<span className="text-white/40 text-lg sm:text-xl ml-0.5 sm:ml-1">{currencySymbols[currency] || currency}</span>
                                </span>
                                {product.stock > 0 ? (
                                    <span className="text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase border border-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1">
                                        In stock ({product.stock})
                                    </span>
                                ) : (
                                    <span className="text-red-400/70 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase border border-red-500/30 px-1.5 sm:px-2 py-0.5 sm:py-1">
                                        Out of stock
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className={`flex-1 py-2.5 sm:py-3 text-[8px] sm:text-[9px] lg:text-[10px] font-body font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase transition ${
                                        product.stock === 0
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                                            : 'bg-white text-black hover:bg-white/90'
                                    }`}
                                >
                                    <ShoppingCart size={10} className="sm:w-3 sm:h-3 inline mr-1.5 sm:mr-2" />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleAddToWishlist}
                                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 transition"
                                >
                                    <Heart size={14} className="sm:w-4 sm:h-4 text-white/60" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section - responsive */}
                    <div className="border-t border-white/8 pt-8 sm:pt-10 lg:pt-12">
                        <h2 className="font-display text-white text-xl sm:text-2xl font-light mb-6 sm:mb-8 flex items-center gap-2">
                            <MessageCircle size={16} className="sm:w-5 sm:h-5 text-white/40" />
                            Customer Reviews ({reviews.length})
                        </h2>

                        {user && (
                            <div className="bg-white/[0.02] border border-white/8 p-4 sm:p-6 mb-6 sm:mb-8">
                                <h3 className="text-white/70 text-[10px] sm:text-xs font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4">Write a review</h3>
                                <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                size={16}
                                                className={`sm:w-5 sm:h-5 ${star <= rating ? 'fill-white/70 text-white/70' : 'text-white/20'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Write your review here..."
                                    rows={3}
                                    className="w-full bg-transparent border border-white/10 p-2.5 sm:p-3 text-white/70 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition mb-3 sm:mb-4"
                                />
                                <button
                                    onClick={submitReview}
                                    className="bg-white text-black text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase px-4 sm:px-6 py-2 sm:py-2.5 hover:bg-white/90 transition"
                                >
                                    Submit Review
                                </button>
                            </div>
                        )}

                        {reviews.length === 0 ? (
                            <div className="text-center py-10 sm:py-12">
                                <MessageCircle size={32} className="sm:w-10 sm:h-10 text-white/10 mx-auto mb-2 sm:mb-3" />
                                <p className="text-white/30 text-xs sm:text-sm">No reviews yet. Be the first to review this product!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 sm:gap-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border border-white/8 p-3 sm:p-4 hover:border-white/20 transition">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2 sm:mb-3">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 flex items-center justify-center">
                                                    <span className="text-white/50 text-[10px] sm:text-xs font-body">
                                                        {review.user?.firstName?.charAt(0)}{review.user?.lastName?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 text-xs sm:text-sm font-medium">
                                                        {review.user?.firstName} {review.user?.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/30 text-[8px] sm:text-[9px] lg:text-[10px]">
                                                        <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                                                        {new Date(review.createdAt).toLocaleDateString('en-US')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 sm:gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p className="text-white/50 text-xs sm:text-sm leading-relaxed pl-0 sm:pl-11">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Zoom Modal - responsive */}
                <AnimatePresence>
                    {isZoomed && images.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsZoomed(false)}
                            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center cursor-pointer"
                        >
                            <motion.img
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className="max-w-[90vw] max-h-[90vh] object-contain"
                            />
                            <button
                                onClick={() => setIsZoomed(false)}
                                className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/10 p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition"
                            >
                                <X size={16} className="sm:w-5 sm:h-5 text-white" />
                            </button>

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 sm:p-3 rounded-full hover:bg-black/70 transition"
                                    >
                                        <ChevronLeft size={20} className="sm:w-7 sm:h-7 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 sm:p-3 rounded-full hover:bg-black/70 transition"
                                    >
                                        <ChevronRight size={20} className="sm:w-7 sm:h-7 text-white" />
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}