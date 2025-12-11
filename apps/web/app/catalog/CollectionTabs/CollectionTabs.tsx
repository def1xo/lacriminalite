'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Flame, CheckCircle } from 'lucide-react';

interface CollectionTabsProps {
  activeCollection?: string;
}

export default function CollectionTabs({ activeCollection }: CollectionTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabs = [
    {
      id: 'all',
      name: 'Все товары',
      href: '/catalog',
      icon: null,
      description: 'Все коллекции',
    },
    {
      id: 'limited',
      name: 'LIMITED',
      href: '/catalog/limited',
      icon: <Flame className="h-4 w-4" />,
      description: 'Эксклюзивные модели',
    },
    {
      id: 'regular',
      name: 'REGULAR',
      href: '/catalog/regular',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Базовые модели',
    },
  ];

  const createUrl = (collectionId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Если переходим на другую коллекцию, сбрасываем фильтры категории
    if (collectionId !== 'all' && collectionId !== activeCollection) {
      params.delete('category');
      params.delete('size');
      params.delete('minPrice');
      params.delete('maxPrice');
      params.delete('page');
    }
    
    const basePath = collectionId === 'all' ? '/catalog' : `/catalog/${collectionId}`;
    const queryString = params.toString();
    
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <div className="flex space-x-8">
      {tabs.map((tab) => {
        const isActive = tab.id === 'all' 
          ? !activeCollection && pathname === '/catalog'
          : activeCollection === tab.id;
        
        return (
          <Link
            key={tab.id}
            href={createUrl(tab.id)}
            className={`group flex flex-col py-4 ${
              isActive
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span className="font-medium">{tab.name}</span>
            </div>
            <span className={`text-xs mt-1 ${
              isActive ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {tab.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}