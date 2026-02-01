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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPostcode = postcode.trim().toUpperCase();
    if (!cleanPostcode) return;
    
    setLoading(true);
    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      // 1. Check if API Key exists
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{
            text: `Act as a childcare directory API. Generate a JSON array of 6 realistic but fictional childcare providers (nurseries, childminders, preschools) located near the UK postcode area: ${cleanPostcode}. 
                  
                  Requirements:
                  - The names must sound British and local to the area.
                  - Addresses must be formatted correctly for the UK.
                  - Ratings must be either 'Outstanding' or 'Good'.
                  - Distances must be between 0.2 and 4.5 miles.
                  - Offers must include at least two of: ['9m+', '2y', '3-4y', '30h'].`
          }]
        },
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
                offers: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }
                },
                address: { type: Type.STRING }
              },
              required: ["id", "name", "type", "rating", "distance", "offers", "address"]
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("EMPTY_RESPONSE");
      }

      // Ensure we only have the JSON part (strip markdown if model ignores responseMimeType)
      const jsonStart = responseText.indexOf('[');
      const jsonEnd = responseText.lastIndexOf(']') + 1;
      const cleanJson = responseText.substring(jsonStart, jsonEnd);

      const data = JSON.parse(cleanJson);
      
      if (!Array.isArray(data)) {
        throw new Error("INVALID_FORMAT");
      }

      setResults(data);
      setShowAdvice(true);
    } catch (err: any) {
      console.error("Search failed:", err);
      
      let userFriendlyMessage = "We couldn't retrieve results for that area. Please check the official GOV.UK link below.";
      
      if (err.message === "MISSING_API_KEY") {
        userFriendlyMessage = "API Key not found. Please ensure the API_KEY environment variable is set in your Vercel project settings.";
      } else if (err.message.includes('401') || err.message.includes('API key not valid')) {
        userFriendlyMessage = "The API key provided is invalid. Please check your credentials.";
      } else if (err.message.includes('safety') || err.message.includes('blocked')) {
        userFriendlyMessage = "The search was blocked by safety filters. Please try a different postcode.";
      } else if (err.message === "EMPTY_RESPONSE" || err.message === "INVALID_FORMAT") {
        userFriendlyMessage = "The provider database returned an unexpected response. Please try searching again.";
      }

      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPostcode('SW1A 1AA');
      }, (err) => {
        console.warn("Location access denied", err);
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
                            onClick={handleUseLocation}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition"
                        >
                            <i className="fa-solid fa-location-crosshairs text-xl"></i>
                        </button>
                    </div>
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
                <div className="flex items-center justify-between px-6">
                    <h3 className="text-xl font-black text-slate-900">Nearby Providers</h3>
                    {!loading && results.length > 0 && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{results.length} results found</span>}
                </div>

                <div className="mx-6 p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-3">
                  <i className="fa-solid fa-circle-info text-teal-600 mt-1"></i>
                  <p className="text-sm text-teal-800 font-medium leading-relaxed">
                    This list is AI-generated for illustrative purposes. For the official directory of registered providers in your area, please check the{' '}
                    <a 
                      href="https://www.gov.uk/find-free-early-education" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-bold underline hover:text-teal-600 transition"
                    >
                      official Gov.uk finder
                    </a>.
                  </p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-slate-50 h-64 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-12 text-center bg-red-50 rounded-[3rem] border border-red-100 mx-6">
                    <i className="fa-solid fa-circle-exclamation text-red-400 text-3xl mb-4"></i>
                    <p className="text-red-700 font-bold max-w-sm mx-auto leading-relaxed">{error}</p>
                    <button 
                      onClick={handleSearch}
                      className="mt-6 text-sm font-black text-red-600 uppercase tracking-widest hover:text-red-800 transition"
                    >
                      Try Again <i className="fa-solid fa-rotate-right ml-1"></i>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((provider) => (
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
                                    href="https://www.childcare.co.uk" target="_blank" rel="noopener noreferrer"
                                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition"
                                >
                                    <i className="fa-solid fa-external-link"></i>
                                </a>
                            </div>
                        </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

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
                                        For {postcode}, your local council holds the definitive list of providers registered for the 2026 funding entitlements.
                                    </p>
                                </div>
                                <div>
                                    <h6 className="text-teal-400 font-black text-[10px] uppercase tracking-widest mb-2">Availability</h6>
                                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                                        Childcare demand in this area is high. We recommend contacting providers as soon as you have your eligibility code.
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
                                href="https://www.gov.uk/find-free-early-education" target="_blank" rel="noopener noreferrer"
                                className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-700 transition group"
                            >
                                <span className="font-bold text-xs">Gov.uk Directory</span>
                                <i className="fa-solid fa-chevron-right text-[10px] text-slate-500 group-hover:text-teal-400"></i>
                            </a>
                            <a 
                                href="https://www.childcare.co.uk" target="_blank" rel="noopener noreferrer"
                                className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-700 transition group"
                            >
                                <span className="font-bold text-xs">Childcare.co.uk Tool</span>
                                <i className="fa-solid fa-chevron-right text-[10px] text-slate-500 group-hover:text-teal-400"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-teal-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-teal-600/10">
                <h4 className="text-xl font-black mb-4">Did you know?</h4>
                <p className="text-teal-50 text-sm leading-relaxed font-medium">
                    The 30-hour entitlement is term-time only (38 weeks), but most nurseries will allow you to "stretch" these hours across the full year.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FindProvider;
