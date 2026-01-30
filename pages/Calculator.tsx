
import React, { useState, useMemo } from 'react';
import { CalculatorData, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';

const Calculator: React.FC = () => {
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

  const isLondon = useMemo(() => {
    const p = data.postcode.trim().toUpperCase();
    const prefixes = ['SW', 'W', 'E', 'N', 'SE', 'NW', 'WC', 'EC', 'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB'];
    return prefixes.some(pref => p.startsWith(pref));
  }, [data.postcode]);

  const stats = useMemo(() => {
    const london = isLondon;
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
      // Pro-rated over the weeks per year (standard funding is 38 weeks)
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
      govPays: weeklyFundingCredit + tfcSaving,
      youPay: weeklyTotal,
      breakdown: { base: baseWeekly, extras: weeklyExtras, funding: weeklyFundingCredit, tfc: tfcSaving, isLondon: london, rateUsed: rate }
    };
  }, [data, isLondon]);

  const updateData = (updates: Partial<CalculatorData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const updateExtra = (idx: number, updates: Partial<any>) => {
    const newExtras = [...data.extraCosts];
    newExtras[idx] = { ...newExtras[idx], ...updates };
    setData(prev => ({ ...prev, extraCosts: newExtras }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">Childcare Cost Calculator</h1>
        <p className="text-slate-500 text-lg max-w-2xl">Estimate your net childcare costs by factoring in government funding, tax-free childcare, and regional provider rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Your Provider */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-house-chimney text-teal-600"></i>
              Your Childcare
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Postcode Prefix</label>
                <input 
                  type="text" 
                  placeholder="e.g. SW11" 
                  value={data.postcode} 
                  onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition outline-none font-bold"
                />
                {isLondon && <p className="text-[10px] text-teal-600 font-bold mt-2"><i className="fa-solid fa-location-dot mr-1"></i> London rates detected</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Provider Type</label>
                <select 
                  value={data.childcareType} 
                  onChange={(e) => updateData({ childcareType: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition outline-none font-bold appearance-none"
                >
                  {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
               <div className="flex justify-between items-center mb-4">
                 <label className="text-xs font-bold text-slate-400 uppercase">Provider Hourly Rate</label>
                 <button 
                  onClick={() => updateData({ useCustomRate: !data.useCustomRate })} 
                  className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700"
                 >
                   {data.useCustomRate ? 'Use Average Instead' : 'Enter Custom Rate'}
                 </button>
               </div>
               {data.useCustomRate ? (
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                   <input 
                    type="number" 
                    step="0.01" 
                    value={data.customRateValue || ''} 
                    onChange={(e) => updateData({ customRateValue: parseFloat(e.target.value) })}
                    className="w-full p-4 pl-8 bg-white border-2 border-teal-600 rounded-2xl font-bold text-xl outline-none"
                    placeholder="Enter rate"
                   />
                 </div>
               ) : (
                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                   <div>
                     <span className="text-2xl font-black text-slate-900">£{stats.breakdown.rateUsed.toFixed(2)}</span>
                     <span className="text-slate-400 text-xs font-bold ml-2">/ hr</span>
                   </div>
                   <span className="text-[9px] font-black bg-teal-100 text-teal-700 px-3 py-1 rounded-full uppercase tracking-widest">
                     {isLondon ? 'London Avg' : 'UK Regional Avg'}
                   </span>
                 </div>
               )}
            </div>
          </div>

          {/* Section 2: Usage */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-teal-600"></i>
              Attendance
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase">Hours per Week</label>
                  <span className="text-2xl font-black text-teal-600">{data.hoursPerWeek}h</span>
                </div>
                <input 
                  type="range" min="1" max="60" 
                  value={data.hoursPerWeek} 
                  onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Days per week</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(d => (
                      <button 
                        key={d} 
                        onClick={() => updateData({ daysPerWeek: d })}
                        className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition ${data.daysPerWeek === d ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Billing Weeks</label>
                  <div className="flex gap-2">
                    {[38, 51].map(w => (
                      <button 
                        key={w} 
                        onClick={() => updateData({ weeksPerYear: w })}
                        className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition ${data.weeksPerYear === w ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {w === 38 ? '38 (Term)' : '51 (Full)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Funding */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-gift text-teal-600"></i>
              Government Help
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Funded Hours Entitlement</label>
                <div className="grid grid-cols-3 gap-3">
                  {['none', '15h', '30h'].map((f) => (
                    <button 
                      key={f} 
                      onClick={() => updateData({ fundingType: f as FundingType })}
                      className={`py-4 rounded-2xl border-2 font-black transition ${data.fundingType === f ? 'border-teal-600 bg-teal-600 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-6 rounded-3xl border-2 transition ${data.includeTaxFreeChildcare ? 'border-teal-600 bg-teal-50' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm">
                      <i className="fa-solid fa-piggy-bank text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Tax-Free Childcare</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Get 20% government top-up on all payments</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateData({ includeTaxFreeChildcare: !data.includeTaxFreeChildcare })}
                    className={`w-14 h-7 rounded-full relative transition-colors ${data.includeTaxFreeChildcare ? 'bg-teal-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${data.includeTaxFreeChildcare ? 'translate-x-8' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Extra Costs (Redesigned) */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-plus-circle text-teal-600"></i>
              Additional Fees
            </h3>
            <p className="text-xs text-slate-400 mb-8 font-medium italic">Enter your provider's specific daily/weekly charges or use the UK 2024 averages.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.extraCosts.map((item, idx) => (
                <div key={item.name} className={`p-5 rounded-3xl border-2 transition ${item.enabled ? 'border-teal-600 bg-white' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={item.enabled} 
                        onChange={(e) => updateExtra(idx, { enabled: e.target.checked })}
                        className="w-5 h-5 rounded accent-teal-600"
                      />
                      <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.unit === 'perDay' ? 'Daily' : 'Weekly'}</span>
                  </div>
                  
                  {item.enabled && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs group-focus-within:text-teal-600">£</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={item.price || ''}
                          placeholder={`${item.defaultPrice.toFixed(2)} (Avg)`}
                          onChange={(e) => updateExtra(idx, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full pl-7 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition font-bold"
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium italic">
                        {item.price === undefined || item.price === 0 
                          ? `Currently using UK average rate of £${item.defaultPrice.toFixed(2)}.` 
                          : `Using your custom provider rate.`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="relative z-10">
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">Your Monthly Bill</span>
              <div className="text-6xl font-black mb-10 tracking-tighter">£{stats.monthly.toFixed(0)}</div>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Weekly Cost</span>
                  <span className="font-bold text-slate-200">£{stats.weekly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Yearly Estimate</span>
                  <span className="font-bold text-slate-200">£{stats.yearly.toFixed(0)}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 space-y-6">
                 <div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                     <span>You Pay</span>
                     <span>Gov Pays</span>
                   </div>
                   <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                     <div 
                      className="bg-teal-500 h-full transition-all duration-1000" 
                      style={{ width: `${(stats.youPay / (stats.youPay + stats.govPays)) * 100}%` }}
                     ></div>
                     <div 
                      className="bg-emerald-400 h-full transition-all duration-1000" 
                      style={{ width: `${(stats.govPays / (stats.youPay + stats.govPays)) * 100}%` }}
                     ></div>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Weekly Savings</span>
                      <span className="text-xl font-black text-emerald-400">£{stats.govPays.toFixed(0)}</span>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Weekly Care</span>
                      <span className="text-xl font-black text-slate-100">£{stats.breakdown.base.toFixed(0)}</span>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => window.print()} 
                className="w-full mt-10 py-5 bg-teal-600 rounded-2xl font-black text-sm hover:bg-teal-500 transition shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-download"></i> Save Summary
              </button>
            </div>
          </div>

          <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100">
            <h4 className="font-bold text-teal-900 mb-2 text-sm">Ready to apply?</h4>
            <p className="text-xs text-teal-700 leading-relaxed mb-6 font-medium">Use our eligibility checker to see if you qualify for the 30-hour expansion starting for children as young as 9 months.</p>
            <a href="/eligibility" className="block text-center py-3 bg-white text-teal-700 rounded-xl font-black text-xs border border-teal-200 hover:bg-teal-100 transition">Check Eligibility</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
