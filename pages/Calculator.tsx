
import React, { useState, useMemo } from 'react';
import { CalculatorData, FundingType } from '../types';
import { PROVIDER_TYPES, CHILDCARE_DATA_2024 } from '../constants';
import { GoogleGenAI } from "@google/genai";

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string; sources: any[] } | null>(null);

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
      // Funded hours are typically 38 weeks. Stretch over 51 if chosen.
      weeklyFundingCredit = (hoursToFund * effectiveHourly * 38) / data.weeksPerYear;
    }

    // 4. Financial Support (Universal Credit, Tax-Free, Student Grant)
    const netBeforeDirectSupport = Math.max(0, baseWeekly - weeklyFundingCredit);
    const totalBillWithExtras = netBeforeDirectSupport + weeklyExtras;

    let govSaving = weeklyFundingCredit;
    let finalPayable = totalBillWithExtras;

    // UC and TFC are mutually exclusive. Student Grant can be additional or distinct.
    if (data.includeUniversalCredit) {
      const ucSaving = totalBillWithExtras * 0.85;
      govSaving += ucSaving;
      finalPayable -= ucSaving;
    } else if (data.includeStudentGrant) {
      const grantSaving = Math.min(totalBillWithExtras * 0.85, 199.62); // Cap based on 2026 guidelines
      govSaving += grantSaving;
      finalPayable -= grantSaving;
    } else if (data.includeTaxFreeChildcare) {
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

  const fetchRealtimeRate = async () => {
    if (!data.postcode) {
      alert("Please enter a postcode prefix (e.g., SW11)");
      return;
    }
    setIsSearching(true);
    setSearchResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Average hourly nursery rate in ${data.postcode} for 2026. Return a clear numerical average.`,
        config: { tools: [{ googleSearch: {} }] },
      });
      const text = response.text || "No live data.";
      setSearchResult({ text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web).map(c => ({ uri: c.web?.uri, title: c.web?.title })) || [] });
      const match = text.match(/£?(\d+\.\d{2})/);
      if (match) setData(prev => ({ ...prev, useCustomRate: true, customRateValue: parseFloat(match[1]) }));
    } catch (e) {
      console.error(e);
      setSearchResult({ text: "Could not fetch local rates.", sources: [] });
    } finally { setIsSearching(false); }
  };

  const updateData = (updates: Partial<CalculatorData>) => setData(prev => ({ ...prev, ...updates }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Childcare Cost Calculator</h1>
        <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
          Integrated with the full 2026 government expansion and live regional rate intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Postcode & Rate Section */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-map-location-dot text-teal-600"></i>
              Attendance & Providers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Postcode Prefix</label>
                  <div className="relative group flex gap-2">
                    <input 
                      type="text" placeholder="e.g. SW11" value={data.postcode} 
                      onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })}
                      className="flex-grow p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-teal-600 transition outline-none font-bold text-lg"
                    />
                    <button 
                      onClick={fetchRealtimeRate} disabled={isSearching}
                      className="bg-slate-900 text-white w-14 h-14 rounded-2xl hover:bg-teal-600 transition flex items-center justify-center shadow-lg shrink-0"
                    >
                      {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Weekly Hours</label>
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
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Estimated Hourly Rate</label>
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
            {searchResult && (
              <div className="mt-8 p-6 bg-teal-50 border border-teal-100 rounded-[2rem] text-sm text-teal-900 animate-in fade-in">
                <p className="font-bold mb-2">Gemini Live Analysis:</p>
                <p>{searchResult.text}</p>
              </div>
            )}
          </div>

          {/* Key Childcare Funding Options for 2026 */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-2">What funding assistance are you eligible for?</h3>
            <p className="text-sm text-slate-400 mb-10 font-medium">Updated 2026 eligibility criteria for UK households.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { 
                  id: '30h', title: '30 Hours Free Childcare', subtitle: 'England: Ages 9m - 4y', 
                  desc: 'Eligible working parents can access 30 hours per week (1,140 hours a year).',
                  isSelected: data.fundingType === '30h',
                  onToggle: () => updateData({ fundingType: data.fundingType === '30h' ? 'none' : '30h' })
                },
                { 
                  id: 'tax_free', title: 'Tax-Free Childcare', subtitle: 'UK Wide Top-Up', 
                  desc: 'Government tops up £8 with £2, up to £2,000/year per child. Cannot be used with UC.',
                  isSelected: data.includeTaxFreeChildcare && !data.includeUniversalCredit,
                  onToggle: () => updateData({ includeTaxFreeChildcare: !data.includeTaxFreeChildcare, includeUniversalCredit: false })
                },
                { 
                  id: 'uc', title: 'Universal Credit Childcare', subtitle: 'Up to 85% claim back', 
                  desc: 'Working parents can claim back 85% of costs. Caps have risen for 2026.',
                  isSelected: data.includeUniversalCredit,
                  onToggle: () => updateData({ includeUniversalCredit: !data.includeUniversalCredit, includeTaxFreeChildcare: false })
                },
                { 
                  id: 'grant', title: 'Childcare Grant (Students)', subtitle: 'Full-time Higher Ed', 
                  desc: 'Receive up to 85% of costs, max £199.62/wk for one child or £342.24/wk for two+.',
                  isSelected: data.includeStudentGrant,
                  onToggle: () => updateData({ includeStudentGrant: !data.includeStudentGrant })
                },
                { 
                  id: 'scot_wales', title: 'Support in Scotland & Wales', subtitle: 'Regional 30h Schemes', 
                  desc: 'Scotland: 30h for 3-4y & eligible 2y. Wales: 30h for 3-4y working parents.',
                  isSelected: data.fundingType === 'scot-wales-30h',
                  onToggle: () => updateData({ fundingType: data.fundingType === 'scot-wales-30h' ? 'none' : 'scot-wales-30h' })
                }
              ].map((scheme) => (
                <div 
                  key={scheme.id} onClick={scheme.onToggle}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${scheme.isSelected ? 'border-teal-600 bg-teal-50/30' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <div className="flex items-start">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-sm leading-tight">{scheme.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{scheme.subtitle}</p>
                    </div>
                    <InfoTooltip text={scheme.desc} />
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${scheme.isSelected ? 'bg-teal-600 border-teal-600 shadow-lg shadow-teal-600/20' : 'bg-white border-slate-200'}`}>
                      {scheme.isSelected && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Results */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative border border-slate-800">
            <div className="relative z-10">
              <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em] block mb-3">2026 Monthly Outgoing</span>
              <div className="text-8xl font-black mb-12 tracking-tighter tabular-nums flex items-start">
                <span className="text-4xl mt-3 mr-1">£</span>{stats.monthly.toFixed(0)}
              </div>
              <div className="space-y-6 mb-12 pt-10 border-t border-slate-800 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400">Weekly Net Cost</span><span className="font-black text-white text-xl">£{stats.weekly.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Annual Total</span><span className="font-bold text-slate-200">£{stats.yearly.toLocaleString()}</span></div>
              </div>
              <div className="space-y-4 mb-10">
                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                   <span className="text-teal-400">You Pay: £{stats.weekly.toFixed(0)}</span>
                   <span className="text-emerald-400">Gov Total: £{stats.govPays.toFixed(0)}</span>
                 </div>
                 <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                   <div className="bg-teal-500 h-full transition-all duration-1000" style={{ width: `${(stats.youPay / (stats.youPay + stats.govPays)) * 100}%` }}></div>
                   <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${(stats.govPays / (stats.youPay + stats.govPays)) * 100}%` }}></div>
                 </div>
              </div>
              <button className="w-full py-6 bg-teal-600 rounded-[1.5rem] font-black text-base hover:bg-teal-500 transition shadow-xl shadow-teal-600/20 active:scale-[0.98]">
                Get Breakdown PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
