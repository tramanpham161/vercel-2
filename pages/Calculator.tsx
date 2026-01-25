import React, { useState, ChangeEvent } from 'react';
import { CalculatorData, ExtraCost, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';

const EXTRA_COST_AVERAGES: Record<string, number> = {
  'Meals': 25,
  'Nappies': 10,
  'Late pickup fees': 15,
  'Extra activities': 15
};

const Calculator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CalculatorData>({
    hoursPerWeek: 30,
    weeksPerYear: 51,
    childcareType: 'Nursery',
    postcode: '',
    knownHourlyRate: false,
    hourlyRate: 7.50,
    extraCosts: [
      { name: 'Meals', enabled: false },
      { name: 'Nappies', enabled: false },
      { name: 'Late pickup fees', enabled: false },
      { name: 'Extra activities', enabled: false }
    ],
    fundingType: 'none',
    includeTaxFreeChildcare: true
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 6;
  const nextStep = () => setStep((s: number) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s: number) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<CalculatorData>) => {
    setData((prev: CalculatorData) => ({ ...prev, ...updates }));
  };

  const getAverageRateInfo = () => {
    const isLondon = data.postcode.startsWith('SW') || 
                     data.postcode.startsWith('W') || 
                     data.postcode.startsWith('E') || 
                     data.postcode.startsWith('N') || 
                     data.postcode.startsWith('SE') || 
                     data.postcode.startsWith('WC') || 
                     data.postcode.startsWith('EC');
    
    const type = data.childcareType.toLowerCase();
    let rate = CHILDCARE_DATA_2024.rates.default.regional;

    if (type.includes('nursery')) {
      rate = isLondon ? CHILDCARE_DATA_2024.rates.nursery.london : CHILDCARE_DATA_2024.rates.nursery.regional;
    } else if (type.includes('childminder')) {
      rate = isLondon ? CHILDCARE_DATA_2024.rates.childminder.london : CHILDCARE_DATA_2024.rates.childminder.regional;
    } else if (type.includes('preschool')) {
      rate = isLondon ? CHILDCARE_DATA_2024.rates.preschool.london : CHILDCARE_DATA_2024.rates.preschool.regional;
    }

    return { rate, isLondon, year: CHILDCARE_DATA_2024.year };
  };

  const calculateCosts = () => {
    const rateInfo = getAverageRateInfo();
    const rate = data.knownHourlyRate ? data.hourlyRate : rateInfo.rate;
    const baseWeekly = data.hoursPerWeek * rate;
    
    let weeklyExtras = 0;
    data.extraCosts.forEach((item: ExtraCost) => {
      if (item.enabled) {
        weeklyExtras += item.price !== undefined ? item.price : (EXTRA_COST_AVERAGES[item.name] || 0);
      }
    });

    let fundingReductionPerWeek = 0;
    if (data.fundingType !== 'none') {
      const maxFunded = data.fundingType === '15h' ? 15 : 30;
      const hoursApplied = Math.min(data.hoursPerWeek, maxFunded);
      fundingReductionPerWeek = (hoursApplied * rate * 38) / data.weeksPerYear;
    }

    const weeklyNet = Math.max(0, baseWeekly - fundingReductionPerWeek) + weeklyExtras;
    const tfcSaving = data.includeTaxFreeChildcare ? Math.min(weeklyNet * 0.20, 2000 / data.weeksPerYear) : 0;

    const weeklyTotal = weeklyNet - tfcSaving;
    const yearlyTotal = weeklyTotal * data.weeksPerYear;

    return {
      weekly: weeklyTotal,
      monthly: yearlyTotal / 12,
      yearly: yearlyTotal,
      breakdown: { baseRate: rate, gross: baseWeekly + weeklyExtras, funding: fundingReductionPerWeek, tfc: tfcSaving }
    };
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Weekly hours</h2>
            <input type="range" min="0" max="60" value={data.hoursPerWeek} onChange={(e: ChangeEvent<HTMLInputElement>) => updateData({ hoursPerWeek: parseInt(e.target.value) })} className="w-full accent-teal-600" />
            <div className="text-center p-10 bg-slate-50 rounded-3xl">
              <span className="text-7xl font-black text-teal-700">{data.hoursPerWeek}</span>
              <span className="text-xl text-slate-400 font-bold ml-4">hrs/wk</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Usage period</h2>
            <div className="grid grid-cols-1 gap-3">
              {[38, 48, 51].map((w: number) => (
                <button key={w} onClick={() => updateData({ weeksPerYear: w })} className={`p-5 text-left border-2 rounded-2xl ${data.weeksPerYear === w ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}>
                  <span className="block font-bold text-lg">{w} weeks</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Setting & location</h2>
            <div className="space-y-4">
              <select value={data.childcareType} onChange={(e: ChangeEvent<HTMLSelectElement>) => updateData({ childcareType: e.target.value })} className="w-full p-4 border-2 border-slate-200 rounded-xl">
                {PROVIDER_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" placeholder="Postcode (e.g. M1)" value={data.postcode} onChange={(e: ChangeEvent<HTMLInputElement>) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-slate-200 rounded-xl" />
            </div>
          </div>
        );
      case 4:
        const ri = getAverageRateInfo();
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Hourly cost</h2>
            {!data.knownHourlyRate ? (
              <div className="p-8 bg-teal-50 rounded-3xl border border-teal-100">
                <span className="text-xs font-bold text-teal-600 block mb-1">{ri.isLondon ? 'London' : 'Regional'} average</span>
                <span className="text-3xl font-black text-teal-900">£{ri.rate.toFixed(2)} / hr</span>
                <button onClick={() => updateData({ knownHourlyRate: true })} className="block mt-4 text-sm font-bold text-teal-700 underline">Enter my specific rate</button>
              </div>
            ) : (
              <input type="number" step="0.01" value={data.hourlyRate} onChange={(e: ChangeEvent<HTMLInputElement>) => updateData({ hourlyRate: parseFloat(e.target.value) })} className="w-full p-4 border-2 border-slate-200 rounded-xl text-xl font-bold" />
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Extra expenses</h2>
            <div className="space-y-2">
              {data.extraCosts.map((item: ExtraCost) => (
                <label key={item.name} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={item.enabled} onChange={(e: ChangeEvent<HTMLInputElement>) => setData((p: CalculatorData) => ({...p, extraCosts: p.extraCosts.map((ec: ExtraCost) => ec.name === item.name ? {...ec, enabled: e.target.checked} : ec)}))} />
                  <span className="font-bold">{item.name}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Apply support</h2>
            <div className="grid grid-cols-3 gap-2">
              {['none', '15h', '30h'].map((f: string) => (
                <button key={f} onClick={() => updateData({ fundingType: f as FundingType })} className={`p-4 rounded-xl border-2 font-bold ${data.fundingType === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200'}`}>{f === 'none' ? 'None' : f.toUpperCase()}</button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const res = calculateCosts();
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-900 text-white p-1">
            <div className="p-8 text-center border-b md:border-b-0 md:border-r border-slate-800">
              <span className="text-teal-400 text-xs font-bold block mb-1">Weekly estimate</span>
              <div className="text-3xl font-black">£{res.weekly.toFixed(2)}</div>
            </div>
            <div className="p-8 text-center border-b md:border-b-0 md:border-r border-slate-800">
              <span className="text-teal-400 text-xs font-bold block mb-1">Monthly (avg)</span>
              <div className="text-3xl font-black">£{res.monthly.toFixed(0)}</div>
            </div>
            <div className="p-8 text-center bg-teal-600">
              <span className="text-white text-xs font-bold block mb-1">Annual total</span>
              <div className="text-3xl font-black">£{res.yearly.toFixed(0)}</div>
            </div>
          </div>

          <div className="p-10 md:p-14">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold">Cost breakdown</h3>
              <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">Modify answers</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-slate-600">Gross childcare cost</span>
                <span className="font-bold">£{res.breakdown.gross.toFixed(2)}</span>
              </div>
              {res.breakdown.funding > 0 && (
                <div className="flex justify-between border-b pb-4 text-green-600">
                  <span>Funded hours credit</span>
                  <span className="font-bold">- £{res.breakdown.funding.toFixed(2)}</span>
                </div>
              )}
              {res.breakdown.tfc > 0 && (
                <div className="flex justify-between border-b pb-4 text-teal-600">
                  <span>Tax-free top-up</span>
                  <span className="font-bold">- £{res.breakdown.tfc.toFixed(2)}</span>
                </div>
              )}
              <div className="bg-teal-50 p-8 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-900 text-xl block">Total weekly outgoing</span>
                  <span className="text-xs text-teal-600 font-semibold">Estimated contribution</span>
                </div>
                <span className="text-3xl md:text-4xl font-black text-teal-700">£{res.weekly.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-14 text-center">
              <button onClick={() => { setStep(1); setIsSubmitted(false); }} className="text-slate-400 font-bold text-xs">Clear and start new</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-2">
          <span className="text-teal-600 font-bold text-xs">Step {step} of {totalSteps}</span>
          <span className="text-slate-400 text-xs font-bold">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>
      <div className="bg-white p-10 md:p-14 rounded-3xl border border-slate-100 flex flex-col">
        <div className="flex-grow">{renderStep()}</div>
        <div className="mt-10 flex justify-between pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold ${step === 1 ? 'opacity-0' : 'text-slate-500'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg">
            {step === totalSteps ? 'See breakdown' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;