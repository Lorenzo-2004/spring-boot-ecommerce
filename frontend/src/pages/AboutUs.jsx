import { motion } from 'framer-motion';
import {
    Award, Users, ShoppingBag, Truck, Shield, Headphones,
    Star, Heart, Zap, Globe, Clock, CreditCard,
    ArrowRight, CheckCircle, Package, Sparkles, Rocket, Target, Crown
} from 'lucide-react';

export default function AboutUs() {

    const stats = [
        { value: '500+', label: 'Products', icon: Package },
        { value: '10k+', label: 'Happy Customers', icon: Users },
        { value: '20+', label: 'Regions', icon: Globe },
        { value: '24/7', label: 'Support', icon: Headphones },
    ];

    const features = [
        { icon: Truck, title: 'Free Delivery', description: 'Free shipping on orders over 50€' },
        { icon: Shield, title: 'Secure Payment', description: '100% secure payment processing' },
        { icon: Clock, title: '24/7 Support', description: 'Round the clock customer service' },
        { icon: CreditCard, title: 'Easy Returns', description: '30-day money back guarantee' },
        { icon: Star, title: 'Premium Quality', description: 'Curated top-tier products' },
        { icon: Zap, title: 'Fast Shipping', description: 'Quick delivery' },
    ];

    const team = [
        { name: 'Lorenzo R.', role: 'Founder & CEO', icon: Crown },
        { name: 'Luc R.', role: 'Head of Operations', icon: Target },
        { name: 'Herizo R.', role: 'Customer Support', icon: Heart },
        { name: 'Micka R.', role: 'Product Manager', icon: Sparkles },
    ];

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

                <div className="relative border-b border-white/8 pt-16 sm:pt-20 pb-10 sm:pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                            <Sparkles size={11} className="sm:w-3.5 sm:h-3.5 text-white/30" />
                            <span className="text-white/30 text-[7px] sm:text-[8px] lg:text-[9px] font-body tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase">Our Story</span>
                        </div>
                        <h1 className="font-display text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
                            About <span className="text-white/60">e-TECH Zone</span>
                        </h1>
                        <p className="text-white/40 text-xs sm:text-sm max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed px-4">
                            We're on a mission to provide the best tech products with exceptional customer service,
                            making technology accessible to everyone.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16">

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-12 sm:mb-16 lg:mb-20">
                        {stats.map((stat, i) => (
                            <div key={i} className="border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-6 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                                    <stat.icon size={18} className="sm:w-6 sm:h-6 text-white/40" />
                                </div>
                                <p className="font-display text-white text-xl sm:text-2xl lg:text-3xl font-light">{stat.value}</p>
                                <p className="text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center mb-12 sm:mb-16 lg:mb-20">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                                <Rocket size={11} className="sm:w-3.5 sm:h-3.5 text-white/40" />
                                <span className="text-white/40 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase">Our Mission</span>
                            </div>
                            <h2 className="font-display text-white text-2xl sm:text-3xl font-light mb-3 sm:mb-4">
                                Making Tech <span className="text-white/60">Accessible</span> to Everyone
                            </h2>
                            <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                                At e-TECH Zone, we believe that cutting-edge technology should be available to all.
                                We carefully curate our product selection to bring you the best quality at competitive prices.
                            </p>
                            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                                Our team is dedicated to providing exceptional customer service and ensuring your
                                shopping experience is seamless from start to finish.
                            </p>
                        </div>
                        <div className="border border-white/8 bg-white/[0.02] p-6 sm:p-8 text-center w-full">
                            <Quote size={32} className="sm:w-10 sm:h-10 text-white/20 mx-auto mb-3 sm:mb-4" />
                            <p className="text-white/60 italic text-base sm:text-lg">
                                "Technology is best when it brings people together. We're here to make that happen."
                            </p>
                            <p className="text-white/40 text-[10px] sm:text-xs mt-3 sm:mt-4">— Lorenzo R., Founder</p>
                        </div>
                    </div>

                    <div className="mb-12 sm:mb-16 lg:mb-20">
                        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                            <h2 className="font-display text-white text-2xl sm:text-3xl font-light mb-2">
                                Why Choose Us
                            </h2>
                            <p className="text-white/40 text-xs sm:text-sm">We pride ourselves on delivering excellence</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                            {features.map((feature, i) => (
                                <div key={i} className="border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-6 hover:border-white/20 transition">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 border border-white/10 flex items-center justify-center mb-3 sm:mb-4">
                                        <feature.icon size={14} className="sm:w-4 sm:h-4 text-white/40" />
                                    </div>
                                    <h3 className="text-white/80 text-xs sm:text-sm font-body tracking-wide mb-0.5 sm:mb-1">{feature.title}</h3>
                                    <p className="text-white/40 text-[10px] sm:text-xs">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-12 sm:mb-16 lg:mb-20">
                        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                            <h2 className="font-display text-white text-2xl sm:text-3xl font-light mb-2">
                                Meet Our Team
                            </h2>
                            <p className="text-white/40 text-xs sm:text-sm">Passionate individuals dedicated to your satisfaction</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                            {team.map((member, i) => (
                                <div key={i} className="border border-white/8 bg-white/[0.02] p-4 sm:p-5 lg:p-6 text-center">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                        <member.icon size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/40" />
                                    </div>
                                    <h3 className="text-white/80 text-xs sm:text-sm font-body">{member.name}</h3>
                                    <p className="text-white/40 text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.1em] uppercase mt-1">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border border-white/8 bg-white/[0.02] p-6 sm:p-8 lg:p-10 text-center">
                        <h2 className="font-display text-white text-2xl sm:text-3xl font-light mb-2 sm:mb-3">Ready to Shop?</h2>
                        <p className="text-white/40 text-xs sm:text-sm mb-4 sm:mb-6">Join thousands of satisfied customers</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-white text-black text-[8px] sm:text-[9px] font-body tracking-[0.2em] sm:tracking-[0.25em] uppercase px-5 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 hover:bg-white/90 transition inline-flex items-center gap-1.5 sm:gap-2"
                        >
                            Start Shopping
                            <ArrowRight size={10} className="sm:w-3 sm:h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function Quote({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
    );
}

