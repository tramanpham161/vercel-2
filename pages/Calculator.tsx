
import React, { useState, useMemo } from 'react';
import { CalculatorData, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';

// Refined Tooltip component matching the Nuuri info interaction
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2">
      <div 
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold cursor-help hover:border-teal-500 hover:text-teal-500 transition-colors"
      >
        i
      </div>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 bg-slate-900 text-white text-[11px] rounded-2xl z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-1 leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

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
      // Fix: Removed redundant check for 'none' as fundingType is already narrowed to '15h' | '30h' by the parent if statement.
      const fundedLimit = data.fundingType === '15h' ? 15 : 30;
      const hoursToFund = Math.min(data.hoursPerWeek, fundedLimit);
      const effectiveHourly = data.rateType === 'hourly' ? rate : (rate / (data.hoursPerWeek / data.daysPerWeek));
      // Standard funding is 38 weeks per year
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
        <p className="text-slate-500 text-lg max-w-2xl">Use our 2024/25 estimates to see how government funding affects your monthly childcare bill.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Section: Postcode & Provider */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-teal-600"></i>
              Attendance & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Postcode Prefix</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SW11" 
                    value={data.postcode} 
                    onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-600 transition outline-none font-bold"
                  />
                  {isLondon && <p className="text-[10px] text-teal-600 font-bold mt-2 uppercase">London regional average applied</p>}
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Provider Type</label>
                   <select 
                      value={data.childcareType} 
                      onChange={(e) => updateData({ childcareType: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-600 transition outline-none font-bold appearance-none cursor-pointer"
                    >
                      {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours per Week</label>
                    <span className="text-3xl font-black text-teal-600 leading-none">{data.hoursPerWeek}h</span>
                  </div>
                  <input 
                    type="range" min="1" max="60" 
                    value={data.hoursPerWeek} 
                    onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hourly Rate (£)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder={stats.breakdown.rateUsed.toFixed(2)}
                      onChange={(e) => updateData({ useCustomRate: true, customRateValue: parseFloat(e.target.value) || 0 })}
                      className="w-full p-4 pl-8 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-teal-600 transition"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">Using UK average (£{stats.breakdown.rateUsed.toFixed(2)}) if blank.</p>
                </div>
              </div>
            </div>
          </div>

          {/* New Section: What funding assistance are you eligible for? (Nuuri Reference Style) */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-2">What funding assistance are you eligible for?</h3>
            <p className="text-xs text-slate-400 mb-8 font-medium">Select the schemes you qualify for based on your child's age and work status.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: 15h 9m+ */}
              <div 
                onClick={() => updateData({ fundingType: data.fundingType === '15h' ? 'none' : '15h' })}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-40 group ${data.fundingType === '15h' ? 'border-teal-600 bg-teal-50/50 shadow-md' : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm leading-tight">15 hours free childcare (9-23 months)</span>
                    <InfoTooltip text="For working parents of children from 9 months. Both parents must earn at least the min wage for 16h/week and under £100k/year." />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expansion Scheme</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${data.fundingType === '15h' ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                     {data.fundingType === '15h' && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                   </div>
                </div>
              </div>

              {/* Card 2: 15h 2y */}
              <div 
                onClick={() => updateData({ fundingType: data.fundingType === '15h' ? 'none' : '15h' })} // logic placeholder for 15h
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-40 group ${data.fundingType === '15h' ? 'border-teal-600 bg-teal-50/50 shadow-md' : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm leading-tight">15 hours free childcare (2 years old)</span>
                    <InfoTooltip text="Working parents of 2-year-olds or those receiving certain support benefits are eligible for 15 hours of funded care." />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 Year Olds</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${data.fundingType === '15h' ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                     {data.fundingType === '15h' && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                   </div>
                </div>
              </div>

              {/* Card 3: 15/30h 3-4y */}
              <div 
                onClick={() => updateData({ fundingType: data.fundingType === '30h' ? 'none' : '30h' })}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-40 group ${data.fundingType === '30h' ? 'border-teal-600 bg-teal-50/50 shadow-md' : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm leading-tight">15/30 hours free childcare (3-4 years old)</span>
                    <InfoTooltip text="All 3-4 year olds in England get 15 hours universal. Working parents can claim an additional 15 hours (total 30)." />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Scheme</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${data.fundingType === '30h' ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                     {data.fundingType === '30h' && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                   </div>
                </div>
              </div>

              {/* Card 4: Tax-Free Childcare */}
              <div 
                onClick={() => updateData({ includeTaxFreeChildcare: !data.includeTaxFreeChildcare })}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-40 group ${data.includeTaxFreeChildcare ? 'border-teal-600 bg-teal-50/50 shadow-md' : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm leading-tight">Tax-Free Childcare (UK Wide)</span>
                    <InfoTooltip text="For every £8 you pay into your account, the government adds £2 (up to £2,000 per child, per year)." />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Support</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${data.includeTaxFreeChildcare ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                     {data.includeTaxFreeChildcare && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Additional Fees */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
             <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <i className="fa-solid fa-basket-shopping text-teal-600"></i>
              Additional Fees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.extraCosts.map((item, idx) => (
                <div key={item.name} className={`p-6 rounded-[1.5rem] border-2 transition ${item.enabled ? 'border-teal-600 bg-white shadow-sm' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={item.enabled} 
                        onChange={(e) => updateExtra(idx, { enabled: e.target.checked })}
                        className="w-5 h-5 rounded accent-teal-600 cursor-pointer"
                      />
                      <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.unit === 'perDay' ? 'Daily' : 'Weekly'}</span>
                  </div>
                  {item.enabled && (
                    <div className="animate-in fade-in slide-in-from-top-1">
                       <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">£</span>
                        <input 
                          type="number" 
                          step="0.50"
                          value={item.price || ''}
                          placeholder={`${item.defaultPrice.toFixed(2)} (Avg)`}
                          onChange={(e) => updateExtra(idx, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition font-bold text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results Sidebar */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-2">Estimated Monthly Bill</span>
              <div className="text-7xl font-black mb-10 tracking-tighter">£{stats.monthly.toFixed(0)}</div>
              
              <div className="space-y-4 mb-10 pt-8 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Weekly Net Cost</span>
                  <span className="font-black text-slate-100 text-lg">£{stats.weekly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Yearly Estimate</span>
                  <span className="font-bold text-slate-200">£{stats.yearly.toLocaleString()}</span>
                </div>
              </div>

              {/* Dynamic Progress Bar: You Pay vs Gov Pays */}
              <div className="space-y-4 pt-4">
                 <div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                     <span className="text-teal-400">You Pay: £{stats.weekly.toFixed(0)}</span>
                     <span className="text-emerald-400">Gov Pays: £{stats.govPays.toFixed(0)}</span>
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
              </div>

              <div className="mt-12 pt-8 border-t border-slate-800">
                <button className="w-full py-5 bg-teal-600 rounded-2xl font-black text-sm hover:bg-teal-500 transition shadow-xl shadow-teal-600/20 active:scale-95">
                  Email This Breakdown
                </button>
                <p className="text-[9px] text-slate-500 text-center mt-6 uppercase tracking-widest font-black">Estimates for 2024/25 Rules</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-teal-50 p-6 rounded-[2rem] border border-teal-100 text-center">
             <p className="text-[10px] text-teal-700 font-bold mb-3 uppercase tracking-wider">Not sure about eligibility?</p>
             <a href="/eligibility" className="text-teal-900 font-black text-xs hover:underline flex items-center justify-center gap-2">
               Check full eligibility criteria <i className="fa-solid fa-arrow-right"></i>
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
