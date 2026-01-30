
export type ChildAge = 'under9m' | '9m-2y' | '2y' | '3-4y' | '5plus';

export type WorkStatus = 'working' | 'on-leave' | 'not-working' | 'unable-to-work';

export type UKRegion = 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';

export interface EligibilityData {
  location: UKRegion;
  childAge: ChildAge;
  hasPartner: boolean;
  userWorkStatus: WorkStatus;
  partnerWorkStatus?: WorkStatus;
  incomeInRange: 'yes' | 'no' | 'notSure'; // Net income < £100k and > Min Wage
  benefits: string[];
  childDisabled: boolean;
  postcode: string;
  hoursPerWeek: number;
  providerType: string;
  parentAge: number;
  isStudent: boolean;
  isPregnant: boolean;
}

export interface ExtraCost {
  name: string;
  enabled: boolean;
  price?: number; // User custom price
  defaultPrice: number; // Fallback average
  unit: 'perDay' | 'perWeek' | 'oneOff';
  description: string;
}

export type FundingType = 'none' | '15h' | '30h' | 'scot-wales-30h';

export interface CalculatorData {
  hoursPerWeek: number;
  daysPerWeek: number;
  weeksPerYear: number;
  childcareType: string;
  postcode: string;
  rateType: 'hourly' | 'daily';
  useCustomRate: boolean;
  customRateValue: number;
  extraCosts: ExtraCost[];
  fundingType: FundingType;
  includeTaxFreeChildcare: boolean;
  includeUniversalCredit: boolean;
  includeStudentGrant: boolean;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  reason: string;
  category: 'Universal' | 'Working Families' | 'Support-Based' | 'Financial';
  hours: number;
  type: 'funding' | 'financial-support' | 'health-food';
  link?: string;
}
