
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
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const NOW = new Date();
  const totalSteps = 9;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const getApplicationWindow = () => {
    const month = NOW.getMonth();
    const date = NOW.getDate();
    
    // Official application windows for England
    if (month < 3 || (month === 3 && date <= 31)) {
      return { term: "1 April", window: `15 Jan to 31 Mar`, deadline: `31 Mar`, active: (month > 0 || (month === 0 && date >= 15)) };
    } else if (month < 8 || (month === 7 && date <= 31)) {
      return { term: "1 September", window: `12 May to 31 Aug`, deadline: `31 Aug`, active: (month > 4 || (month === 4 && date >= 12)) };
    } else {
      return { term: "1 January", window: `15 Oct to 31 Dec`, deadline: `31 Dec`, active: (month > 9 || (month === 9 && date >= 15)) };
    }
  };

  const providerLinks: Record<UKRegion, string> = {
    'England': 'https://www.gov.uk/find-local-council-childcare',
    'Scotland': 'https://www.parentclub.scot/articles/funded-early-learning-and-childcare',
    'Wales': 'https://careinspectorate.wales/find-a-care-service',
    'Northern Ireland': 'https://www.familysupportni.gov.uk/ServiceSearch/1/Childcare'
  };

  const results = useMemo(() => {
    const schemes: Scheme[] = [];
    
    const userQualifiesWork = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerQualifiesWork = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeQualifies = data.incomeInRange === 'yes';
    const isWorkingEligible = userQualifiesWork && partnerQualifiesWork && incomeQualifies;
    const onBenefits = data.benefits.length > 0;

    if (data.location === 'England') {
      // 3-4 Year Olds
      if (data.childAge === '3-4y') {
        schemes.push({
          id: 'eng-15h-univ',
          title: '15 Hours Free Childcare (Universal)',
          description: 'All 3 to 4-year-olds in England can get 15 hours a week for 38 weeks a year.',
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-2-to-4-year-olds'
        });
        if (isWorkingEligible) {
          schemes.push({
            id: 'eng-30h-work',
            title: '30 Hours Working Parent Entitlement',
            description: 'Working parents qualify for an additional 15 hours, bringing the total to 30 hours per week.',
            hours: 15,
            type: 'funding',
            link: 'https://www.gov.uk/apply-30-hours-free-childcare'
          });
        }
      } 
      // 9 Months to 2 Year Olds (Full 30h expansion active as of Sept 2025)
      else if (['under9m', '9m-2y', '2y'].includes(data.childAge) && isWorkingEligible) {
        schemes.push({
          id: 'eng-expansion',
          title: '30 Hours Working Parent Entitlement',
          description: 'The expansion is now fully active. Eligible working parents of children from 9 months old now qualify for 30 hours per week.',
          hours: 30,
          type: 'funding',
          link: 'https://www.gov.uk/check-eligible-working-parent-childcare'
        });
      }

      // 2 Year Olds (Support-based / Disadvantaged) - This remains 15 hours
      if (data.childAge === '2y' && (onBenefits || data.childDisabled)) {
        schemes.push({
          id: 'eng-2y-support',
          title: '15 Hours Support-based (Age 2)',
          description: 'If you receive certain benefits or your child has SEN/disability, you are entitled to 15 hours per week.',
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-2-year-olds'
        });
      }
    }

    // Scotland, Wales, NI regions (remained consistent)
    if (data.location === 'Scotland' && (data.childAge === '3-4y' || (data.childAge === '2y' && (onBenefits || data.childDisabled)))) {
      schemes.push({ id: 'sco-1140h', title: '1,140 Hours Funded Childcare', description: 'Universal 30h support for all 3-4y and eligible 2-year-olds.', hours: 30, type: 'funding', link: providerLinks['Scotland'] });
    }

    if (data.location === 'Wales') {
      if (data.childAge === '3-4y') {
        schemes.push({ id: 'wal-foundation', title: 'Early Education (Wales)', description: 'Universal 10-12.5h a week for 3-4 year olds.', hours: 10, type: 'funding' });
        if (isWorkingEligible) schemes.push({ id: 'wal-offer', title: 'Childcare Offer for Wales', description: 'Up to 30h combined support for working parents.', hours: 20, type: 'funding', link: 'https://www.gov.wales/childcare-offer-wales-parents' });
      } else if (data.childAge === '2y' && onBenefits) {
        schemes.push({ id: 'wal-flying', title: 'Flying Start Childcare', description: '12.5h a week for 2y in Flying Start areas.', hours: 12.5, type: 'funding' });
      }
    }

    if (isWorkingEligible && data.childAge !== '5plus') {
      schemes.push({ id: 'tfc', title: 'Tax-Free Childcare', description: 'Govt adds £2 for every £8 you pay, up to £2,000/year per child.', hours: 0, type: 'financial-support', link: 'https://www.gov.uk/tax-free-childcare' });
    }

    return schemes;
  }, [data]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 5000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Location</h2>
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
            <h2 className="text-2xl font-bold text-slate-900">Parent Profile</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your age</label>
                <div className="flex items-center gap-6">
                   <div className="text-4xl font-black text-teal-600 w-16">{data.parentAge}</div>
                   <input type="range" min="16" max="65" value={data.parentAge} onChange={(e) => updateData({ parentAge: parseInt(e.target.value) })} className="flex-grow accent-teal-600" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => updateData({ isStudent: !data.isStudent })} className={`p-6 rounded-2xl border-2 transition text-left flex flex-col gap-1 ${data.isStudent ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                   <span className="font-bold text-slate-900 text-sm">Are you a student?</span>
                </button>
                <button onClick={() => updateData({ isPregnant: !data.isPregnant })} className={`p-6 rounded-2xl border-2 transition text-left flex flex-col gap-1 ${data.isPregnant ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                   <span className="font-bold text-slate-900 text-sm">Are you pregnant?</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Child's age</h2>
            <div className="grid grid-cols-1 gap-3">
              {(['under9m', '9m-2y', '2y', '3-4y', '5plus'] as ChildAge[]).map((age) => (
                <button key={age} onClick={() => updateData({ childAge: age })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.childAge === age ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                  {age === 'under9m' && 'Under 9 months'}
                  {age === '9m-2y' && '9 months to 2 years'}
                  {age === '2y' && '2 years old'}
                  {age === '3-4y' && '3 to 4 years old'}
                  {age === '5plus' && 'School age (5+)'}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Household</h2>
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
      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Employment</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your Status</label>
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
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Partner's Status</label>
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
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Income Check</h2>
            <p className="text-slate-500 text-sm">Working parent funding requires earning ≥£183/wk (avg) and <£100k net income per year.</p>
            <div className="grid grid-cols-1 gap-3 pt-4">
              {[
                { val: 'yes', label: 'Yes, we fit this range' },
                { val: 'no', label: 'No, someone is outside' },
                { val: 'notSure', label: 'Not sure / Casual' },
              ].map((opt) => (
                <button key={opt.val} onClick={() => updateData({ incomeInRange: opt.val as any })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.incomeInRange === opt.val ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm' : 'border-slate-100'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Benefits</h2>
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
      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Health & SEN</h2>
            <div className={`p-8 rounded-[2.5rem] border-2 transition ${data.childDisabled ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Child disability?</h4>
                  <p className="text-xs text-slate-400 mt-1">EHCP, DLA, PIP or registered blind.</p>
                </div>
                <div className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${data.childDisabled ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => updateData({ childDisabled: !data.childDisabled })}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${data.childDisabled ? 'translate-x-8' : 'translate-x-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Ready!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">Cross-referencing your profile with the latest 2026 UK support schemes.</p>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const totalFunded = results.filter(s => s.type === 'funding').reduce((acc, curr) => acc + curr.hours, 0);
    const appWindow = getApplicationWindow();
    const categories = [{ id: 'funding', title: 'Funded Hours', icon: 'clock' }, { id: 'financial-support', title: 'Financial Support', icon: 'sterling-sign' }];

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-white text-center">
            <h2 className="text-4xl font-black mb-2">Entitlement Results</h2>
            <p className="text-teal-400 font-bold uppercase tracking-widest text-xs">Based on 2026 {data.location} Regulations</p>
          </div>
          <div className="p-10 md:p-14">
            <div className="mb-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
               <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-1"></i>
               <div className="text-xs text-amber-900 leading-relaxed font-medium">
                 <strong>Disclaimer:</strong> This is a 2026 estimate. Eligibility depends on income thresholds and re-confirmation of codes every 3 months. Verify results on <strong>GOV.UK</strong>.
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Est. Weekly Funding</span>
                  <div className="text-6xl font-black text-teal-900 leading-none">{totalFunded} <span className="text-lg font-normal">hrs</span></div>
                </div>
                <i className="fa-solid fa-clock text-4xl text-teal-100"></i>
              </div>
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">Application Window</h4>
                {data.location === 'England' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-blue-700">For term starting <strong>{appWindow.term}</strong>:</p>
                    <div className={`bg-white p-3 rounded-xl border border-blue-100 font-black text-sm ${appWindow.active ? 'text-teal-700' : 'text-slate-400'}`}>
                       {appWindow.active ? `Window is OPEN! Apply by ${appWindow.deadline}` : `Window opens ${appWindow.window.split(' to ')[0]}`}
                    </div>
                  </div>
                ) : <p className="text-xs text-blue-700">Check with your regional authority in {data.location} for next term dates.</p>}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {catSchemes.map((scheme) => (
                        <div key={scheme.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 group hover:bg-white hover:shadow-xl hover:border-teal-100 transition-all duration-300 flex flex-col">
                          <h4 className="font-bold text-lg text-slate-900 mb-2">{scheme.title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">{scheme.description}</p>
                          {scheme.link && <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-teal-600 font-bold text-xs">Check Official Portal <i className="fa-solid fa-arrow-right"></i></a>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-16 bg-white rounded-[3rem] p-10 md:p-14 border border-slate-200 shadow-sm text-center">
                <h4 className="text-2xl font-black text-slate-900 mb-4">Find a Provider</h4>
                <a href={providerLinks[data.location]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg group">Official Directory <i className="fa-solid fa-external-link text-[10px]"></i></a>
            </div>
            <div className="mt-16 bg-teal-600 rounded-[3rem] p-10 md:p-16 text-white text-center">
                 <h4 className="text-3xl font-black mb-6">Email these results</h4>
                 {emailSent ? <div className="bg-white/10 p-6 rounded-2xl border border-white/20">Sent! Check your inbox.</div> : (
                   <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-grow p-4 rounded-xl text-slate-900 outline-none" required />
                     <button type="submit" className="bg-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition">Email Me</button>
                   </form>
                 )}
            </div>
            <div className="mt-8 text-center"><button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-400 hover:text-teal-600 transition">Start new check</button></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4"><span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Eligibility Engine</span><span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step {step}/{totalSteps}</span></div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }}></div></div>
      </div>
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[580px]">
        <div className="flex-grow">{renderStep()}</div>
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">{step === totalSteps ? 'Show My Results' : 'Continue'}</button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
