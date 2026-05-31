import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const res = await api.get(`/auth/verify?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Email verified successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Invalid or expired verification link');
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md w-full"
            >
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-8">
                    {status === 'loading' && (
                        <>
                            <Loader2 size={48} className="text-violet-400 mx-auto mb-4 animate-spin" />
                            <h2 className="text-white text-xl mb-2">Verifying your email...</h2>
                            <p className="text-white/40 text-sm">Please wait while we verify your account.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                            <h2 className="text-white text-xl mb-2">Email Verified!</h2>
                            <p className="text-white/60 mb-4">{message}</p>
                            <p className="text-white/40 text-sm">Redirecting to login page...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
                            <h2 className="text-white text-xl mb-2">Verification Failed</h2>
                            <p className="text-white/60 mb-4">{message}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-4 px-6 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition"
                            >
                                Back to Login
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}