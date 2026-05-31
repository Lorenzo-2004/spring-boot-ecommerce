import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Eye, EyeOff, CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/register', data);
            setRegisteredEmail(data.email);
            setSuccess(true);
            // NE PLUS REDIRIGER AUTOMATIQUEMENT VERS LOGIN
            // L'utilisateur doit d'abord vérifier son email
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to create account');
        } finally {
            setLoading(false);
        }
    };

    // Validation pour empêcher les chiffres
    const validateNoNumbers = (value) => {
        if (!value) return true;
        if (/\d/.test(value)) {
            return 'Numbers are not allowed';
        }
        return true;
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

                {/* Ambient light - responsive avec couleur rose */}
                <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-md">

                    {/* Card - responsive padding avec bordure rose */}
                    <div className="bg-white/[0.02] border border-white/8 backdrop-blur-sm rounded-sm p-5 sm:p-6 md:p-8 hover:border-pink-500/30 transition-all duration-300">

                        {/* Minimal logo mark - responsive avec couleur rose */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 border border-pink-500/30 rounded-sm flex items-center justify-center bg-pink-500/5">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full" />
                            </div>
                        </div>

                        {/* Header - responsive */}
                        <div className="text-center mb-6 sm:mb-8 md:mb-10">
                            <h1 className="font-display text-white text-3xl sm:text-4xl font-light tracking-tight">Register</h1>
                            <p className="font-body text-pink-400/50 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-2 sm:mt-3">Create your account</p>
                        </div>

                        {/* SUCCESS MESSAGE MODIFIÉ - Avec vérification d'email */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-6 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-lg"
                            >
                                <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
                                <p className="text-emerald-300 text-center text-sm font-medium">
                                    Account created successfully!
                                </p>
                                <p className="text-white/60 text-center text-xs mt-2">
                                    We've sent a verification email to <strong className="text-pink-400">{registeredEmail}</strong>.<br />
                                    Please check your inbox and click the verification link to activate your account.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="mt-4 w-full bg-white/10 text-white py-2 text-sm rounded-lg hover:bg-white/20 transition"
                                >
                                    Back to Login
                                </button>
                            </motion.div>
                        )}

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

                        {/* Formulaire - caché si succès */}
                        {!success && (
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">

                                {/* Name fields - responsive avec blocage des chiffres */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                        <input
                                            placeholder="First Name"
                                            {...register('firstName', {
                                                required: 'First name is required',
                                                validate: validateNoNumbers
                                            })}
                                            onKeyPress={(e) => {
                                                if (/\d/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="w-full bg-transparent border-b border-white/10 py-2.5 sm:py-3 px-1 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/20 focus:border-pink-500/50 outline-none transition"
                                        />
                                        {errors.firstName && (
                                            <p className="text-red-400 text-[8px] sm:text-[10px] mt-1">{errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            placeholder="Last Name"
                                            {...register('lastName', {
                                                required: 'Last name is required',
                                                validate: validateNoNumbers
                                            })}
                                            onKeyPress={(e) => {
                                                if (/\d/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="w-full bg-transparent border-b border-white/10 py-2.5 sm:py-3 px-1 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/20 focus:border-pink-500/50 outline-none transition"
                                        />
                                        {errors.lastName && (
                                            <p className="text-red-400 text-[8px] sm:text-[10px] mt-1">{errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email field - responsive avec focus rose */}
                                <div>
                                    <input
                                        placeholder="Email"
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        className="w-full bg-transparent border-b border-white/10 py-2.5 sm:py-3 px-1 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/20 focus:border-pink-500/50 outline-none transition"
                                    />
                                    {errors.email && (
                                        <p className="text-red-400 text-[8px] sm:text-[10px] mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Password field with toggle - responsive avec focus rose */}
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
                                            }
                                        })}
                                        className="w-full bg-transparent border-b border-white/10 py-2.5 sm:py-3 px-1 pr-7 sm:pr-8 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/20 focus:border-pink-500/50 outline-none transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-pink-400 transition"
                                    >
                                        {showPassword ? <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" /> : <Eye size={12} className="sm:w-3.5 sm:h-3.5" />}
                                    </button>
                                    {errors.password && (
                                        <p className="text-red-400 text-[8px] sm:text-[10px] mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Submit button - responsive avec dégradé rose */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="mt-3 sm:mt-4 w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-2.5 sm:py-3 text-[9px] sm:text-xs font-body font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:from-pink-500 hover:to-rose-500 transition disabled:opacity-50 shadow-lg shadow-pink-500/20"
                                >
                                    {loading ? 'Creating account...' : 'Create my account'}
                                </motion.button>
                            </form>
                        )}

                        {/* Login link - responsive avec couleur rose (caché si succès) */}
                        {!success && (
                            <p className="text-center text-white/40 text-[10px] sm:text-xs font-body mt-6 sm:mt-8">
                                Already have an account?{' '}
                                <Link to="/login" className="text-pink-400 hover:text-pink-300 transition">
                                    Sign in
                                </Link>
                            </p>
                        )}

                        {/* Decorative line - responsive */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
                            <span className="text-white/15 text-[7px] sm:text-[8px] tracking-[0.3em] sm:tracking-[0.5em] uppercase font-body">Secure registration</span>
                        </div>
                    </div>

                    {/* Corner marks - responsive avec couleur rose */}
                    <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 border-t border-l border-pink-500/20" />
                    <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 border-t border-r border-pink-500/20" />
                    <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 border-b border-l border-pink-500/20" />
                    <div className="absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 border-b border-r border-pink-500/20" />
                </motion.div>
            </div>
        </>
    );
}