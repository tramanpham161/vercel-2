
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
    { id: '3', name: 'St. Mary\'s Preschool', type: 'Preschool', rating: 'Good', distance: '1.2 miles', offers: ['3-4y', '30h'], address: 'Church Lane, London' }
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
                <div className="mx-6 p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-3">
                  <i className="fa-solid fa-circle-info text-teal-600 mt-1"></i>
                  <p className="text-sm text-teal-800 font-medium leading-relaxed">
                    This list is AI-generated for illustrative purposes. For official data, check the{' '}
                    <a href="https://www.gov.uk/find-free-early-education" target="_blank" rel="noopener noreferrer" className="font-bold underline">official Gov.uk finder</a>.
                  </p>
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
                        <div key={provider.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-teal-200 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-1">{provider.type}</span>
                                    <h4 className="text-xl font-black text-slate-900">{provider.name}</h4>
                                </div>
                                <span className="bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">{provider.rating}</span>
                            </div>
                            <p className="text-slate-400 text-xs mb-6"><i className="fa-solid fa-location-dot mr-2"></i>{provider.address} • {provider.distance}</p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {provider.offers.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{tag} Funded</span>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-teal-600 transition">View Details</button>
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
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                            For {postcode || 'your area'}, demand for funded spaces is high. We recommend contacting at least 3 nurseries to compare availability for the 2026 intake.
                        </p>
                    ) : (
                        <p className="text-slate-500 text-sm leading-relaxed italic">Enter a postcode to see local availability trends and council-specific advice.</p>
                    )}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                    <a href="https://www.gov.uk/find-free-early-education" target="_blank" className="block p-4 bg-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-700 transition">Official Gov Directory</a>
                    <a href="https://www.childcare.co.uk" target="_blank" className="block p-4 bg-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-700 transition">Childcare.co.uk Finder</a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FindProvider;
