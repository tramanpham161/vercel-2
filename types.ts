export type ChildAge = 'under9m' | '9m-2y' | '2y' | '3-4y' | '5plus';

export type WorkStatus = 'both' | 'one' | 'none' | 'notSure';

export interface EligibilityData {
  childAge: ChildAge;
  workStatus: WorkStatus;
  incomeInRange: 'yes' | 'no' | 'notSure';
  benefits: string[];
  postcode: string;
  hoursPerWeek: number;
  providerType: string;
}

export interface ExtraCost {
  name: string;
  enabled: boolean;
  price?: number;
}

export type FundingType = 'none' | '15h' | '30h';

export interface CalculatorData {
  hoursPerWeek: number;
  weeksPerYear: number;
  childcareType: string;
  postcode: string;
  knownHourlyRate: boolean;
  hourlyRate: number;
  extraCosts: ExtraCost[];
  fundingType: FundingType;
  includeTaxFreeChildcare: boolean;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  hours: number;
}