import React from 'react';
import { ExternalLink, Star, AlertTriangle, Zap, Globe } from 'lucide-react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md hover:border-blue-200 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {lead.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{lead.rating}</span>
          </div>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Zap className="w-5 h-5" />
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
        {lead.description}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-slate-700">
            <span className="font-semibold text-slate-900">Problem:</span> {lead.issue}
          </span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Zap className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <span className="text-slate-700">
            <span className="font-semibold text-slate-900">Opportunity:</span> {lead.action}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {lead.url && lead.url !== 'None' && lead.url !== 'N/A' ? (
          <a
            href={lead.url.startsWith('http') ? lead.url : `https://${lead.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Visit Website
          </a>
        ) : (
           <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
             <Globe className="w-4 h-4" />
             No Website
           </span>
        )}
        
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Analyze <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};