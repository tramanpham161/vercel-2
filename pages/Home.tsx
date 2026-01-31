
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
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-balance">
              30 hours of childcare for all. Now a reality.
            </h1>
            <p className="text-xl text-teal-50 mb-10 leading-relaxed font-medium">
              The 2026 expansion is complete. Check your eligibility, calculate your true monthly costs, and find registered providers near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/eligibility" className="bg-white text-teal-700 px-8 py-4 rounded-xl font-bold text-center hover:bg-teal-50 transition shadow-lg">
                Check Eligibility
              </Link>
              <Link to="/find" className="bg-teal-700 text-white px-8 py-4 rounded-xl font-bold text-center border border-teal-500 hover:bg-teal-800 transition shadow-lg">
                Find a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-semibold text-slate-500 text-xs">
             <i className="fa-solid fa-building-columns text-lg"></i>
             <span>GOV.UK Verified Rules</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-500 text-xs">
             <i className="fa-solid fa-shield-halved text-lg"></i>
             <span>Independent Analysis</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-500 text-xs">
             <i className="fa-solid fa-calendar-check text-lg"></i>
             <span>2026 Updated Data</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-teal-600 text-5xl font-black mb-2 leading-none">30</div>
              <div className="text-slate-900 font-bold text-lg mb-2">Weekly Funded Hours</div>
              <p className="text-slate-500 text-sm leading-relaxed">Full 30-hour support is now active for working parents of all children from 9 months to school age.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-teal-600 text-5xl font-black mb-2 leading-none">£2k</div>
              <div className="text-slate-900 font-bold text-lg mb-2">Tax-Free Savings</div>
              <p className="text-slate-500 text-sm leading-relaxed">Maximum government top-up per child per year to help pay your provider directly through HMRC.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-teal-600 text-5xl font-black mb-2 leading-none">85%</div>
              <div className="text-slate-900 font-bold text-lg mb-2">Universal Credit</div>
              <p className="text-slate-500 text-sm leading-relaxed">Maximum claim back for working parents on Universal Credit, covering significant childcare costs.</p>
            </div>
          </div>

          <div className="lg:flex items-center gap-20">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-teal-100 rounded-[3rem] -rotate-3"></div>
                <img 
                  src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800&h=600" 
                  alt="Modern bright nursery classroom" 
                  className="relative rounded-[2.5rem] shadow-2xl object-cover" 
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black mb-8 text-slate-900 leading-tight">Your Complete Childcare Toolkit.</h2>
              <div className="space-y-8">
                {[
                  { title: 'Full 30-Hour Eligibility', text: 'Check if you qualify for the expanded working parents entitlement (9 months up to school age).' },
                  { title: 'Interactive Cost Estimates', text: 'Our calculator factor in funded hours, regional averages, and Tax-Free Childcare savings.' },
                  { title: 'Local Provider Search', text: 'Find registered nurseries and preschools near your postcode that accept funded hours.' },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
                      <i className="fa-solid fa-check-double text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900 mb-1">{benefit.title}</h4>
                      <p className="text-slate-600 leading-relaxed text-sm">{benefit.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link to="/eligibility" className="inline-flex items-center gap-3 bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-teal-700 transition shadow-xl shadow-teal-600/20">
                  Get Started <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to find local support?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Our 2026 provider finder helps you locate nurseries and preschools currently participating in the funded hours scheme.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/find" className="bg-teal-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-teal-500 transition shadow-2xl shadow-teal-600/20">
              Search for Providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
