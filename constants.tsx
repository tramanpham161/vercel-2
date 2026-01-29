
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

/**
 * OFFICIAL LINKS CONFIGURATION
 */
export const OFFICIAL_LINKS = {
  directories: {
    'England': 'https://www.gov.uk/browse/childcare-parenting/childcare',
    'Scotland': 'https://www.parentclub.scot/topics/childcare',
    'Wales': 'https://digital.careinspectorate.wales/directory',
    'Northern Ireland': 'https://www.familysupportni.gov.uk'
  },
  schemes: {
    eng15hUniversal: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-2-to-4-year-olds',
    eng30hWorking: 'https://www.gov.uk/apply-30-hours-free-childcare',
    engExpansion: 'https://www.gov.uk/free-childcare-if-working/apply-for-free-childcare-if-youre-working',
    eng2hSupport: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-2-year-olds',
    scotland1140: 'https://www.gov.scot/policies/early-education-and-care/early-learning-and-childcare/',
    walesOffer: 'https://www.gov.wales/childcare-offer-for-wales-campaign',
    walesFlyingStart: 'https://www.gov.wales/get-help-flying-start',
    niPreschool: 'https://www.nidirect.gov.uk/articles/pre-school-education-places',
    niSubsidy: 'https://www.nidirect.gov.uk/articles/help-paying-approved-childcare',
    taxFreeChildcare: 'https://www.gov.uk/tax-free-childcare',
    childcareChoices: 'https://www.childcarechoices.gov.uk/'
  }
};

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
