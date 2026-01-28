
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
  'Pension Credit',
  'Housing Benefit'
];

export const PROVIDER_TYPES = [
  'Nursery',
  'Childminder',
  'Preschool',
  'After-school club',
  'Not sure'
];

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
    meals: { price: 6.00, desc: "Fresh lunch, snacks, and dinner." },
    nappies: { price: 2.50, desc: "Nappies, wipes, and cream." },
    activities: { price: 12.00, desc: "External classes (French, Music, etc)." },
    consumables: { price: 5.00, desc: "General hygiene and resource fee." }
  }
};

export const Logo = () => (
  <div className="flex items-center gap-2 font-bold text-teal-700 text-xl group">
    <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20 group-hover:rotate-6 transition-transform">
      <i className="fa-solid fa-child-reaching"></i>
    </div>
    <span className="tracking-tight">Childcare<span className="text-slate-900">Checker</span></span>
  </div>
);
