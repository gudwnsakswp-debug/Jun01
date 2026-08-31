import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { PCDashboard } from './PCDashboard';
import { PCChecklistManager } from './PCChecklistManager';
import { PCAnomalyManager } from './PCAnomalyManager';
import { PCStatutoryManager } from './PCStatutoryManager';
import { PCMaintenanceDB } from './PCMaintenanceDB';
import { PCReportGenerator } from './PCReportGenerator';
import { QRScannerModal } from '../common/QRScannerModal';
import { EquipmentQRModal } from '../common/EquipmentQRModal';
import { MobileAnomalyReport } from '../mobile/MobileAnomalyReport';
import { Equipment, ChecklistItem } from '../../types';
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Calendar,
  Wrench,
  FileText,
  QrCode,
  Smartphone,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Building2,
  Menu,
  X
} from 'lucide-react';

interface PCAppViewProps {
  onSwitchToMobile: () => void;
}

export const PCAppView: React.FC<PCAppViewProps> = ({ onSwitchToMobile }) => {
  const { centerInfo, currentUser, setCurrentUser, anomalies, statutoryInspections } = useFacility();

  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedEquipmentForQR, setSelectedEquipmentForQR] = useState<Equipment | null>(null);
  const [isNewAnomalyModalOpen, setIsNewAnomalyModalOpen] = useState(false);
  const [defectChecklistItem, setDefectChecklistItem] = useState<ChecklistItem | null>(null);

  const pendingAnomaliesCount = anomalies.filter(a => a.status !== 'RESOLVED').length;
  const dueSoonStatutoryCount = statutoryInspections.filter(s => s.status !== 'COMPLETED' && s.dDay <= 30).length;

  const handleScanSuccess = (scannedEq: Equipment) => {
    setSelectedEquipmentForQR(scannedEq);
  };

  const currentDateFormatted = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased">
      {/* High Density Header */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 flex-none sticky top-0 z-40 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg text-white shadow-sm">
            C
          </div>
          <div className="flex items-center">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
              CenterCare
              <span className="text-slate-400 font-normal text-sm ml-2 hidden sm:inline">
                | {centerInfo?.name || '국민체육센터'} 스마트 시설관리
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1 rounded text-xs font-medium border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">시스템 정상 운영중</span>
          </div>

          {/* Switch to Mobile View Quick Button */}
          <button
            onClick={onSwitchToMobile}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="모바일 현장 점검자 화면으로 전환"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">모바일 뷰</span>
          </button>

          {/* User Info */}
          <div className="text-right">
            <p className="text-[10px] text-slate-400 leading-none">{currentDateFormatted}</p>
            <p className="text-xs font-medium text-slate-200 mt-0.5">
              {currentUser?.name || '김시설 주임'} {currentUser?.role || '관리자'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Layout Container with High Density Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* High Density Left Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col flex-none hidden lg:flex">
          <nav className="flex-1 py-4">
            <div className="px-4 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Main Console
            </div>

            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                activeTab === 'DASHBOARD'
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 shrink-0 text-current" />
                <span>통합 대시보드</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('CHECKLIST')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                activeTab === 'CHECKLIST'
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 shrink-0 text-current" />
                <span>시설 점검 관리</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('ANOMALIES')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                activeTab === 'ANOMALIES'
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 text-current" />
                <span>이상 및 결함 조치</span>
              </div>
              {pendingAnomaliesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                  {pendingAnomaliesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('STATUTORY')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                activeTab === 'STATUTORY'
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 shrink-0 text-current" />
                <span>법정 의무 점검 (D-Day)</span>
              </div>
              {dueSoonStatutoryCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">
                  D-{statutoryInspections.filter(s => s.status !== 'COMPLETED')[0]?.dDay || 14}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('MAINTENANCE_DB')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                activeTab === 'MAINTENANCE_DB'
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 shrink-0 text-current" />
                <span>장비 이력 (QR 명판)</span>
              </div>
            </button>

            <div className="px-4 mt-6 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Reporting & Tools
            </div>

            <button
              onClick={() => setActiveTab('REPORT_GENERATOR')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                activeTab === 'REPORT_GENERATOR'
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0 text-current" />
                <span>정기 보고서 생성</span>
              </div>
            </button>
          </nav>

          {/* Bottom High-Density Action */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors uppercase tracking-tight flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>QR 코드 스캔 / 출력</span>
            </button>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>센터 규모</span>
              <span className="font-medium text-slate-600">연면적 8,420㎡</span>
            </div>
          </div>
        </aside>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 p-1 flex justify-around shadow-md">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'CHECKLIST' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <ClipboardList className="w-4 h-4" />
            점검표
          </button>
          <button
            onClick={() => setActiveTab('ANOMALIES')}
            className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'ANOMALIES' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            이상관리
          </button>
          <button
            onClick={() => setActiveTab('STATUTORY')}
            className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'STATUTORY' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <Calendar className="w-4 h-4" />
            법정점검
          </button>
          <button
            onClick={() => setActiveTab('REPORT_GENERATOR')}
            className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'REPORT_GENERATOR' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <FileText className="w-4 h-4" />
            보고서
          </button>
        </div>

        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0 pb-16 lg:pb-6">
          {activeTab === 'DASHBOARD' && (
            <PCDashboard
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onSelectEquipment={(eq) => setSelectedEquipmentForQR(eq)}
            />
          )}

          {activeTab === 'CHECKLIST' && (
            <PCChecklistManager
              onOpenReportDefect={(item) => {
                setDefectChecklistItem(item);
                setIsNewAnomalyModalOpen(true);
              }}
            />
          )}

          {activeTab === 'ANOMALIES' && (
            <PCAnomalyManager
              onOpenNewAnomalyModal={() => {
                setDefectChecklistItem(null);
                setIsNewAnomalyModalOpen(true);
              }}
            />
          )}

          {activeTab === 'STATUTORY' && (
            <PCStatutoryManager />
          )}

          {activeTab === 'MAINTENANCE_DB' && (
            <PCMaintenanceDB />
          )}

          {activeTab === 'REPORT_GENERATOR' && (
            <PCReportGenerator />
          )}
        </main>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Equipment QR Modal */}
      <EquipmentQRModal
        equipment={selectedEquipmentForQR}
        onClose={() => setSelectedEquipmentForQR(null)}
      />

      {/* Anomaly Report Modal */}
      {isNewAnomalyModalOpen && (
        <MobileAnomalyReport
          prefilledChecklistItem={defectChecklistItem}
          onClose={() => {
            setIsNewAnomalyModalOpen(false);
            setDefectChecklistItem(null);
          }}
          onSuccess={() => {
            setActiveTab('ANOMALIES');
          }}
        />
      )}
    </div>
  );
};
