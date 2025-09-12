import { useState, useEffect, useCallback } from 'react';

// Tipos para el sistema de monedas
export type Currency = 'USD' | 'COP';

export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  source: string;
  lastUpdated: number;
  warning?: string;
}

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  lastUpdated: number;
  source: string;
}

export interface CurrencyStats {
  average: number;
  highest: number;
  lowest: number;
  current: number;
  trend: 'rising' | 'falling' | 'stable';
  percentChange: number;
  dataPoints: number;
}

// Hook principal para manejo de monedas
export function useCurrency() {
  const [currentRates, setCurrentRates] = useState<{ [key: string]: ExchangeRate }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>('COP');

  // Obtener tasa de cambio actual
  const getExchangeRate = useCallback(async (fromCurrency: Currency, toCurrency: Currency): Promise<ExchangeRate> => {
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        rate: 1,
        source: 'same_currency',
        lastUpdated: Date.now()
      };
    }

    const key = `${fromCurrency}_${toCurrency}`;
    
    // Verificar caché (válido por 5 minutos)
    const cachedRate = currentRates[key];
    if (cachedRate && Date.now() - cachedRate.lastUpdated < 5 * 60 * 1000) {
      return cachedRate;
    }

    try {
      setIsLoading(true);
      
      // En producción, esto sería una llamada a tu API de Convex
      // Por ahora simularemos con valores realistas
      const simulatedRate = await simulateExchangeRateAPI(fromCurrency, toCurrency);
      
      const newRate: ExchangeRate = {
        fromCurrency,
        toCurrency,
        rate: simulatedRate.rate,
        source: simulatedRate.source,
        lastUpdated: Date.now()
      };

      setCurrentRates(prev => ({
        ...prev,
        [key]: newRate
      }));

      return newRate;
    } catch (error) {
      // Usar tasa de fallback
      const fallbackRate = fromCurrency === 'USD' ? 4000 : 0.00025;
      return {
        fromCurrency,
        toCurrency,
        rate: fallbackRate,
        source: 'fallback',
        lastUpdated: Date.now(),
        warning: 'Using fallback exchange rate'
      };
    } finally {
      setIsLoading(false);
    }
  }, [currentRates]);

  // Convertir montos entre monedas
  const convertCurrency = useCallback(async (
    amount: number, 
    fromCurrency: Currency, 
    toCurrency: Currency
  ): Promise<ConversionResult> => {
    const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = Math.round(amount * exchangeRate.rate * 100) / 100;

    return {
      originalAmount: amount,
      convertedAmount,
      rate: exchangeRate.rate,
      fromCurrency,
      toCurrency,
      lastUpdated: exchangeRate.lastUpdated,
      source: exchangeRate.source
    };
  }, [getExchangeRate]);

  // Formatear moneda según el tipo
  const formatCurrency = useCallback((amount: number, currency: Currency): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } else {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
  }, []);

  // Formatear monto sin símbolo de moneda
  const formatAmount = useCallback((amount: number, currency: Currency): string => {
    if (currency === 'USD') {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      return Math.round(amount).toLocaleString('es-CO');
    }
  }, []);

  // Obtener símbolo de moneda
  const getCurrencySymbol = useCallback((currency: Currency): string => {
    return currency === 'USD' ? '$' : '$';
  }, []);

  // Obtener nombre de moneda
  const getCurrencyName = useCallback((currency: Currency): string => {
    return currency === 'USD' ? 'Dólar Americano' : 'Peso Colombiano';
  }, []);

  // Obtener código de moneda para mostrar
  const getCurrencyCode = useCallback((currency: Currency): string => {
    return currency;
  }, []);

  // Actualizar tasas automáticamente
  const updateRates = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Actualizar USD to COP
      await getExchangeRate('USD', 'COP');
      // Actualizar COP to USD
      await getExchangeRate('COP', 'USD');
      
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error updating exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getExchangeRate]);

  // Obtener estadísticas de la moneda
  const getCurrencyStats = useCallback(async (
    fromCurrency: Currency, 
    toCurrency: Currency, 
    days: number = 7
  ): Promise<CurrencyStats> => {
    // En producción, esto llamaría a tu función de Convex
    // Por ahora simulamos estadísticas
    const baseRate = fromCurrency === 'USD' ? 4000 : 0.00025;
    const fluctuation = baseRate * 0.05; // 5% de variación

    return {
      average: baseRate,
      highest: baseRate + fluctuation,
      lowest: baseRate - fluctuation,
      current: baseRate + (Math.random() - 0.5) * fluctuation * 0.5,
      trend: Math.random() > 0.5 ? 'rising' : Math.random() > 0.5 ? 'falling' : 'stable',
      percentChange: (Math.random() - 0.5) * 10, // ±5%
      dataPoints: days * 4 // Simulamos 4 puntos por día
    };
  }, []);

  // Auto-actualizar cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      updateRates();
    }, 5 * 60 * 1000);

    // Actualización inicial
    updateRates();

    return () => clearInterval(interval);
  }, [updateRates]);

  return {
    // Estado
    currentRates,
    isLoading,
    lastUpdate,
    preferredCurrency,
    
    // Acciones
    setPreferredCurrency,
    updateRates,
    
    // Funciones de conversión
    getExchangeRate,
    convertCurrency,
    
    // Funciones de formato
    formatCurrency,
    formatAmount,
    getCurrencySymbol,
    getCurrencyName,
    getCurrencyCode,
    
    // Estadísticas
    getCurrencyStats
  };
}

// Simulador de API de tasas de cambio
async function simulateExchangeRateAPI(fromCurrency: Currency, toCurrency: Currency) {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Simular tasas realistas con pequeñas fluctuaciones
  const baseRates = {
    'USD_COP': 4000,
    'COP_USD': 0.00025
  };

  const key = `${fromCurrency}_${toCurrency}` as keyof typeof baseRates;
  const baseRate = baseRates[key] || 1;
  
  // Agregar fluctuación pequeña (±2%)
  const fluctuation = (Math.random() - 0.5) * 0.04;
  const rate = baseRate * (1 + fluctuation);

  return {
    rate: Math.round(rate * 100000) / 100000, // 5 decimales de precisión
    source: 'simulated-exchange-api',
    success: true
  };
}

// Hook para componentes que necesitan conversión automática
export function useAutoConversion(amount: number, fromCurrency: Currency, toCurrency: Currency) {
  const { convertCurrency } = useCurrency();
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      setIsConverting(true);
      convertCurrency(amount, fromCurrency, toCurrency)
        .then(setConversion)
        .finally(() => setIsConverting(false));
    }
  }, [amount, fromCurrency, toCurrency, convertCurrency]);

  return { conversion, isConverting };
}

// Hook para manejar inputs de moneda
export function useCurrencyInput(initialAmount: number = 0, initialCurrency: Currency = 'COP') {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const { formatAmount, convertCurrency } = useCurrency();

  const handleAmountChange = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    setAmount(numericValue);
  }, []);

  const handleCurrencyChange = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
  }, []);

  const getConvertedAmount = useCallback(async (targetCurrency: Currency) => {
    if (currency === targetCurrency) return amount;
    const result = await convertCurrency(amount, currency, targetCurrency);
    return result.convertedAmount;
  }, [amount, currency, convertCurrency]);

  const formattedAmount = formatAmount(amount, currency);

  return {
    amount,
    currency,
    formattedAmount,
    handleAmountChange,
    handleCurrencyChange,
    getConvertedAmount,
    setAmount,
    setCurrency
  };
}