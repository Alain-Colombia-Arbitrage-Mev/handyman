import React from 'react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({ categories, selectedCategory, onCategorySelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${
            selectedCategory === category.id
              ? 'bg-primary text-white shadow-lg scale-105'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className={`text-2xl mb-2 ${category.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
            {category.icon}
          </div>
          <span className="text-xs text-center leading-tight">{category.name}</span>
        </button>
      ))}
    </div>
  );
}