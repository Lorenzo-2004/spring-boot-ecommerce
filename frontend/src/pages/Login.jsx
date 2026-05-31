import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Send } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const { register, handleSubmit, watch } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState(null);

    const watchedEmail = watch('email');

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setResendMessage(null);

        try {
            const res = await api.post('/auth/login', data);
            const { user, token } = res.data;

            // Vérifier si l'email est vérifié
            if (user && !user.enabled) {
                setError('Please verify your email before logging in. Check your inbox for the verification link.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Email or password incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!watchedEmail) {
            setResendMessage({ type: 'error', text: 'Please enter your email address first.' });
            return;
        }

        setResending(true);
        setResendMessage(null);

        try {
            await api.post(`/auth/resend-verification?email=${watchedEmail}`);
            setResendMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
        } catch (err) {
            setResendMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send verification email.' });
        } finally {
            setResending(false);
        }
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
            `}</style>

            <div className="grain font-body min-h-screen bg-[#080808] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">

                {/* Background grid - responsive */}
                <div className="absolute inset-0 opacity-[0.025]"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                {/* Ambient light - responsive avec couleur violette */}
                <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-md">

                    {/* Card - responsive padding avec bordure violette */}
                    <div className="bg-white/[0.02] border border-white/8 backdrop-blur-sm rounded-sm p-5 sm:p-6 md:p-8 hover:border-violet-500/30 transition-all duration-300">

                        {/* Minimal logo mark - responsive avec couleur violette */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 border border-violet-500/30 rounded-sm flex items-center justify-center bg-violet-500/5">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-400 rounded-full" />
                            </div>
                        </div>

                        {/* Header - responsive */}
                        <div className="text-center mb-6 sm:mb-8 md:mb-10">
                            <h1 className="font-display text-white text-3xl sm:text-4xl font-light tracking-tight">Sign in</h1>
                            <p className="font-body text-violet-400/50 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-2 sm:mt-3">Welcome back</p>
                        </div>

                        {/* Error message - responsive */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-5 sm:mb-6 flex items-center gap-2 border-l border-red-500/50 bg-red-500/5 px-3 py-2 text-red-300 text-[10px] sm:text-xs font-body">
                                <AlertCircle size={10} className="sm:w-3 sm:h-3" />
                                {error}
                            </motion.div>
                        )}

                        {/* Resend message - responsive */}
                        {resendMessage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`mb-5 sm:mb-6 flex items-center gap-2 border-l px-3 py-2 text-[10px] sm:text-xs font-body ${
                                    resendMessage.type === 'success'
                                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-300'
                                        : 'border-red-500/50 bg-red-500/5 text-red-300'
                                }`}>
                                <AlertCircle size={10} className="sm:w-3 sm:h-3" />
                                {resendMessage.text}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">

                            {/* Email field - responsive avec focus violet */}
                            <div className="relative">
                                <Mail size={12} className="sm:w-3.5 sm:h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400" />
                                <input
                                    placeholder="Email"
                                    type="email"
                                    {...register('email', { required: true })}
                                    className="w-full bg-transparent border-b border-white/10 py-2.5 sm:py-3 pl-8 pr-3 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/20 focus:border-violet-500/50 outline-none transition"
                                />
                            </div>

                            {/* Password field with toggle - responsive avec focus violet */}
                            <div className="relative">
                                <Lock size={12} className="sm:w-3.5 sm:h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    {...register('password', { required: true })}
                                    className="w-full bg-transparent border-b border-white/10 py-2.5 sm:py-3 pl-8 pr-7 sm:pr-8 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/20 focus:border-violet-500/50 outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-violet-400 transition"
                                >
                                    {showPassword ? <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" /> : <Eye size={12} className="sm:w-3.5 sm:h-3.5" />}
                                </button>
                            </div>

                            {/* Submit button - responsive avec dégradé violet */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 sm:py-3 text-[9px] sm:text-xs font-body font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-50 shadow-lg shadow-violet-500/20"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </motion.button>
                        </form>

                        {/* Register link - responsive avec couleur violette */}
                        <p className="text-center text-white/40 text-[10px] sm:text-xs font-body mt-6 sm:mt-8">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-violet-400 hover:text-violet-300 transition">
                                Sign up
                            </Link>
                        </p>

                        {/* Resend verification link - NOUVEAU */}
                        <div className="text-center mt-4">
                            <button
                                onClick={handleResendVerification}
                                disabled={resending}
                                className="text-white/30 hover:text-violet-400 text-[8px] sm:text-[9px] tracking-[0.15em] uppercase transition flex items-center justify-center gap-1 mx-auto"
                            >
                                {resending ? (
                                    <>
                                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={10} />
                                        Resend verification email
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Decorative line - responsive */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
                            <span className="text-white/15 text-[7px] sm:text-[8px] tracking-[0.3em] sm:tracking-[0.5em] uppercase font-body">Secure access</span>
                        </div>
                    </div>

                    {/* Corner marks - responsive avec couleur violette */}
                    <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 border-t border-l border-violet-500/20" />
                    <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 border-t border-r border-violet-500/20" />
                    <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 border-b border-l border-violet-500/20" />
                    <div className="absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 border-b border-r border-violet-500/20" />
                </motion.div>
            </div>
        </>
    );
}