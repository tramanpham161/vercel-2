
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
    if (month >= 0 && month <= 2) return { term: "1 April", window: `15 Jan to 31 Mar`, deadline: `31 Mar`, id: 'apr' };
    else if (month >= 3 && month <= 7) return { term: "1 September", window: `12 May to 31 Aug`, deadline: `31 Aug`, id: 'sep' };
    else return { term: "1 January", window: `15 Oct to 31 Dec`, deadline: `31 Dec`, id: 'jan' };
  };

  const providerLinks: Record<UKRegion, string> = {
    'England': 'https://www.gov.uk/find-local-council-childcare',
    'Scotland': 'http://www.careinspectorate.com/',
    'Wales': 'https://careinspectorate.wales/',
    'Northern Ireland': 'https://www.familysupportni.gov.uk/'
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Simulate sending email
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 5000);
  };

  const results = useMemo(() => {
    const schemes: Scheme[] = [];
    
    const userQualifiesWork = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerQualifiesWork = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeQualifies = data.incomeInRange === 'yes';
    const isWorkingEligible = userQualifiesWork && partnerQualifiesWork && incomeQualifies;
    const onBenefits = data.benefits.length > 0;
    const isEngland = data.location === 'England';
    const isWales = data.location === 'Wales';
    const isScotland = data.location === 'Scotland';
    const isNI = data.location === 'Northern Ireland';

    // --- 1. CHILDCARE HOURS ---

    if (isEngland) {
      if (data.childAge === '3-4y') {
        schemes.push({
          id: 'eng-15h-univ',
          title: '15 Hours Free Childcare (Universal)',
          description: 'All 3 to 4-year-olds in England get 15 hours a week for 38 weeks.',
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-2-to-4-year-olds'
        });
        if (isWorkingEligible) {
          schemes.push({
            id: 'eng-30h-work',
            title: '30 Hours Free Childcare',
            description: 'Eligible working parents of 3-4 year olds can get an extra 15 hours.',
            hours: 15,
            type: 'funding',
            link: 'https://www.gov.uk/apply-30-hours-free-childcare'
          });
        }
      } else if (['9m-2y', '2y'].includes(data.childAge) && isWorkingEligible) {
        schemes.push({
          id: 'eng-expansion',
          title: 'Working Parent Entitlement (Expansion)',
          description: 'Working parents of children from 9 months up can access up to 30 hours.',
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/check-eligible-working-parent-childcare'
        });
      }
      if (data.childAge === '2y' && (onBenefits || data.childDisabled)) {
        schemes.push({
          id: 'eng-2y-support',
          title: '15 Hours Support-based (Age 2)',
          description: 'Available for families on benefits or children with extra needs.',
          hours: 15,
          type: 'funding',
          link: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-2-year-olds'
        });
      }
    }

    if (isScotland && ['3-4y', '2y'].includes(data.childAge)) {
      if (data.childAge === '3-4y' || onBenefits || data.childDisabled) {
        schemes.push({
          id: 'sco-1140h',
          title: '1,140 Hours Funded ELC',
          description: 'Universal support for 3-4 year olds and eligible 2-year-olds in Scotland.',
          hours: 30,
          type: 'funding',
          link: 'https://www.parentclub.scot/articles/funded-early-learning-and-childcare'
        });
      }
    }

    if (isWales && data.childAge === '3-4y') {
      schemes.push({
        id: 'wal-foundation',
        title: 'Early Education (Wales)',
        description: 'Universal early education support for all 3 and 4-year-olds.',
        hours: 10,
        type: 'funding',
        link: 'https://www.gov.wales/get-help-childcare-costs'
      });
      if (isWorkingEligible) {
        schemes.push({
          id: 'wal-offer',
          title: 'Childcare Offer for Wales',
          description: 'Up to 30 hours total for working parents of 3-4 year olds.',
          hours: 20,
          type: 'funding',
          link: 'https://www.gov.wales/childcare-offer-wales-parents'
        });
      }
    }

    if (isNI && data.childAge === '3-4y') {
      schemes.push({
        id: 'ni-preschool',
        title: 'Pre-school Education (NI)',
        description: 'Funded places for children in their immediate pre-school year.',
        hours: 12.5,
        type: 'funding',
        link: 'https://www.nidirect.gov.uk/articles/applying-pre-school-place'
      });
    }

    // --- 2. FINANCIAL & EXTRA ---

    if (isWorkingEligible && data.childAge !== '5plus') {
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare',
        description: 'Get up to £2,000/year government top-up to help with your bills.',
        hours: 0,
        type: 'financial-support',
        link: 'https://www.gov.uk/tax-free-childcare'
      });
    }

    if (onBenefits && (userQualifiesWork || partnerQualifiesWork)) {
      schemes.push({
        id: 'uc-childcare',
        title: 'Universal Credit Childcare',
        description: 'Claim back up to 85% of costs for working parents on UC.',
        hours: 0,
        type: 'financial-support',
        link: 'https://www.gov.uk/help-with-childcare-costs/universal-credit'
      });
    }

    if (onBenefits || data.isPregnant) {
      const title = isScotland ? 'Best Start Foods' : 'Healthy Start Card';
      schemes.push({
        id: 'healthy-start',
        title: title,
        description: 'Support for healthy food and milk for pregnant women and young children.',
        hours: 0,
        type: 'health-food',
        link: isScotland ? 'https://www.mygov.scot/best-start-grant-best-start-foods' : 'https://www.healthystart.nhs.uk/'
      });
    }

    if (isEngland && (onBenefits || data.childDisabled)) {
      schemes.push({
        id: 'eypp',
        title: 'Early Years Pupil Premium',
        description: 'Extra provider funding for children from low-income families.',
        hours: 0,
        type: 'health-food',
        link: 'https://www.gov.uk/get-extra-early-years-funding'
      });
    }

    return schemes;
  }, [data]);

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
            <h2 className="text-2xl font-bold text-slate-900">Profile Details</h2>
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
                   <span className="font-bold text-slate-900">Are you a student?</span>
                   <span className="text-[10px] text-slate-400">Higher Education status.</span>
                </button>
                <button onClick={() => updateData({ isPregnant: !data.isPregnant })} className={`p-6 rounded-2xl border-2 transition text-left flex flex-col gap-1 ${data.isPregnant ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                   <span className="font-bold text-slate-900">Are you pregnant?</span>
                   <span className="text-[10px] text-slate-400">Relevant for Healthy Start.</span>
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
            <h2 className="text-2xl font-bold text-slate-900">Your household</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => updateData({ hasPartner: false })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${!data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                <i className="fa-solid fa-user text-2xl"></i>
                <span className="font-bold text-sm">Single Parent</span>
              </button>
              <button onClick={() => updateData({ hasPartner: true })} className={`p-8 flex flex-col items-center gap-3 border-2 rounded-[2rem] transition ${data.hasPartner ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-100'}`}>
                <i className="fa-solid fa-users text-2xl"></i>
                <span className="font-bold text-sm">With Partner</span>
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
            <h2 className="text-2xl font-bold text-slate-900">Earnings</h2>
            <p className="text-slate-500 text-sm">Most funding requires earning ≥£183/wk and &lt;£100k net income per year.</p>
            <div className="grid grid-cols-1 gap-3 pt-4">
              {[
                { val: 'yes', label: 'Yes, we are within this range' },
                { val: 'no', label: 'No, someone is outside this range' },
                { val: 'notSure', label: 'Not sure / Irregular earnings' },
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
            <h2 className="text-2xl font-bold text-slate-900">Current Benefits</h2>
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
            <h2 className="text-2xl font-bold text-slate-900">Additional Needs</h2>
            <div className={`p-8 rounded-[2.5rem] border-2 transition ${data.childDisabled ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Child disability?</h4>
                  <p className="text-xs text-slate-400 mt-1">DLA, PIP or registered blind.</p>
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
            <h2 className="text-3xl font-black text-slate-900">All set!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">We've cross-referenced your details with all national and regional support schemes.</p>
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
      { id: 'financial-support', title: 'Financial Support', icon: 'sterling-sign' },
      { id: 'health-food', title: 'Food & Extras', icon: 'basket-shopping' },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-white text-center relative">
            <h2 className="text-4xl font-black mb-2">Support Engine Results</h2>
            <p className="text-teal-400 font-bold uppercase tracking-widest text-xs">Guidelines for {data.location}</p>
          </div>

          <div className="p-10 md:p-14">
            {/* Disclaimer */}
            <div className="mb-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
               <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-1"></i>
               <p className="text-xs text-amber-900 leading-relaxed font-medium">
                 <strong>Important:</strong> These results are an estimate based solely on your inputs. Please cross-check this information with official government websites (like GOV.UK) as individual circumstances and eligibility dates may vary.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Weekly Hours</span>
                  <div className="text-6xl font-black text-teal-900 leading-none">{totalFunded}</div>
                </div>
                <i className="fa-solid fa-clock text-4xl text-teal-100"></i>
              </div>
              
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">Next Intake</h4>
                {data.location === 'England' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-blue-700">For term starting <strong>{appWindow.term}</strong>:</p>
                    <div className="bg-white p-3 rounded-xl border border-blue-100 font-black text-blue-900 text-sm italic">Apply by {appWindow.deadline}</div>
                  </div>
                ) : (
                  <p className="text-xs text-blue-700">Check with your regional authority in {data.location} for key application dates.</p>
                )}
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
                          {scheme.link && (
                            <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-teal-600 font-bold text-xs">
                              Official Info <i className="fa-solid fa-arrow-right"></i>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-20 bg-slate-100 rounded-[3rem] p-10 md:p-14 border border-slate-200">
                <h4 className="text-2xl font-black text-slate-900 mb-4">Find an Approved Provider</h4>
                <p className="text-sm text-slate-600 mb-8 max-w-2xl leading-relaxed">
                  Now that you know your eligibility, use the official directory for <strong>{data.location}</strong> to find a registered childcare setting near you:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={providerLinks[data.location]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-bold hover:border-teal-600 hover:text-teal-600 transition shadow-sm group">
                    Official Directory <i className="fa-solid fa-external-link text-[10px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                  </a>
                </div>
            </div>

            {/* Email Form */}
            <div className="mt-16 bg-teal-600 rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-3xl font-black mb-6">Email me these results</h4>
                 {emailSent ? (
                   <div className="bg-white/10 p-6 rounded-2xl border border-white/20 animate-in fade-in duration-500">
                     <i className="fa-solid fa-circle-check text-4xl mb-3"></i>
                     <p className="font-bold">Sent! Check your inbox shortly.</p>
                   </div>
                 ) : (
                   <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-grow p-4 rounded-xl text-slate-900 outline-none" required />
                     <button type="submit" className="bg-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition">Send Now</button>
                   </form>
                 )}
                 <p className="mt-6 text-sm text-teal-100 opacity-70">We respect your privacy and don't store your personal data.</p>
               </div>
            </div>

            <div className="mt-8 text-center">
               <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-slate-400 hover:text-teal-600">Start new check</button>
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
          <button onClick={prevStep} disabled={step === 1} className={`font-bold transition-all px-6 py-3 rounded-xl ${step === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>Back</button>
          <button onClick={step === totalSteps ? () => setIsSubmitted(true) : nextStep} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
            {step === totalSteps ? 'See Results' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
