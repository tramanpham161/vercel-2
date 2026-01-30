
import React, { useState, useMemo } from 'react';
import { CalculatorData, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';

// Nuuri-style Info Tooltip
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-auto">
      <div 
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => { e.stopPropagation(); setVisible(!visible); }}
        className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold cursor-help hover:border-teal-500 hover:text-teal-500 transition-colors bg-white shadow-sm"
      >
        i
      </div>
      {visible && (
        <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-slate-900 text-white text-[11px] rounded-2xl z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-1 leading-relaxed">
          {text}
          <div className="absolute top-full right-4 border-8 border-transparent border-t-slate-900"></div>
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
    includeTaxFreeChildcare: true,
    includeUniversalCredit: false,
    includeStudentGrant: false
  });

  const isLondon = useMemo(() => {
    const p = data.postcode.trim().toUpperCase();
    const prefixes = ['SW', 'W', 'E', 'N', 'SE', 'NW', 'WC', 'EC', 'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB'];
    return prefixes.some(pref => p.startsWith(pref));
  }, [data.postcode]);

  const stats = useMemo(() => {
    const typeKey = data.childcareType.toLowerCase();
    const rateData = (CHILDCARE_DATA_2024.rates as any)[typeKey] || CHILDCARE_DATA_2024.rates.default;
    const avgRate = isLondon ? rateData[data.rateType].london : rateData[data.rateType].regional;
    const rate = data.useCustomRate && data.customRateValue > 0 ? data.customRateValue : avgRate;
    
    // 1. Initial Weekly Cost (Provider Fees)
    let baseWeekly = data.rateType === 'hourly' ? data.hoursPerWeek * rate : data.daysPerWeek * rate;
    
    // 2. Extra Costs
    let weeklyExtras = 0;
    data.extraCosts.forEach(cost => {
      if (cost.enabled) {
        const val = (cost.price !== undefined && cost.price > 0) ? cost.price : cost.defaultPrice;
        if (cost.unit === 'perDay') weeklyExtras += val * data.daysPerWeek;
        else if (cost.unit === 'perWeek') weeklyExtras += val;
      }
    });

    // 3. Hourly Funding (30h England, Scot/Wales)
    let weeklyFundingCredit = 0;
    if (data.fundingType !== 'none') {
      const fundedLimit = (data.fundingType === '30h' || data.fundingType === 'scot-wales-30h') ? 30 : 15;
      const hoursToFund = Math.min(data.hoursPerWeek, fundedLimit);
      const effectiveHourly = data.rateType === 'hourly' ? rate : (rate / (data.hoursPerWeek / data.daysPerWeek));
      // Funded hours are typically 38 weeks per year.
      weeklyFundingCredit = (hoursToFund * effectiveHourly * 38) / data.weeksPerYear;
    }

    // 4. Financial Support (Universal Credit, Tax-Free, Student Grant)
    const netBeforeDirectSupport = Math.max(0, baseWeekly - weeklyFundingCredit);
    const totalBillWithExtras = netBeforeDirectSupport + weeklyExtras;

    let govSaving = weeklyFundingCredit;
    let finalPayable = totalBillWithExtras;

    // Logic: Universal Credit, Student Grant, and Tax-Free are generally mutually exclusive for childcare.
    if (data.includeUniversalCredit) {
      const ucSaving = totalBillWithExtras * 0.85;
      govSaving += ucSaving;
      finalPayable -= ucSaving;
    } else if (data.includeStudentGrant) {
      // 85% of costs, capped at £199.62 per week for 1 child
      const grantSaving = Math.min(totalBillWithExtras * 0.85, 199.62);
      govSaving += grantSaving;
      finalPayable -= grantSaving;
    } else if (data.includeTaxFreeChildcare) {
      // 20% savings up to £2,000/year (£38.46/week)
      const tfcSaving = Math.min(finalPayable * 0.20, 2000 / 52);
      govSaving += tfcSaving;
      finalPayable -= tfcSaving;
    }

    const yearlyTotal = Math.max(0, finalPayable) * data.weeksPerYear;

    return {
      weekly: Math.max(0, finalPayable),
      monthly: yearlyTotal / 12,
      yearly: yearlyTotal,
      govPays: govSaving,
      youPay: Math.max(0, finalPayable),
      breakdown: { base: baseWeekly, extras: weeklyExtras, funding: weeklyFundingCredit, isLondon, rateUsed: rate }
    };
  }, [data, isLondon]);

  const updateData = (updates: Partial<CalculatorData>) => setData(prev => ({ ...prev, ...updates }));
  const updateExtra = (idx: number, updates: Partial<any>) => {
    const newExtras = [...data.extraCosts];
    newExtras[idx] = { ...newExtras[idx], ...updates };
    setData(prev => ({ ...prev, extraCosts: newExtras }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Childcare Cost Calculator</h1>
        <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
          See your true monthly outgoings with the full 2026 funding rollout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Postcode & Rate Section */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-map-location-dot text-teal-600"></i>
              Attendance & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Postcode Area</label>
                  <input 
                    type="text" placeholder="e.g. SW11" value={data.postcode} 
                    onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-teal-600 transition outline-none font-bold text-lg"
                  />
                  {isLondon && <p className="text-[10px] text-teal-600 font-bold mt-3 uppercase tracking-wider">London regional average applied</p>}
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Hours Per Week</label>
                  <div className="flex items-center gap-6">
                    <input 
                      type="range" min="1" max="60" value={data.hoursPerWeek} 
                      onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })}
                      className="flex-grow h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600" 
                    />
                    <span className="text-2xl font-black text-slate-900 w-12">{data.hoursPerWeek}h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Childcare Type</label>
                  <select 
                    value={data.childcareType} onChange={(e) => updateData({ childcareType: e.target.value })}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-teal-600 transition outline-none font-bold appearance-none cursor-pointer"
                  >
                    {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Hourly Rate (£)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">£</span>
                    <input 
                      type="number" step="0.01" value={data.customRateValue || ''}
                      placeholder={stats.breakdown.rateUsed.toFixed(2)}
                      onChange={(e) => updateData({ useCustomRate: true, customRateValue: parseFloat(e.target.value) || 0 })}
                      className="w-full p-5 pl-10 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-lg outline-none focus:border-teal-600 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Childcare Funding Options for 2026 */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-2">What funding assistance are you eligible for?</h3>
            <p className="text-sm text-slate-400 mb-10 font-medium">Select the schemes you qualify for based on the latest 2026 rules.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { 
                  id: '30h', title: '30 Hours Free Childcare (England)', subtitle: 'Working Parents (9m - 4y)', 
                  desc: 'Eligible working parents of children aged 9 months to 4 years can access 30 hours per week (1,140 hours a year).',
                  isSelected: data.fundingType === '30h',
                  onToggle: () => updateData({ fundingType: data.fundingType === '30h' ? 'none' : '30h' })
                },
                { 
                  id: 'tax_free', title: 'Tax-Free Childcare', subtitle: 'Government Top-Up', 
                  desc: 'Government tops up £8 with £2, up to £500 per child every 3 months (£2,000/year).',
                  isSelected: data.includeTaxFreeChildcare && !data.includeUniversalCredit && !data.includeStudentGrant,
                  onToggle: () => updateData({ includeTaxFreeChildcare: !data.includeTaxFreeChildcare, includeUniversalCredit: false, includeStudentGrant: false })
                },
                { 
                  id: 'uc', title: 'Universal Credit', subtitle: 'Support for Families', 
                  desc: 'Eligible parents can claim back up to 85% of eligible childcare costs, with caps expected to rise.',
                  isSelected: data.includeUniversalCredit,
                  onToggle: () => updateData({ includeUniversalCredit: !data.includeUniversalCredit, includeTaxFreeChildcare: false, includeStudentGrant: false })
                },
                { 
                  id: 'grant', title: 'Childcare Grant (Students)', subtitle: 'Higher Education Support', 
                  desc: 'Full-time higher education students may receive 85% of costs, up to £199.62/week for one child, or £342.24/week for two or more.',
                  isSelected: data.includeStudentGrant,
                  onToggle: () => updateData({ includeStudentGrant: !data.includeStudentGrant, includeTaxFreeChildcare: false, includeUniversalCredit: false })
                },
                { 
                  id: 'scot_wales', title: 'Support in Scotland & Wales', subtitle: 'Regional 30h Schemes', 
                  desc: 'Scotland: 30 hours for 3-4 year olds and eligible 2 year olds. Wales: 30 hours (combined education and childcare) for 3-4 year olds of working parents.',
                  isSelected: data.fundingType === 'scot-wales-30h',
                  onToggle: () => updateData({ fundingType: data.fundingType === 'scot-wales-30h' ? 'none' : 'scot-wales-30h' })
                }
              ].map((scheme) => (
                <div 
                  key={scheme.id} onClick={scheme.onToggle}
                  className={`p-7 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[170px] ${scheme.isSelected ? 'border-teal-600 bg-teal-50/30' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <div className="flex items-start">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-sm leading-tight">{scheme.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{scheme.subtitle}</p>
                    </div>
                    <InfoTooltip text={scheme.desc} />
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${scheme.isSelected ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                      {scheme.isSelected && <i className="fa-solid fa-check text-white text-[11px]"></i>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fees */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
             <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3">
              <i className="fa-solid fa-plus-circle text-teal-600"></i>
              Additional Costs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.extraCosts.map((item, idx) => (
                <div 
                  key={item.name} 
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${item.enabled ? 'border-teal-600 bg-white ring-4 ring-teal-50' : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}
                  onClick={() => updateExtra(idx, { enabled: !item.enabled })}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${item.enabled ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                         {item.enabled && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                       </div>
                       <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.unit === 'perDay' ? 'Daily' : 'Weekly'}</span>
                  </div>
                  {item.enabled && (
                    <div className="animate-in fade-in slide-in-from-top-1" onClick={(e) => e.stopPropagation()}>
                       <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">£</span>
                        <input 
                          type="number" step="0.50" value={item.price || ''}
                          placeholder={item.defaultPrice.toFixed(2)}
                          onChange={(e) => updateExtra(idx, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full pl-8 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-600 transition font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative border border-slate-800">
            <div className="relative z-10">
              <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em] block mb-3">Estimated Monthly Bill</span>
              <div className="text-8xl font-black mb-12 tracking-tighter tabular-nums flex items-start">
                <span className="text-4xl mt-3 mr-1">£</span>{stats.monthly.toFixed(0)}
              </div>
              
              <div className="space-y-6 mb-12 pt-10 border-t border-slate-800 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Weekly Net Cost</span>
                  <span className="font-black text-white text-xl">£{stats.weekly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Annual Estimate</span>
                  <span className="font-bold text-slate-200">£{stats.yearly.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                   <span className="text-teal-400">You Pay: £{stats.weekly.toFixed(0)}</span>
                   <span className="text-emerald-400">Gov Benefit: £{stats.govPays.toFixed(0)}</span>
                 </div>
                 <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                   <div className="bg-teal-500 h-full transition-all duration-1000 ease-out" style={{ width: `${(stats.youPay / (stats.youPay + stats.govPays)) * 100}%` }}></div>
                   <div className="bg-emerald-400 h-full transition-all duration-1000 ease-out" style={{ width: `${(stats.govPays / (stats.youPay + stats.govPays)) * 100}%` }}></div>
                 </div>
              </div>

              <button className="w-full py-6 bg-teal-600 rounded-[1.5rem] font-black text-base hover:bg-teal-500 transition shadow-xl shadow-teal-600/20 active:scale-[0.98]">
                Get Full PDF Breakdown
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-[0.2em] font-black">2026 Childcare Data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
