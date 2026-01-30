
import React, { useMemo, useState } from 'react';
import { EligibilityData, ChildAge, WorkStatus, Scheme, UKRegion } from '../types';
import { BENEFIT_OPTIONS, OFFICIAL_LINKS } from '../constants';

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

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const toggleBenefit = (benefit: string) => {
    updateData({
      benefits: data.benefits.includes(benefit) 
        ? data.benefits.filter(b => b !== benefit)
        : [...data.benefits, benefit]
    });
  };

  const results = useMemo(() => {
    const list: Scheme[] = [];
    const isWorking = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerWorking = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeOk = data.incomeInRange === 'yes';
    const workingFamiliesEligible = isWorking && partnerWorking && incomeOk;

    // England 2026 Expansion Logic
    if (data.location === 'England') {
      const age34 = data.childAge === '3-4y';
      list.push({
        id: 'eng-15h-univ',
        title: 'Universal 15 Hours (3-4y)',
        category: 'Universal',
        description: 'Standard funded childcare for all 3 and 4-year-olds in England, regardless of income.',
        hours: age34 ? 15 : 0,
        type: 'funding',
        reason: age34 ? "Your child is in the 3-4 age group." : "Only available for children aged 3 or 4.",
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
        reason: qualifies30h ? "Both parents work and child is within the 2026 expanded age range." : "Requires working status for both parents and child age between 9m and 4y.",
        link: OFFICIAL_LINKS.schemes.engExpansion
      });
    }

    // Scotland/Wales Regionals
    if (data.location === 'Scotland' || data.location === 'Wales') {
        const hours = data.childAge === '3-4y' ? 30 : 0;
        list.push({
            id: 'regional-funding',
            title: `30 Hours in ${data.location}`,
            category: 'Universal',
            description: `Regional funded hours provided by the ${data.location} government.`,
            hours: hours,
            type: 'funding',
            reason: hours > 0 ? `Qualified as a resident of ${data.location} with a 3-4 year old.` : "Only for 3-4 year olds.",
            link: data.location === 'Scotland' ? OFFICIAL_LINKS.schemes.scotland1140 : OFFICIAL_LINKS.schemes.walesOffer
        });
    }

    // Universal Credit
    if (data.benefits.includes('Universal Credit') || (isWorking && data.benefits.length > 0)) {
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

    // Tax-Free Childcare
    const tfcEligible = workingFamiliesEligible && data.childAge !== '5plus' && !data.benefits.includes('Universal Credit');
    list.push({
      id: 'tfc',
      title: 'Tax-Free Childcare (20%)',
      category: 'Financial',
      description: 'Government top-up: £2 for every £8 you pay, up to £2,000/year.',
      hours: 0,
      type: 'financial-support',
      reason: tfcEligible ? "Qualified based on work status and income thresholds." : "Note: You cannot use this if you claim Universal Credit.",
      link: OFFICIAL_LINKS.schemes.taxFreeChildcare
    });

    return list;
  }, [data]);

  const eligibleList = useMemo(() => results.filter(s => s.hours > 0 || (s.type === 'financial-support' && (s.id !== 'tfc' || !data.benefits.includes('Universal Credit')))), [results, data.benefits]);
  const totalFundedHours = useMemo(() => Math.max(...results.map(s => s.hours), 0), [results]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Eligibility Checker</h1>
        <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
          Update your household details below to see which 2026 funding schemes apply to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Basics: Location & Age */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-child text-teal-600"></i>
              Family Basics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Region</label>
                <div className="grid grid-cols-1 gap-3">
                  {(['England', 'Scotland', 'Wales', 'Northern Ireland'] as UKRegion[]).map((loc) => (
                    <button 
                      key={loc} onClick={() => updateData({ location: loc })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${data.location === loc ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-500'}`}
                    >
                      <span className="font-bold text-sm">{loc}</span>
                      {data.location === loc && <i className="fa-solid fa-check-circle text-teal-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Child's Age</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'under9m', label: 'Under 9 months' },
                    { id: '9m-2y', label: '9 months - 2 years' },
                    { id: '2y', label: '2 years old' },
                    { id: '3-4y', label: '3 - 4 years old' },
                    { id: '5plus', label: 'School age (5+)' }
                  ].map((age) => (
                    <button 
                      key={age.id} onClick={() => updateData({ childAge: age.id as ChildAge })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${data.childAge === age.id ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-500'}`}
                    >
                      <span className="font-bold text-sm">{age.label}</span>
                      {data.childAge === age.id && <i className="fa-solid fa-check-circle text-teal-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Household & Work */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-briefcase text-teal-600"></i>
              Work & Household
            </h3>
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Household Setup</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => updateData({ hasPartner: false })}
                      className={`flex-1 p-5 rounded-2xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${!data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      Single Parent
                    </button>
                    <button 
                      onClick={() => updateData({ hasPartner: true })}
                      className={`flex-1 p-5 rounded-2xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      With Partner
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Income Threshold</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500">Earnings &lt; £100k/yr?</span>
                        <button 
                            onClick={() => updateData({ incomeInRange: data.incomeInRange === 'yes' ? 'no' : 'yes' })}
                            className={`w-10 h-6 rounded-full relative transition-colors ${data.incomeInRange === 'yes' ? 'bg-teal-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.incomeInRange === 'yes' ? 'left-5' : 'left-1'}`}></div>
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Your Work Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['working', 'on-leave', 'not-working', 'unable-to-work'].map(id => (
                      <button 
                          key={id} onClick={() => updateData({ userWorkStatus: id as WorkStatus })}
                          className={`p-3 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${data.userWorkStatus === id ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      >
                        {id.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                {data.hasPartner && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Partner's Work Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['working', 'on-leave', 'not-working', 'unable-to-work'].map(id => (
                        <button 
                            key={id} onClick={() => updateData({ partnerWorkStatus: id as WorkStatus })}
                            className={`p-3 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${data.partnerWorkStatus === id ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                        >
                          {id.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits & Disability */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-hand-holding-heart text-teal-600"></i>
              Support & Health
            </h3>
            <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Household Benefits</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BENEFIT_OPTIONS.map((benefit) => (
                      <button 
                        key={benefit} onClick={() => toggleBenefit(benefit)}
                        className={`p-3 rounded-xl border-2 text-[10px] font-bold text-left transition-all ${data.benefits.includes(benefit) ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      >
                        {benefit}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between">
                    <div>
                        <span className="font-black text-sm block">Disability / EHCP</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Child has specific care needs</span>
                    </div>
                    <button 
                        onClick={() => updateData({ childDisabled: !data.childDisabled })}
                        className={`w-14 h-8 rounded-full relative transition-colors ${data.childDisabled ? 'bg-teal-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${data.childDisabled ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>
          </div>

          {/* Results List In Main Column */}
          <div className="space-y-6">
             <h3 className="text-xl font-black text-slate-900 px-4">Qualified Schemes</h3>
             {eligibleList.map(scheme => (
                <div key={scheme.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-teal-200 transition-colors flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{scheme.category}</span>
                             <InfoTooltip text={scheme.description} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-4">{scheme.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 italic">"{scheme.reason}"</p>
                        <a 
                            href={scheme.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest border-b-2 border-slate-900 pb-1 hover:text-teal-600 hover:border-teal-600 transition-all"
                        >
                            Official Application <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </a>
                    </div>
                    {scheme.hours > 0 && (
                        <div className="bg-slate-900 text-white w-24 h-24 rounded-3xl flex flex-col items-center justify-center shrink-0 shadow-xl">
                            <span className="text-3xl font-black tracking-tighter">{scheme.hours}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Hours</span>
                        </div>
                    )}
                </div>
             ))}
             {eligibleList.length === 0 && (
                <div className="p-12 text-center bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No specific funding found. Try adjusting your household details.</p>
                </div>
             )}
          </div>
        </div>

        {/* Sticky Entitlement Sidebar */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative border border-slate-800">
            <div className="relative z-10">
              <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em] block mb-3">Your Entitlement</span>
              <div className="text-8xl font-black mb-12 tracking-tighter tabular-nums flex items-baseline">
                {totalFundedHours}<span className="text-2xl ml-2 text-slate-500">hrs</span>
              </div>
              
              <div className="space-y-6 mb-12 pt-10 border-t border-slate-800 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Scheme Status</span>
                  <span className="font-black text-teal-500 text-xs uppercase tracking-widest">Active for 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Qualified Options</span>
                  <span className="font-bold text-slate-200">{eligibleList.length} total</span>
                </div>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700 mb-10">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-2">Pro Tip</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Working parents of children from 9m to 4y are now eligible for the full 30-hour rollout.
                  </p>
              </div>

              <button className="w-full py-6 bg-teal-600 rounded-[1.5rem] font-black text-base hover:bg-teal-500 transition shadow-xl shadow-teal-600/20 active:scale-[0.98]">
                Download Eligibility Summary
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-[0.2em] font-black">Official 2026 Checker</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
