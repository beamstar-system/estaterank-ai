import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { LeadCard } from './components/LeadCard';
import { findLeads } from './services/gemini';
import { SearchParams, SearchState } from './types';
import { LayoutGrid, List, Info, Database, ShieldCheck, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    isSearching: false,
    leads: [],
    rawText: '',
    groundingSources: [],
    error: null,
  });

  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSearch = async (params: SearchParams) => {
    setLastSearchParams(params);
    setState(prev => ({ ...prev, isSearching: true, error: null, leads: [] }));
    
    try {
      const result = await findLeads(params.location, params.niche);
      setState(prev => ({
        ...prev,
        isSearching: false,
        leads: result.leads,
        rawText: result.rawText,
        groundingSources: result.sources,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: error.message || 'An error occurred while fetching leads.',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-300 text-xs font-semibold tracking-wide uppercase">Powered by Google Gemini</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            EstateRank AI
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Leverage live Google Search & Maps data to identify real estate businesses with untapped SEO potential.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-20">
        <SearchForm onSearch={handleSearch} isLoading={state.isSearching} />

        {/* Error State */}
        {state.error && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
               <Info className="w-5 h-5 shrink-0" />
               <p className="font-medium">{state.error}</p>
            </div>
            
            {lastSearchParams && (
                <button 
                    onClick={() => handleSearch(lastSearchParams)}
                    className="px-4 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
          </div>
        )}

        {/* Empty State / Initial Instructions */}
        {!state.isSearching && state.leads.length === 0 && !state.error && !state.rawText && (
          <div className="max-w-4xl mx-auto mt-16 text-center text-slate-400">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Enter a location and niche to begin scanning.</p>
          </div>
        )}

        {/* Results Section */}
        {(state.leads.length > 0 || state.rawText) && (
          <div className="max-w-6xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                Identified Leads
                <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                  {state.leads.length}
                </span>
              </h2>
              
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Leads Grid */}
            {state.leads.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {state.leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-semibold mb-4">Raw Analysis</h3>
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-600">
                    {state.rawText}
                 </div>
              </div>
            )}

            {/* Grounding Sources (Data Transparency) */}
            {state.groundingSources.length > 0 && (
               <div className="mt-12 pt-8 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Data Sources
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {state.groundingSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-1.5 truncate max-w-xs"
                      >
                         <img 
                           src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}`} 
                           alt="favicon" 
                           className="w-3 h-3 opacity-60"
                         />
                         {source.title}
                      </a>
                    ))}
                  </div>
               </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} EstateRank AI. Built with Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;