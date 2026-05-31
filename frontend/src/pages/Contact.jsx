import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, Clock, CheckCircle, AlertCircle, MessageCircle, Loader2, Menu, X } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [focusedField, setFocusedField] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const user = JSON.parse(localStorage.getItem('user'));
    const defaultName  = user ? user.firstName + ' ' + user.lastName : '';
    const defaultEmail = user ? user.email : '';

    const [formData, setFormData] = useState({
        name: defaultName, email: defaultEmail, subject: '', message: ''
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (formData.name.trim().length > 100) {
            errors.name = 'Name must be less than 100 characters';
        }

        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        } else if (formData.subject.trim().length < 3) {
            errors.subject = 'Subject must be at least 3 characters';
        } else if (formData.subject.trim().length > 200) {
            errors.subject = 'Subject must be less than 200 characters';
        }

        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
        } else if (formData.message.trim().length > 2000) {
            errors.message = 'Message must be less than 2000 characters';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showNotification('Please fix the errors in the form', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post('/contact', formData);
            setSuccess(true);
            setFormData(prev => ({ ...prev, subject: '', message: '' }));
            showNotification("Message sent successfully! We'll get back to you soon.", 'success');
            setTimeout(() => setSuccess(false), 5000);
            setFieldErrors({});
        } catch (err) {
            const msg = 'Failed to send message. Please try again.';
            setError(msg);
            showNotification(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => window.open('https://wa.me/261389408853', '_blank');

    const contactInfo = [
        { icon: Mail, title: 'Email', info: 'lorenzorafanomezantsoa@gmail.com', link: 'mailto:lorenzorafanomezantsoa@gmail.com', onClick: null },
        { icon: Phone, title: 'Phone', info: '+261 38 94 088 53', link: 'tel:+261389408853', onClick: null },
        { icon: MessageCircle, title: 'WhatsApp', info: '+261 38 94 088 53', link: null, onClick: handleWhatsApp },
        { icon: Clock, title: 'Business Hours', info: 'Mon – Fri: 9:00 AM – 6:00 PM', link: null, onClick: null },
    ];

    const inputClass = (field) =>
        `w-full px-0 py-2.5 sm:py-3 bg-transparent border-b outline-none text-white/70 placeholder-white/15 text-xs sm:text-sm transition-all duration-300 resize-none db-body ${
            focusedField === field ? 'border-white/40' : 'border-white/12'
        } ${fieldErrors[field] ? 'border-b-red-500/50' : ''}`;

    const labelClass = 'db-body text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] lg:tracking-[0.4em] uppercase text-white/25 mb-1.5 sm:mb-2 block';

    return (
        <>
            <style>{`
               @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
               @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
               .font-display { font-family: 'Inter', sans-serif; }
               .font-body    { font-family: 'Space Grotesk', sans-serif; }
                .info-card { border: 1px solid rgba(255,255,255,0.07); transition: border-color 0.25s, background 0.25s; }
                .info-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.02); }
                @media (max-width: 640px) {
                    .info-card { padding: 12px 0; }
                }
            `}</style>

            <div className="db-body min-h-screen bg-[#080808]">

                {/* ── NOTIFICATION RESPONSIVE ── */}
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-[9998] flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm border backdrop-blur-md ${
                            notification.type === 'success'
                                ? 'bg-white/5 border-white/20 text-white'
                                : 'bg-red-950/40 border-red-500/30 text-red-300'
                        }`}>
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="flex-1">{notification.message}</span>
                    </motion.div>
                )}

                {/* ── HEADER RESPONSIVE ── */}
                <div className="border-b border-white/8">
                    <div className="h-px w-full bg-white/10" />
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16 text-center">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                            <p className="db-body text-white/20 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase mb-3 sm:mb-4">— Contact</p>
                            <h1 className="db-display text-white font-light" style={{ fontSize: 'clamp(28px, 8vw, 80px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                                We hear you !
                            </h1>
                            <p className="db-body text-white/25 text-xs sm:text-sm mt-4 sm:mt-5 max-w-md mx-auto leading-relaxed px-4">
                                Questions, feedback, or just want to say hello? Send us a message and we'll respond as soon as possible.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* ── MAIN CONTENT RESPONSIVE ── */}
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
                    <div className="flex flex-col lg:flex-row gap-px bg-white/5">

                        {/* ── LEFT — Contact info responsive ── */}
                        <div className="bg-[#080808] p-5 sm:p-6 lg:p-10 w-full lg:w-1/3">
                            <p className="db-body text-white/20 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase mb-6 sm:mb-8">— Reach us</p>

                            {contactInfo.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    onClick={item.onClick || undefined}
                                    className={`info-card py-4 sm:py-5 lg:py-6 px-0 border-b border-white/5 last:border-0 ${item.onClick ? 'cursor-pointer' : ''}`}>

                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <item.icon size={11} className="sm:w-3 sm:h-3 text-white/30" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="db-body text-white/20 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] lg:tracking-[0.4em] uppercase mb-1 sm:mb-1.5">{item.title}</p>
                                            {item.link ? (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                   className="db-body text-white/55 text-[11px] sm:text-sm hover:text-white/80 transition break-all"
                                                   onClick={e => e.stopPropagation()}>
                                                    {item.info}
                                                </a>
                                            ) : (
                                                <p className="db-body text-white/55 text-[11px] sm:text-sm break-words">{item.info}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Decorative element - responsive */}
                            <div className="pt-8 sm:pt-10 lg:pt-12">
                                <div className="w-px h-12 sm:h-16 lg:h-20 bg-gradient-to-b from-white/10 to-transparent" />
                                <p className="db-display italic text-white/10 text-2xl sm:text-3xl lg:text-4xl font-light mt-3 sm:mt-4 leading-tight">
                                    We reply<br />within 24h.
                                </p>
                            </div>
                        </div>

                        {/* ── RIGHT — Form responsive ── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#080808] p-5 sm:p-6 lg:p-10 w-full lg:w-2/3">

                            <p className="db-body text-white/20 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] uppercase mb-6 sm:mb-8">— Send a message</p>

                            {/* Status banners - responsive */}
                            {success && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                            className="mb-5 sm:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 border border-emerald-500/20 bg-emerald-500/5 px-3 sm:px-5 py-3 sm:py-4">
                                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <p className="db-body text-emerald-400/80 text-[11px] sm:text-sm">Message sent successfully! We'll get back to you soon.</p>
                                </motion.div>
                            )}
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                            className="mb-5 sm:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 border border-red-500/20 bg-red-500/5 px-3 sm:px-5 py-3 sm:py-4">
                                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-400 shrink-0" />
                                    <p className="db-body text-red-400/80 text-[11px] sm:text-sm">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
                                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-8">
                                    <div className="flex-1">
                                        <label className={labelClass}>Your Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            disabled={!!user}
                                            placeholder=""
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            className={inputClass('name')}
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                        {fieldErrors.name && (
                                            <p className="text-red-400 text-[8px] sm:text-[9px] lg:text-[10px] mt-1">{fieldErrors.name}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelClass}>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={!!user}
                                            placeholder=""
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className={inputClass('email')}
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                        {fieldErrors.email && (
                                            <p className="text-red-400 text-[8px] sm:text-[9px] lg:text-[10px] mt-1">{fieldErrors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Subject *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="What is your message about?"
                                        onFocus={() => setFocusedField('subject')}
                                        onBlur={() => setFocusedField(null)}
                                        className={inputClass('subject')}
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    />
                                    {fieldErrors.subject && (
                                        <p className="text-red-400 text-[8px] sm:text-[9px] lg:text-[10px] mt-1">{fieldErrors.subject}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Message *</label>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Write your message here..."
                                        onFocus={() => setFocusedField('message')}
                                        onBlur={() => setFocusedField(null)}
                                        className={inputClass('message')}
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    />
                                    {fieldErrors.message && (
                                        <p className="text-red-400 text-[8px] sm:text-[9px] lg:text-[10px] mt-1">{fieldErrors.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="db-body bg-white text-black px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 text-[8px] sm:text-[9px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase font-medium hover:bg-white/85 transition disabled:opacity-40 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
                                        {loading ? (
                                            <>
                                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={9} className="sm:w-2.5 sm:h-2.5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                    <p className="db-body text-white/15 text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-center sm:text-left">
                                        We reply within 24 hours
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}
