import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AlertCircle, Plus, CheckCircle2, MapPin, Clock, Wrench, ShieldAlert } from 'lucide-react';

export default function OperationalIssueTracker() {
  const { operationalIssues, logOperationalIssue, resolveOperationalIssue, aisles } = useStore();

  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueLocation, setIssueLocation] = useState('Aisle 3 (Dairy Cooler)');
  const [issueSeverity, setIssueSeverity] = useState('MEDIUM');
  const [issueDetails, setIssueDetails] = useState('');

  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (!issueTitle) return;
    logOperationalIssue({
      title: issueTitle,
      location: issueLocation,
      severity: issueSeverity,
      details: issueDetails,
      reportedBy: 'Supermarket Admin Staff'
    });
    setIssueTitle('');
    setIssueDetails('');
    setIsAddIssueOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Store Operations Quality</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Operational Issues &amp; Maintenance Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log and resolve facility anomalies, scanner failures, damaged shelf QR tags, and cooling issues.
          </p>
        </div>

        <button
          onClick={() => setIsAddIssueOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Incident</span>
        </button>
      </div>

      {/* Issues Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operationalIssues.map((issue) => {
          const isResolved = issue.status === 'RESOLVED';

          return (
            <div
              key={issue.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 flex flex-col justify-between transition ${
                isResolved ? 'border-slate-200 opacity-60 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{issue.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isResolved
                      ? 'bg-emerald-100 text-emerald-800'
                      : issue.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {issue.status} &bull; {issue.severity}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {issue.details}
                </div>

                <div className="mt-2.5 flex items-center space-x-3 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1 text-slate-700 font-medium">
                    <MapPin className="w-3 h-3 text-sky-600" />
                    <span>{issue.location}</span>
                  </span>
                  <span>&bull;</span>
                  <span>Reported: {issue.reportedAt}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[10px]">
                  By: {issue.reportedBy}
                </span>

                {!isResolved && (
                  <button
                    onClick={() => resolveOperationalIssue(issue.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Issue Modal */}
      {isAddIssueOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Log Supermarket Operational Incident</h3>
            <form onSubmit={handleCreateIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POS Scanner Malfunction on Aisle 6"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={issueLocation}
                    onChange={(e) => setIssueLocation(e.target.value)}
                    placeholder="e.g. Aisle 3 Shelf C"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High / Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Details &amp; Actions Needed</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what happened and who needs to be contacted..."
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddIssueOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
