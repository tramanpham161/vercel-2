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
 * 1. Coram Family and Childcare Survey 2024 (NCT & DayNurseries references)
 * 2. DfE Education provision: children under 5 (Explore Education Statistics 2024)
 * Rates are estimates based on weighted averages for England.
 */
export const CHILDCARE_DATA_2024 = {
  year: 2024,
  sources: [
    "Coram Family and Childcare Survey 2024",
    "DfE Education Provision Statistics 2024",
    "NCT & DayNurseries Cost Indices"
  ],
  rates: {
    nursery: { regional: 7.25, london: 10.45 },
    childminder: { regional: 6.30, london: 9.15 },
    preschool: { regional: 6.80, london: 9.50 },
    default: { regional: 7.00, london: 10.00 }
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