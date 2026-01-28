
import React, { useState, useMemo } from 'react';
import { EligibilityData, ChildAge, WorkStatus, Scheme, UKRegion } from '../types';
import { BENEFIT_OPTIONS } from '../constants';

const Eligibility: React.FC = () => {
  const [step, setStep] = useState(1);
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 2026 Estimated Threshold: ~£195/week (16 hours at National Living Wage)
  const MIN_EARNINGS_TEXT = "at least £195/week (approx. 16 hours at National Living Wage)";

  const totalSteps = 8;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const getApplicationWindow = () => {
    const NOW = new Date();
    const month = NOW.getMonth();
    const date = NOW.getDate();
    
    // Logic for 2026 intake periods
    if (month < 3 || (month === 3 && date <= 31)) {
      return { term: "1 April", window: `15 Jan to 31 Mar`, deadline: `31 Mar`, active: (month > 0 || (month === 0 && date >= 15)) };
    } else if (month < 8 || (month === 7 && date <= 31)) {
      return { term: "1 September", window: `12 May to 31 Aug`, deadline: `31 Aug`, active: (month > 4 || (month === 4 && date >= 12)) };
    } else {
      return { term: "1 January", window: `15 Oct to 31 Dec`, deadline: `31 Dec`, active: (month > 9 || (month === 9 && date >= 15)) };
    }
  };

  const providerLinks: Record<UKRegion, string> = {
    'England': 'https://www.gov.uk/government/publications/childminder-agencies-list-of-agencies',
    'Scotland': 'http://www.careinspectorate.com/',
    'Wales': 'https://digital.careinspectorate.wales/directory/search',
    'Northern Ireland': 'https://www.nidirect.gov.uk/articles/early-years-teams'
  };

  const results = useMemo(() => {
    const schemes: Scheme[] = [];
    const userQualifiesWork = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerQualifiesWork = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeQualifies = data.incomeInRange === 'yes';
    const isWorkingEligible = userQualifiesWork && partnerQualifiesWork && incomeQualifies;
    const onBenefits = data.benefits.length > 0;

    if (data.location === 'England') {
      // 1. UNIVERSAL 15 HOURS (3-4y)
      if (data.childAge === '3-4y') {
        schemes.push({
          id: 'eng-15h-univ',
          title: '15 Hours Universal Funding',
          category: 'Universal',
          description: 'Standard funded childcare for all 3 and 4-year-olds.',
          reason: 'Every child in England qualifies for 15 hours automatically from the term after their 3rd birthday.',
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-2-to-4-year-olds'
        });

        if (isWorkingEligible) {
          schemes.push({
            id: 'eng-30h-work',
            title: 'Working Parent Top-up (+15h)',
            category: 'Working Families',
            description: 'An additional 15 hours for working families, totaling 30 hours.',
            reason: `You qualify for the extra 15 hours because you (and your partner) earn ${MIN_EARNINGS_TEXT} and less than £100k/year.`,
            hours: 15,
            type: 'funding',
            link: 'https://www.gov.uk/apply-30-hours-free-childcare'
          });
        }
      } 
      
      else if (['9m-2y', '2y'].includes(data.childAge) && isWorkingEligible) {
        schemes.push({
          id: 'eng-expansion-30h',
          title: '30 Hours Working Parent Entitlement',
          category: 'Working Families',
          description: 'The full 30-hour expansion is now active for toddlers from 9 months old.',
          reason: `As a working family earning ${MIN_EARNINGS_TEXT}, your child qualifies for the full 30 hours.`,
          hours: 30,
          type: 'funding',
          link: 'https://www.gov.uk/check-eligible-working-parent-childcare'
        });
      }

      if (data.childAge === '2y' && (onBenefits || data.childDisabled)) {
        schemes.push({
          id: 'eng-2y-support',
          title: '15 Hours Support-based Funding',
          category: 'Support-Based',
          description: 'Specifically for 2-year-olds whose families require extra financial or health support.',
          reason: `Your 2-year-old qualifies because ${onBenefits ? 'you receive qualifying benefits' : 'your child has an EHCP or receives DLA'}.`,
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-2-year-olds'
        });
      }

      if (data.childAge === 'under9m' && isWorkingEligible) {
        schemes.push({
          id: 'eng-future',
          title: 'Future 30 Hours (Starts at 9m)',
          category: 'Working Families',
          description: 'You will qualify for 30 hours once your child reaches 9 months of age.',
          reason: 'Your income meets the criteria, but funding for this age group starts at 9 months.',
          hours: 0,
          type: 'funding',
          link: 'https://www.gov.uk/check-eligible-working-parent-childcare'
        });
      }
    }

    if (data.location === 'Scotland' && (data.childAge === '3-4y' || (data.childAge === '2y' && (onBenefits || data.childDisabled)))) {
      schemes.push({
        id: 'sco-1140h',
        title: '1,140 Hours Funded Childcare',
        category: 'Universal',
        description: 'Scotland provides a universal 1,140 hours a year (approx 30h/week).',
        reason: 'All 3 and 4-year-olds in Scotland qualify automatically.',
        hours: 30,
        type: 'funding',
        link: 'https://www.parentclub.scot/articles/funded-early-learning-and-childcare'
      });
    }

    if (isWorkingEligible && data.childAge !== '5plus') {
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare (20% Savings)',
        category: 'Financial',
        description: 'The government adds £2 for every £8 you pay your provider.',
        reason: 'Because you are working and earn under £100k, you can save up to £2,000 per child per year.',
        hours: 0,
        type: 'financial-support',
        link: 'https://www.gov.uk/tax-free-childcare'
      });
    }

    return schemes;
  }, [data]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Where do you live?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['England', 'Scotland', 'Wales', 'Northern Ireland'] as UKRegion[]).map((loc) => (
                <button key={loc} onClick={() => updateData({ location: loc })} className={`p-5 text-left border-2 rounded-2xl transition font-bold flex items-center justify-between ${data.location === loc ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  {loc}
                  {data.location === loc && <i className="fa-solid fa-circle-check text-teal-600"></i>}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
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
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your household</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => updateData({ hasPartner: false })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${!data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                <i className="fa-solid fa-user text-2xl"></i>
                <span className="font-bold text-sm text-center">Single Parent</span>
              </button>
              <button onClick={() => updateData({ hasPartner: true })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                <i className="fa-solid fa-users text-2xl"></i>
                <span className="font-bold text-sm text-center">With Partner</span>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
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
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Income check</h2>
            <p className="text-slate-500 text-sm">Most working parent schemes require earning between £195/wk and £100k net income per year.</p>
            <div className="grid grid-cols-1 gap-3 pt-4">
              {[{ val: 'yes', label: 'Yes, both parents fit this range' }, { val: 'no', label: 'No, someone is outside' }, { val: 'notSure', label: 'Not sure / Irregular' }].map((opt) => (
                <button key={opt.val} onClick={() => updateData({ incomeInRange: opt.val as any })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.incomeInRange === opt.val ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm' : 'border-slate-100'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
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
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Health & SEN</h2>
            <div className={`p-8 rounded-[2.5rem] border-2 transition ${data.childDisabled ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Does your child have a disability?</h4>
                  <p className="text-xs text-slate-400 mt-1">Includes EHCP, DLA, or PIP.</p>
                </div>
                <div className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${data.childDisabled ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => updateData({ childDisabled: !data.childDisabled })}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${data.childDisabled ? 'translate-x-8' : 'translate-x-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Calculating...</h2>
            <p className="text-slate-500 max-w-sm mx-auto">Verifying your profile against 2026 UK Childcare legislation.</p>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const totalFunded = results.filter(s => s.type === 'funding').reduce((acc, curr) => acc + curr.hours, 0);
    const appWindow = getApplicationWindow();
    const categories = [
      { id: 'funding', title: 'Funded Hours', icon: 'clock' },
      { id: 'financial-support', title: 'Financial Support', icon: 'sterling-sign' }
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-white text-center">
            <h2 className="text-4xl font-black mb-2">Your 2026 Entitlements</h2>
            <p className="text-teal-400 font-bold uppercase tracking-widest text-xs">Based on {data.location} Regulations</p>
          </div>
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Est. Weekly Funding</span>
                  <div className="text-6xl font-black text-teal-900 leading-none">{totalFunded} <span className="text-lg font-normal">hrs</span></div>
                </div>
                <i className="fa-solid fa-clock text-4xl text-teal-100"></i>
              </div>
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">When to Apply</h4>
                <div className="space-y-2">
                  <p className="text-xs text-blue-700">Next Term: <strong>{appWindow.term}</strong></p>
                  <div className={`bg-white p-3 rounded-xl border border-blue-100 font-black text-sm ${appWindow.active ? 'text-teal-700' : 'text-slate-400'}`}>
                     {appWindow.active ? `Apply by ${appWindow.deadline}` : `Opens ${appWindow.window.split(' to ')[0]}`}
                  </div>
                </div>
              </div>
            </div>

            {/* SIMPLE APPLICATION TABLE */}
            <div className="mb-16 bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden">
               <div className="px-8 py-5 border-b bg-white/50">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check text-teal-600"></i>
                    England 2026 Intake Periods
                  </h4>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead>
                     <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100/50">
                       <th className="px-8 py-4">Intake Term</th>
                       <th className="px-8 py-4">Application Window</th>
                       <th className="px-8 py-4 text-right">Deadline</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {[
                       { term: 'January', window: '15 Oct – 31 Dec', deadline: '31 Dec' },
                       { term: 'April', window: '15 Jan – 31 Mar', deadline: '31 Mar' },
                       { term: 'September', window: '12 May – 31 Aug', deadline: '31 Aug' }
                     ].map((item) => (
                       <tr key={item.term} className={appWindow.term.includes(item.term) ? "bg-teal-50" : "bg-white"}>
                         <td className="px-8 py-5 font-bold text-slate-900 flex items-center gap-2">
                           {item.term} 
                           {appWindow.term.includes(item.term) && <span className="text-[8px] bg-teal-600 text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
                         </td>
                         <td className="px-8 py-5 text-slate-500 font-medium">{item.window}</td>
                         <td className="px-8 py-5 text-right font-black text-slate-900">{item.deadline}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               <div className="p-4 bg-teal-50 text-[10px] text-teal-700 italic border-t border-teal-100 flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  Note: You must have your code by the deadline to start funding in the next term.
               </div>
            </div>

            <div className="space-y-16">
              {categories.map((cat) => {
                const catSchemes = results.filter(s => s.type === cat.id);
                if (catSchemes.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <h3 className="text-2xl font-black text-slate-900 border-b pb-4 mb-8 flex items-center gap-3">
                      <i className={`fa-solid fa-${cat.icon} text-teal-600 w-8`}></i>
                      {cat.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {catSchemes.map((scheme) => (
                        <div key={scheme.id} className="p-8 rounded-[2rem] border border-slate-100 bg-white flex flex-col hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full opacity-50"></div>
                          <div className="relative flex flex-col h-full">
                            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 w-fit ${
                              scheme.category === 'Universal' ? 'bg-blue-100 text-blue-700' : 
                              scheme.category === 'Working Families' ? 'bg-teal-100 text-teal-700' : 
                              scheme.category === 'Support-Based' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {scheme.category}
                            </span>
                            <h4 className="font-bold text-xl text-slate-900 mb-3">{scheme.title}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">{scheme.description}</p>
                            
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8 flex-grow">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Why you qualify</span>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed italic">"{scheme.reason}"</p>
                            </div>

                            {scheme.link && (
                              <div className="mt-auto">
                                <a 
                                  href={scheme.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                    scheme.category === 'Universal' 
                                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                                  }`}
                                >
                                  Apply Now <i className="fa-solid fa-arrow-right text-[10px]"></i>
                                </a>
                                <p className="text-[10px] text-slate-400 mt-3 text-center">Redirects to official {scheme.id.startsWith('eng') ? 'Gov.uk' : 'regional'} portal</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-20 bg-slate-50 rounded-[3rem] p-10 md:p-14 text-center border border-slate-100">
                <h4 className="text-2xl font-black text-slate-900 mb-4">Finding a registered provider</h4>
                <p className="text-sm text-slate-500 mb-8 max-w-xl mx-auto">Funding only applies to "approved" providers. Use the official {data.location} directory to find nurseries and childminders in your area.</p>
                <a href={providerLinks[data.location]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-teal-600 transition shadow-lg">
                  Browse {data.location} Providers <i className="fa-solid fa-external-link text-[10px]"></i>
                </a>
            </div>

            <div className="mt-8 text-center">
              <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-400 hover:text-teal-600 transition">Start a new eligibility check</button>
            </div>
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
        <div className="flex-grow">
          {renderStep()}
        </div>
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'Show My Support' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
