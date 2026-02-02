import React, { useState } from 'react';
import { Provider } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

const FindProvider: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Provider[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mockResults: Provider[] = [
    { id: '1', name: 'Little Explorers Nursery', type: 'Nursery', rating: 'Outstanding', distance: '0.4 miles', offers: ['9m+', '2y', '3-4y'], address: '12 High Street, London' },
    { id: '2', name: 'Sunny Days Childminding', type: 'Childminder', rating: 'Good', distance: '0.8 miles', offers: ['2y', '30h'], address: '45 Park Avenue, London' },
    { id: '3', name: 'St. Mary\'s Preschool', type: 'Preschool', rating: 'Good', distance: '1.2 miles', offers: ['3-4y', '30h'], address: 'Church Lane, London' },
    { id: '4', name: 'Bright Beginnings Daycare', type: 'Nursery', rating: 'Outstanding', distance: '1.5 miles', offers: ['9m+', '30h'], address: '88 Station Road, London' }
  ];

  const handleSearch = async (e?: React.FormEvent, isDemo = false) => {
    e?.preventDefault();
    const cleanPostcode = postcode.trim().toUpperCase() || 'SW1A 1AA';
    
    setLoading(true);
    setIsSearching(true);
    setError(null);
    setResults([]);

    if (isDemo) {
      setTimeout(() => {
        setResults(mockResults);
        setShowAdvice(true);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey.length < 5) {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Generate 6 realistic childcare providers near UK postcode ${cleanPostcode}. Return as a JSON array.`
          }]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                rating: { type: Type.STRING },
                distance: { type: Type.STRING },
                offers: { type: Type.ARRAY, items: { type: Type.STRING } },
                address: { type: Type.STRING }
              },
              required: ["id", "name", "type", "rating", "distance", "offers", "address"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setResults(data);
      setShowAdvice(true);
    } catch (err: any) {
      console.error("Search failed:", err);
      if (err.message === "MISSING_API_KEY") {
        setError("API_CONFIG_REQUIRED");
      } else {
        setError("An error occurred while searching. Please try again or use the official links.");
      }
    } finally {
      setLoading(false);
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
          
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <i className="fa-solid fa-magnifying-glass-location text-teal-50 text-7xl -rotate-12"></i>
            </div>
            <form onSubmit={(e) => handleSearch(e)} className="relative z-10">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Your Postcode</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Enter postcode (e.g. SW11)" 
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        className="flex-grow p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-lg focus:border-teal-600 outline-none transition"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-teal-600 transition shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search Area'} <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </form>
          </div>

          {isSearching && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Search Resources Hub */}
                <div className="mx-6 p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl">
                  <div className="bg-teal-600 w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-magnifying-glass text-2xl"></i>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-lg font-black mb-1">Provider Research Hub</h3>
                    <p className="text-slate-400 text-xs font-medium">Verify ratings and read parent feedback for your local area.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                      href="https://reports.ofsted.gov.uk" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <i className="fa-solid fa-medal"></i> Ofsted Reports
                    </a>
                    <a 
                      href={`https://www.childcare.co.uk/search?postcode=${postcode}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <i className="fa-solid fa-star"></i> Parent Reviews
                    </a>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-slate-50 h-64 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                  </div>
                ) : error === "API_CONFIG_REQUIRED" ? (
                  <div className="p-12 text-center bg-amber-50 rounded-[3rem] border border-amber-100 mx-6">
                    <i className="fa-solid fa-gears text-amber-400 text-3xl mb-4"></i>
                    <h3 className="text-amber-900 font-black text-xl mb-2">Setup Required</h3>
                    <p className="text-amber-700 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                      To enable live searching, please add your <strong>API_KEY</strong> to the Vercel Environment Variables and redeploy.
                    </p>
                    <button 
                      onClick={() => handleSearch(undefined, true)}
                      className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition shadow-lg"
                    >
                      View Demo Results
                    </button>
                  </div>
                ) : error ? (
                  <div className="p-12 text-center bg-red-50 rounded-[3rem] border border-red-100 mx-6">
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((provider) => (
                        <div key={provider.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-teal-200 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-1">{provider.type}</span>
                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition">{provider.name}</h4>
                                </div>
                                <span className="bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shrink-0">{provider.rating}</span>
                            </div>
                            
                            <p className="text-slate-400 text-xs mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-location-dot"></i> {provider.address} • {provider.distance}
                            </p>

                            <div className="flex flex-wrap gap-2 flex-grow">
                                {provider.offers.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                        {tag} Funded
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 space-y-8">
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative border border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white"><i className="fa-solid fa-info-circle"></i></div>
                    <span className="text-[11px] font-black text-teal-400 uppercase tracking-widest">Local Advisor</span>
                </div>
                <div className="min-h-[150px]">
                    {showAdvice ? (
                        <div className="space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed italic">
                                For {postcode || 'your area'}, funding places are allocated through your specific local authority's <strong>Family Information Service (FIS)</strong>.
                            </p>
                            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                                <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-2 underline">What to do next:</span>
                                <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                                    <li>Get your 30-hour eligibility code from HMRC.</li>
                                    <li>Contact your chosen registered nursery to check availability.</li>
                                    <li>Provide your code to confirm your funded placement.</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm leading-relaxed italic">Enter a postcode to see local availability trends and council-specific advice.</p>
                    )}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                    <a href="https://reports.ofsted.gov.uk" target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-700 transition flex items-center justify-between">
                        <span>Ofsted Reports</span>
                        <i className="fa-solid fa-chevron-right text-teal-400"></i>
                    </a>
                    <a href="https://www.gov.uk/find-local-council" target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-700 transition flex items-center justify-between">
                        <span>Local Council Finder</span>
                        <i className="fa-solid fa-chevron-right text-teal-400"></i>
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FindProvider;
