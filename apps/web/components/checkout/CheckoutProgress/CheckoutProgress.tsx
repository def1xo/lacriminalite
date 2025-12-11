'use client';

import { Check, User, Truck, CreditCard } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: number;
}

const steps = [
  {
    id: 1,
    name: 'Контактные данные',
    icon: User,
  },
  {
    id: 2,
    name: 'Доставка и оплата',
    icon: Truck,
  },
  {
    id: 3,
    name: 'Подтверждение',
    icon: CreditCard,
  },
];

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Шаг */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-black border-black'
                      : isCurrent
                      ? 'border-black bg-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <step.icon
                      className={`h-6 w-6 ${
                        isCurrent ? 'text-black' : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent
                        ? 'text-black'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Шаг {step.id}
                  </div>
                </div>
              </div>

              {/* Линия между шагами */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4">
                  <div
                    className={`h-full ${
                      isCompleted ? 'bg-black' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}