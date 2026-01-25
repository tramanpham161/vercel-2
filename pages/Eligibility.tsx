
import React, { useState, useMemo } from 'react';
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

  const NOW = new Date();
  
  const totalSteps = 7;
  const nextStep = () => setStep((s: number) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s: number) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev: EligibilityData) => ({ ...prev, ...updates }));
  };

  /**
   * Application windows based on current GOV.UK guidelines.
   */
  const getApplicationWindow = () => {
    const month = NOW.getMonth(); // 0-indexed
    const year = NOW.getFullYear();

    if (month >= 0 && month <= 2) { // Jan - Mar
      return { term: "1 April", window: `15 Jan to 31 Mar ${year}`, deadline: `31 Mar ${year}` };
    } else if (month >= 3 && month <= 7) { // Apr - Aug
      return { term: "1 September", window: `12 May to 31 Aug ${year}`, deadline: `31 Aug ${year}` };
    } else { // Sept - Dec
      return { term: "1 January", window: `15 Oct to 31 Dec ${year}`, deadline: `31 Dec ${year}` };
    }
  };

  const results = useMemo(() => {
    const schemes: Scheme[] = [];
    const isWorkingEligible = data.workStatus === 'both' && data.incomeInRange === 'yes';
    
    // 1. 3-4 Year Old Entitlements
    if (data.childAge === '3-4y') {
      schemes.push({
        id: '15h-34-universal',
        title: '15 Hours Free (Universal)',
        description: 'Available to ALL children in England regardless of parental work status. Total 570 hours per year.',
        hours: 15
      });

      if (isWorkingEligible) {
        schemes.push({
          id: '30h-34-working',
          title: '30 Hours for Working Parents',
          description: 'An additional 15 hours for eligible working families. You must reconfirm your code every 3 months.',
          hours: 15
        });
      }
    }

    // 2. 9-Month to 2-Year Old Working Parent Entitlements (Full 30h Rollout)
    if (data.childAge === '2y' || data.childAge === '9m-2y' || data.childAge === 'under9m') {
      if (isWorkingEligible) {
        // Post Sept 2025: All 9m+ working parents get 30 hours
        schemes.push({
          id: '30h-working-infant',
          title: '30 Hours for Working Parents',
          description: 'Full 30-hour entitlement is now active for all eligible working parents of children from 9 months old.',
          hours: 30
        });
      }
    }

    // 3. 2-Year-Old Support-Based (15 hours)
    if (data.childAge === '2y' && !isWorkingEligible && data.benefits.length > 0) {
      schemes.push({
        id: '15h-2-support',
        title: '15 Hours Support-Based (2yo)',
        description: 'Available to families receiving specified benefits. This remains a 15-hour weekly entitlement.',
        hours: 15
      });
    }

    // 4. Tax-Free Childcare (Universal if working)
    if (isWorkingEligible && data.childAge !== '5plus') {
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare',
        description: 'Get up to £2,000 per year per child for childcare costs. The government adds £2 for every £8 you pay.',
        hours: 0
      });
    }

    return schemes;
  }, [data]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">How old is your child?</h2>
            <p className="text-slate-500 text-sm">Entitlements start the term after your child reaches these age milestones.</p>
            <div className="grid grid-cols-1 gap-3">
              {(['under9m', '9m-2y', '2y', '3-4y', '5plus'] as ChildAge[]).map((age: ChildAge) => (
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
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Working status</h2>
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
              Working entitlements require each parent to earn at least £183/wk (avg) and under £100k adjusted net income per year.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {['yes', 'no', 'notSure'].map((opt) => (
                <button key={opt} onClick={() => updateData({ incomeInRange: opt as any })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.incomeInRange === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                  {opt === 'yes' && 'Yes, our income is in this range'}
                  {opt === 'no' && 'No, one parent earns >£100k or <Min Wage'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BENEFIT_OPTIONS.map((ben) => (
                <label key={ben} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition">
                  <input type="checkbox" checked={data.benefits.includes(ben)} onChange={(e) => {
                    if (e.target.checked) updateData({ benefits: [...data.benefits, ben] });
                    else updateData({ benefits: data.benefits.filter(b => b !== ben) });
                  }} className="w-5 h-5 accent-teal-600 rounded" />
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
            <input type="text" placeholder="e.g. SW1 or M1" value={data.postcode} onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:border-teal-600 outline-none uppercase text-2xl font-black text-slate-800 placeholder:text-slate-200" />
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
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
               <i className="fa-solid fa-flag-checkered"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Confirm Details</h2>
            <p className="text-slate-500 max-w-sm mx-auto">See your final results based on the full 30-hour childcare rollout in England.</p>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
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
              <p className="text-slate-400 font-medium italic">Current entitlements as of {NOW.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100">
                 <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Total Weekly Support</span>
                 <div className="text-5xl font-black text-teal-900">{totalFunded} <span className="text-lg font-normal">hrs</span></div>
                 <p className="text-xs text-teal-600 mt-2 font-medium">Standard weekly funding credit</p>
              </div>
              
              <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-day text-amber-600"></i>
                  Next Intake Term: {appWindow.term}
                </h4>
                <p className="text-sm text-amber-800 leading-tight mb-4">Ensure you have your 11-digit code by the deadline to access funding for this term.</p>
                <div className="bg-white p-3 rounded-xl border border-amber-100">
                   <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Apply By:</span>
                   <span className="text-sm font-black text-amber-900">{appWindow.deadline}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 border-b pb-4">Qualifying Support Schemes</h3>
              <div className="grid grid-cols-1 gap-4">
                {results.length > 0 ? results.map((scheme) => (
                  <div key={scheme.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-lg text-slate-900">{scheme.title}</h4>
                       {scheme.hours > 0 && <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-[10px] font-black">{scheme.hours} HRS</span>}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{scheme.description}</p>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed">
                    You do not appear to be eligible for any childcare funding schemes at this time.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white">
                <div className="max-w-xl">
                  <h4 className="text-3xl font-black mb-4">Immediate Next Steps</h4>
                  <ul className="space-y-4 mb-10 text-slate-400 text-sm">
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-circle-check text-teal-500 mt-1"></i> <span>Check with your nursery if they have space and accept funded hours.</span></li>
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-circle-check text-teal-500 mt-1"></i> <span>Apply for your eligibility code on the official GOV.UK Childcare Service.</span></li>
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-circle-check text-teal-500 mt-1"></i> <span>Set a reminder: You must reconfirm your eligibility every 3 months.</span></li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://www.gov.uk/apply-30-hours-free-childcare" target="_blank" rel="noopener noreferrer" className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-center hover:bg-teal-500 transition shadow-xl shadow-teal-600/20">Apply Now on GOV.UK</a>
                    <button onClick={() => setIsSubmitted(false)} className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-bold text-center border border-slate-700 hover:bg-slate-700 transition">Adjust My Answers</button>
                  </div>
                </div>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
              This report follows current Department for Education policy for England. Funding covers the delivery of childcare; providers may charge for meals and consumables separately.
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
          <span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Eligibility Assessment ({Math.round((step / totalSteps) * 100)}%)</span>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step {step}/{totalSteps}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
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
