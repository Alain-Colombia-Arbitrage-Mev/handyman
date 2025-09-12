import React, { useState, useEffect } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Card } from './card';
import { useCurrency, useAutoConversion, Currency } from '../../hooks/useCurrency';

interface CurrencyConverterProps {
  initialAmount?: number;
  initialFromCurrency?: Currency;
  initialToCurrency?: Currency;
  onConversionChange?: (amount: number, fromCurrency: Currency, toCurrency: Currency, convertedAmount: number) => void;
  showStats?: boolean;
  compact?: boolean;
}

export function CurrencyConverter({
  initialAmount = 1000,
  initialFromCurrency = 'COP',
  initialToCurrency = 'USD',
  onConversionChange,
  showStats = false,
  compact = false
}: CurrencyConverterProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [fromCurrency, setFromCurrency] = useState<Currency>(initialFromCurrency);
  const [toCurrency, setToCurrency] = useState<Currency>(initialToCurrency);
  
  const { 
    formatCurrency, 
    formatAmount, 
    getCurrencySymbol, 
    getCurrencyCode,
    isLoading,
    lastUpdate,
    getCurrencyStats
  } = useCurrency();
  
  const { conversion, isConverting } = useAutoConversion(amount, fromCurrency, toCurrency);
  const [stats, setStats] = useState<any>(null);

  // Actualizar stats si se requieren
  useEffect(() => {
    if (showStats) {
      getCurrencyStats(fromCurrency, toCurrency).then(setStats);
    }
  }, [fromCurrency, toCurrency, showStats, getCurrencyStats]);

  // Notificar cambios de conversión
  useEffect(() => {
    if (conversion && onConversionChange) {
      onConversionChange(amount, fromCurrency, toCurrency, conversion.convertedAmount);
    }
  }, [conversion, amount, fromCurrency, toCurrency, onConversionChange]);

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    setAmount(numericValue);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getTrendIcon = () => {
    if (!stats) return <Minus size={14} className="text-gray-400" />;
    
    if (stats.trend === 'rising') return <TrendingUp size={14} className="text-green-500" />;
    if (stats.trend === 'falling') return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getTrendColor = () => {
    if (!stats) return 'text-gray-500';
    if (stats.trend === 'rising') return 'text-green-600';
    if (stats.trend === 'falling') return 'text-red-600';
    return 'text-gray-600';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Desde</div>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="text-sm h-8 w-20"
                min="0"
                step="0.01"
              />
              <Badge variant="outline" className="text-xs">
                {getCurrencyCode(fromCurrency)}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={swapCurrencies}
            className="p-1 h-8 w-8"
          >
            <ArrowUpDown size={14} />
          </Button>
          
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">A</div>
            <div className="flex items-center gap-1">
              <div className="text-sm font-medium min-w-[60px]">
                {isConverting ? '...' : formatAmount(conversion?.convertedAmount || 0, toCurrency)}
              </div>
              <Badge variant="outline" className="text-xs">
                {getCurrencyCode(toCurrency)}
              </Badge>
            </div>
          </div>
        </div>
        
        {conversion && (
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>1 {getCurrencyCode(fromCurrency)} = {formatAmount(conversion.rate, toCurrency)} {getCurrencyCode(toCurrency)}</span>
            {getTrendIcon()}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Conversor de Moneda</h3>
        {lastUpdate > 0 && (
          <Badge variant="secondary" className="text-xs">
            Act. hace {Math.floor((Date.now() - lastUpdate) / 60000)}min
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3 items-end">
        {/* Moneda origen */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desde
          </label>
          <div className="space-y-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="text-right"
              min="0"
              step="0.01"
            />
            <div className="flex gap-1">
              <Button
                variant={fromCurrency === 'USD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFromCurrency('USD')}
                className="flex-1 text-xs"
              >
                USD
              </Button>
              <Button
                variant={fromCurrency === 'COP' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFromCurrency('COP')}
                className="flex-1 text-xs"
              >
                COP
              </Button>
            </div>
          </div>
        </div>

        {/* Botón intercambiar */}
        <div className="col-span-1 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={swapCurrencies}
            className="p-2 rounded-full"
            disabled={isLoading || isConverting}
          >
            <ArrowUpDown size={20} />
          </Button>
        </div>

        {/* Moneda destino */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            A
          </label>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 border rounded-md text-right">
              {isConverting ? (
                <div className="animate-pulse">Convirtiendo...</div>
              ) : (
                <div className="font-medium">
                  {conversion ? formatAmount(conversion.convertedAmount, toCurrency) : '0'}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant={toCurrency === 'USD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToCurrency('USD')}
                className="flex-1 text-xs"
              >
                USD
              </Button>
              <Button
                variant={toCurrency === 'COP' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToCurrency('COP')}
                className="flex-1 text-xs"
              >
                COP
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Información de tasa de cambio */}
      {conversion && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Tasa de cambio:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                1 {getCurrencyCode(fromCurrency)} = {formatAmount(conversion.rate, toCurrency)} {getCurrencyCode(toCurrency)}
              </span>
              {getTrendIcon()}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Fuente: {conversion.source}</span>
            <span>
              Actualizado: {new Date(conversion.lastUpdated).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Estadísticas de tendencia */}
      {showStats && stats && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-700">Promedio 7d</div>
            <div className="text-blue-600">{formatAmount(stats.average, toCurrency)}</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-medium text-green-700">Máximo</div>
            <div className="text-green-600">{formatAmount(stats.highest, toCurrency)}</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-medium text-red-700">Mínimo</div>
            <div className="text-red-600">{formatAmount(stats.lowest, toCurrency)}</div>
          </div>
        </div>
      )}

      {/* Tendencia */}
      {stats && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span>Tendencia:</span>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium capitalize">{stats.trend}</span>
            {stats.percentChange !== 0 && (
              <span>({stats.percentChange > 0 ? '+' : ''}{stats.percentChange.toFixed(2)}%)</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}