
import React, { useState, useMemo } from 'react';
import { EligibilityData, ChildAge, WorkStatus, Scheme, UKRegion } from '../types';
import { BENEFIT_OPTIONS, OFFICIAL_LINKS } from '../constants';

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

  const totalSteps = 8;
  const MIN_EARNINGS_TXT = "at least £195/week (approx. 16 hours at National Living Wage)";

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const getIntakeDetails = () => {
    const NOW = new Date();
    const month = NOW.getMonth();
    
    if (month < 3) { // Jan-Mar
      return { term: "April", deadline: "31 March", active: true };
    } else if (month < 8) { // Apr-Aug
      return { term: "September", deadline: "31 August", active: true };
    } else { // Sep-Dec
      return { term: "January", deadline: "31 December", active: true };
    }
  };

  const results = useMemo(() => {
    const list: Scheme[] = [];
    const isWorking = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerWorking = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeOk = data.incomeInRange === 'yes';
    const workingFamiliesEligible = isWorking && partnerWorking && incomeOk;
    const hasBenefits = data.benefits.length > 0;

    // --- ENGLAND ---
    if (data.location === 'England') {
      const age34 = data.childAge === '3-4y';
      list.push({
        id: 'eng-15h-univ',
        title: 'Universal 15 Hours (Age 3-4)',
        category: 'Universal',
        description: 'Standard funded childcare for all 3 and 4-year-olds in England.',
        hours: age34 ? 15 : 0,
        type: 'funding',
        reason: age34 
          ? "Your child is in the 3-4 year age range, qualifying them automatically for 15 hours." 
          : "This universal support only applies to children aged 3 or 4.",
        link: OFFICIAL_LINKS.schemes.eng15hUniversal
      });

      const eligibleAgeRange = ['9m-2y', '2y', '3-4y'].includes(data.childAge);
      const qualifies30h = eligibleAgeRange && workingFamiliesEligible;
      list.push({
        id: 'eng-30h-work',
        title: 'Working Parent Entitlement (Up to 30h)',
        category: 'Working Families',
        description: '30-hour support for working parents of children from 9 months to 4 years.',
        hours: qualifies30h ? 30 : 0,
        type: 'funding',
        reason: qualifies30h 
          ? "You qualify for 30 hours because both parents are working and your child is aged 9m+." 
          : !eligibleAgeRange ? "Your child is not in the 9m-4y age window for this expansion." : "Requires both parents to be working and earning within the required thresholds.",
        link: OFFICIAL_LINKS.schemes.engExpansion
      });

      const age2 = data.childAge === '2y';
      const qualifiesSupport = age2 && (hasBenefits || data.childDisabled);
      list.push({
        id: 'eng-2y-support',
        title: 'Support-based 15 Hours (Age 2)',
        category: 'Support-Based',
        description: 'Targeted support for 2-year-olds in families on benefits.',
        hours: qualifiesSupport ? 15 : 0,
        type: 'funding',
        reason: qualifiesSupport 
          ? "Qualifies due to age 2 and receipt of qualifying benefits or disability support." 
          : "Only for 2-year-olds in households receiving specific support benefits.",
        link: OFFICIAL_LINKS.schemes.eng2hSupport
      });
    }

    // --- SCOTLAND ---
    else if (data.location === 'Scotland') {
      const scoAgeEligible = data.childAge === '3-4y' || (data.childAge === '2y' && (hasBenefits || data.childDisabled));
      list.push({
        id: 'sco-1140h',
        title: '1,140 Hours Funded Childcare',
        category: 'Universal',
        description: '1,140 hours per year for all 3-4y and eligible 2y in Scotland.',
        hours: scoAgeEligible ? 30 : 0,
        type: 'funding',
        reason: scoAgeEligible 
          ? "Resident in Scotland with an eligible child age (3-4y or supported 2y)." 
          : "In Scotland, 1140h starts at age 3 unless meeting specific support criteria at age 2.",
        link: OFFICIAL_LINKS.schemes.scotland1140
      });
    }

    // --- WALES ---
    else if (data.location === 'Wales') {
      const walesOfferEligible = data.childAge === '3-4y' && workingFamiliesEligible;
      list.push({
        id: 'wal-offer',
        title: 'Childcare Offer for Wales',
        category: 'Working Families',
        description: '30 hours of combined education and childcare for 3-4 year olds.',
        hours: walesOfferEligible ? 30 : 0,
        type: 'funding',
        reason: walesOfferEligible 
          ? "Working parents of 3-4 year olds in Wales qualify for this combined entitlement." 
          : "Requires both parents working and a child aged 3 or 4.",
        link: OFFICIAL_LINKS.schemes.walesOffer
      });

      const flyingStartEligible = data.childAge === '2y' && (hasBenefits || data.childDisabled);
      list.push({
        id: 'wal-fs',
        title: 'Flying Start (Age 2)',
        category: 'Support-Based',
        description: '12.5 hours of funded childcare for eligible 2-year-olds in Flying Start areas.',
        hours: flyingStartEligible ? 12.5 : 0,
        type: 'funding',
        reason: flyingStartEligible 
          ? "Available to eligible 2-year-olds in Flying Start areas of Wales." 
          : "Typically requires living in a target Flying Start postcode or meeting specific support needs.",
        link: OFFICIAL_LINKS.schemes.walesFlyingStart
      });
    }

    // --- NORTHERN IRELAND ---
    else if (data.location === 'Northern Ireland') {
      const niPreEligible = data.childAge === '3-4y';
      list.push({
        id: 'ni-preschool',
        title: 'Pre-School Education Programme',
        category: 'Universal',
        description: '12.5 to 22.5 hours of funded pre-school education in NI.',
        hours: niPreEligible ? 12.5 : 0,
        type: 'funding',
        reason: niPreEligible 
          ? "Universal support for children in NI in their final pre-school year." 
          : "Only for children in their immediate pre-school year (age 3-4).",
        link: OFFICIAL_LINKS.schemes.niPreschool
      });

      const niSubsidyEligible = workingFamiliesEligible && data.childAge !== '5plus';
      list.push({
        id: 'ni-nics',
        title: 'NI Childcare Subsidy (NICS)',
        category: 'Financial',
        description: 'A 15% cost reduction for working parents of children under school age.',
        hours: 0,
        type: 'financial-support',
        reason: niSubsidyEligible 
          ? "As a working family in NI, you qualify for a 15% reduction in childcare costs." 
          : "Requires both parents working and a child below primary school age.",
        link: OFFICIAL_LINKS.schemes.niSubsidy
      });
    }

    // --- TAX-FREE CHILDCARE (UK WIDE) ---
    const tfcEligible = workingFamiliesEligible && data.childAge !== '5plus';
    list.push({
      id: 'tfc',
      title: 'Tax-Free Childcare (UK Wide)',
      category: 'Financial',
      description: 'Government top-up: £2 for every £8 you pay, up to £2,000/year.',
      hours: 0,
      type: 'financial-support',
      reason: tfcEligible 
        ? "Working families earning under £100k qualify for this 20% government top-up." 
        : "Requires both parents to be working at least 16h/week and earning under £100k.",
      link: OFFICIAL_LINKS.schemes.taxFreeChildcare
    });

    return list;
  }, [data]);

  const renderStepContent = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Where do you live?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['England', 'Scotland', 'Wales', 'Northern Ireland'] as UKRegion[]).map((loc) => (
              <button key={loc} onClick={() => updateData({ location: loc })} className={`p-5 text-left border-2 rounded-2xl transition font-bold flex items-center justify-between ${data.location === loc ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                {loc} {data.location === loc && <i className="fa-solid fa-circle-check text-teal-600"></i>}
              </button>
            ))}
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Child's age</h2>
          <div className="grid grid-cols-1 gap-3">
            {(['under9m', '9m-2y', '2y', '3-4y', '5plus'] as ChildAge[]).map((age) => (
              <button key={age} onClick={() => updateData({ childAge: age })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.childAge === age ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                {age === 'under9m' && 'Under 9 months old'}
                {age === '9m-2y' && '9 months to 2 years'}
                {age === '2y' && '2 years old'}
                {age === '3-4y' && '3 to 4 years old'}
                {age === '5plus' && 'School age (5+)'}
              </button>
            ))}
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Your household</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => updateData({ hasPartner: false })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${!data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
              <i className="fa-solid fa-user text-2xl"></i><span className="font-bold text-sm">Single Parent</span>
            </button>
            <button onClick={() => updateData({ hasPartner: true })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
              <i className="fa-solid fa-users text-2xl"></i><span className="font-bold text-sm">With Partner</span>
            </button>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Employment</h2>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your status</label>
              <div className="grid grid-cols-2 gap-2">
                {['working', 'on-leave', 'unable-to-work', 'not-working'].map(id => (
                  <button key={id} onClick={() => updateData({ userWorkStatus: id as WorkStatus })} className={`p-4 text-xs font-bold border-2 rounded-xl transition ${data.userWorkStatus === id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400'}`}>
                    {id.replace('-', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {data.hasPartner && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Partner's status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['working', 'on-leave', 'unable-to-work', 'not-working'].map(id => (
                    <button key={id} onClick={() => updateData({ partnerWorkStatus: id as WorkStatus })} className={`p-4 text-xs font-bold border-2 rounded-xl transition ${data.partnerWorkStatus === id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400'}`}>
                      {id.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Income range</h2>
          <p className="text-slate-500 text-sm">Most working parent schemes require earning {MIN_EARNINGS_TXT} and under £100k net income per year.</p>
          <div className="grid grid-cols-1 gap-3 pt-4">
            {[{ val: 'yes', label: 'Yes, both parents are in range' }, { val: 'no', label: 'No, someone is outside' }].map((opt) => (
              <button key={opt.val} onClick={() => updateData({ incomeInRange: opt.val as any })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.incomeInRange === opt.val ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Any benefits?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BENEFIT_OPTIONS.map((ben) => (
              <label key={ben} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={data.benefits.includes(ben)} onChange={(e) => {
                  if (e.target.checked) updateData({ benefits: [...data.benefits, ben] });
                  else updateData({ benefits: data.benefits.filter(b => b !== ben) });
                }} className="w-5 h-5 accent-teal-600 rounded" />
                <span className="text-[11px] font-medium text-slate-700">{ben}</span>
              </label>
            ))}
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Health & SEN</h2>
          <div className={`p-8 rounded-[2.5rem] border-2 transition ${data.childDisabled ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div><h4 className="font-bold text-slate-900">Does your child have a disability?</h4><p className="text-xs text-slate-400 mt-1">Includes EHCP or DLA.</p></div>
              <div className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${data.childDisabled ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => updateData({ childDisabled: !data.childDisabled })}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${data.childDisabled ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </div>
            </div>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-6 text-center py-10">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"><i className="fa-solid fa-list-check"></i></div>
          <h2 className="text-3xl font-black text-slate-900">Generating Results...</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Calculating your entitlements based on regional 2024/25 legislation.</p>
        </div>
      );
      default: return null;
    }
  };

  if (isSubmitted) {
    const totalHours = results.filter(s => s.type === 'funding').reduce((a, b) => a + b.hours, 0);
    const intake = getIntakeDetails();

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-white text-center">
            <h2 className="text-4xl font-black mb-2">Your Results</h2>
            <p className="text-teal-400 font-bold uppercase tracking-widest text-xs">Regulations for {data.location} (2024/25)</p>
          </div>
          
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 flex items-center justify-between">
                <div><span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Weekly Funded Hours</span><div className="text-6xl font-black text-teal-900">{totalHours} <span className="text-lg font-normal">hrs</span></div></div>
                <i className="fa-solid fa-clock text-4xl text-teal-100"></i>
              </div>
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">Next Intake</h4>
                <div className="space-y-2">
                  <p className="text-xs text-blue-700">Intake Term: <strong>{intake.term}</strong></p>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 font-black text-sm text-teal-700">
                    Apply by {intake.deadline}
                  </div>
                </div>
              </div>
            </div>

            {/* APPLICATION DATES TABLE */}
            <div className="mb-12 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm">When to apply for funded childcare (England)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-200/50 text-slate-500 uppercase tracking-tighter font-bold">
                      <th className="px-6 py-3">Child's birthday</th>
                      <th className="px-6 py-3">When they can start</th>
                      <th className="px-6 py-3">Recommended apply date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-6 py-4">1 Jan to 31 March</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">Term starting in April</td>
                      <td className="px-6 py-4">15 Jan to 31 March</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">1 April to 31 Aug</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">Term starting in Sept</td>
                      <td className="px-6 py-4">12 May to 31 August</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">1 Sept to 31 Dec</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">Term starting in Jan</td>
                      <td className="px-6 py-4">15 Oct to 31 December</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-12">
              {['funding', 'financial-support'].map(catType => {
                const catSchemes = results.filter(s => s.type === catType);
                if (catSchemes.length === 0) return null;
                return (
                  <div key={catType}>
                    <h3 className="text-2xl font-black text-slate-900 border-b pb-4 mb-8 flex items-center gap-3">
                      <i className={`fa-solid fa-${catType === 'funding' ? 'clock' : 'sterling-sign'} text-teal-600`}></i>
                      {catType === 'funding' ? 'Funded Childcare Hours' : 'Financial Support'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {catSchemes.map(scheme => {
                        const isEligible = scheme.type === 'funding' ? scheme.hours > 0 : !scheme.reason.toLowerCase().includes('ineligible') && !scheme.reason.toLowerCase().includes('requires');
                        return (
                          <div key={scheme.id} className={`p-8 rounded-[2rem] border flex flex-col hover:shadow-xl transition-all h-full ${isEligible ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200 grayscale opacity-80'}`}>
                            <div className="flex-grow">
                              <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase mb-2 ${scheme.category === 'Universal' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{scheme.category}</span>
                              <h4 className="font-bold text-xl text-slate-900 mb-2">{scheme.title}</h4>
                              {scheme.hours > 0 && <span className="text-2xl font-black text-teal-600 block mb-4">{scheme.hours} Hours</span>}
                              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{scheme.description}</p>
                              <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100 mb-6 italic text-xs text-slate-600 font-medium">"{scheme.reason}"</div>
                            </div>
                            {scheme.link && isEligible && (
                              <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 shadow-lg">Apply Now <i className="fa-solid fa-arrow-right text-[10px]"></i></a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-20 bg-slate-50 rounded-[3rem] p-10 text-center border border-slate-100">
                <h4 className="text-2xl font-black text-slate-900 mb-4">Finding a Provider</h4>
                <p className="text-sm text-slate-500 mb-8 max-w-xl mx-auto">Use the official {data.location} directory to find approved nurseries and childminders who accept government funding.</p>
                <a href={OFFICIAL_LINKS.directories[data.location]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-teal-600 transition shadow-lg">Browse {data.location} Providers <i className="fa-solid fa-external-link text-[10px]"></i></a>
            </div>

            <div className="mt-8 text-center"><button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-400 hover:text-teal-600 transition">Adjust Check</button></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Eligibility Engine</span>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step {step}/{totalSteps}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[580px]">
        <div className="flex-grow">{renderStepContent()}</div>
        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : () => setStep(s => s + 1)} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'Show My Support' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
