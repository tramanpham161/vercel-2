
import React, { useState } from 'react';
import { CalculatorData, ExtraCost, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';

const Calculator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const [data, setData] = useState<CalculatorData>({
    hoursPerWeek: 30,
    daysPerWeek: 3,
    weeksPerYear: 51,
    childcareType: 'Nursery',
    postcode: '',
    rateType: 'hourly',
    useCustomRate: false,
    customRateValue: 0,
    extraCosts: [
      { name: 'Meals', enabled: false, defaultPrice: CHILDCARE_DATA_2024.extras.meals.price, unit: 'perDay', description: CHILDCARE_DATA_2024.extras.meals.desc },
      { name: 'Nappies & Wipes', enabled: false, defaultPrice: CHILDCARE_DATA_2024.extras.nappies.price, unit: 'perDay', description: CHILDCARE_DATA_2024.extras.nappies.desc },
      { name: 'External Activities', enabled: false, defaultPrice: CHILDCARE_DATA_2024.extras.activities.price, unit: 'perWeek', description: CHILDCARE_DATA_2024.extras.activities.desc },
      { name: 'Consumables Fee', enabled: false, defaultPrice: CHILDCARE_DATA_2024.extras.consumables.price, unit: 'perDay', description: CHILDCARE_DATA_2024.extras.consumables.desc }
    ],
    fundingType: 'none',
    includeTaxFreeChildcare: true
  });

  const totalSteps = 7;

  const isLondon = (pc: string) => {
    const p = pc.trim().toUpperCase();
    const prefixes = ['SW', 'W', 'E', 'N', 'SE', 'NW', 'WC', 'EC', 'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB'];
    return prefixes.some(pref => p.startsWith(pref));
  };

  const calculateCosts = () => {
    const london = isLondon(data.postcode);
    const typeKey = data.childcareType.toLowerCase();
    const rateData = (CHILDCARE_DATA_2024.rates as any)[typeKey] || CHILDCARE_DATA_2024.rates.default;
    const avgRate = london ? rateData[data.rateType].london : rateData[data.rateType].regional;
    
    const rate = data.useCustomRate && data.customRateValue > 0 ? data.customRateValue : avgRate;
    
    let baseWeekly = data.rateType === 'hourly' ? data.hoursPerWeek * rate : data.daysPerWeek * rate;
    let weeklyExtras = 0;
    data.extraCosts.forEach(cost => {
      if (cost.enabled) {
        const val = (cost.price !== undefined && cost.price > 0) ? cost.price : cost.defaultPrice;
        if (cost.unit === 'perDay') weeklyExtras += val * data.daysPerWeek;
        else if (cost.unit === 'perWeek') weeklyExtras += val;
      }
    });

    let weeklyFundingCredit = 0;
    if (data.fundingType !== 'none') {
      const fundedLimit = data.fundingType === '15h' ? 15 : 30;
      const hoursToFund = Math.min(data.hoursPerWeek, fundedLimit);
      const effectiveHourly = data.rateType === 'hourly' ? rate : (rate / (data.hoursPerWeek / data.daysPerWeek));
      weeklyFundingCredit = (hoursToFund * effectiveHourly * 38) / data.weeksPerYear;
    }

    const netPreTFC = Math.max(0, baseWeekly - weeklyFundingCredit) + weeklyExtras;
    const tfcSaving = data.includeTaxFreeChildcare ? Math.min(netPreTFC * 0.20, 2000 / 52) : 0;

    const weeklyTotal = netPreTFC - tfcSaving;
    const yearlyTotal = weeklyTotal * data.weeksPerYear;

    return {
      weekly: weeklyTotal,
      monthly: yearlyTotal / 12,
      yearly: yearlyTotal,
      breakdown: { base: baseWeekly, extras: weeklyExtras, funding: weeklyFundingCredit, tfc: tfcSaving, isLondon: london }
    };
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Usage</h2>
            <div className="space-y-8">
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Hours per week</label>
                <input type="range" min="1" max="60" value={data.hoursPerWeek} onChange={(e) => setData({...data, hoursPerWeek: parseInt(e.target.value)})} className="w-full accent-teal-600" />
                <div className="text-center mt-2 font-black text-2xl text-teal-700">{data.hoursPerWeek} hrs</div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Days per week</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(d => (
                    <button key={d} onClick={() => setData({...data, daysPerWeek: d})} className={`flex-grow p-3 rounded-xl border-2 font-bold transition ${data.daysPerWeek === d ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Region</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Provider Type</label>
                <select value={data.childcareType} onChange={(e) => setData({...data, childcareType: e.target.value})} className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white">
                  {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Postcode Prefix</label>
                <input type="text" placeholder="e.g. SW1 or M1" value={data.postcode} onChange={(e) => setData({...data, postcode: e.target.value.toUpperCase()})} className="w-full p-4 border-2 border-slate-200 rounded-xl" />
                <p className="text-[10px] text-slate-400 mt-1 italic">Postcodes like SW or EC trigger London rate estimates.</p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Extras</h2>
            <p className="text-xs text-slate-400">Enter your provider's specific charges or use our 2024 averages.</p>
            <div className="space-y-3">
              {data.extraCosts.map((item, idx) => (
                <div key={item.name} className={`p-5 rounded-2xl border-2 transition ${item.enabled ? 'border-teal-600 bg-teal-50 shadow-sm' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={item.enabled} onChange={(e) => {
                        const newCosts = [...data.extraCosts];
                        newCosts[idx].enabled = e.target.checked;
                        setData({...data, extraCosts: newCosts});
                      }} className="w-5 h-5 accent-teal-600 rounded" />
                      <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    </label>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{item.unit === 'perDay' ? 'Per Day' : 'Per Week'}</span>
                  </div>
                  
                  {item.enabled && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">£</span>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder={`${item.defaultPrice.toFixed(2)} (2024 Average)`}
                          value={item.price || ''}
                          onChange={(e) => {
                            const newCosts = [...data.extraCosts];
                            newCosts[idx].price = e.target.value ? parseFloat(e.target.value) : undefined;
                            setData({...data, extraCosts: newCosts});
                          }}
                          className="w-full pl-7 pr-4 py-2 text-xs border border-teal-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100"
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 leading-tight">{item.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="py-20 text-center">
            <h2 className="text-xl font-bold text-slate-800">Step {step}</h2>
            <p className="text-slate-400 text-sm mt-2">Configuration for your tailored quote.</p>
          </div>
        );
    }
  };

  if (isSubmitted) {
    const res = calculateCosts();
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-900 text-white">
            <div className="p-10 text-center border-r border-slate-800">
              <span className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-widest">Monthly Net</span>
              <div className="text-4xl font-black">£{res.monthly.toFixed(0)}</div>
            </div>
            <div className="p-10 text-center border-r border-slate-800">
              <span className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-widest">Weekly Net</span>
              <div className="text-4xl font-black">£{res.weekly.toFixed(2)}</div>
            </div>
            <div className="p-10 text-center bg-teal-600">
              <span className="text-xs text-teal-100 block mb-1 uppercase font-bold tracking-widest">Yearly Total</span>
              <div className="text-4xl font-black">£{res.yearly.toFixed(0)}</div>
            </div>
          </div>

          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-5">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                   <i className="fa-solid fa-list-check text-teal-600"></i> Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs py-2 border-b">
                    <span className="text-slate-500">Gross Weekly Care</span>
                    <span className="font-bold">£{res.breakdown.base.toFixed(2)}</span>
                  </div>
                  {res.breakdown.funding > 0 && (
                    <div className="flex justify-between text-xs py-2 border-b text-emerald-600">
                      <span>Government Funding Credit</span>
                      <span className="font-bold">-£{res.breakdown.funding.toFixed(2)}</span>
                    </div>
                  )}
                  {res.breakdown.extras > 0 && (
                    <div className="flex justify-between text-xs py-2 border-b">
                      <span>Extras (Meals, etc.)</span>
                      <span className="font-bold">+£{res.breakdown.extras.toFixed(2)}</span>
                    </div>
                  )}
                  {data.includeTaxFreeChildcare && (
                    <div className="flex justify-between text-xs py-2 border-b text-teal-600 font-medium">
                      <span>Tax-Free Childcare (20% Top-up)</span>
                      <span className="font-bold">-£{res.breakdown.tfc.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-center text-center">
                 <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Your Est. Weekly Bill</span>
                 <div className="text-6xl font-black text-slate-900">£{res.weekly.toFixed(2)}</div>
                 {res.breakdown.isLondon && (
                   <div className="mt-4 inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-tighter">
                     London Weighting Applied
                   </div>
                 )}
              </div>
            </div>

            <div className="text-center pt-8 border-t">
              <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-400 hover:text-teal-600 transition">Start New Estimate</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepContent = [1, 3, 5].includes(step) ? renderStep() : (
    <div className="py-20 text-center">
      <h2 className="text-xl font-bold text-slate-800">Step {step}</h2>
      <p className="text-slate-400 text-sm mt-2">Configuring your childcare profile.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-widest">Cost Estimator</span>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Step {step}/7</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / 7) * 100}%` }}></div>
        </div>
      </div>
      
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
        <div className="flex-grow">{currentStepContent}</div>
        <div className="mt-12 flex justify-between border-t pt-8">
           <button onClick={() => setStep(s => Math.max(1, s-1))} className="text-slate-400 font-bold hover:text-slate-600 transition">Back</button>
           <button onClick={step === totalSteps ? () => setIsSubmitted(true) : () => setStep(s => s+1)} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-teal-700 transition active:scale-95">
              {step === totalSteps ? 'See Results' : 'Continue'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
