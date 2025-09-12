import React, { useState } from 'react';
import { ArrowLeft, Search, Zap, MapPin, DollarSign, Clock, User, Filter } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { JobCard } from '../JobCard';
import { useLanguage } from '../LanguageProvider';
import { Job } from '../../types';

interface FlashOffersPageProps {
  onBack: () => void;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function FlashOffersPage({ onBack, jobs, onJobClick }: FlashOffersPageProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgent, setFilterUrgent] = useState(false);

  // Filter jobs to show only flash/quick jobs
  const flashJobs = jobs.filter(job => 
    job.isFlashJob || job.isUrgent || 
    job.title.toLowerCase().includes('reparar') ||
    job.title.toLowerCase().includes('urgente') ||
    job.title.toLowerCase().includes('domicilio')
  );

  // Apply search and filter
  const filteredJobs = flashJobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUrgent = !filterUrgent || job.isUrgent;
    
    return matchesSearch && matchesUrgent;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 safe-area-inset-top w-full">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2 touch-manipulation">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Zap size={20} />
              <h1 className="font-semibold">{t('menu.flashOffer')}</h1>
            </div>
            <p className="text-sm text-gray-500">{t('menu.flashOfferDesc')}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.searchPlaceholder')}
            className="pl-10 h-12 w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filterUrgent ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterUrgent(!filterUrgent)}
            className="flex items-center gap-2"
          >
            <Zap size={14} />
{t('jobCard.urgent')}
          </Button>
          <Badge variant="secondary" className="ml-auto">
{filteredJobs.length} {filteredJobs.length === 1 ? t('search.jobs').slice(0, -1) : t('search.jobs')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4 w-full">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Trabajos Flash Activos</h3>
              <p className="text-sm opacity-90">
                {flashJobs.length} trabajos rápidos disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Trabajos Disponibles</h2>
              <span className="text-sm text-gray-500">
                {filteredJobs.length} de {flashJobs.length}
              </span>
            </div>
            
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={onJobClick} />
            ))}
          </>
        ) : (
          <div className="text-center py-12 w-full">
            <div className="text-gray-400 mb-4">
              <Zap size={48} />
            </div>
            <h3 className="font-medium text-gray-600 mb-2">
              {searchQuery ? 'No se encontraron trabajos' : 'No hay trabajos flash activos'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? 'Intenta con una búsqueda diferente' 
                : 'Los trabajos rápidos aparecerán aquí cuando estén disponibles'
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-3"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}