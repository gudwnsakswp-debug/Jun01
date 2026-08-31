import React from 'react';
import { useFacility } from '../../context/FacilityContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastNotification: React.FC = () => {
  const { toastMessage, clearToast } = useFacility();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'alert':
        return <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toastMessage.type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
      case 'warning':
        return 'border-amber-200 bg-amber-50/95 text-amber-900';
      case 'alert':
        return 'border-rose-200 bg-rose-50/95 text-rose-900';
      default:
        return 'border-blue-200 bg-blue-50/95 text-blue-900';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all ${getBorderColor()}`}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold leading-5">{toastMessage.title}</h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed break-words">{toastMessage.desc}</p>
          </div>
          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
