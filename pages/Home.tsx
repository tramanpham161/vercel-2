
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-teal-50 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Updated for 2026/27 Rollout</span>
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
            UK Childcare <br /><span className="text-teal-600 underline decoration-teal-100 decoration-8 underline-offset-4">Simplified.</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            The definitive toolkit to check your eligibility, calculate your true monthly costs, and find registered providers near you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link to="/eligibility" className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-teal-600 transition-all text-left flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-clipboard-check text-2xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Check Eligibility</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">See if you qualify for 15 or 30 hours based on your region and income.</p>
              </div>
              <div className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-widest mt-6">
                Start Check <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>

            <Link to="/calculator" className="group bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20 hover:ring-4 hover:ring-teal-500/20 transition-all text-left flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-teal-400 mb-6">
                  <i className="fa-solid fa-calculator text-2xl"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Cost Calculator</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Estimate your monthly outgoings after funded hours and tax-free top-ups.</p>
              </div>
              <div className="flex items-center gap-2 text-teal-400 font-black text-[10px] uppercase tracking-widest mt-6">
                Calculate Now <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>

            <Link to="/find" className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-teal-600 transition-all text-left flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-search-location text-2xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Find Providers</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Locate nurseries and childminders in your area offering funded spaces.</p>
              </div>
              <div className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-widest mt-6">
                Search Area <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Status Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-50 rounded-[4rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block mb-4">Latest Expansion News</span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 tracking-tight">The 30-Hour rollout is now complete.</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                Working parents of children from 9 months up to school age can now access 30 hours of funded childcare per week. Our tools are updated with the latest regional criteria for England, Scotland, Wales, and Northern Ireland.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                  <i className="fa-solid fa-shield-check text-teal-600"></i>
                  <span className="font-bold text-sm text-slate-700">Official Data</span>
                </div>
                <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                  <i className="fa-solid fa-clock text-teal-600"></i>
                  <span className="font-bold text-sm text-slate-700">2026/27 Ready</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="aspect-square bg-slate-200 rounded-[3.5rem] overflow-hidden shadow-2xl">
                 <img 
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop" 
                    alt="Happy child learning" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                 />
               </div>
               <div className="absolute -bottom-6 -right-6 bg-teal-600 text-white p-8 rounded-[2rem] shadow-xl">
                  <span className="text-4xl font-black block">£2,000</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Max Annual Tax-Free Savings</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
