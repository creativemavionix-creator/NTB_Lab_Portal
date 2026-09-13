import React from 'react';
import { FolderCheck } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded shadow-2xs text-center my-2">
      <div className="p-3 bg-amber-100/70 text-[#f5b041] rounded-full mb-2">
        <FolderCheck size={36} className="stroke-[2]" />
      </div>
      <h3 className="text-slate-500 font-extrabold text-xs tracking-widest uppercase">
        NO RECORD FOUND
      </h3>
    </div>
  );
}
