import React from 'react';
import { 
  GitBranch, 
  FileText, 
  Award, 
  Globe, 
  Terminal 
} from 'lucide-react';

export const LandingVerifiedSourcesTicker: React.FC = () => {
  const sources = [
    { name: 'GitHub Enterprise', icon: GitBranch },
    { name: 'arXiv Research Papers', icon: FileText },
    { name: 'Product Hunt API', icon: Award },
    { name: 'Global Patent Filings', icon: Globe },
    { name: 'Hacker News Tech', icon: Terminal },
  ];

  return (
    <div className="border-y border-white/[0.06] bg-zinc-950/60 py-6 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest shrink-0">
          Fuentes de señal verificadas en tiempo real:
        </p>
        <div className="flex items-center gap-8 md:gap-12 text-xs font-medium text-zinc-400 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {sources.map((source, index) => {
            const Icon = source.icon;
            return (
              <span key={index} className="flex items-center gap-2 hover:text-white transition-colors shrink-0">
                <Icon className="w-4 h-4 text-orange-400" />
                <span>{source.name}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
