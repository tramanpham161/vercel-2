
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

  const getApplicationWindow = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed

    if (month >= 0 && month <= 2) { // Jan - Mar
      return { term: "April", window: "15 January to 28 February", deadline: "31 March" };
    } else if (month >= 3 && month <= 7) { // Apr - Aug
      return { term: "September", window: "15 May to 31 August", deadline: "31 August" };
    } else { // Sept - Dec
      return { term: "January", window: "15 October to 30 November", deadline: "31 December" };
    }
  };

  const calculateResults = (): Scheme[] => {
    const schemes: Scheme[] = [];
    const isWorking = data.workStatus === 'both' && data.incomeInRange === 'yes';
    
    if (data.childAge === '3-4y') {
      schemes.push({
        id: '15h-34',
        title: '15 Hours Free (Universal)',
        description: 'Available to ALL 3 and 4 year olds in England. No application code needed, usually handled by provider.',
        hours: 15
      });

      if (isWorking) {
        schemes.push({
          id: '30h-34',
          title: '30 Hours for Working Parents',
          description: 'An additional 15 hours for working families. Requires a valid DfE eligibility code.',
          hours: 15
        });
      }
    }

    if (data.childAge === '2y') {
      if (isWorking) {
        schemes.push({
          id: '15h-2-working',
          title: '15 Hours for Working Parents (2yo)',
          description: 'Working families earning under £100k per parent. Apply now for the next term.',
          hours: 15
        });
      } else if (data.benefits.length > 0) {
        schemes.push({
          id: '15h-2-benefits',
          title: '15 Hours (Support-based)',
          description: 'Funded hours for families receiving Universal Credit or other specified support.',
          hours: 15
        });
      }
    }

    if (data.childAge === '9m-2y' || data.childAge === 'under9m') {
      if (isWorking) {
        schemes.push({
          id: '15h-9m-working',
          title: '15 Hours for Working Parents (9m+)',
          description: 'Entitlement for working parents of babies from 9 months. Rollout began Sept 2024.',
          hours: 15
        });

        schemes.push({
          id: '30h-9m-future',
          title: 'Upcoming: 30 Hours from Sept 2025',
          description: 'Your entitlement is scheduled to increase to 30 hours per week from September 2025.',
          hours: 0
        });
      }
    }

    if (data.incomeInRange === 'yes' && data.childAge !== '5plus') {
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare',
        description: 'Get up to £2,000 per child/year top-up. Open to apply year-round.',
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
            <h2 className="text-2xl font-bold">How old is your child?</h2>
            <p className="text-slate-600">Funding starts the term after your child reaches the age milestone.</p>
            <div className="grid grid-cols-1 gap-3">
              {(['under9m', '9m-2y', '2y', '3-4y', '5plus'] as ChildAge[]).map((age: ChildAge) => (
                <button key={age} onClick={() => updateData({ childAge: age })} className={`p-4 text-left border-2 rounded-xl transition font-medium ${data.childAge === age ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 hover:border-slate-300'}`}>
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
            <h2 className="text-2xl font-bold">Working Status</h2>
            <p className="text-slate-600">Usually both parents (if applicable) must be in work to qualify for extended hours.</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { val: 'both', label: 'Both parents work (or single parent works)' },
                { val: 'one', label: 'One parent works' },
                { val: 'none', label: 'Not currently working' },
                { val: 'notSure', label: 'Not sure / Irregular hours' },
              ].map((opt: {val: string, label: string}) => (
                <button key={opt.val} onClick={() => updateData({ workStatus: opt.val as WorkStatus })} className={`p-4 text-left border-2 rounded-xl transition font-medium ${data.workStatus === opt.val ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 hover:border-slate-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Household Income</h2>
            <p className="text-slate-600 text-sm">To qualify for working support, you must earn at least the equivalent of 16 hours at National Minimum Wage (£183/wk) but less than £100,000 per year per parent.</p>
            <div className="grid grid-cols-1 gap-3">
              {(['yes', 'no', 'notSure'] as const).map((opt: string) => (
                <button key={opt} onClick={() => updateData({ incomeInRange: opt as any })} className={`p-4 text-left border-2 rounded-xl transition font-medium ${data.incomeInRange === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 hover:border-slate-300'}`}>
                  {opt === 'yes' && 'Yes, earning in this range'}
                  {opt === 'no' && 'No, earning outside this range'}
                  {opt === 'notSure' && 'Not sure / Variable income'}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Benefits & Support</h2>
            <p className="text-slate-600">Select any benefits your household currently receives.</p>
            <div className="grid grid-cols-1 gap-2">
              {BENEFIT_OPTIONS.map((ben: string) => (
                <label key={ben} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition">
                  <input type="checkbox" checked={data.benefits.includes(ben)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.checked) updateData({ benefits: [...data.benefits, ben] });
                    else updateData({ benefits: data.benefits.filter((b: string) => b !== ben) });
                  }} className="w-5 h-5 text-teal-600 rounded" />
                  <span className="text-sm font-medium">{ben}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Postcode</h2>
            <p className="text-slate-600">Rules differ slightly across the UK. This tool is for families in England.</p>
            <input type="text" placeholder="e.g. SW1A 1AA" value={data.postcode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none uppercase text-xl font-bold" />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Planned Hours</h2>
            <p className="text-slate-600">How many hours per week do you expect to use?</p>
            <div className="flex flex-col gap-6">
              <input type="range" min="0" max="60" value={data.hoursPerWeek} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData({ hoursPerWeek: parseInt(e.target.value) })} className="w-full accent-teal-600" />
              <div className="flex justify-between items-center bg-slate-100 p-6 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold text-sm">Weekly Usage</span>
                <span className="text-4xl text-teal-700 font-black">{data.hoursPerWeek} <span className="text-lg">hrs</span></span>
                <span className="text-slate-500 font-bold text-sm">Target</span>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Provider Type</h2>
            <p className="text-slate-600">Funding can only be used at Ofsted-registered providers.</p>
            <div className="grid grid-cols-1 gap-3">
              {PROVIDER_TYPES.map((type: string) => (
                <button key={type} onClick={() => updateData({ providerType: type })} className={`p-4 text-left border-2 rounded-xl transition font-medium ${data.providerType === type ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 hover:border-slate-300'}`}>
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
    const totalFunded = results.reduce((acc: number, curr: Scheme) => acc + curr.hours, 0);
    const appWindow = getApplicationWindow();

    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="bg-teal-600 p-10 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <i className="fa-solid fa-calendar-check text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold">Your Eligibility Report</h2>
            <p className="text-teal-100 mt-2 opacity-90 italic">Based on GOV.UK 2024/25 rollout and Thrive Childcare policies</p>
          </div>
          
          <div className="p-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900">Total Support Available</h3>
              <button onClick={() => setIsSubmitted(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-slate-200">
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                 <span className="text-slate-500 text-[10px] font-bold block mb-1 uppercase tracking-widest">Max Funded Hours</span>
                 <div className="text-4xl font-black text-teal-700">{totalFunded} <span className="text-lg font-normal">hrs/wk</span></div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <span className="text-amber-700 text-[10px] font-bold block mb-1 uppercase tracking-widest">Next Term Start</span>
                <div className="text-xl font-bold text-amber-900">1st {appWindow.term}</div>
                <p className="text-[10px] text-amber-700 mt-1 font-medium">Apply by {appWindow.deadline} for this term.</p>
              </div>
            </div>

            <div className="mb-10 p-6 bg-teal-50 rounded-2xl border border-teal-100">
              <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-clock"></i>
                When to Apply
              </h4>
              <p className="text-sm text-teal-800 leading-relaxed mb-4">
                You must apply during the application window <strong>before</strong> the term your child starts. For the <strong>{appWindow.term}</strong> term, you should apply between:
              </p>
              <div className="bg-white p-4 rounded-xl border border-teal-100 font-bold text-center text-teal-700 text-lg">
                {appWindow.window}
              </div>
              <p className="text-[10px] text-teal-600 mt-3 italic">
                *Failure to apply before the {appWindow.deadline} deadline will mean you cannot receive funding until the following term.
              </p>
            </div>

            <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-2 border-t pt-8">
              <i className="fa-solid fa-list-check text-teal-600"></i>
              Qualifying Schemes
            </h3>
            
            <div className="space-y-4 mb-10">
              {results.map((scheme: Scheme) => (
                <div key={scheme.id} className="p-6 border-2 border-slate-50 rounded-2xl group hover:border-teal-100 transition">
                  <h4 className="font-bold text-lg text-slate-900 mb-2">{scheme.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{scheme.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl">
                <h4 className="font-bold text-2xl mb-4">Send me this report</h4>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">Includes key application dates and links to the official GOV.UK portal.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="email" placeholder="your@email.com" className="flex-grow p-4 rounded-xl text-slate-900 outline-none" />
                  <button className="bg-teal-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-teal-500 transition">Email Me</button>
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
          <span className="text-teal-600 font-bold text-[10px] uppercase tracking-widest">Step {step} of {totalSteps}</span>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[500px]">
        <div className="flex-grow">{renderStep()}</div>
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition ${step === 1 ? 'opacity-0 cursor-default' : 'text-slate-500 hover:text-slate-700'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'Get results' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
