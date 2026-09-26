import React from 'react';
import { 
  GitBranch, 
  FileText, 
  Award, 
  Globe, 
  Terminal,
  Cpu,
  Layers,
  Database
} from 'lucide-react';

export const LandingVerifiedSourcesTicker: React.FC = () => {
  const sources = [
    { name: 'GitHub Enterprise', icon: GitBranch },
    { name: 'arXiv Research Papers', icon: FileText },
    { name: 'Product Hunt API', icon: Award },
    { name: 'Global Patent Filings', icon: Globe },
    { name: 'Hacker News Tech', icon: Terminal },
    { name: 'HuggingFace Hub', icon: Cpu },
    { name: 'IEEE Xplore', icon: Layers },
    { name: 'Edgar SEC Filings', icon: Database },
  ];

  // Duplicamos la lista para crear un bucle infinito continuo
  const duplicatedSources = [...sources, ...sources];

  return (
    <div className="border-y border-white/[0.06] bg-zinc-950/70 py-5 overflow-hidden relative">
      {/* Side Fade Gradients for smooth fade-in/fade-out */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0C] to-transparent z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center gap-6">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest shrink-0 hidden md:block">
          Fuentes verificadas en tiempo real:
        </p>

        {/* Marquee Track */}
        <div className="overflow-hidden flex-1 w-full">
          <div className="animate-marquee flex items-center gap-10 text-xs font-medium text-zinc-400">
            {duplicatedSources.map((source, idx) => {
              const Icon = source.icon;
              return (
                <span
                  key={idx}
                  className="flex items-center gap-2 hover:text-white transition-colors shrink-0 group cursor-default"
                >
                  <Icon className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-zinc-300">{source.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
