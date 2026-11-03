import React from 'react';

export const JobCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-200" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-5 bg-slate-200 rounded w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded-lg w-20" />
        <div className="h-6 bg-slate-200 rounded-lg w-24" />
        <div className="h-6 bg-slate-200 rounded-lg w-16" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-7 bg-slate-200 rounded-xl w-24" />
      </div>
    </div>
  );
};

export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded w-28" />
        <div className="w-8 h-8 rounded-xl bg-slate-200" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-20" />
      <div className="h-2 bg-slate-200 rounded w-36" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-xl w-full" />
      ))}
    </div>
  );
};

export default JobCardSkeleton;

