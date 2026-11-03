import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Flag, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReports();
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, newStatus) => {
    try {
      const res = await adminAPI.updateReport(reportId, { status: newStatus });
      if (res.data.success) {
        toast.success(`Report marked as ${newStatus}.`);
        setReports(reports.map((r) => (r._id === reportId ? res.data.report : r)));
      }
    } catch (err) {
      toast.error('Failed to update report.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Platform Reports & Moderation</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review community reports regarding inaccurate job descriptions, spam, or misconduct.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading platform reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All Clear! No Pending Reports</h3>
          <p className="text-xs text-slate-500">Platform activity is healthy with zero outstanding moderation flags.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">Reason & Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.reporter?.name || 'User'}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">{r.targetType}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-bold text-slate-800">{r.reason}</div>
                      <div className="text-[11px] text-slate-400">{r.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleResolve(r._id, 'resolved')}
                        className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;

