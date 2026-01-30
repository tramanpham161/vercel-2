
import React, { useState, useMemo } from 'react';
import { EligibilityData, ChildAge, WorkStatus, Scheme, UKRegion } from '../types';
import { BENEFIT_OPTIONS, OFFICIAL_LINKS } from '../constants';

// Reusable Info Tooltip matching Calculator style
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
        <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-slate-900 text-white text-[11px] rounded-2xl z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-1 leading-relaxed font-normal">
          {text}
          <div className="absolute top-full right-4 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

const Eligibility: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [data, setData] = useState<EligibilityData>({
    location: 'England',
    childAge: '3-4y',
    hasPartner: false,
    userWorkStatus: 'working',
    partnerWorkStatus: 'working',
    incomeInRange: 'yes',
    benefits: [],
    childDisabled: false,
    postcode: '',
    hoursPerWeek: 30,
    providerType: 'Nursery',
    parentAge: 25,
    isStudent: false,
    isPregnant: false
  });

  const totalSteps = 6;

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const results = useMemo(() => {
    const list: Scheme[] = [];
    const isWorking = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerWorking = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeOk = data.incomeInRange === 'yes';
    const workingFamiliesEligible = isWorking && partnerWorking && incomeOk;

    // 1. England Funding (2026 Logic)
    if (data.location === 'England') {
      const age34 = data.childAge === '3-4y';
      list.push({
        id: 'eng-15h-univ',
        title: 'Universal 15 Hours (3-4y)',
        category: 'Universal',
        description: 'Standard funded childcare for all 3 and 4-year-olds in England, regardless of income.',
        hours: age34 ? 15 : 0,
        type: 'funding',
        reason: age34 ? "Your child is in the 3-4 age group." : "Only available for 3-4 year olds.",
        link: OFFICIAL_LINKS.schemes.eng15hUniversal
      });

      const eligible9mTo4y = ['9m-2y', '2y', '3-4y'].includes(data.childAge);
      const qualifies30h = eligible9mTo4y && workingFamiliesEligible;
      list.push({
        id: 'eng-30h-work',
        title: '30 Hours Working Entitlement',
        category: 'Working Families',
        description: '30 hours for working parents of children from 9 months to 4 years.',
        hours: qualifies30h ? 30 : 0,
        type: 'funding',
        reason: qualifies30h ? "Both parents work and child is within the 2026 expanded age range." : "Requires working status and child age between 9m and 4y.",
        link: OFFICIAL_LINKS.schemes.engExpansion
      });
    }

    // 2. Universal Credit (85%)
    if (data.benefits.includes('Universal Credit') || isWorking) {
        list.push({
            id: 'uc-childcare',
            title: 'Universal Credit Childcare',
            category: 'Support-Based',
            description: 'Claim back up to 85% of your costs if you are working.',
            hours: 0,
            type: 'financial-support',
            reason: "Available to help working families on lower incomes cover childcare costs.",
            link: "https://www.gov.uk/help-with-childcare-costs/universal-credit"
        });
    }

    // 3. Tax-Free Childcare
    const tfcEligible = workingFamiliesEligible && data.childAge !== '5plus' && !data.benefits.includes('Universal Credit');
    list.push({
      id: 'tfc',
      title: 'Tax-Free Childcare (20%)',
      category: 'Financial',
      description: 'Government top-up: £2 for every £8 you pay, up to £2,000/year.',
      hours: 0,
      type: 'financial-support',
      reason: tfcEligible ? "Qualified based on work status and income thresholds." : "Note: Mutually exclusive with Universal Credit.",
      link: OFFICIAL_LINKS.schemes.taxFreeChildcare
    });

    return list.filter(s => s.hours > 0 || s.id === 'tfc' || (s.id === 'uc-childcare' && data.benefits.includes('Universal Credit')));
  }, [data]);

  const toggleBenefit = (benefit: string) => {
    updateData({
      benefits: data.benefits.includes(benefit) 
        ? data.benefits.filter(b => b !== benefit)
        : [...data.benefits, benefit]
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Where do you live?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['England', 'Scotland', 'Wales', 'Northern Ireland'] as UKRegion[]).map((loc) => (
                <div 
                  key={loc} onClick={() => updateData({ location: loc })}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${data.location === loc ? 'border-teal-600 bg-teal-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <span className={`font-bold text-lg ${data.location === loc ? 'text-teal-900' : 'text-slate-500'}`}>{loc}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${data.location === loc ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                    {data.location === loc && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Child's age?</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'under9m', label: 'Under 9 months old' },
                { id: '9m-2y', label: '9 months to 2 years' },
                { id: '2y', label: '2 years old' },
                { id: '3-4y', label: '3 to 4 years old' },
                { id: '5plus', label: 'School age (5+)' }
              ].map((age) => (
                <div 
                  key={age.id} onClick={() => updateData({ childAge: age.id as ChildAge })}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${data.childAge === age.id ? 'border-teal-600 bg-teal-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <span className={`font-bold text-lg ${data.childAge === age.id ? 'text-teal-900' : 'text-slate-500'}`}>{age.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${data.childAge === age.id ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                    {data.childAge === age.id && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Household setup?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: false, label: 'Single Parent', icon: 'fa-user' },
                { id: true, label: 'Living with Partner', icon: 'fa-users' }
              ].map((opt) => (
                <div 
                  key={opt.label} onClick={() => updateData({ hasPartner: opt.id })}
                  className={`p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${data.hasPartner === opt.id ? 'border-teal-600 bg-teal-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${data.hasPartner === opt.id ? 'bg-teal-600 text-white' : 'bg-white text-slate-300'}`}>
                    <i className={`fa-solid ${opt.icon}`}></i>
                  </div>
                  <span className={`font-black text-lg ${data.hasPartner === opt.id ? 'text-teal-900' : 'text-slate-500'}`}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Work status?</h2>
            <div className="space-y-10">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">Your Status</p>
                <div className="grid grid-cols-2 gap-3">
                  {['working', 'on-leave', 'not-working', 'unable-to-work'].map(id => (
                    <button 
                        key={id} onClick={() => updateData({ userWorkStatus: id as WorkStatus })}
                        className={`p-5 rounded-2xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${data.userWorkStatus === id ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 text-slate-400'}`}
                    >
                      {id.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              {data.hasPartner && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">Partner's Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['working', 'on-leave', 'not-working', 'unable-to-work'].map(id => (
                      <button 
                          key={id} onClick={() => updateData({ partnerWorkStatus: id as WorkStatus })}
                          className={`p-5 rounded-2xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${data.partnerWorkStatus === id ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 text-slate-400'}`}
                      >
                        {id.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Income range?</h2>
            <p className="text-slate-500 -mt-6">Does each parent earn at least £183/week (avg) but less than £100,000 net per year?</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'yes', label: 'Yes, within range' },
                { id: 'no', label: 'No, outside range' },
                { id: 'notSure', label: 'Not sure' }
              ].map((opt) => (
                <div 
                  key={opt.id} onClick={() => updateData({ incomeInRange: opt.id as any })}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${data.incomeInRange === opt.id ? 'border-teal-600 bg-teal-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <span className={`font-bold text-lg ${data.incomeInRange === opt.id ? 'text-teal-900' : 'text-slate-500'}`}>{opt.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${data.incomeInRange === opt.id ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                    {data.incomeInRange === opt.id && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Government benefits?</h2>
            <p className="text-slate-500 -mt-6">Select any that apply to your household.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {BENEFIT_OPTIONS.map((benefit) => (
                <div 
                  key={benefit} onClick={() => toggleBenefit(benefit)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${data.benefits.includes(benefit) ? 'border-teal-600 bg-teal-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                   <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${data.benefits.includes(benefit) ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}>
                    {data.benefits.includes(benefit) && <i className="fa-solid fa-check text-white text-[8px]"></i>}
                  </div>
                  <span className={`font-bold text-sm ${data.benefits.includes(benefit) ? 'text-teal-900' : 'text-slate-500'}`}>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">Is your child disabled or has an EHCP?</span>
                <button 
                  onClick={() => updateData({ childDisabled: !data.childDisabled })}
                  className={`w-14 h-8 rounded-full transition-colors relative ${data.childDisabled ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${data.childDisabled ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    const totalFundedHours = results.reduce((acc, curr) => acc + (curr.hours || 0), 0);
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm">
                <h2 className="text-4xl font-black text-slate-900 mb-2">Eligible Schemes</h2>
                <p className="text-slate-500 mb-10 font-medium">Based on your household profile for the 2026/27 academic year.</p>
                
                <div className="space-y-6">
                    {results.map(scheme => (
                        <div key={scheme.id} className="p-8 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-teal-100 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] block mb-2">{scheme.category}</span>
                                    <h4 className="font-black text-2xl text-slate-900">{scheme.title}</h4>
                                </div>
                                {scheme.hours > 0 && (
                                    <div className="bg-teal-600 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-teal-600/20">
                                        <span className="text-xl font-black">{scheme.hours}</span>
                                        <span className="text-[8px] font-bold uppercase">Hours</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-600 mb-8 leading-relaxed italic">"{scheme.reason}"</p>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <a 
                                    href={scheme.link} target="_blank" rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-teal-600 transition flex items-center justify-center gap-2"
                                >
                                    Official Application <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                </a>
                                <InfoTooltip text={scheme.description} />
                            </div>
                        </div>
                    ))}
                    {results.length === 0 && (
                        <div className="p-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <i className="fa-solid fa-circle-info text-slate-300 text-4xl mb-4"></i>
                            <p className="text-slate-500 font-bold">No specific funding matches found. You may still qualify for universal support.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pt-8">
                <button onClick={() => { setIsSubmitted(false); setStep(1); }} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-teal-600 transition">
                    Start over & recalculate
                </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl border border-slate-800">
                <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em] block mb-3">Total Entitlement</span>
                <div className="text-8xl font-black mb-12 tracking-tighter tabular-nums flex items-baseline">
                    {totalFundedHours}<span className="text-2xl ml-2 text-slate-500">hrs/wk</span>
                </div>

                <div className="space-y-6 pt-10 border-t border-slate-800 mb-10">
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <h5 className="text-teal-400 font-black text-[10px] uppercase tracking-widest mb-3">Key Deadline</h5>
                        <p className="text-sm font-bold leading-snug">Apply by March 31st for the April term start.</p>
                    </div>
                </div>

                <button className="w-full py-6 bg-teal-600 rounded-[1.5rem] font-black text-base hover:bg-teal-500 transition shadow-xl shadow-teal-600/20 active:scale-[0.98]">
                    Send to Email
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-[0.2em] font-black">2026 Regulations</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 flex items-center justify-between px-2">
        <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? 'w-8 bg-teal-600' : 'w-4 bg-slate-200'}`}></div>
            ))}
        </div>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Step {step} of {totalSteps}</span>
      </div>

      <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-sm min-h-[500px] flex flex-col justify-between">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderStep()}
        </div>

        <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
            <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={`text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition ${step === 1 ? 'invisible' : 'visible'}`}
            >
                Previous
            </button>
            <button 
                onClick={step === totalSteps ? () => setIsSubmitted(true) : () => setStep(s => s + 1)}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-sm hover:bg-teal-600 transition shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-2"
            >
                {step === totalSteps ? 'View Eligibility' : 'Continue'}
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
