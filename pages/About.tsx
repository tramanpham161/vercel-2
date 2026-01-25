import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8 text-slate-900 text-center">About Childcare Checker</h1>
      <div className="prose prose-slate lg:prose-lg mx-auto">
        <p className="text-lg leading-relaxed text-slate-600 mb-6 text-center">
          We are an independent service dedicated to helping UK parents navigate the complexity of government childcare support.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-4 text-teal-700">Our Mission</h3>
            <p className="text-slate-600">To provide clear, up-to-date, and actionable information about childcare funding, empowering parents to make informed financial decisions for their families.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-4 text-teal-700">Our Data</h3>
            <p className="text-slate-600">Our eligibility rules and cost estimates are based on official GOV.UK publications, local authority average rates, and the latest budget announcements from HMRC.</p>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Why we built this?</h2>
          <p className="text-slate-600 mb-4">
            Childcare costs in the UK are some of the highest in the developed world. While the government offers significant support through various schemes like the 30-hour entitlement and Tax-Free Childcare, many parents find the application process and eligibility rules confusing.
          </p>
          <p className="text-slate-600">
            Childcare Checker was created as a single, friendly point of entry to help you see the big picture of your entitlements and expected outgoings.
          </p>
        </section>

        <section className="mt-20 p-10 bg-teal-600 rounded-3xl text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Questions?</h2>
          <p className="mb-8 opacity-90">Our team is always here to help clarify the latest funding rules.</p>
          <a href="mailto:support@childcarechecker.uk" className="bg-white text-teal-700 px-8 py-3 rounded-xl font-bold hover:bg-teal-50 transition">Contact Us</a>
        </section>
      </div>
    </div>
  );
};

export default About;