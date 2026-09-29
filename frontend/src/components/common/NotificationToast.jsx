import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  const { activeNotification } = useStore();

  if (!activeNotification) return null;

  const bgStyles = {
    success: 'bg-emerald-900 border-emerald-700 text-emerald-100',
    warning: 'bg-amber-900 border-amber-700 text-amber-100',
    info: 'bg-slate-900 border-slate-700 text-slate-100'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl ${bgStyles[activeNotification.type] || bgStyles.info}`}>
        {icons[activeNotification.type] || icons.info}
        <div className="text-sm font-medium pr-2">
          {activeNotification.message}
        </div>
      </div>
    </div>
  );
}
