
import React, { useState } from 'react';
import { CalculatorData, ExtraCost, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';

const Calculator: React.FC = () => {
  const [step, setStep] = useState(1);
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 7;
  const nextStep = () => setStep((s: number) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s: number) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<CalculatorData>) => {
    setData((prev: CalculatorData) => ({ ...prev, ...updates }));
  };

  const isLondon = (pc: string) => {
    const p = pc.trim().toUpperCase();
    return ['SW', 'W', 'E', 'N', 'SE', 'NW', 'WC', 'EC'].some(pref => p.startsWith(pref));
  };

  const getAverageRate = () => {
    const london = isLondon(data.postcode);
    const type = data.childcareType.toLowerCase();
    const rateData = (CHILDCARE_DATA_2024.rates as any)[type] || CHILDCARE_DATA_2024.rates.default;
    return london ? rateData[data.rateType].london : rateData[data.rateType].regional;
  };

  const calculateCosts = () => {
    const avgRate = getAverageRate();
    const rate = data.useCustomRate && data.customRateValue > 0 ? data.customRateValue : avgRate;
    
    // 1. Base Childcare Cost
    let baseWeekly = 0;
    if (data.rateType === 'hourly') {
      baseWeekly = data.hoursPerWeek * rate;
    } else {
      baseWeekly = data.daysPerWeek * rate;
    }

    // 2. Extra Costs
    let weeklyExtras = 0;
    data.extraCosts.forEach(cost => {
      if (cost.enabled) {
        const val = cost.price !== undefined && cost.price > 0 ? cost.price : cost.defaultPrice;
        if (cost.unit === 'perDay') weeklyExtras += val * data.daysPerWeek;
        else if (cost.unit === 'perWeek') weeklyExtras += val;
        else weeklyExtras += val;
      }
    });

    // 3. Funding Reduction (Stretched Logic)
    let weeklyFundingCredit = 0;
    if (data.fundingType !== 'none') {
      const fundedHoursLimit = data.fundingType === '15h' ? 15 : 30;
      const hoursToFund = Math.min(data.hoursPerWeek, fundedHoursLimit);
      
      // Effective hourly rate for calculation
      const effectiveHourly = data.rateType === 'hourly' ? rate : (rate / (data.hoursPerWeek / data.daysPerWeek));
      
      // Pro-rating: (Max Hours * Rate * 38 weeks) / weeks_per_year_usage
      weeklyFundingCredit = (hoursToFund * effectiveHourly * 38) / data.weeksPerYear;
    }

    const weeklyNetPreTFC = Math.max(0, baseWeekly - weeklyFundingCredit) + weeklyExtras;
    
    // 4. Tax-Free Childcare (TFC) Savings
    const tfcWeeklyLimit = 2000 / 52;
    const tfcSaving = data.includeTaxFreeChildcare ? Math.min(weeklyNetPreTFC * 0.20, tfcWeeklyLimit) : 0;

    const weeklyTotal = weeklyNetPreTFC - tfcSaving;
    const yearlyTotal = weeklyTotal * data.weeksPerYear;

    return {
      weekly: weeklyTotal,
      monthly: yearlyTotal / 12,
      yearly: yearlyTotal,
      breakdown: {
        base: baseWeekly,
        extras: weeklyExtras,
        funding: weeklyFundingCredit,
        tfc: tfcSaving,
        rateUsed: rate,
        isAverage: !data.useCustomRate,
        fundedHoursCount: data.fundingType === 'none' ? 0 : (data.fundingType === '15h' ? 15 : 30)
      }
    };
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your usage</h2>
            <div className="space-y-8">
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Hours per week</label>
                <input type="range" min="1" max="60" value={data.hoursPerWeek} onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })} className="w-full accent-teal-600" />
                <div className="text-center mt-2 font-black text-2xl text-teal-700">{data.hoursPerWeek} hrs</div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Days per week</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(d => (
                    <button key={d} onClick={() => updateData({ daysPerWeek: d })} className={`flex-grow p-3 rounded-xl border-2 font-bold transition ${data.daysPerWeek === d ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Care period</h2>
            <div className="grid grid-cols-1 gap-3">
              {[38, 48, 51].map((w) => (
                <button key={w} onClick={() => updateData({ weeksPerYear: w })} className={`p-5 text-left border-2 rounded-2xl transition ${data.weeksPerYear === w ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="block font-bold text-lg">{w} weeks</span>
                  <span className="text-xs text-slate-400">{w === 38 ? 'Term-time (Funding fully covers these weeks)' : 'Year-round (Funding is "stretched" across the year)'}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Provider & Region</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Provider Type</label>
                <select value={data.childcareType} onChange={(e) => updateData({ childcareType: e.target.value })} className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white focus:border-teal-600 outline-none">
                  {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Postcode (First half)</label>
                <input type="text" placeholder="e.g. SW1 or M1" value={data.postcode} onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none" />
              </div>
            </div>
          </div>
        );
      case 4:
        const avg = getAverageRate();
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Standard fee</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button onClick={() => updateData({ rateType: 'hourly' })} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${data.rateType === 'hourly' ? 'bg-white shadow text-teal-600' : 'text-slate-500'}`}>Hourly Rate</button>
              <button onClick={() => updateData({ rateType: 'daily' })} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${data.rateType === 'daily' ? 'bg-white shadow text-teal-600' : 'text-slate-500'}`}>Daily Rate</button>
            </div>
            
            {!data.useCustomRate ? (
              <div className="p-8 bg-teal-50 rounded-3xl border border-teal-100 text-center">
                <span className="text-xs font-bold text-teal-600 block mb-1">Average in {isLondon(data.postcode) ? 'London' : 'your region'}</span>
                <span className="text-4xl font-black text-teal-900">£{avg.toFixed(2)}<span className="text-lg font-medium">/{data.rateType === 'hourly' ? 'hr' : 'day'}</span></span>
                <button onClick={() => updateData({ useCustomRate: true, customRateValue: avg })} className="block w-full mt-6 py-3 bg-white border border-teal-200 rounded-xl text-sm font-bold text-teal-700 hover:bg-teal-100 transition">Enter my specific rate</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                  <input type="number" step="0.01" value={data.customRateValue || ''} onChange={(e) => updateData({ customRateValue: parseFloat(e.target.value) })} className="w-full p-4 pl-8 border-2 border-teal-600 rounded-xl text-xl font-bold text-teal-900 outline-none" placeholder="0.00" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">per {data.rateType === 'hourly' ? 'hour' : 'day'}</span>
                </div>
                <button onClick={() => updateData({ useCustomRate: false })} className="text-slate-400 text-xs font-bold hover:text-teal-600">Use regional average</button>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Extra costs</h2>
            <p className="text-slate-500 text-sm">Most providers charge for meals and consumables when using funded hours.</p>
            <div className="space-y-3">
              {data.extraCosts.map((item, idx) => (
                <div key={item.name} className={`p-4 rounded-2xl border-2 transition ${item.enabled ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={item.enabled} onChange={(e) => {
                      const newCosts = [...data.extraCosts];
                      newCosts[idx].enabled = e.target.checked;
                      setData({...data, extraCosts: newCosts});
                    }} className="w-5 h-5 accent-teal-600" />
                    <div className="flex-grow">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.description}</div>
                    </div>
                  </label>
                  {item.enabled && (
                    <div className="mt-4 pl-8 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="relative flex-grow">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">£</span>
                        <input type="number" step="0.01" placeholder={item.defaultPrice.toFixed(2)} value={item.price || ''} onChange={(e) => {
                          const newCosts = [...data.extraCosts];
                          newCosts[idx].price = parseFloat(e.target.value);
                          setData({...data, extraCosts: newCosts});
                        }} className="w-full p-2 pl-6 border rounded-lg text-sm outline-none focus:border-teal-500" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unit === 'perDay' ? 'Daily' : 'Weekly'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Financial Support</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Funded Hours entitlement</label>
                <div className="grid grid-cols-3 gap-2">
                  {['none', '15h', '30h'].map((f) => (
                    <button key={f} onClick={() => updateData({ fundingType: f as FundingType })} className={`p-4 rounded-xl border-2 font-bold transition ${data.fundingType === f ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {f === 'none' ? 'None' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-6 rounded-2xl border-2 transition ${data.includeTaxFreeChildcare ? 'border-teal-600 bg-teal-50 shadow-sm' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2">
                     <i className="fa-solid fa-piggy-bank text-teal-600"></i>
                     Tax-Free Childcare
                   </h4>
                   <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${data.includeTaxFreeChildcare ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => updateData({ includeTaxFreeChildcare: !data.includeTaxFreeChildcare })}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${data.includeTaxFreeChildcare ? 'translate-x-7' : 'translate-x-1'}`}></div>
                   </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">The government adds £2 for every £8 you pay, up to £2,000/year. Select this to see your net out-of-pocket cost.</p>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 text-center py-8">
            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Calculate my estimate</h2>
            <p className="text-slate-500 max-w-sm mx-auto">We'll pro-rate your funding and extras across your {data.weeksPerYear}-week care cycle.</p>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const res = calculateCosts();
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-900 text-white">
            <div className="p-10 text-center border-b md:border-b-0 md:border-r border-slate-800">
              <span className="text-teal-400 text-[10px] font-bold block mb-1 uppercase tracking-widest">Weekly Net</span>
              <div className="text-4xl font-black">£{res.weekly.toFixed(2)}</div>
            </div>
            <div className="p-10 text-center border-b md:border-b-0 md:border-r border-slate-800">
              <span className="text-teal-400 text-[10px] font-bold block mb-1 uppercase tracking-widest">Monthly Average</span>
              <div className="text-4xl font-black">£{res.monthly.toFixed(0)}</div>
            </div>
            <div className="p-10 text-center bg-teal-600">
              <span className="text-white text-[10px] font-bold block mb-1 uppercase tracking-widest">Annual Outgoing</span>
              <div className="text-4xl font-black">£{res.yearly.toFixed(0)}</div>
            </div>
          </div>

          <div className="p-10 md:p-14">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900">Breakdown & Policy Notes</h3>
              <button onClick={() => setIsSubmitted(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition">Adjust my answers</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-600 font-medium">Gross Childcare Fee</span>
                  <span className="font-bold text-slate-900">£{res.breakdown.base.toFixed(2)}</span>
                </div>

                {res.breakdown.extras > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-600 font-medium">Extra Expenses (Meals/Consumables)</span>
                    <span className="font-bold text-slate-900">+ £{res.breakdown.extras.toFixed(2)}</span>
                  </div>
                )}

                {res.breakdown.funding > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 text-emerald-600">
                    <span className="font-medium">Funded Hours Credit</span>
                    <span className="font-bold">- £{res.breakdown.funding.toFixed(2)}</span>
                  </div>
                )}

                {res.breakdown.tfc > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 text-teal-600">
                    <span className="font-medium">Tax-Free Childcare top-up</span>
                    <span className="font-bold">- £{res.breakdown.tfc.toFixed(2)}</span>
                  </div>
                )}

                <div className="bg-teal-50 p-8 rounded-[2rem] flex flex-col items-center text-center gap-2 mt-8">
                   <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Estimated Weekly Outgoing</span>
                   <span className="text-5xl font-black text-teal-900">£{res.weekly.toFixed(2)}</span>
                   <p className="text-[10px] text-teal-600/70 mt-2 italic">*Based on {data.weeksPerYear} weeks per year</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <i className="fa-solid fa-circle-question text-teal-600"></i>
                   How we calculated this
                </h4>
                <div className="space-y-6 text-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">"Stretched" Funding</p>
                    <p className="text-slate-500 leading-relaxed">
                      Funding is usually 1,140 hours over 38 weeks. Since you care for <strong>{data.weeksPerYear} weeks</strong>, your funding is pro-rated to roughly <strong>{(res.breakdown.fundedHoursCount * 38 / data.weeksPerYear).toFixed(1)} hours per week</strong> across the whole year.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">Consumables & Meals</p>
                    <p className="text-slate-500 leading-relaxed">
                      Government funding only covers education, not subsistence. Providers charge daily fees for lunches and resources which are added back to your bill.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">Tax-Free Childcare Cap</p>
                    <p className="text-slate-500 leading-relaxed">
                      The maximum top-up is £2,000 per year (£38.46 per week). If your 20% savings exceeded this, we have capped it at the legal limit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-3">
          <span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Calculator Progress</span>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>
      
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[550px]">
        <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderStep()}
        </div>
        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'Show Result' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
