
import React, { useState } from 'react';

// Use React.FC to ensure proper handling of reserved props like 'key' in TypeScript
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
      q: "What is the 30 hours free childcare scheme?",
      a: "Working parents of 3 and 4-year-olds in England may be entitled to 30 hours of free childcare per week for 38 weeks of the year (a total of 1,140 hours per year). To be eligible, both parents (or a lone parent) must usually earn at least £8,600 and less than £100,000 per year."
    },
    {
      q: "How does Tax-Free Childcare work?",
      a: "For every £8 you pay into an online childcare account, the government will pay in £2. You can get up to £2,000 per child per year (or £4,000 if your child is disabled). You can use this to pay for nurseries, childminders, and even some after-school clubs."
    },
    {
      q: "What changed in April 2024?",
      a: "From April 2024, eligible working parents of 2-year-olds can access 15 hours of free childcare. This is the first stage of the government's expansion of the childcare funding program."
    },
    {
      q: "What is changing in September 2024?",
      a: "From September 2024, the 15-hour entitlement will expand further to include eligible working parents of children from 9 months old."
    },
    {
      q: "Can I use funded hours with any provider?",
      a: "No, you must use a 'registered' or 'approved' provider. Most nurseries, preschools, and registered childminders qualify, but you should always ask your provider if they accept government funding before signing a contract."
    },
    {
      q: "Does the funding cover meals and snacks?",
      a: "Usually, no. The funding covers the cost of childcare and education, but providers are allowed to charge 'consumable' fees for things like meals, nappies, and extra-curricular activities. Our calculator allows you to factor these in."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-600 max-w-xl mx-auto">Find answers to the most common questions about childcare funding in England.</p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} q={faq.q} a={faq.a} />
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-slate-500 mb-6 italic">Still have questions? Check the official GOV.UK guidance.</p>
        <a 
          href="https://www.gov.uk/free-childcare-if-working" 
          target="_blank" 
          className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline"
        >
          View GOV.UK Childcare Pages <i className="fa-solid fa-external-link text-sm"></i>
        </a>
      </div>
    </div>
  );
};

export default FAQ;
