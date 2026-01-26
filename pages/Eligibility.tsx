
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
    providerType: 'Nursery'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const NOW = new Date();
  const totalSteps = 8;

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

  /**
   * Links updated to match the official GOV.UK "How to find an approved childcare provider" section.
   * Source: https://www.gov.uk/help-with-childcare-costs/approved-childcare
   */
  const providerLinks: Record<UKRegion, string> = {
    'England': 'https://www.gov.uk/find-local-council-childcare',
    'Scotland': 'http://www.careinspectorate.com/',
    'Wales': 'https://careinspectorate.wales/',
    'Northern Ireland': 'https://www.familysupportni.gov.uk/'
  };

  const results = useMemo(() => {
    const schemes: Scheme[] = [];
    
    const userQualifiesWork = data.userWorkStatus === 'working' || data.userWorkStatus === 'on-leave';
    const partnerQualifiesWork = !data.hasPartner || (data.partnerWorkStatus === 'working' || data.partnerWorkStatus === 'on-leave');
    const incomeQualifies = data.incomeInRange === 'yes';
    const isWorkingEligible = userQualifiesWork && partnerQualifiesWork && incomeQualifies;

    // --- ENGLAND LOGIC ---
    if (data.location === 'England') {
      if (data.childAge === '3-4y') {
        schemes.push({
          id: 'eng-15h-34-univ',
          title: '15 Hours Free (Universal)',
          description: 'Available to all 3 and 4-year-olds in England, starting the term after their 3rd birthday.',
          hours: 15,
          type: 'funding'
        });
        if (isWorkingEligible) {
          schemes.push({
            id: 'eng-30h-34-work',
            title: '30 Hours for Working Parents',
            description: 'An extra 15 hours for eligible working families (30 total).',
            hours: 15,
            type: 'funding'
          });
        }
      } else if (['9m-2y', '2y'].includes(data.childAge)) {
        if (isWorkingEligible) {
          schemes.push({
            id: 'eng-30h-infant',
            title: '30 Hours for Working Parents',
            description: 'Now active for children from 9 months old whose parents meet the work/income criteria.',
            hours: 30,
            type: 'funding'
          });
        }
        if (data.childAge === '2y' && data.benefits.length > 0) {
          schemes.push({
            id: 'eng-15h-2-support',
            title: '15 Hours Support-Based (2yo)',
            description: 'Available for 2-year-olds if parents receive specified benefits or the child has additional needs.',
            hours: 15,
            type: 'funding'
          });
        }
      }
    }

    // --- SCOTLAND LOGIC (Refined: 1140 hours) ---
    if (data.location === 'Scotland') {
      if (['3-4y', '2y'].includes(data.childAge)) {
        if (data.childAge === '3-4y') {
          schemes.push({
            id: 'sco-1140h-univ',
            title: '1,140 Hours Funded Childcare',
            description: 'All 3 and 4-year-olds in Scotland get 1,140 hours of funded ELC per year (approx 30h/week term-time).',
            hours: 30,
            type: 'funding'
          });
        } else if (data.childAge === '2y' && (data.benefits.length > 0 || data.childDisabled)) {
          schemes.push({
            id: 'sco-2y-funding',
            title: '1,140 Hours for Eligible 2-Year-Olds',
            description: 'Available if you receive certain benefits or the child is "looked after" or has a disability record.',
            hours: 30,
            type: 'funding'
          });
        }
      }
    }

    // --- WALES LOGIC (Refined: Childcare Offer & Flying Start) ---
    if (data.location === 'Wales') {
      if (data.childAge === '3-4y') {
        schemes.push({
          id: 'wal-early-edu',
          title: 'Early Education (Foundation Phase)',
          description: 'Minimum 10 hours of early education for all 3 and 4-year-olds.',
          hours: 10,
          type: 'funding'
        });
        if (isWorkingEligible) {
          schemes.push({
            id: 'wal-childcare-offer',
            title: 'Childcare Offer for Wales',
            description: 'Combines early education and childcare to provide 30 hours total for up to 48 weeks a year.',
            hours: 20,
            type: 'funding'
          });
        }
      } else if (data.childAge === '2y' && data.benefits.length > 0) {
        schemes.push({
          id: 'wal-flying-start',
          title: 'Flying Start Childcare',
          description: '12.5 hours per week of funded childcare for 2-year-olds in Flying Start areas.',
          hours: 12.5,
          type: 'funding'
        });
      }
    }

    // --- NORTHERN IRELAND LOGIC (Refined: Pre-school education) ---
    if (data.location === 'Northern Ireland') {
      if (data.childAge === '3-4y') {
        schemes.push({
          id: 'ni-preschool',
          title: 'Pre-school Education Programme',
          description: 'Funded pre-school places (12.5h - 22.5h) for children in their immediate pre-school year.',
          hours: 12.5,
          type: 'funding'
        });
      }
    }

    // --- UK-WIDE FINANCIAL SUPPORT ---
    if (isWorkingEligible && data.childAge !== '5plus') {
      const maxAmount = data.childDisabled ? '£4,000' : '£2,000';
      schemes.push({
        id: 'tfc',
        title: 'Tax-Free Childcare',
        description: `Get up to ${maxAmount} per year per child. The government adds £2 for every £8 you pay into your account. Available UK-wide.`,
        hours: 0,
        type: 'financial-support'
      });
    }

    if (data.benefits.includes('Universal Credit') && userQualifiesWork && partnerQualifiesWork) {
      schemes.push({
        id: 'uc-childcare',
        title: 'Universal Credit Childcare',
        description: 'Claim back up to 85% of costs if you work. Max £1,014 (1 child) or £1,739 (2+ children) per month. Available UK-wide.',
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
            <p className="text-slate-500 text-sm">Funding rules and hours vary significantly depending on your UK region.</p>
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
            <h2 className="text-2xl font-bold text-slate-900">How old is your child?</h2>
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
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Household</h2>
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
      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Work Status</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your Current Status</label>
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
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Income Check</h2>
            <p className="text-slate-500 text-sm">Most working parent entitlements require each parent to earn at least £183/wk and less than £100k net income per year.</p>
            <div className="grid grid-cols-1 gap-3 pt-4">
              {[
                { val: 'yes', label: 'Yes, we are within this range' },
                { val: 'no', label: 'No, someone earns over £100k or under Min Wage' },
                { val: 'notSure', label: 'Not sure / Irregular earnings' },
              ].map((opt) => (
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
            <h2 className="text-2xl font-bold text-slate-900">Benefits & Health</h2>
            <div className={`p-6 rounded-2xl border-2 transition mb-6 ${data.childDisabled ? 'border-teal-600 bg-teal-50 shadow-sm' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Child with disability?</h4>
                  <p className="text-[10px] text-slate-400">Receives DLA/PIP or registered blind.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${data.childDisabled ? 'bg-teal-600' : 'bg-slate-300'}`} onClick={() => updateData({ childDisabled: !data.childDisabled })}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${data.childDisabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
              </div>
            </div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Benefits you currently receive</label>
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
            <h2 className="text-2xl font-bold text-slate-900">Postcode & Target Hours</h2>
            <input type="text" placeholder="Postcode (Optional)" value={data.postcode} onChange={(e) => updateData({ postcode: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none text-center font-bold text-xl uppercase" />
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Planned Weekly Care</span>
              <div className="text-6xl font-black text-teal-600 mb-6">{data.hoursPerWeek} <span className="text-lg font-medium">hrs</span></div>
              <input type="range" min="1" max="60" value={data.hoursPerWeek} onChange={(e) => updateData({ hoursPerWeek: parseInt(e.target.value) })} className="w-full accent-teal-600" />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fa-solid fa-flag-checkered"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Everything looks good!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">Click below to see your personalized childcare support summary for {data.location}.</p>
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
              <h2 className="text-4xl font-black mb-2">Eligibility Results</h2>
              <p className="text-teal-400 font-bold uppercase tracking-widest text-sm">{data.location} Guidelines Applied</p>
            </div>
          </div>
          
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100">
                <span className="text-teal-600 text-[10px] font-bold block mb-1 uppercase tracking-widest">Est. Weekly Support</span>
                <div className="text-5xl font-black text-teal-900">{totalFunded} <span className="text-lg font-normal">hrs</span></div>
                <p className="text-xs text-teal-600 mt-2 font-medium">Standard core hours allocation</p>
              </div>
              {data.location === 'England' ? (
                <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-sm uppercase">Next Intake: {appWindow.term}</h4>
                  <div className="bg-white p-3 rounded-xl border border-amber-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-600">Apply By:</span>
                    <span className="text-sm font-black text-amber-900">{appWindow.deadline}</span>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-2">Check eligibility on the GOV.UK portal.</p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm uppercase">Regional Support</h4>
                  <p className="text-xs text-blue-700 leading-tight">Different application windows apply in {data.location}. Consult your local council or regional portal for specific dates.</p>
                </div>
              )}
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-4 mb-6">Eligible Support Schemes</h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.length > 0 ? results.map((scheme) => (
                    <div key={scheme.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{scheme.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${scheme.hours > 0 ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                          {scheme.hours > 0 ? `${scheme.hours} HRS` : 'FINANCIAL'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{scheme.description}</p>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed">
                      No matching schemes found. You may still be eligible for Tax-Free Childcare depending on your income.
                    </div>
                  )}
                </div>
              </div>

              {data.location === 'England' && (
                <div className="animate-in fade-in duration-1000">
                  <h3 className="text-2xl font-bold text-slate-900 border-b pb-4 mb-6">Application Windows (England)</h3>
                  <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Starts Term</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">When to apply</th>
                        </tr>
                      </thead>
                      <tbody>
                        {windows.map((win) => (
                          <tr key={win.id} className={`${appWindow.id === win.id ? 'bg-teal-50/50' : 'bg-white'} border-t border-slate-100`}>
                            <td className={`px-6 py-4 font-bold ${appWindow.id === win.id ? 'text-teal-900' : 'text-slate-800'}`}>{win.term}</td>
                            <td className={`px-6 py-4 text-sm ${appWindow.id === win.id ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>{win.dates}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-slate-100 rounded-[2rem] p-8 border border-slate-200">
                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-search text-teal-600"></i>
                  Find an Approved Provider
                </h4>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Now that you know your likely entitlements, you should find a childcare provider that is officially approved in <strong>{data.location}</strong>. Use the official directory for your region:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={providerLinks[data.location]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:border-teal-600 hover:text-teal-600 transition shadow-sm group">
                    Find Approved Providers <i className="fa-solid fa-external-link text-[10px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                  </a>
                  {data.location === 'England' && (
                    <a href="https://reports.ofsted.gov.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:border-teal-600 hover:text-teal-600 transition shadow-sm">
                      Check Ofsted Reports
                    </a>
                  )}
                </div>
                <p className="mt-4 text-[10px] text-slate-400 italic">Verify with individual providers that they have space and accept your specific funding code.</p>
              </div>
            </div>

            <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-xl relative z-10">
                  <h4 className="text-3xl font-black mb-4">What to do now</h4>
                  <ul className="space-y-4 mb-10 text-slate-400 text-sm">
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-check text-teal-500 mt-1"></i> <span>Apply for your 11-digit code via the official {data.location} portal.</span></li>
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-check text-teal-500 mt-1"></i> <span>Check if your local nursery has space for the next term start.</span></li>
                    <li className="flex gap-3 items-start"><i className="fa-solid fa-check text-teal-500 mt-1"></i> <span>Remember to reconfirm your details every 3 months for working parent schemes.</span></li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://www.childcarechoices.gov.uk" target="_blank" rel="noopener noreferrer" className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-center hover:bg-teal-500 transition shadow-xl shadow-teal-600/20">Official Childcare Choices</a>
                    <button onClick={() => setIsSubmitted(false)} className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-bold text-center border border-slate-700 hover:bg-slate-700 transition">Update My Details</button>
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
            {step === totalSteps ? 'Show My Results' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
