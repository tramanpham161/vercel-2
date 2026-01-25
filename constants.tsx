
import React from 'react';

export const COLORS = {
  primary: 'teal-600',
  secondary: 'teal-600',
  accent: 'amber-400',
  background: 'slate-50',
};

export const BENEFIT_OPTIONS = [
  'Universal Credit',
  'Income Support',
  'Income-based JSA',
  'Income-related ESA',
  'Child Tax Credit',
  'Working Tax Credit',
];

export const PROVIDER_TYPES = [
  'Nursery',
  'Childminder',
  'Preschool',
  'After-school club',
  'Not sure'
];

/**
 * Data Sources:
 * 1. Coram Family and Childcare Survey 2024
 * 2. DayNurseries.co.uk Advice & Costs Index
 * 3. DfE Education provision statistics 2024
 */
export const CHILDCARE_DATA_2024 = {
  year: 2024,
  rates: {
    nursery: { 
      hourly: { regional: 7.25, london: 10.45 },
      daily: { regional: 68.00, london: 98.00 }
    },
    childminder: { 
      hourly: { regional: 6.30, london: 9.15 },
      daily: { regional: 55.00, london: 82.00 }
    },
    preschool: { 
      hourly: { regional: 6.80, london: 9.50 },
      daily: { regional: 62.00, london: 88.00 }
    },
    default: { 
      hourly: { regional: 7.00, london: 10.00 },
      daily: { regional: 60.00, london: 90.00 }
    }
  },
  extras: {
    meals: 6.00, // per day
    nappies: 2.50, // per day
    activities: 12.00, // per week
    lateFees: 15.00 // per occurrence (treated as weekly estimate for calc)
  }
};

export const Logo = () => (
  <div className="flex items-center gap-2 font-bold text-teal-700 text-xl">
    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white">
      <i className="fa-solid fa-child-reaching"></i>
    </div>
    <span>Childcare Checker</span>
  </div>
);
