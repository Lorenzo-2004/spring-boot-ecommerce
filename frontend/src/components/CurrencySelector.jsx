import { useState, useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';

export default function CurrencySelector({ onCurrencyChange }) {
    const [selectedCurrency, setSelectedCurrency] = useState('EUR');
    const [isOpen, setIsOpen] = useState(false);
    const hasInitialized = useRef(false);

    const currencies = [
        { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
        { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
        { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
        { code: 'MGA', symbol: 'Ar', flag: '🇲🇬', name: 'Malagasy Ariary' },
        { code: 'JPY', symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
        { code: 'CHF', symbol: 'Fr', flag: '🇨🇭', name: 'Swiss Franc' },
        { code: 'CNY', symbol: '¥', flag: '🇨🇳', name: 'Chinese Yuan' }
    ];

    const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

    // ✅ CORRECTION : Appel unique au montage
    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency');
        if (savedCurrency && savedCurrency !== selectedCurrency) {
            setSelectedCurrency(savedCurrency);
            if (onCurrencyChange) {
                onCurrencyChange(savedCurrency);
            }
        }
    }, []);

    const handleSelect = (currencyCode) => {
        if (currencyCode === selectedCurrency) {
            setIsOpen(false);
            return;
        }
        setSelectedCurrency(currencyCode);
        localStorage.setItem('currency', currencyCode);
        if (onCurrencyChange) onCurrencyChange(currencyCode);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <div className="hidden sm:block">
                <div className="flex items-center gap-2 border border-white/10 hover:border-white/30 transition px-2 sm:px-3 py-1 sm:py-1.5">
                    <DollarSign size={11} className="sm:w-3.5 sm:h-3.5 text-white/40" />
                    <select
                        value={selectedCurrency}
                        onChange={(e) => handleSelect(e.target.value)}
                        className="bg-transparent text-white/70 text-[9px] sm:text-[10px] lg:text-[11px] font-body tracking-wide focus:outline-none cursor-pointer"
                    >
                        {currencies.map(currency => (
                            <option key={currency.code} value={currency.code} className="bg-[#080808] text-white/70">
                                {currency.flag} {currency.code} ({currency.symbol})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sm:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 border border-white/10 hover:border-white/30 transition px-2 py-1.5"
                >
                    <DollarSign size={11} className="text-white/40" />
                    <span className="text-white/70 text-[9px] font-body tracking-wide">
                        {selectedCurrencyData?.flag} {selectedCurrencyData?.code}
                    </span>
                    <svg
                        className={`w-3 h-3 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/60"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-1 z-50 w-48 bg-[#080808] border border-white/10 shadow-2xl max-h-60 overflow-y-auto">
                            {currencies.map((currency) => (
                                <button
                                    key={currency.code}
                                    onClick={() => handleSelect(currency.code)}
                                    className={`w-full text-left px-3 py-2 text-[10px] font-body transition flex items-center gap-2 ${
                                        selectedCurrency === currency.code
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <span className="text-sm">{currency.flag}</span>
                                    <span className="flex-1">{currency.code}</span>
                                    <span className="text-white/30 text-[9px]">{currency.symbol}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}