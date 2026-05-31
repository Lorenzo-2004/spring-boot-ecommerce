package com.ecommerce.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class CurrencyService {

    private static final Map<String, Double> exchangeRates = new HashMap<>();

    static {
        exchangeRates.put("EUR", 1.0);
        exchangeRates.put("USD", 1.09);
        exchangeRates.put("GBP", 0.86);
        exchangeRates.put("JPY", 164.0);
        exchangeRates.put("CAD", 1.48);
        exchangeRates.put("AUD", 1.62);
        exchangeRates.put("CHF", 0.96);
        exchangeRates.put("CNY", 7.85);
        exchangeRates.put("MGA", 4800.0);
    }

    public double convert(double amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }

        if (!exchangeRates.containsKey(fromCurrency)) {
            throw new RuntimeException("Currency not supported: " + fromCurrency);
        }

        if (!exchangeRates.containsKey(toCurrency)) {
            throw new RuntimeException("Currency not supported: " + toCurrency);
        }

        Double fromRate = exchangeRates.get(fromCurrency);
        Double toRate = exchangeRates.get(toCurrency);

        double amountInEUR = amount / fromRate;
        double converted = amountInEUR * toRate;

        return BigDecimal.valueOf(converted).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public Map<String, Object> getSupportedCurrencies() {
        Map<String, Object> currencies = new HashMap<>();
        currencies.put("currencies", exchangeRates.keySet());
        currencies.put("rates", exchangeRates);
        currencies.put("base", "EUR");
        return currencies;
    }

    public boolean isSupported(String currency) {
        return exchangeRates.containsKey(currency);
    }
}