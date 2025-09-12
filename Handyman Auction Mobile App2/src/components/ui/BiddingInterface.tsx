import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle,
  ArrowUp,
  Target,
  Zap
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Card } from './card';
import { Textarea } from './textarea';
import { CurrencyConverter } from './CurrencyConverter';
import { useCurrency, useCurrencyInput, Currency } from '../../hooks/useCurrency';

interface Bid {
  id: string;
  handymanId: string;
  handymanName: string;
  handymanAvatar?: string;
  handymanRating: number;
  bidAmount: number;
  currency: Currency;
  bidAmountUSD: number;
  bidAmountCOP: number;
  message: string;
  estimatedDuration: string;
  proposedStartDate: Date;
  availability: string;
  status: 'active' | 'outbid' | 'accepted' | 'rejected';
  isCurrentHighest: boolean;
  createdAt: Date;
}

interface PriceRecommendation {
  averageBidUSD: number;
  averageBidCOP: number;
  highestBidUSD: number;
  highestBidCOP: number;
  lowestBidUSD: number;
  lowestBidCOP: number;
  recommendedBudgetUSD: number;
  recommendedBudgetCOP: number;
  totalBids: number;
  qualityScore: number;
  marketTrend: 'low' | 'average' | 'high';
}

interface BiddingInterfaceProps {
  jobOfferId: string;
  jobTitle: string;
  currentBudget: {
    min: number;
    max: number;
    currency: Currency;
  };
  bids: Bid[];
  priceRecommendation?: PriceRecommendation;
  userType: 'client' | 'handyman';
  isJobOwner?: boolean;
  onPlaceBid?: (bidAmount: number, currency: Currency, message: string, estimatedDuration: string, availability: string) => Promise<void>;
  onAcceptBid?: (bidId: string) => Promise<void>;
  onUpdateBudget?: (newMin: number, newMax: number, currency: Currency) => Promise<void>;
  onViewHandymanProfile?: (handymanId: string) => void;
}

