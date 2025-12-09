'use client';

interface StatusBadgeProps {
  status: 'live' | 'rerack' | 'might' | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  
  const config: Record<string, { label: string; className: string; shadow: string }> = {
    live: { 
      label: 'LIVE', 
      className: 'bg-gradient-emerald text-emerald-100 border border-emerald-400/30',
      shadow: 'shadow-emerald'
    },
    rerack: { 
      label: 'RERACK', 
      className: 'bg-gradient-amber text-amber-100 border border-amber-400/30',
      shadow: 'shadow-amber'
    },
    might: { 
      label: 'MIGHT', 
      className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      shadow: ''
    },
  };
  
  const statusConfig = config[status];
  if (!statusConfig) return null;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusConfig.className} ${statusConfig.shadow} shadow-button`}>
      {statusConfig.label}
    </span>
  );
}
