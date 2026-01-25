
import React, { useState } from 'react';

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition">{q}</span>
        <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-slate-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "Who is eligible for the 30 hours free childcare scheme?",
      a: "Working parents of children aged 9 months up to 4 years in England are now eligible for 30 hours of funded childcare per week (for 38 weeks of the year). To qualify, both parents (or a single parent) must usually earn at least £8,600 and less than £100,000 per year."
    },
    {
      q: "How does Tax-Free Childcare work?",
      a: "For every £8 you pay into an online childcare account, the government will pay in £2. You can get up to £2,000 per child per year (or £4,000 if your child is disabled). This can be used alongside the 30-hour funded entitlement."
    },
    {
      q: "What is the age range for the 30-hour entitlement?",
      a: "Following the full rollout in September 2025, the entitlement covers children from 9 months old until they reach school age."
    },
    {
      q: "Do I need to re-apply every term?",
      a: "You don't need to do a full application every term, but you MUST reconfirm your eligibility code every 3 months. You will receive an email or text reminder from HMRC to do this via your Childcare Service account."
    },
    {
      q: "Can I use funded hours with any provider?",
      a: "You must use an Ofsted-registered provider that has signed up to the local authority's funding agreement. This includes most nurseries, childminders, and preschools."
    },
    {
      q: "Does the funding cover meals and snacks?",
      a: "Generally, no. The funding covers the core childcare and education. Providers are permitted to charge for meals, nappies, and extra-curricular activities (like music or languages). Our cost calculator helps you estimate these additional outgoings."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-600 max-w-xl mx-auto">Latest information on the full 30-hour childcare rollout in England.</p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} q={faq.q} a={faq.a} />
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-slate-500 mb-6 italic">Looking for official GOV.UK guidance?</p>
        <a 
          href="https://www.gov.uk/free-childcare-if-working" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline"
        >
          Visit Childcare Choices <i className="fa-solid fa-external-link text-sm"></i>
        </a>
      </div>
    </div>
  );
};

export default FAQ;