export function BiddingInterface({
  jobOfferId,
  jobTitle,
  currentBudget,
  bids,
  priceRecommendation,
  userType,
  isJobOwner = false,
  onPlaceBid,
  onAcceptBid,
  onUpdateBudget,
  onViewHandymanProfile
}: BiddingInterfaceProps) {
  const { formatCurrency, convertCurrency } = useCurrency();
  
  // Estados para nueva puja
  const {
    amount: bidAmount,
    currency: bidCurrency,
    formattedAmount,
    handleAmountChange,
    handleCurrencyChange
  } = useCurrencyInput(0, currentBudget.currency);
  
  const [bidMessage, setBidMessage] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [availability, setAvailability] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBudgetUpdate, setShowBudgetUpdate] = useState(false);
  
  // Estados para actualizar presupuesto
  const {
    amount: newBudgetMin,
    handleAmountChange: handleMinChange
  } = useCurrencyInput(currentBudget.min, currentBudget.currency);
  
  const {
    amount: newBudgetMax,
    handleAmountChange: handleMaxChange
  } = useCurrencyInput(currentBudget.max, currentBudget.currency);

  const [budgetCurrency, setBudgetCurrency] = useState<Currency>(currentBudget.currency);

  const activeBids = bids.filter(bid => bid.status === 'active');
  const highestBid = activeBids.find(bid => bid.isCurrentHighest);
  const userBid = activeBids.find(bid => bid.handymanId === 'current_user_id'); // Reemplazar con ID real

  const handleSubmitBid = async () => {
    if (!onPlaceBid || bidAmount <= 0) return;
    
    try {
      setIsSubmitting(true);
      await onPlaceBid(bidAmount, bidCurrency, bidMessage, estimatedDuration, availability);
      
      // Limpiar form
      setBidMessage('');
      setEstimatedDuration('');
      setAvailability('');
    } catch (error) {
      console.error('Error placing bid:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!onUpdateBudget) return;
    
    try {
      await onUpdateBudget(newBudgetMin, newBudgetMax, budgetCurrency);
      setShowBudgetUpdate(false);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const isValidBid = () => {
    if (!highestBid) return bidAmount > 0;
    return bidAmount > (highestBid.currency === bidCurrency ? 
      highestBid.bidAmount : 
      (bidCurrency === 'USD' ? highestBid.bidAmountUSD : highestBid.bidAmountCOP)
    );
  };

  const getMinimumBidAmount = () => {
    if (!highestBid) return 1;
    const minIncrease = highestBid.currency === 'USD' ? 1 : 1000; // $1 USD o $1000 COP mínimo
    return highestBid.currency === bidCurrency ? 
      highestBid.bidAmount + minIncrease :
      (bidCurrency === 'USD' ? highestBid.bidAmountUSD + 1 : highestBid.bidAmountCOP + 1000);
  };

  const getBidStatusIcon = (bid: Bid) => {
    if (bid.isCurrentHighest) return <TrendingUp size={16} className="text-green-500" />;
    if (bid.status === 'outbid') return <ArrowUp size={16} className="text-orange-500" />;
    return <Clock size={16} className="text-gray-400" />;
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `hace ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header con título y stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h2 className="font-semibold text-blue-800 mb-2">{jobTitle}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-blue-600 font-medium">{activeBids.length}</div>
            <div className="text-blue-500">Pujas</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">
              {highestBid ? formatCurrency(
                highestBid.currency === 'USD' ? highestBid.bidAmountUSD : highestBid.bidAmountCOP,
                'USD'
              ) : 'N/A'}
            </div>
            <div className="text-blue-500">Puja más alta</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">
              {formatCurrency(currentBudget.min, currentBudget.currency)} - {formatCurrency(currentBudget.max, currentBudget.currency)}
            </div>
            <div className="text-blue-500">Presupuesto</div>
          </div>
        </div>
      </div>

      {/* Recomendaciones de precio (solo para clientes) */}
      {isJobOwner && priceRecommendation && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <Target size={20} className="text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-2">Recomendaciones Inteligentes</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <div className="text-green-700 font-medium">Promedio de pujas</div>
                  <div className="text-green-600">{formatCurrency(priceRecommendation.averageBidUSD, 'USD')}</div>
                </div>
                <div>
                  <div className="text-green-700 font-medium">Presupuesto sugerido</div>
                  <div className="text-green-600">{formatCurrency(priceRecommendation.recommendedBudgetUSD, 'USD')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <Badge variant={priceRecommendation.marketTrend === 'high' ? 'destructive' : 
                             priceRecommendation.marketTrend === 'low' ? 'secondary' : 'default'}>
                  Mercado {priceRecommendation.marketTrend === 'high' ? 'Alto' : 
                           priceRecommendation.marketTrend === 'low' ? 'Bajo' : 'Promedio'}
                </Badge>
                <span className="text-gray-600">
                  Calidad promedio: {priceRecommendation.qualityScore.toFixed(1)}/5.0
                </span>
              </div>
              
              {!showBudgetUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBudgetUpdate(true)}
                  className="mt-3 border-green-300 text-green-700 hover:bg-green-100"
                >
                  Actualizar Presupuesto
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Actualizar presupuesto */}
      {showBudgetUpdate && isJobOwner && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-orange-800 mb-3">Actualizar Presupuesto</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-orange-700 mb-1">Mínimo</label>
              <Input
                type="number"
                value={newBudgetMin}
                onChange={(e) => handleMinChange(e.target.value)}
                className="border-orange-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-700 mb-1">Máximo</label>
              <Input
                type="number"
                value={newBudgetMax}
                onChange={(e) => handleMaxChange(e.target.value)}
                className="border-orange-300"
              />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Button
              variant={budgetCurrency === 'USD' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBudgetCurrency('USD')}
            >
              USD
            </Button>
            <Button
              variant={budgetCurrency === 'COP' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBudgetCurrency('COP')}
            >
              COP
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdateBudget} className="bg-orange-600 hover:bg-orange-700">
              Actualizar Presupuesto
            </Button>
            <Button variant="outline" onClick={() => setShowBudgetUpdate(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Interface para pujar (solo handymen) */}
      {userType === 'handyman' && !isJobOwner && !userBid && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3 mb-4">
            <DollarSign size={20} className="text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 mb-1">Hacer una Puja</h3>
              {highestBid && (
                <p className="text-sm text-blue-600">
                  Puja mínima: {formatCurrency(getMinimumBidAmount(), bidCurrency)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Tu puja"
                  min={getMinimumBidAmount()}
                  step={bidCurrency === 'USD' ? '0.01' : '1000'}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  variant={bidCurrency === 'USD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCurrencyChange('USD')}
                  className="flex-1 text-xs"
                >
                  USD
                </Button>
                <Button
                  variant={bidCurrency === 'COP' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCurrencyChange('COP')}
                  className="flex-1 text-xs"
                >
                  COP
                </Button>
              </div>
            </div>

            <Textarea
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
              placeholder="Describe brevemente cómo realizarías el trabajo..."
              className="min-h-[60px]"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="Duración estimada"
              />
              <Input
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Disponibilidad"
              />
            </div>

            {!isValidBid() && bidAmount > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-100 p-2 rounded">
                <AlertCircle size={16} />
                <span>Tu puja debe ser mayor que la puja actual más alta</span>
              </div>
            )}

            <Button
              onClick={handleSubmitBid}
              disabled={!isValidBid() || isSubmitting || !bidMessage.trim()}
              className="w-full"
            >
              {isSubmitting ? 'Enviando...' : `Pujar ${formatCurrency(bidAmount, bidCurrency)}`}
            </Button>
          </div>
        </Card>
      )}

      {/* Mi puja actual */}
      {userBid && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-1">Tu Puja</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(userBid.bidAmount, userBid.currency)}
                </span>
                {getBidStatusIcon(userBid)}
                <Badge variant={userBid.isCurrentHighest ? 'default' : 'secondary'}>
                  {userBid.isCurrentHighest ? 'Puja más alta' : 'Superada'}
                </Badge>
              </div>
              <p className="text-sm text-green-600 mb-2">{userBid.message}</p>
              <div className="text-xs text-green-500">
                Enviada {formatTimeAgo(userBid.createdAt)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de pujas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Pujas Activas ({activeBids.length})</h3>
          <Badge variant="secondary">
            {activeBids.length > 0 ? `Rango: ${formatCurrency(
              Math.min(...activeBids.map(b => b.bidAmountUSD)), 'USD'
            )} - ${formatCurrency(
              Math.max(...activeBids.map(b => b.bidAmountUSD)), 'USD'
            )}` : 'Sin pujas'}
          </Badge>
        </div>

        {activeBids.map((bid) => (
          <Card key={bid.id} className={`p-4 ${bid.isCurrentHighest ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium cursor-pointer hover:text-blue-600"
                          onClick={() => onViewHandymanProfile?.(bid.handymanId)}>
                      {bid.handymanName}
                    </span>
                    <Badge variant="outline">★ {bid.handymanRating}</Badge>
                    {bid.isCurrentHighest && (
                      <Badge className="bg-green-600">Más Alta</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimeAgo(bid.createdAt)} • {bid.estimatedDuration}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {formatCurrency(bid.bidAmount, bid.currency)}
                </div>
                {bid.currency !== 'USD' && (
                  <div className="text-sm text-gray-500">
                    ≈ {formatCurrency(bid.bidAmountUSD, 'USD')}
                  </div>
                )}
              </div>
            </div>

            {bid.message && (
              <p className="text-sm text-gray-600 mb-2 pl-13">
                "{bid.message}"
              </p>
            )}

            <div className="flex items-center justify-between pl-13">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📅 {bid.availability}</span>
                <span>⏱️ {bid.estimatedDuration}</span>
              </div>
              
              {isJobOwner && onAcceptBid && (
                <Button
                  size="sm"
                  onClick={() => onAcceptBid(bid.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aceptar Puja
                </Button>
              )}
            </div>
          </Card>
        ))}

        {activeBids.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            <Zap size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium mb-2">Sin pujas aún</h3>
            <p className="text-sm">Las pujas aparecerán aquí cuando los trabajadores respondan</p>
          </Card>
        )}
      </div>
    </div>
  );
}