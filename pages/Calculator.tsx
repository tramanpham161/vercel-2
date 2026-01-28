
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
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 5000);
  };

  const calculateCosts = () => {
    const avgRate = getAverageRate();
    const rate = data.useCustomRate && data.customRateValue > 0 ? data.customRateValue : avgRate;
    
    let baseWeekly = data.rateType === 'hourly' ? data.hoursPerWeek * rate : data.daysPerWeek * rate;
    let weeklyExtras = 0;
    data.extraCosts.forEach(cost => {
      if (cost.enabled) {
        const val = cost.price !== undefined && cost.price > 0 ? cost.price : cost.defaultPrice;
        if (cost.unit === 'perDay') weeklyExtras += val * data.daysPerWeek;
        else if (cost.unit === 'perWeek') weeklyExtras += val;
      }
    });

    let weeklyFundingCredit = 0;
    if (data.fundingType !== 'none') {
      const fundedHoursLimit = data.fundingType === '15h' ? 15 : 30;
      const hoursToFund = Math.min(data.hoursPerWeek, fundedHoursLimit);
      const effectiveHourly = data.rateType === 'hourly' ? rate : (rate / (data.hoursPerWeek / data.daysPerWeek));
      // Pro-rate funded hours over the weeks per year if not term-time (38 weeks)
      weeklyFundingCredit = (hoursToFund * effectiveHourly * 38) / data.weeksPerYear;
    }

    const weeklyNetPreTFC = Math.max(0, baseWeekly - weeklyFundingCredit) + weeklyExtras;
    const tfcSaving = data.includeTaxFreeChildcare ? Math.min(weeklyNetPreTFC * 0.20, 2000 / 52) : 0;

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
        fundedHoursCount: data.fundingType === 'none' ? 0 : (data.fundingType === '15h' ? 15 : 30)
      }
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
            <h2 className="text-2xl font-bold text-slate-900">Care Period</h2>
            <div className="grid grid-cols-1 gap-3">
              {[38, 51].map((w) => (
                <button key={w} onClick={() => updateData({ weeksPerYear: w })} className={`p-5 text-left border-2 rounded-2xl transition ${data.weeksPerYear === w ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="block font-bold text-lg">{w} weeks</span>
                  <span className="text-xs text-slate-400">{w === 38 ? 'Term-time only' : 'Full year (funding stretched)'}</span>
                </button>
              ))}
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
                <select value={data.childcareType} onChange={(e) => updateData({ childcareType: e.target.value })} className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white">
                  {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Postcode Prefix</label>
                <input type="text" placeholder="e.g. SW1 or M1" value={data.postcode} onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        );
      case 4:
        const avg = getAverageRate();
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Fees</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button onClick={() => updateData({ rateType: 'hourly' })} className={`flex-1 py-2 rounded-lg font-bold text-sm ${data.rateType === 'hourly' ? 'bg-white shadow text-teal-600' : 'text-slate-500'}`}>Hourly</button>
              <button onClick={() => updateData({ rateType: 'daily' })} className={`flex-1 py-2 rounded-lg font-bold text-sm ${data.rateType === 'daily' ? 'bg-white shadow text-teal-600' : 'text-slate-500'}`}>Daily</button>
            </div>
            {!data.useCustomRate ? (
              <div className="p-8 bg-teal-50 rounded-3xl border border-teal-100 text-center">
                <span className="text-4xl font-black text-teal-900">£{avg.toFixed(2)}</span>
                <button onClick={() => updateData({ useCustomRate: true, customRateValue: avg })} className="block w-full mt-6 py-3 bg-white border border-teal-200 rounded-xl text-sm font-bold text-teal-700 transition hover:bg-teal-50">Enter custom rate</button>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input type="number" step="0.01" value={data.customRateValue || ''} onChange={(e) => updateData({ customRateValue: parseFloat(e.target.value) })} className="w-full p-4 pl-8 border-2 border-teal-600 rounded-xl text-xl font-bold" />
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Extras</h2>
            <div className="space-y-3">
              {data.extraCosts.map((item, idx) => (
                <div key={item.name} className={`p-4 rounded-2xl border-2 transition ${item.enabled ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={item.enabled} onChange={(e) => {
                      const newCosts = [...data.extraCosts];
                      newCosts[idx].enabled = e.target.checked;
                      setData({...data, extraCosts: newCosts});
                    }} className="w-5 h-5 accent-teal-600 rounded" />
                    <div>
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.description}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Funding Applied</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {['none', '15h', '30h'].map((f) => (
                  <button key={f} onClick={() => updateData({ fundingType: f as FundingType })} className={`p-4 rounded-xl border-2 font-bold transition ${data.fundingType === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-400 hover:border-slate-300'}`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className={`p-6 rounded-2xl border-2 transition ${data.includeTaxFreeChildcare ? 'border-teal-600 bg-teal-50' : 'bg-slate-50'}`}>
                 <button onClick={() => updateData({ includeTaxFreeChildcare: !data.includeTaxFreeChildcare })} className="w-full flex justify-between items-center text-left">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Tax-Free Childcare</span>
                      <span className="text-xs text-slate-400">Apply 20% savings on net costs?</span>
                    </div>
                    <i className={`fa-solid fa-toggle-${data.includeTaxFreeChildcare ? 'on text-teal-600' : 'off text-slate-300'} text-3xl`}></i>
                 </button>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="text-center py-12">
            <i className="fa-solid fa-chart-line text-6xl text-teal-600 mb-6"></i>
            <h2 className="text-3xl font-black text-slate-900">Calculating your quote...</h2>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const res = calculateCosts();
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-900 text-white">
            <div className="p-10 text-center border-r border-slate-800">
              <span className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-widest">Monthly</span>
              <div className="text-4xl font-black">£{res.monthly.toFixed(0)}</div>
            </div>
            <div className="p-10 text-center border-r border-slate-800">
              <span className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-widest">Weekly</span>
              <div className="text-4xl font-black">£{res.weekly.toFixed(2)}</div>
            </div>
            <div className="p-10 text-center bg-teal-600">
              <span className="text-xs text-teal-100 block mb-1 uppercase font-bold tracking-widest">Yearly</span>
              <div className="text-4xl font-black">£{res.yearly.toFixed(0)}</div>
            </div>
          </div>

          <div className="p-10 md:p-14">
             {/* Disclaimer */}
             <div className="mb-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
               <i className="fa-solid fa-circle-info text-amber-600 mt-1"></i>
               <div className="text-xs text-amber-900 leading-relaxed font-medium">
                 <strong>Cross-check Required:</strong> This quote is an estimate based on average regional rates and provided inputs. Individual provider fees and local authority pro-rating policies vary. Please verify this quote with your chosen setting before signing a contract.
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex justify-between border-b pb-4 text-sm">
                  <span className="text-slate-600">Base Cost ({data.hoursPerWeek}h/wk)</span>
                  <span className="font-bold">£{res.breakdown.base.toFixed(2)}</span>
                </div>
                {res.breakdown.funding > 0 && (
                  <div className="flex justify-between border-b pb-4 text-emerald-600 text-sm">
                    <span>Funding Credit (38wks pro-rated)</span>
                    <span className="font-bold">- £{res.breakdown.funding.toFixed(2)}</span>
                  </div>
                )}
                {res.breakdown.extras > 0 && (
                  <div className="flex justify-between border-b pb-4 text-sm">
                    <span>Selected Extras</span>
                    <span className="font-bold">+ £{res.breakdown.extras.toFixed(2)}</span>
                  </div>
                )}
                {data.includeTaxFreeChildcare && (
                  <div className="flex justify-between border-b pb-4 text-teal-600 text-sm font-medium">
                    <span>Tax-Free Childcare Savings</span>
                    <span className="font-bold">- £{res.breakdown.tfc.toFixed(2)}</span>
                  </div>
                )}
                <div className="bg-teal-50 p-8 rounded-[2.5rem] text-center border border-teal-100 mt-4">
                   <span className="text-xs font-black text-teal-600 uppercase tracking-widest block mb-1">Weekly Net Payable</span>
                   <div className="text-6xl font-black text-teal-900">£{res.weekly.toFixed(2)}</div>
                </div>
              </div>

              {/* Email Form */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center">
                 <h4 className="font-bold text-xl mb-2">Email me this quote</h4>
                 <p className="text-xs text-slate-400 mb-6 leading-relaxed">Keep a copy of this cost breakdown for your records. We'll send it as a PDF-ready summary.</p>
                 {emailSent ? (
                   <div className="text-teal-400 font-bold p-4 bg-teal-400/10 rounded-xl text-center border border-teal-400/20 animate-in fade-in slide-in-from-top-2">
                     <i className="fa-solid fa-paper-plane mb-2 block"></i>
                     Quote sent! Check your inbox.
                   </div>
                 ) : (
                   <form onSubmit={handleEmailSubmit} className="space-y-3">
                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full p-4 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-teal-500" required />
                     <button type="submit" className="w-full bg-teal-600 py-4 rounded-xl font-bold hover:bg-teal-500 transition shadow-lg shadow-teal-600/20 active:scale-95">Send Quote</button>
                   </form>
                 )}
              </div>
            </div>

            <div className="mt-12 text-center">
              <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-400 hover:text-teal-600 transition">Adjust calculation</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-widest">Cost Estimator</span>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>
      
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[500px] transition-all">
        <div className="flex-grow">
          {renderStep()}
        </div>
        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'Calculate Costs' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
