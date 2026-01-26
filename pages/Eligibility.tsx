
import React, { useState, useMemo } from 'react';
import { EligibilityData, ChildAge, WorkStatus, Scheme } from '../types';
import { BENEFIT_OPTIONS } from '../constants';

const Eligibility: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EligibilityData>({
    childAge: '3-4y',
    hasPartner: false,
    userWorkStatus: 'working',
    partnerWorkStatus: 'working',
    incomeInRange: 'yes',
    benefits: [],
    childDisabled: false,
    postcode: '',
    hoursPerWeek: 30,
    providerType: 'Nursery'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const NOW = new Date();
  const totalSteps = 7;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateData = (updates: Partial<EligibilityData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const getApplicationWindow = () => {
    const month = NOW.getMonth();
    const year = NOW.getFullYear();
    if (month >= 0 && month <= 2) return { term: "1 April", window: `15 Jan to 31 Mar`, deadline: `31 Mar`, id: 'apr' };
    else if (month >= 3 && month <= 7) return { term: "1 September", window: `12 May to 31 Aug`, deadline: `31 Aug`, id: 'sep' };
    else return { term: "1 January", window: `15 Oct to 31 Dec`, deadline: `31 Dec`, id: 'jan' };
  };

  const results = useMemo(() => {
    const schemes: Scheme[] = [];
    
    // Eligibility Logic for Working Parent Entitlements (15/30 hours)
    // Both parents must work (or one if single) and earn >= min wage & < £100k
    const userQualifies = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerQualifies = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeQualifies = data.incomeInRange === 'yes';
    
    const isWorkingEligible = userQualifies && partnerQualifies && incomeQualifies;

    // 1. 15 Hours Universal (3-4 year olds)
    if (data.childAge === '3-4y') {
      schemes.push({
        id: '15h-34-univ',
        title: '15 Hours Free (Universal)',
        description: 'Available to all 3 and 4-year-olds in England, regardless of your work status or income.',
        hours: 15,
        type: 'funding'
      });
      if (isWorkingEligible) {
        schemes.push({
          id: '30h-34-work',
          title: '30 Hours for Working Parents',
          description: 'An extra 15 hours (30 total) for eligible working families. You must reconfirm your code every 3 months.',
          hours: 15,
          type: 'funding'
        });
      }
    }

    // 2. 9 Months - 2 Year Olds Working Parents (Full 30h Rollout)
    if (['under9m', '9m-2y', '2y'].includes(data.childAge)) {
      if (isWorkingEligible && data.childAge !== 'under9m') {
        schemes.push({
          id: '30h-working-infant',
          title: '30 Hours for Working Parents',
          description: 'Now fully available for children from 9 months old whose parents meet the work and income criteria.',
          hours: 30,
          type: 'funding'
        });
      }
    }

    // 3. 2-Year-Old Support-Based (15 hours)
    if (data.childAge === '2y' && data.benefits.length > 0) {
      schemes.push({
        id: '15h-2-support',
        title: '15 Hours Support-Based (2yo)',
        description: 'Available to families receiving specified benefits like Universal Credit or if the child has a DLA/PIP record.',
        hours: 15,
        type: 'funding'
      });
    }

    // 4. Tax-Free Childcare
    if (isWorkingEligible && data.childAge !== '5plus') {
      const maxAmount = data.childDisabled ? '£4,000' : '£2,000';
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare',
        description: `Get up to ${maxAmount} per year per child. The government adds £2 for every £8 you pay into your account.`,
        hours: 0,
        type: 'financial-support'
      });
    }

    // 5. Universal Credit Childcare
    if (data.benefits.includes('Universal Credit') && isWorkingEligible) {
      schemes.push({
        id: 'uc-childcare',
        title: 'Universal Credit Childcare Support',
        description: 'Claim back up to 85% of your childcare costs (up to £1,014.63 for one child) if you are working.',
        hours: 0,
        type: 'financial-support'
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
            <div className="p-5 bg-teal-50 border-2 border-teal-600 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <span className="block font-bold text-teal-900 text-lg">England</span>
                <span className="text-xs text-teal-600">This tool is currently optimized for English funding rules.</span>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How old is your child?</h2>
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
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Household</h2>
            <p className="text-slate-500 text-sm">Entitlements change based on whether you are a single parent or living with a partner.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => updateData({ hasPartner: false })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${!data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                <i className="fa-solid fa-user text-2xl"></i>
                <span className="font-bold">Single Parent</span>
              </button>
              <button onClick={() => updateData({ hasPartner: true })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                <i className="fa-solid fa-users text-2xl"></i>
                <span className="font-bold">With Partner</span>
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Work Status</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'working', label: 'Working', icon: 'briefcase' },
                  { id: 'on-leave', label: 'On Leave', icon: 'house-laptop' },
                  { id: 'unable-to-work', label: 'Unable to work', icon: 'hand-holding-heart' },
                  { id: 'not-working', label: 'Not working', icon: 'xmark' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => updateData({ userWorkStatus: opt.id as WorkStatus })} className={`p-4 text-xs font-bold border-2 rounded-xl flex items-center gap-2 transition ${data.userWorkStatus === opt.id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400'}`}>
                    <i className={`fa-solid fa-${opt.icon}`}></i> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {data.hasPartner && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Partner's Work Status</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'working', label: 'Working', icon: 'briefcase' },
                    { id: 'on-leave', label: 'On Leave', icon: 'house-laptop' },
                    { id: 'unable-to-work', label: 'Unable to work', icon: 'hand-holding-heart' },
                    { id: 'not-working', label: 'Not working', icon: 'xmark' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => updateData({ partnerWorkStatus: opt.id as WorkStatus })} className={`p-4 text-xs font-bold border-2 rounded-xl flex items-center gap-2 transition ${data.partnerWorkStatus === opt.id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400'}`}>
                      <i className={`fa-solid fa-${opt.icon}`}></i> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Earnings & Income</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              To qualify for 30 hours and Tax-Free Childcare, {data.hasPartner ? 'both you and your partner' : 'you'} must:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <li className="flex items-center gap-2"><i className="fa-solid fa-check text-teal-600"></i> Earn at least £183/week (National Minimum Wage for 16hrs)</li>
              <li className="flex items-center gap-2"><i className="fa-solid fa-check text-teal-600"></i> Earn less than £100,000 adjusted net income per year</li>
            </ul>
            <div className="grid grid-cols-1 gap-3 pt-4">
              {[
                { val: 'yes', label: 'Yes, we meet these criteria' },
                { val: 'no', label: 'No, one of us earns >£100k or <Min Wage' },
                { val: 'notSure', label: 'Not sure / Income varies' },
              ].map((opt) => (
                <button key={opt.val} onClick={() => updateData({ incomeInRange: opt.val as any })} className={`p-4 text-left border-2 rounded-2xl transition font-semibold ${data.incomeInRange === opt.val ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Health & Benefits</h2>
            <div className="space-y-4">
              <div className={`p-6 rounded-2xl border-2 transition ${data.childDisabled ? 'border-teal-600 bg-teal-50 shadow-sm' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2">
                     <i className="fa-solid fa-wheelchair text-teal-600"></i>
                     Child with disability?
                   </h4>
                   <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${data.childDisabled ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => updateData({ childDisabled: !data.childDisabled })}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${data.childDisabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                   </div>
                </div>
                <p className="text-xs text-slate-500">This includes children receiving DLA or PIP, or those registered blind.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Benefits you receive</label>
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
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Childcare Usage</h2>
            <div className="space-y-10">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Weekly Goal</span>
                 <div className="text-6xl font-black text-teal-600 leading-none">{data.hoursPerWeek}<span className="text-xl font-medium">hrs</span></div>
              </div>
              <input type="range" min="0" max="60" value={data.hoursPerWeek} onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })} className="w-full accent-teal-600" />
              <input type="text" placeholder="Postcode (First half)" value={data.postcode} onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none uppercase font-bold text-center" />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
               <i className="fa-solid fa-flag-checkered"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Ready to See Results?</h2>
            <p className="text-slate-500 max-w-sm mx-auto italic">Based on the latest GOV.UK Childcare Service criteria.</p>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    const totalFunded = results.reduce((acc, curr) => acc + curr.hours, 0);
    const appWindow = getApplicationWindow();
    const windows = [
      { id: 'apr', term: '1 April', dates: '15 Jan to 31 Mar' },
      { id: 'sep', term: '1 September', dates: '12 May to 31 Aug' },
      { id: 'jan', term: '1 January', dates: '15 Oct to 31 Dec' },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-3xl mb-8 rotate-3 shadow-xl">
                <i className="fa-solid fa-clipboard-check text-4xl"></i>
              </div>
              <h2 className="text-4xl font-black mb-2">Your Eligibility Result</h2>
              <p className="text-slate-400 font-medium italic">Accurate as of {NOW.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100">
                 <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Total Weekly Support</span>
                 <div className="text-5xl font-black text-teal-900">{totalFunded} <span className="text-lg font-normal">hrs</span></div>
                 <p className="text-xs text-teal-600 mt-2 font-medium italic">Apply these to your bill</p>
              </div>
              <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-day text-amber-600"></i>
                  Next Intake Term: {appWindow.term}
                </h4>
                <div className="bg-white p-3 rounded-xl border border-amber-100 mb-2">
                   <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Apply By:</span>
                   <span className="text-sm font-black text-amber-900">{appWindow.deadline}</span>
                </div>
                <p className="text-[10px] text-amber-800">You must have your code by this date.</p>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-4 mb-6">Qualifying Schemes</h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.length > 0 ? results.map((scheme) => (
                    <div key={scheme.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-lg text-slate-900">{scheme.title}</h4>
                         {scheme.hours > 0 ? (
                           <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-[10px] font-black">{scheme.hours} HRS</span>
                         ) : (
                           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black">CASH TOP-UP</span>
                         )}
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

              <div>
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-4 mb-6">Application Deadlines</h3>
                <div className="overflow-hidden border border-slate-200 rounded-3xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Start Term</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">When to apply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {windows.map((win) => (
                        <tr key={win.id} className={`${appWindow.id === win.id ? 'bg-teal-50/50' : 'bg-white'} border-b border-slate-100 last:border-0`}>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${appWindow.id === win.id ? 'text-teal-900' : 'text-slate-800'}`}>{win.term}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${appWindow.id === win.id ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>{win.dates}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white">
                <div className="max-w-xl">
                  <h4 className="text-3xl font-black mb-4">Immediate Next Steps</h4>
                  <ul className="space-y-4 mb-10 text-slate-400 text-sm">
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-circle-check text-teal-500 mt-1"></i> <span>Get your 11-digit eligibility code via GOV.UK.</span></li>
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-circle-check text-teal-500 mt-1"></i> <span>Provide the code to your nursery manager immediately.</span></li>
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-circle-check text-teal-500 mt-1"></i> <span>Reconfirm your details every 3 months or your code will expire.</span></li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://www.gov.uk/apply-30-hours-free-childcare" target="_blank" rel="noopener noreferrer" className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-center hover:bg-teal-500 transition shadow-xl shadow-teal-600/20">Apply Now on GOV.UK</a>
                    <button onClick={() => setIsSubmitted(false)} className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-bold text-center border border-slate-700 hover:bg-slate-700 transition">Change Details</button>
                  </div>
                </div>
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
          <span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Eligibility Check ({Math.round((step / totalSteps) * 100)}%)</span>
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
