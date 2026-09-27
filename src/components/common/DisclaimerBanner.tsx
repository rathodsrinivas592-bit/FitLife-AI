import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../../utils/calculator';

interface DisclaimerBannerProps {
  compact?: boolean;
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false, className = '' }) => {
  const [expanded, setExpanded] = useState(!compact);

  if (compact) {
    return (
      <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 ${className}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full font-medium text-slate-300 hover:text-slate-100 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            General Wellness & Estimation Notice
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {expanded && (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            {MEDICAL_DISCLAIMER}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 text-xs ${className}`}>
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-slate-200 text-xs mb-1">Health & Medical Disclaimer</h4>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
};
