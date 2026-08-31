import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { MobileHome } from './MobileHome';
import { MobileChecklist } from './MobileChecklist';
import { MobileAnomalyReport } from './MobileAnomalyReport';
import { MobileEquipmentDetail } from './MobileEquipmentDetail';
import { QRScannerModal } from '../common/QRScannerModal';
import { EquipmentQRModal } from '../common/EquipmentQRModal';
import { Equipment, ChecklistItem, FacilityCategory } from '../../types';
import {
  Home,
  ClipboardList,
  AlertTriangle,
  QrCode,
  History,
  Calendar,
  Layers,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const MobileAppView: React.FC = () => {
  const { equipments, anomalies, checklistItems } = useFacility();

  const [activeTab, setActiveTab] = useState<'HOME' | 'CHECKLIST' | 'ANOMALIES' | 'STATUTORY' | 'EQUIPMENTS'>('HOME');
  const [selectedCategoryForChecklist, setSelectedCategoryForChecklist] = useState<FacilityCategory | 'ALL'>('ALL');
  
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedEquipmentForDetail, setSelectedEquipmentForDetail] = useState<Equipment | null>(null);
  const [equipmentForQRModal, setEquipmentForQRModal] = useState<Equipment | null>(null);
  
  const [isAnomalyReportOpen, setIsAnomalyReportOpen] = useState(false);
  const [prefilledDefectItem, setPrefilledDefectItem] = useState<ChecklistItem | null>(null);

  const pendingAnomaliesCount = anomalies.filter(a => a.status !== 'RESOLVED').length;

  const handleScanSuccess = (scannedEq: Equipment) => {
    setSelectedEquipmentForDetail(scannedEq);
  };

  const handleReportDefectItem = (item: ChecklistItem) => {
    setPrefilledDefectItem(item);
    setIsAnomalyReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-2 sm:py-6 px-0 sm:px-4">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md bg-slate-50 min-h-[844px] sm:rounded-[40px] shadow-2xl border-0 sm:border-8 sm:border-slate-800 flex flex-col overflow-hidden relative">
        {/* Mobile Status Bar Simulation */}
        <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none">
          <span className="font-bold text-[11px] tracking-wide">09:41</span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span>LTE</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              CC
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-none">CenterCare</h1>
              <span className="text-[10px] text-slate-400 font-medium">현장점검 모바일</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="QR코드 스캔"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {selectedEquipmentForDetail ? (
            <MobileEquipmentDetail
              equipment={selectedEquipmentForDetail}
              onBack={() => setSelectedEquipmentForDetail(null)}
              onOpenChecklist={() => {
                setSelectedEquipmentForDetail(null);
                setActiveTab('CHECKLIST');
              }}
              onOpenReportAnomaly={() => {
                setIsAnomalyReportOpen(true);
              }}
              onOpenQRTag={() => {
                setEquipmentForQRModal(selectedEquipmentForDetail);
              }}
            />
          ) : activeTab === 'HOME' ? (
            <MobileHome
              onOpenQR={() => setIsQRScannerOpen(true)}
              onOpenChecklist={(cat) => {
                setSelectedCategoryForChecklist(cat || 'ALL');
                setActiveTab('CHECKLIST');
              }}
              onOpenAnomalyReport={() => {
                setPrefilledDefectItem(null);
                setIsAnomalyReportOpen(true);
              }}
              onSelectEquipment={(eq) => setSelectedEquipmentForDetail(eq)}
              onOpenStatutory={() => setActiveTab('STATUTORY')}
            />
          ) : activeTab === 'CHECKLIST' ? (
            <MobileChecklist
              initialCategory={selectedCategoryForChecklist}
              onReportDefectItem={handleReportDefectItem}
            />
          ) : activeTab === 'ANOMALIES' ? (
            <div className="space-y-3 pb-24">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">현장 이상사항 목록</h3>
                  <p className="text-[11px] text-slate-500">진행 중 및 완료된 조치 내역</p>
                </div>
                <button
                  onClick={() => {
                    setPrefilledDefectItem(null);
                    setIsAnomalyReportOpen(true);
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  + 신규 등록
                </button>
              </div>

              <div className="space-y-2.5">
                {anomalies.map(anom => (
                  <div
                    key={anom.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${anom.severity === '긴급' ? 'bg-rose-600 text-white' : anom.severity === '중요' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'}`}>
                        {anom.severity}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${anom.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : anom.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                        {anom.status === 'RESOLVED' ? '조치 완료' : anom.status === 'IN_PROGRESS' ? '조치 중' : '이상 감지'}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">{anom.equipmentName}</div>
                      <div className="text-xs text-slate-700 font-medium mt-0.5">{anom.title}</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{anom.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>신고: {anom.reportedAt} ({anom.reportedBy})</span>
                      <span>📍 {anom.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'STATUTORY' ? (
            <div className="space-y-3 pb-24">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">법정 점검 및 의무 일정</h3>
                <p className="text-[11px] text-slate-500">소방, 기계, 수질, 승강기 법정 의무 일정</p>
              </div>

              {/* Statutory List */}
              <div className="space-y-2.5">
                {useFacility().statutoryInspections.map(stat => (
                  <div
                    key={stat.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-[10px] rounded">
                        D-{stat.dDay}일
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {stat.status === 'COMPLETED' ? '점검 완료' : '예정됨'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{stat.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">근거: {stat.lawBasis}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        대행사: {stat.contractorName || stat.inspectorType}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>마감일: <strong className="text-rose-600">{stat.nextDueDate}</strong></span>
                      <span>주기: {stat.cycle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-24">
              <h3 className="font-extrabold text-slate-900 text-sm">센터 등록 설비 ({equipments.length})</h3>
              <div className="space-y-2">
                {equipments.map(eq => (
                  <div
                    key={eq.id}
                    onClick={() => setSelectedEquipmentForDetail(eq)}
                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${eq.category === '소방' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                          {eq.category}
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-600">{eq.code}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">{eq.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">📍 {eq.location}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEquipmentForQRModal(eq);
                      }}
                      className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 shrink-0"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around absolute bottom-0 inset-x-0 z-30 shadow-lg">
          <button
            onClick={() => {
              setSelectedEquipmentForDetail(null);
              setActiveTab('HOME');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${activeTab === 'HOME' && !selectedEquipmentForDetail ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home className="w-5 h-5" />
            홈
          </button>

          <button
            onClick={() => {
              setSelectedEquipmentForDetail(null);
              setActiveTab('CHECKLIST');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${activeTab === 'CHECKLIST' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ClipboardList className="w-5 h-5" />
            점검표
          </button>

          {/* Floating Center QR Scan Button */}
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
          >
            <QrCode className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              setSelectedEquipmentForDetail(null);
              setActiveTab('ANOMALIES');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors relative ${activeTab === 'ANOMALIES' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <AlertTriangle className="w-5 h-5" />
            이상관리
            {pendingAnomaliesCount > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {pendingAnomaliesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setSelectedEquipmentForDetail(null);
              setActiveTab('STATUTORY');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${activeTab === 'STATUTORY' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Calendar className="w-5 h-5" />
            법정점검
          </button>
        </div>

        {/* QR Scanner Modal */}
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />

        {/* Equipment QR Tag Modal */}
        <EquipmentQRModal
          equipment={equipmentForQRModal}
          onClose={() => setEquipmentForQRModal(null)}
          onScanThis={(eq) => setSelectedEquipmentForDetail(eq)}
        />

        {/* Anomaly Report Modal */}
        {isAnomalyReportOpen && (
          <MobileAnomalyReport
            prefilledEquipment={selectedEquipmentForDetail}
            prefilledChecklistItem={prefilledDefectItem}
            onClose={() => setIsAnomalyReportOpen(false)}
            onSuccess={() => {
              setActiveTab('ANOMALIES');
            }}
          />
        )}
      </div>
    </div>
  );
};
