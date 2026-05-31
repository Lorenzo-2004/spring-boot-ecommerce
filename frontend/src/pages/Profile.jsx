import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Lock, Package, Heart, Crown, Settings, LogOut, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Profile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            currentPassword: '',
            newPassword: '',
        }
    });
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const newPassword = watch('newPassword');
    const requireCurrentPassword = newPassword && newPassword.length > 0;

    if (!user) {
        navigate('/login');
        return null;
    }

    const onSubmit = async (data) => {
        if (requireCurrentPassword && !data.currentPassword) {
            setErrorMsg('Current password is required to change your password.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const updateData = {
                firstName: data.firstName,
                lastName: data.lastName,
            };
            if (data.newPassword && data.newPassword.length >= 6) {
                updateData.currentPassword = data.currentPassword;
                updateData.newPassword = data.newPassword;
            } else if (data.newPassword && data.newPassword.length < 6) {
                setErrorMsg('New password must be at least 6 characters.');
                setLoading(false);
                return;
            }

            const res = await api.put(`/auth/${user.id}`, updateData);
            localStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            // Reset password fields
            data.currentPassword = '';
            data.newPassword = '';
        } catch (err) {
            const backendError = err.response?.data?.error || err.response?.data?.message;
            if (backendError && backendError.toLowerCase().includes('password')) {
                setErrorMsg('Current password is incorrect.');
            } else {
                setErrorMsg('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
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

            <div className="grain font-body min-h-screen bg-[#080808]">

                {/* Background grid - responsive */}
                <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                {/* Ambient light - responsive */}
                <div className="fixed top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

                    {/* Back button - responsive */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="text-white/30 hover:text-white/60 text-[10px] sm:text-xs font-body tracking-[0.2em] sm:tracking-[0.3em] uppercase flex items-center gap-1.5 sm:gap-2 transition"
                        >
                            <ArrowLeft size={10} className="sm:w-3 sm:h-3" />
                            Back to Home
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white/[0.02] border border-white/8 backdrop-blur-sm rounded-sm p-5 sm:p-6 md:p-8"
                    >
                        {/* Header - responsive */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10 pb-4 sm:pb-6 border-b border-white/8">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                                    <span className="font-display text-white/60 text-xl sm:text-2xl">
                                        {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="font-display text-white text-xl sm:text-2xl font-light tracking-tight">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="font-body text-white/30 text-[10px] sm:text-xs flex items-center gap-1 mt-0.5 sm:mt-1">
                                        <Mail size={10} className="sm:w-2.5 sm:h-2.5" />
                                        {user.email}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 mt-1.5 sm:mt-2 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.15em] sm:tracking-[0.2em] uppercase px-1.5 sm:px-2 py-0.5 border ${
                                        user.role === 'ADMIN' ? 'border-amber-500/30 text-amber-400' : 'border-white/20 text-white/40'
                                    }`}>
                                        {user.role === 'ADMIN' ? <Crown size={7} className="sm:w-2 sm:h-2" /> : <User size={7} className="sm:w-2 sm:h-2" />}
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            {user.role === 'ADMIN' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="sm:ml-auto text-white/30 hover:text-white/60 text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.3em] uppercase border border-white/10 px-2.5 sm:px-3 py-1.5 transition self-start sm:self-center"
                                >
                                    Admin
                                </button>
                            )}
                        </div>

                        {/* Success message - responsive */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-5 sm:mb-6 flex items-center gap-2 border-l border-emerald-500/50 bg-emerald-500/5 px-3 py-2 text-emerald-300 text-[10px] sm:text-xs font-body"
                            >
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Profile updated successfully!
                            </motion.div>
                        )}

                        {/* Error message - responsive */}
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-5 sm:mb-6 flex items-center gap-2 border-l border-red-500/50 bg-red-500/5 px-3 py-2 text-red-300 text-[10px] sm:text-xs font-body"
                            >
                                <AlertCircle size={11} className="sm:w-3 sm:h-3" />
                                {errorMsg}
                            </motion.div>
                        )}

                        {/* Form - responsive */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                                <div className="flex-1">
                                    <label className="block text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase mb-1 font-body">First Name</label>
                                    <input
                                        {...register('firstName')}
                                        className="w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase mb-1 font-body">Last Name</label>
                                    <input
                                        {...register('lastName')}
                                        className="w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body focus:border-white/30 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase mb-1 font-body">Current Password</label>
                                <input
                                    type="password"
                                    placeholder="Required only if changing password"
                                    {...register('currentPassword')}
                                    className={`w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/15 focus:border-white/30 outline-none transition ${
                                        requireCurrentPassword && !watch('currentPassword') ? 'border-b-red-500/50' : ''
                                    }`}
                                />
                                {requireCurrentPassword && !watch('currentPassword') && (
                                    <p className="text-red-400/70 text-[7px] sm:text-[8px] mt-1">Current password is required</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase mb-1 font-body">New Password</label>
                                <input
                                    type="password"
                                    placeholder="Leave empty to keep current"
                                    {...register('newPassword', { minLength: { value: 6, message: 'Minimum 6 characters' } })}
                                    className="w-full bg-transparent border-b border-white/10 py-1.5 sm:py-2 px-1 text-white/80 text-xs sm:text-sm font-body placeholder:text-white/15 focus:border-white/30 outline-none transition"
                                />
                                {errors.newPassword && (
                                    <p className="text-red-400/70 text-[7px] sm:text-[8px] mt-1">{errors.newPassword.message}</p>
                                )}
                                <p className="text-white/20 text-[7px] sm:text-[8px] mt-1">Minimum 6 characters</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="mt-4 sm:mt-6 w-full bg-white text-black py-2.5 sm:py-3 text-[8px] sm:text-[9px] lg:text-[10px] font-body font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                {loading ? (
                                    <span className="inline-block w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <Save size={10} className="sm:w-3 sm:h-3" />
                                )}
                                Save Changes
                            </motion.button>
                        </form>

                        {/* Action buttons - responsive */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/8 flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase py-2 sm:py-2.5 transition flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <Package size={10} className="sm:w-3 sm:h-3" />
                                My Orders
                            </button>
                            <button
                                onClick={() => navigate('/wishlist')}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase py-2 sm:py-2.5 transition flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <Heart size={10} className="sm:w-3 sm:h-3" />
                                Wishlist
                            </button>
                        </div>

                        {/* Logout button - responsive */}
                        <button
                            onClick={handleLogout}
                            className="w-full mt-3 sm:mt-4 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-300 text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase py-2 sm:py-2.5 transition border border-white/5 hover:border-red-500/30 flex items-center justify-center gap-1.5 sm:gap-2"
                        >
                            <LogOut size={10} className="sm:w-3 sm:h-3" />
                            Logout
                        </button>

                        {/* Decorative line - responsive */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
                            <span className="text-white/15 text-[7px] sm:text-[8px] tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase font-body">Secure account</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}