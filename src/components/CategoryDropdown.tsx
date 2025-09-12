import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react-native';
import { Button } from './ui/button';
import { useLanguage } from './LanguageProvider';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryDropdown({ categories, selectedCategory, onCategorySelect }: CategoryDropdownProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Add defensive check for categories
  const safeCategories = categories || [];
  const selectedCategoryData = safeCategories.find(cat => cat.id === selectedCategory);

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 justify-between touch-manipulation bg-white border-gray-300 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span className="text-gray-700">
            {selectedCategoryData 
              ? `${selectedCategoryData.icon} ${t(`categories.${selectedCategoryData.id}`)}`
              : t('categories.all')
            }
          </span>
        </div>
        <ChevronDown 
          size={16} 
        />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto">
            {/* All categories */}
            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation border-b border-gray-100 ${
                !selectedCategory ? 'bg-blue-50 text-[#21ABF6] font-medium' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Filter size={16} />
                </div>
                <span>{t('categories.all')}</span>
              </div>
            </button>

            {/* Individual categories */}
            {safeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation ${
                  selectedCategory === category.id ? 'bg-blue-50 text-[#21ABF6] font-medium' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                    {category.icon}
                  </div>
                  <span>{t(`categories.${category.id}`)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}