
import React, { useState } from 'react';
import { EligibilityData, ChildAge, WorkStatus, Scheme } from '../types';
import { BENEFIT_OPTIONS, PROVIDER_TYPES } from '../constants';

const Eligibility: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EligibilityData>({
    childAge: '3-4y',
    workStatus: 'both',
    incomeInRange: 'yes',
    benefits: [],
    postcode: '',
    hoursPerWeek: 30,
    providerType: 'Nursery'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 7;
  const nextStep = () => setStep((s: number) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s: number) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev: EligibilityData) => ({ ...prev, ...updates }));
  };

  /**
   * Application windows based on GOV.UK "When to apply":
   * Term start 1 Jan: Apply 15 Oct - 31 Dec
   * Term start 1 Apr: Apply 15 Jan - 31 Mar
   * Term start 1 Sep: Apply 12 May - 31 Aug
   */
  const getApplicationWindow = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed

    if (month >= 0 && month <= 2) { // Jan - Mar
      return { term: "1 April", window: "15 January to 31 March", deadline: "31 March" };
    } else if (month >= 3 && month <= 7) { // Apr - Aug
      return { term: "1 September", window: "12 May to 31 August", deadline: "31 August" };
    } else { // Sept - Dec
      return { term: "1 January", window: "15 October to 31 December", deadline: "31 December" };
    }
  };

  const calculateResults = (): Scheme[] => {
    const schemes: Scheme[] = [];
    const isWorkingEligible = data.workStatus === 'both' && data.incomeInRange === 'yes';
    
    // 1. Universal Hours (3-4 year olds)
    if (data.childAge === '3-4y') {
      schemes.push({
        id: '15h-34-universal',
        title: '15 Hours Free (Universal)',
        description: 'Available to all 3 and 4-year-olds in England regardless of working status. Usually 570 hours per year.',
        hours: 15
      });

      if (isWorkingEligible) {
        schemes.push({
          id: '30h-34-working',
          title: '30 Hours for Working Parents',
          description: 'An additional 15 hours (total 30) for eligible working families. Requires an eligibility code from GOV.UK.',
          hours: 15
        });
      }
    }

    // 2. 2-Year-Old Funding
    if (data.childAge === '2y') {
      if (isWorkingEligible) {
        schemes.push({
          id: '15h-2-working',
          title: '15 Hours for Working Parents (2yo)',
          description: 'Working families can access 15 hours of funded childcare. This expands to 30 hours in Sept 2025.',
          hours: 15
        });
      } else if (data.benefits.length > 0) {
        schemes.push({
          id: '15h-2-support',
          title: '15 Hours Support-Based (2yo)',
          description: 'Available if you receive certain benefits (e.g. Universal Credit, Income Support).',
          hours: 15
        });
      }
    }

    // 3. 9 Months + Funding
    if (data.childAge === '9m-2y' || data.childAge === 'under9m') {
      if (isWorkingEligible) {
        schemes.push({
          id: '15h-9m-working',
          title: '15 Hours for Working Parents (9m+)',
          description: 'Rollout began Sept 2024 for babies from 9 months old. Currently 15 hours for eligible working parents.',
          hours: 15
        });
      }
    }

    // 4. Sept 2025 Expansion Note
    if (isWorkingEligible && (data.childAge === 'under9m' || data.childAge === '9m-2y' || data.childAge === '2y')) {
      schemes.push({
        id: '30h-expansion-2025',
        title: 'UPCOMING: 30 Hours Expansion (Sept 2025)',
        description: 'From September 2025, the working parent entitlement increases to 30 hours for all ages from 9 months up to school age.',
        hours: 0
      });
    }

    // 5. Tax-Free Childcare (Universal if working)
    if (isWorkingEligible && data.childAge !== '5plus') {
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare',
        description: 'For every £8 you pay, the government pays £2. Up to £2,000 per child per year (or £4,000 if disabled).',
        hours: 0
      });
    }

    return schemes;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">How old is your child?</h2>
            <p className="text-slate-500 text-sm">Entitlements change as your child hits key milestones (9m, 2y, 3y).</p>
            <div className="grid grid-cols-1 gap-3">
              {(['under9m', '9m-2y', '2y', '3-4y', '5plus'] as ChildAge[]).map((age: ChildAge) => (
                <button key={age} onClick={() => updateData({ childAge: age })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.childAge === age ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                   {age === 'under9m' && 'Under 9 months'}
                   {age === '9m-2y' && '9 months to 2 years'}
                   {age === '2y' && '2 years old'}
                   {age === '3-4y' && '3 to 4 years old'}
                   {age === '5plus' && '5 years or older'}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Working status</h2>
            <p className="text-slate-500 text-sm">The 30-hour and 9-month schemes usually require both parents to work.</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { val: 'both', label: 'Both parents work (or single parent works)' },
                { val: 'one', label: 'One parent works' },
                { val: 'none', label: 'Not currently working' },
                { val: 'notSure', label: 'Irregular hours / Not sure' },
              ].map((opt) => (
                <button key={opt.val} onClick={() => updateData({ workStatus: opt.val as WorkStatus })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.workStatus === opt.val ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Household income</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              To be "eligible working parents," you must each earn at least £183/wk (avg) and less than £100,000/year adjusted net income.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {['yes', 'no', 'notSure'].map((opt) => (
                <button key={opt} onClick={() => updateData({ incomeInRange: opt as any })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.incomeInRange === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                  {opt === 'yes' && 'Yes, our income is in this range'}
                  {opt === 'no' && 'No, one of us earns >£100k or <Min Wage'}
                  {opt === 'notSure' && 'Not sure / Income varies'}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Benefits received</h2>
            <p className="text-slate-500 text-sm">Some 2-year-olds qualify based on family support rather than work.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BENEFIT_OPTIONS.map((ben) => (
                <label key={ben} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition">
                  <input type="checkbox" checked={data.benefits.includes(ben)} onChange={(e) => {
                    if (e.target.checked) updateData({ benefits: [...data.benefits, ben] });
                    else updateData({ benefits: data.benefits.filter(b => b !== ben) });
                  }} className="w-5 h-5 accent-teal-600" />
                  <span className="text-xs font-medium text-slate-700">{ben}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Postcode</h2>
            <p className="text-slate-500 text-sm">Funding rules apply to England only. This helps us check for local supplements.</p>
            <input type="text" placeholder="e.g. M1 1AA" value={data.postcode} onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:border-teal-600 outline-none uppercase text-2xl font-black text-slate-800 placeholder:text-slate-200" />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Planned hours</h2>
            <div className="space-y-10">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Weekly Goal</span>
                 <div className="text-6xl font-black text-teal-600 leading-none">{data.hoursPerWeek}<span className="text-xl font-medium">hrs</span></div>
              </div>
              <input type="range" min="0" max="60" value={data.hoursPerWeek} onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })} className="w-full accent-teal-600" />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Current provider</h2>
            <div className="grid grid-cols-1 gap-3">
              {PROVIDER_TYPES.map((type) => (
                <button key={type} onClick={() => updateData({ providerType: type })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.providerType === type ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const results = calculateResults();
    const totalFunded = results.reduce((acc, curr) => acc + curr.hours, 0);
    const appWindow = getApplicationWindow();

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <div className="absolute top-10 right-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
               <div className="absolute bottom-10 left-10 w-32 h-32 bg-teal-300 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-3xl mb-8 rotate-3 shadow-xl">
                <i className="fa-solid fa-clipboard-check text-4xl"></i>
              </div>
              <h2 className="text-4xl font-black mb-2">Your Eligibility Result</h2>
              <p className="text-slate-400 font-medium italic">Verified against GOV.UK 2024/25 rollout rules</p>
            </div>
          </div>
          
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100">
                 <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Calculated Support</span>
                 <div className="text-5xl font-black text-teal-900">{totalFunded} <span className="text-lg font-normal">hrs/wk</span></div>
                 <p className="text-xs text-teal-600 mt-2 font-medium">Standard 38-week entitlement</p>
              </div>
              
              <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-day text-amber-600"></i>
                  Next Enrollment: {appWindow.term}
                </h4>
                <p className="text-sm text-amber-800 leading-tight mb-4">You must have a code before the deadline to receive funding for this term.</p>
                <div className="bg-white p-3 rounded-xl border border-amber-100">
                   <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Apply Between:</span>
                   <span className="text-sm font-black text-amber-900">{appWindow.window}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 border-b pb-4">Qualifying Support Schemes</h3>
              <div className="grid grid-cols-1 gap-4">
                {results.map((scheme) => (
                  <div key={scheme.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-lg text-slate-900">{scheme.title}</h4>
                       {scheme.hours > 0 && <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-[10px] font-black">{scheme.hours} HRS</span>}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{scheme.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white">
                <div className="max-w-xl">
                  <h4 className="text-3xl font-black mb-4">Secure your funding code</h4>
                  <p className="text-slate-400 mb-10 leading-relaxed">
                    Most working parent schemes require a code from the GOV.UK Childcare Service. These must be re-confirmed every 3 months.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://www.gov.uk/apply-30-hours-free-childcare" target="_blank" className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-center hover:bg-teal-500 transition shadow-xl shadow-teal-600/20">Apply on GOV.UK</a>
                    <button onClick={() => setIsSubmitted(false)} className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-bold text-center border border-slate-700 hover:bg-slate-700 transition">Start Again</button>
                  </div>
                </div>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-slate-400 font-medium">
              Information based on GOV.UK "What you'll get" guidance. Always verify with your local provider as regional variations may apply.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Eligibility Step {step} of {totalSteps}</span>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-1000 ease-in-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[550px]">
        <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderStep()}
        </div>
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'See Eligibility' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
