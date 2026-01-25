import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-teal-500 rounded-full opacity-50 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Navigate childcare funding with confidence.
            </h1>
            <p className="text-xl text-teal-50 mb-10 leading-relaxed font-medium">
              Find out how much childcare help you could get in England — free hours, tax-free childcare and cost estimates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/eligibility" className="bg-white text-teal-700 px-8 py-4 rounded-xl font-bold text-center hover:bg-teal-50 transition shadow-lg">
                Check your eligibility
              </Link>
              <Link to="/calculator" className="bg-teal-700 text-white px-8 py-4 rounded-xl font-bold text-center border border-teal-500 hover:bg-teal-800 transition shadow-lg">
                Estimate your costs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-semibold text-slate-500">
             <i className="fa-solid fa-building-columns text-xl"></i>
             <span>Based on GOV.UK rules</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-500">
             <i className="fa-solid fa-shield-halved text-xl"></i>
             <span>Impartial & Independent</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-500">
             <i className="fa-solid fa-location-dot text-xl"></i>
             <span>UK-Focused Data</span>
          </div>
        </div>
      </section>

      {/* Benefits Section - KPI Style */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="text-teal-600 text-5xl font-extrabold mb-2">£6,500</div>
              <div className="text-slate-900 font-bold text-lg mb-2 text-balance">Potential Annual Saving</div>
              <p className="text-slate-500 text-sm">Average yearly saving per child for eligible working parents.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="text-teal-600 text-5xl font-extrabold mb-2">30</div>
              <div className="text-slate-900 font-bold text-lg mb-2 text-balance">Weekly Funded Hours</div>
              <p className="text-slate-500 text-sm">Available for working parents of 3 and 4 year olds.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="text-teal-600 text-5xl font-extrabold mb-2">£2,000</div>
              <div className="text-slate-900 font-bold text-lg mb-2 text-balance">Tax-Free Top Up</div>
              <p className="text-slate-500 text-sm">Maximum government contribution per child, per year.</p>
            </div>
          </div>

          <div className="lg:flex items-center gap-20">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <img 
                src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800&h=600" 
                alt="Children playing in a bright nursery setting" 
                className="rounded-3xl shadow-2xl object-cover" 
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">Making childcare affordable for every family.</h2>
              <div className="space-y-6">
                {[
                  { title: '15 & 30 Hours Funding', text: 'Working parents of children aged 9 months to 4 years can access significant funded childcare hours.' },
                  { title: 'Tax-Free Childcare', text: 'Get help with the costs of childcare via a dedicated government account for each of your children.' },
                  { title: 'Universal Credit Support', text: 'If you work, you could claim back up to 85% of your childcare costs through the UC system.' },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 text-teal-600">
                      <i className="fa-solid fa-circle-check text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{benefit.title}</h4>
                      <p className="text-slate-600">{benefit.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/eligibility" className="text-teal-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                  See what you qualify for <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to see what you could save?</h2>
          <p className="text-xl text-slate-400 mb-12">
            Childcare Checker aims to help you to plan your future and manage your budget
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/eligibility" className="bg-teal-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-teal-500 transition shadow-xl">
              Start Eligibility Check
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;