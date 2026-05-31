import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Lock, Globe, FileText, Clock, UserCheck, Server, Mail, Trash2 } from 'lucide-react';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    };

    const sections = [
        {
            icon: <Eye size={18} />,
            title: "1. INFORMATION WE COLLECT",
            content: [
                "• Personal information: name, email address, shipping address, phone number",
                "• Payment information: we do not store your full credit card details",
                "• Account information: order history, wishlist, product reviews",
                "• Technical data: IP address, browser type, visited pages, browsing duration"
            ]
        },
        {
            icon: <Database size={18} />,
            title: "2. HOW WE USE YOUR INFORMATION",
            content: [
                "• Process and deliver your orders",
                "• Communicate about your account and orders",
                "• Improve our website and services",
                "• Personalize your shopping experience",
                "• Send promotional offers (with your consent)"
            ]
        },
        {
            icon: <Lock size={18} />,
            title: "3. DATA SECURITY",
            content: [
                "• All data is encrypted using SSL/TLS technology",
                "• Your passwords are hashed and never stored in plain text",
                "• Restricted access to personal data",
                "• Continuous vulnerability monitoring"
            ]
        },
        {
            icon: <Globe size={18} />,
            title: "4. INFORMATION SHARING",
            content: [
                "• We never sell your personal data",
                "• Sharing with delivery providers for shipping",
                "• Secure payment providers (VISA, Amex, MasterCard)",
                "• Legal obligations (upon authority request)"
            ]
        },
        {
            icon: <Clock size={18} />,
            title: "5. DATA RETENTION",
            content: [
                "• Account data: kept as long as your account is active",
                "• Order history: kept for legal and tax purposes",
                "• You can request deletion of your data at any time"
            ]
        },
        {
            icon: <UserCheck size={18} />,
            title: "6. YOUR RIGHTS",
            content: [
                "• Right of access: know what data we hold",
                "• Right of rectification: correct your information",
                "• Right to erasure: delete your account and data",
                "• Right to object: refuse certain processing",
                "• Right to data portability: retrieve your data"
            ]
        },
        {
            icon: <Server size={18} />,
            title: "7. COOKIES & SIMILAR TECHNOLOGIES",
            content: [
                "• Essential cookies: necessary for website operation",
                "• Preference cookies: remember your settings",
                "• Analytics cookies: help us improve our services",
                "• You can manage cookie preferences in your browser"
            ]
        },
        {
            icon: <Mail size={18} />,
            title: "8. CONTACT US",
            content: [
                "• For any privacy questions or requests",
                "• Email: lorenzorafanomezantsoa@gmail.com",
                "• Phone: +261 38 94 088 53",
                "• Address: E-Tech Zone, Premium Tech Retail"
            ]
        },
        {
            icon: <Trash2 size={18} />,
            title: "9. ACCOUNT DELETION",
            content: [
                "• You can delete your account via your profile settings",
                "• Upon deletion, your personal data will be removed within 30 days",
                "• Order history may be kept for legal compliance",
                "• Contact us for any assistance with account deletion"
            ]
        }
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Inter:ital,wght@0,100..900;1,100..900&display=swap');
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                .font-body { font-family: 'Inter', sans-serif; }
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

            <div className="grain font-body min-h-screen bg-black">

                {/* Background grid */}
                <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px sm:80px 80px' }} />

                {/* Ambient light */}
                <div className="fixed top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                {/* Header */}
                <div className="border-b border-white/8 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-white/40 hover:text-white/70 transition p-1"
                            >
                                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                            </button>
                            <div className="inline-flex items-center gap-2">
                                <Shield size={16} className="sm:w-5 sm:h-5 text-white/30" />
                                <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] uppercase">Legal</span>
                            </div>
                        </div>
                        <h1 className="font-display text-white text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.15em] uppercase mt-2 sm:mt-3">
                            Last updated: April 2026
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">

                    {/* Introduction */}
                    <motion.div {...fadeIn} className="mb-8 sm:mb-10 lg:mb-12">
                        <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-body">
                            At E-Tech Zone, we take your privacy seriously. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you visit our website and use our services.
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy
                            policy, please do not access the site.
                        </p>
                    </motion.div>

                    {/* Sections */}
                    <div className="space-y-5 sm:space-y-6">
                        {sections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                className="border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-6 hover:border-white/15 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="text-white/30 group-hover:text-white/50 transition">
                                        {section.icon}
                                    </div>
                                    <h2 className="font-display text-white/80 text-xs sm:text-sm tracking-[0.15em] uppercase">
                                        {section.title}
                                    </h2>
                                </div>
                                <div className="space-y-1.5">
                                    {section.content.map((item, j) => (
                                        <p key={j} className="text-white/40 text-[10px] sm:text-xs leading-relaxed font-body ml-1 sm:ml-2">
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 sm:mt-10 lg:mt-12 pt-5 sm:pt-6 border-t border-white/8 text-center"
                    >
                        <p className="text-white/25 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase">
                            E-Tech Zone is committed to protecting your privacy and ensuring the security of your personal data.
                        </p>
                        <p className="text-white/20 text-[7px] sm:text-[8px] tracking-[0.15em] uppercase mt-2 sm:mt-3">
                            © 2026 E-Tech Zone · All Rights Reserved
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}