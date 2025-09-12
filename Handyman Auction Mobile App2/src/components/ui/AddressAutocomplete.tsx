import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Card } from './card';
import { usePlaceAutocomplete, useGeocoding, useGeolocation } from '../../hooks/useGeolocation';
import { GeolocationPosition } from '../../services/geolocationService';

interface AddressAutocompleteProps {
  value?: string;
  placeholder?: string;
  onAddressSelect: (address: string, location: GeolocationPosition) => void;
  onClear?: () => void;
  showCurrentLocation?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  value = '',
  placeholder = 'Buscar dirección...',
  onAddressSelect,
  onClear,
  showCurrentLocation = true,
  disabled = false,
  className = ''
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, isLoading, getSuggestions, clearSuggestions } = usePlaceAutocomplete();
  const { geocodeAddress, isLoading: isGeocoding } = useGeocoding();
  const { getCurrentLocation, isLoading: isGettingLocation } = useGeolocation();

  // Actualizar valor interno cuando cambie el prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Obtener sugerencias cuando cambie el input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim() && inputValue.length >= 2) {
        getSuggestions(inputValue);
        setShowSuggestions(true);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [inputValue, getSuggestions, clearSuggestions]);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      const result = await geocodeAddress(prediction.description);
      if (result) {
        setInputValue(prediction.description);
        setShowSuggestions(false);
        onAddressSelect(prediction.description, {
          lat: result.location.lat,
          lng: result.location.lng,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };

  // Usar ubicación actual
  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation(true);
      if (location) {
        // Obtener dirección de la ubicación actual
        const result = await geocodeAddress(`${location.lat},${location.lng}`);
        if (result) {
          setInputValue(result.formattedAddress);
          setShowSuggestions(false);
          onAddressSelect(result.formattedAddress, location);
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  // Limpiar input
  const handleClear = () => {
    setInputValue('');
    setShowSuggestions(false);
    clearSuggestions();
    onClear?.();
    inputRef.current?.focus();
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLoadingAny = isLoading || isGeocoding || isGettingLocation;

  return (
    <div className={`relative ${className}`}>
      {/* Input principal */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoadingAny ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <Search size={16} />
          )}
        </div>
        
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-10 ${inputValue ? 'pr-20' : showCurrentLocation ? 'pr-12' : 'pr-4'}`}
        />

        {/* Botones de acción */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="p-1 h-6 w-6 hover:bg-gray-100"
              disabled={disabled}
            >
              <X size={12} />
            </Button>
          )}
          
          {showCurrentLocation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={disabled || isGettingLocation}
              className="p-1 h-6 w-6 hover:bg-gray-100"
              title="Usar ubicación actual"
            >
              <Navigation size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* Lista de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-white border shadow-lg"
        >
          {suggestions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => handleSuggestionSelect(prediction)}
            >
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Mensaje de "No se encontraron resultados" */}
      {showSuggestions && !isLoading && inputValue.length >= 2 && suggestions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border shadow-lg">
          <div className="p-3 text-center text-sm text-gray-500">
            No se encontraron direcciones
          </div>
        </Card>
      )}

      {/* Indicador de carga */}
      {showSuggestions && isLoading && inputValue.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border shadow-lg">
          <div className="p-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Buscando direcciones...
          </div>
        </Card>
      )}
    </div>
  );
}

// Componente simplificado para selección rápida de ubicación
interface QuickLocationSelectorProps {
  onLocationSelect: (location: GeolocationPosition, address: string) => void;
  className?: string;
}

export function QuickLocationSelector({ 
  onLocationSelect, 
  className = '' 
}: QuickLocationSelectorProps) {
  const { getCurrentLocation, isLoading } = useGeolocation();
  const { reverseGeocode, isLoading: isGeocoding } = useGeocoding();

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation(true);
      if (location) {
        const result = await reverseGeocode(location.lat, location.lng);
        const address = result?.formattedAddress || 'Ubicación actual';
        onLocationSelect(location, address);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const isLoadingAny = isLoading || isGeocoding;

  return (
    <Button
      variant="outline"
      onClick={handleUseCurrentLocation}
      disabled={isLoadingAny}
      className={`flex items-center gap-2 ${className}`}
    >
      {isLoadingAny ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      ) : (
        <Navigation size={16} />
      )}
      {isLoadingAny ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
    </Button>
  );
}