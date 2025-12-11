import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  time: string;
  icon: any;
  features: string[];
}

interface DeliveryMethodsProps {
  options: DeliveryMethod[];
  selected: string;
  onSelect: (methodId: string) => void;
}

export default function DeliveryMethods({
  options,
  selected,
  onSelect,
}: DeliveryMethodsProps) {
  return (
    <div className="space-y-4">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = selected === option.id;
        
        return (
          <div
            key={option.id}
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              isSelected
                ? 'border-black bg-black/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                    {option.price === 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                        БЕСПЛАТНО
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{option.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{option.time}</span>
                    </div>
                    {option.price > 0 && (
                      <div className="text-lg font-bold">
                        {formatPrice(option.price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Радиокнопка */}
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-black'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Особенности доставки */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {option.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}