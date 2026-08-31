import React, { useState } from 'react';
import { FacilityProvider } from './context/FacilityContext';
import { PCAppView } from './components/pc/PCAppView';
import { MobileAppView } from './components/mobile/MobileAppView';
import { ToastNotification } from './components/common/ToastNotification';
import { Smartphone, Monitor, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [deviceMode, setDeviceMode] = useState<'PC' | 'MOBILE'>('PC');

  return (
    <FacilityProvider>
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
        {/* Top Simulation Mode Switcher Bar */}
        <div className="bg-slate-950 text-slate-300 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs z-50 select-none print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-white tracking-tight">CenterCare</span>
            <span className="text-slate-400 hidden sm:inline text-[11px]">
              국민체육센터 스마트 시설점검 및 통합 이력 관리 시스템
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDeviceMode('PC')}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                deviceMode === 'PC'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC 관리자 웹</span>
            </button>

            <button
              onClick={() => setDeviceMode('MOBILE')}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                deviceMode === 'MOBILE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>모바일 현장 점검</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mode Screen */}
        <div className="flex-1 bg-slate-100">
          {deviceMode === 'PC' ? (
            <PCAppView onSwitchToMobile={() => setDeviceMode('MOBILE')} />
          ) : (
            <div className="py-2 sm:py-6 bg-slate-900/90 min-h-screen flex flex-col items-center">
              <div className="text-center mb-3 text-slate-300 text-xs flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>체육센터 현장 시설관리자(기계/소방 담당자) 모바일 뷰</span>
              </div>
              <MobileAppView />
            </div>
          )}
        </div>

        {/* Global Toast Notifications */}
        <ToastNotification />
      </div>
    </FacilityProvider>
  );
}
