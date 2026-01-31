
import React, { useState } from 'react';
import { Provider } from '../types';

const FindProvider: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Simulated Providers based on common types
  const mockProviders: Provider[] = [
    { id: '1', name: 'Sunshine Day Nursery', type: 'Nursery', rating: 'Outstanding', distance: '0.4 miles', offers: ['9m+', '2y', '30h'], address: '12 Primary Lane, London' },
    { id: '2', name: 'Little Explorers Preschool', type: 'Preschool', rating: 'Good', distance: '0.8 miles', offers: ['2y', '30h'], address: 'St. Marys Hall, High Street' },
    { id: '3', name: 'Sarah\'s Home Childminding', type: 'Childminder', rating: 'Outstanding', distance: '1.2 miles', offers: ['9m+', '30h'], address: 'Residential Area, London' },
    { id: '4', name: 'Bluebell Montessori', type: 'Nursery', rating: 'Outstanding', distance: '1.5 miles', offers: ['2y', '30h'], address: 'Greenway Business Park' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode) return;
    
    setLoading(true);
    setIsSearching(true);
    
    // Simulate a brief loading state for UX
    setTimeout(() => {
      setLoading(false);
      setShowAdvice(true);
    }, 600);
  };

  const useLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // In a real app, reverse geocode here. For demo, we'll set a sample.
        setPostcode('SW1A 1AA');
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 text-center lg:text-left max-w-3xl">
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Find Funded Providers</h1>
        <p className="text-slate-500 text-xl font-medium leading-relaxed">
          Search for nurseries, childminders, and preschools near you that accept the 2026 government funding entitlements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Search Bar Container */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <i className="fa-solid fa-magnifying-glass-location text-teal-50 text-7xl -rotate-12"></i>
            </div>
            <form onSubmit={handleSearch} className="relative z-10">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Your Postcode</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="Enter postcode (e.g. SW11)" 
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-lg focus:border-teal-600 outline-none transition"
                        />
                        <button 
                            type="button"
                            onClick={useLocation}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition"
                        >
                            <i className="fa-solid fa-location-crosshairs text-xl"></i>
                        </button>
                    </div>
                    <button 
                        type="submit"
                        className="bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-teal-600 transition shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        Search Area <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </form>
          </div>

          {/* Results Area */}
          {isSearching && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between px-6">
                    <h3 className="text-xl font-black text-slate-900">Nearby Providers</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{mockProviders.length} results found</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockProviders.map((provider) => (
                        <div key={provider.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-teal-200 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-1">{provider.type}</span>
                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition">{provider.name}</h4>
                                </div>
                                <div className="bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                    {provider.rating}
                                </div>
                            </div>
                            
                            <p className="text-slate-400 text-xs mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-location-dot"></i> {provider.address} • {provider.distance}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {provider.offers.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                        {tag} Funded
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-grow py-4 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-teal-600 transition">
                                    View Details
                                </button>
                                <a 
                                    href="https://www.childcare.co.uk" target="_blank"
                                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition"
                                >
                                    <i className="fa-solid fa-external-link"></i>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Sidebar: Advice & Official Links */}
        <div className="lg:sticky lg:top-24 space-y-8">
            <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative border border-slate-800">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                            <i className="fa-solid fa-info-circle text-lg"></i>
                        </div>
                        <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em]">Local Advisor</span>
                    </div>

                    <div className="min-h-[200px] flex flex-col">
                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-800 rounded w-full"></div>
                                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                                <div className="h-4 bg-slate-800 rounded w-2/3 mt-8"></div>
                            </div>
                        ) : showAdvice ? (
                            <div className="space-y-6">
                                <div>
                                    <h6 className="text-teal-400 font-black text-[10px] uppercase tracking-widest mb-2">Council Directory</h6>
                                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                                        For the area {postcode}, your local council holds the definitive list of providers who are registered for the 9-month, 2-year, and 30-hour entitlements.
                                    </p>
                                </div>
                                <div>
                                    <h6 className="text-teal-400 font-black text-[10px] uppercase tracking-widest mb-2">2026 Insider Tip</h6>
                                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                                        Waitlists for September 2026 starts are already opening. Contact your preferred provider immediately to secure your "30 Hours" place, as these are often capped.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Enter your postcode to receive specific advice for your local council's funding procedures and application deadlines.
                            </p>
                        )}
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-800">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-6 italic">Quick Resources</h5>
                        <div className="space-y-4">
                            <a 
                                href="https://www.gov.uk/find-free-early-education" target="_blank"
                                className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-700 transition group"
                            >
                                <span className="font-bold text-xs">Gov.uk Directory</span>
                                <i className="fa-solid fa-chevron-right text-[10px] text-slate-500 group-hover:text-teal-400"></i>
                            </a>
                            <a 
                                href="https://www.childcare.co.uk/find/Nurseries/2-year-old-free-childcare" target="_blank"
                                className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-700 transition group"
                            >
                                <span className="font-bold text-xs">Childcare.co.uk 2y Tool</span>
                                <i className="fa-solid fa-chevron-right text-[10px] text-slate-500 group-hover:text-teal-400"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-teal-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-teal-600/10">
                <h4 className="text-xl font-black mb-4">Did you know?</h4>
                <p className="text-teal-50 text-sm leading-relaxed font-medium">
                    Providers often have separate waiting lists for funded spaces. We recommend contacting nurseries at least 6 months before your child's intended start date.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FindProvider;
